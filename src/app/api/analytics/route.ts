import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { verifyAuth } from '@/lib/auth';
import { Conversation } from '@/types/conversation';

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);

    // Get all conversations for the user
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('uuid', '==', uid));
    const conversationsSnapshot = await getDocs(q);

    // Initialize counters
    let totalConversations = 0;
    let settedConversations = 0;
    const conversations: Conversation[] = [];

    // Process each conversation
    conversationsSnapshot.forEach((doc) => {
      const conversationData = doc.data();
      const conversation: Conversation = conversationData as Conversation;
      
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
