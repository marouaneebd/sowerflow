import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { verifyAuth } from '@/lib/auth';
import { Conversation } from '@/types/instagram';

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);

    // Get all conversations for the user
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('uuid', '==', uid));
    const querySnapshot = await getDocs(q);

    // Initialize counters
    let totalConversations = 0;
    let settedConversations = 0;
    const conversations: Conversation[] = [];

    // Process each conversation
    querySnapshot.forEach((doc) => {
      const conversationData = doc.data();
      const conversation: Conversation = {
        uuid: uid,
        created_at: conversationData.created_at,
        updated_at: conversationData.updated_at,
        instagram_user_id: conversationData.instagram_user_id,
        scoped_user_id: conversationData.scoped_user_id,
        scoped_user_username: conversationData.scoped_user_username,
        status: conversationData.status,
        events: conversationData.events
      };
      
      conversations.push(conversation);
      totalConversations++;
      
      if (conversation.status === 'setted') {
        settedConversations++;
      }
    });

    // Calculate conversion rate (as a percentage)
    const conversionRate = totalConversations > 0 
      ? (settedConversations / totalConversations) * 100 
      : 0;

    return NextResponse.json({
      conversations,
      stats: {
        totalConversations,
        settedConversations,
        conversionRate: Number(conversionRate.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Error in GET /api/analytics:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
