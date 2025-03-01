import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth } from '@/lib/auth';
import { Conversation } from '@/types/conversation';

// Add route segment config to mark as dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);

    // Get all conversations for the user
    const conversationsRef = adminDb.collection('conversations');
    const conversationsSnapshot = await conversationsRef.where('uuid', '==', uid).orderBy('created_at', 'desc').get();

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
