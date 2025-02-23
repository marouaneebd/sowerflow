import { NextResponse } from 'next/server';
import { db } from '@/app/firebase';
import { collection, query, where, orderBy, limit, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ChatMessage, ChatRole } from '@/types/chat';
import { Conversation, Event } from '@/types/conversation';
import { generateAIResponse } from '@/lib/messageBuilder';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// This will be called by Vercel Cron
export async function GET(req: Request) {
  // Verify cron secret
  const cronSecret = req.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the oldest conversation with status 'sending_message'
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('status', '==', 'sending_message'),
      orderBy('updated_at', 'asc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return NextResponse.json({ message: 'No conversations to process' });
    }

    const conversationDoc = querySnapshot.docs[0];
    const conversation = conversationDoc.data() as Conversation;

    // Get user's profile first
    const profilesRef = collection(db, 'profiles');
    const profileQuery = query(
      profilesRef,
      where('instagram.userId', '==', conversation.instagram_user_id),
      limit(1)
    );
    
    const profileSnapshot = await getDocs(profileQuery);
    if (profileSnapshot.empty) {
      throw new Error('Profile not found');
    }

    const profile = profileSnapshot.docs[0].data();

    // Convert events to chat messages
    const messages: ChatMessage[] = conversation.events
      .filter(event => !!event.description)
      .map(event => ({ 
        id: event.date.toString(),
        role: (event.direction === 'received' ? 'user' : 'assistant') as ChatRole,
        content: event.description
      }))
      .sort((a, b) => {
        const eventA = conversation.events.find(e => e.date.toString() === a.id);
        const eventB = conversation.events.find(e => e.date.toString() === b.id);
        return (eventA?.date || 0) - (eventB?.date || 0);
      });

    // Get AI response directly using the new function
    const aiResponse = await generateAIResponse(profile, messages, conversationDoc.id);

    // Send message to Instagram
    const instagramResponse = await fetch(`https://graph.instagram.com/v22.0/${conversation.instagram_user_id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${profile.instagram.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient: {
          id: conversation.scoped_user_id
        },
        message: {
          text: aiResponse
        }
      })
    });

    if (!instagramResponse.ok) {
      throw new Error('Failed to send Instagram message');
    }

    const instagramData = await instagramResponse.json();

    // Create new event for the sent message
    const newEvent: Event = {
      date: Date.now(),
      type: 'message',
      direction: 'sent',
      description: aiResponse,
      event_details: {
        message: {
          mid: instagramData.id,
          text: aiResponse,
          is_echo: false
        }
      }
    };

    // Update conversation in Firebase
    await updateDoc(doc(db, 'conversations', conversationDoc.id), {
      status: 'waiting_message',
      updated_at: Date.now(),
      events: [...conversation.events, newEvent]
    });

    return NextResponse.json({ 
      message: 'Successfully processed conversation',
      conversation_id: conversationDoc.id 
    });

  } catch (error) {
    console.error('Error in Instagram bot cron:', error);
    return NextResponse.json(
      { error: 'Failed to process conversation' },
      { status: 500 }
    );
  }
}
