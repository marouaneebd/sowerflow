import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/app/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Types
type EventType = 'message' | 'message_reactions' | 'messaging_referral' | 'messaging_optins' | 'messaging_postbacks';
type Direction = 'sent' | 'received';
type ConversationStatus = 'sending_message' | 'waiting_message' | 'setted' | 'abandoned' | 'ignored';

interface Event {
  date: number;
  type: EventType;
  direction: Direction;
  event_details: Record<string, unknown> & { id: string };
}

interface Conversation {
  created_at: number;
  updated_at: number;
  app_user_id: string;
  scoped_user_id: string;
  status: ConversationStatus;
  events: Event[];
}

interface InstagramMessage {
  id: string;
  text?: string;
  attachments?: Array<{
    type: string;
    payload: {
      url: string;
    };
  }>;
}

// Add these interfaces at the top with the other types
interface InstagramMessageEvent {
  mid: string;
  text?: string;
  attachments?: Array<{
    type: string;
    payload: {
      url: string;
    };
  }>;
}

interface InstagramReactionEvent {
  mid: string;
  action: string;
  reaction: string;
}

interface InstagramPostbackEvent {
  mid: string;
  payload: string;
  title: string;
}

interface InstagramReferralEvent {
  ref: string;
  source: string;
}

interface MessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: InstagramMessageEvent;
  reaction?: InstagramReactionEvent;
  postback?: InstagramPostbackEvent;
  referral?: InstagramReferralEvent;
}

// This should be stored in environment variables
const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

// Handle GET requests (for webhook verification)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Check if this is a verification request
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    // Respond with the challenge token from the request
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } else {
    // Respond with '403 Forbidden' if verify tokens do not match
    return new NextResponse('Forbidden', { status: 403 });
  }
}

// Handle POST requests (for webhook events)
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifySignature(rawBody, signature)) {
    return new NextResponse('Invalid signature', { status: 403 });
  }

  try {
    const body = JSON.parse(rawBody);

    console.log(body);
    
    // Process each entry in the webhook
    for (const entry of body.entry) {
      // Handle messaging events
      if (entry.messaging) {
        for (const messagingEvent of entry.messaging) {
          await processMessagingEvent(messagingEvent, entry.id);
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processMessagingEvent(messagingEvent: MessagingEvent, appUserId: string) {
  // Determine who is who in the conversation
  const senderId = messagingEvent.sender?.id;
  const recipientId = messagingEvent.recipient?.id;
  
  // If the app user is the sender, then the scoped user is the recipient
  // If the app user is the recipient, then the scoped user is the sender
  let scopedUserId: string;
  let direction: Direction;
  
  if (senderId === appUserId) {
    scopedUserId = recipientId;
    direction = 'sent';
  } else {
    scopedUserId = senderId;
    direction = 'received';
  }

  // Rest of the event type determination remains the same
  let eventType: EventType;
  let eventDetails: Record<string, unknown> & { id: string };

  if (messagingEvent.message) {
    eventType = 'message';
    eventDetails = {
      id: messagingEvent.message.mid,
      text: messagingEvent.message.text,
      attachments: messagingEvent.message.attachments,
    } as Record<string, unknown> & { id: string };
  } else if (messagingEvent.reaction) {
    eventType = 'message_reactions';
    eventDetails = {
      id: messagingEvent.reaction.mid,
      action: messagingEvent.reaction.action,
      reaction: messagingEvent.reaction.reaction,
    } as Record<string, unknown> & { id: string };
  } else if (messagingEvent.postback) {
    eventType = 'messaging_postbacks';
    eventDetails = {
      id: messagingEvent.postback.mid,
      payload: messagingEvent.postback.payload,
      title: messagingEvent.postback.title,
    } as Record<string, unknown> & { id: string };
  } else if (messagingEvent.referral) {
    eventType = 'messaging_referral';
    eventDetails = {
      id: `${messagingEvent.timestamp}_referral`,
      ref: messagingEvent.referral.ref,
      source: messagingEvent.referral.source,
    } as Record<string, unknown> & { id: string };
  } else {
    return; // Unsupported event type
  }

  const event: Event = {
    date: messagingEvent.timestamp,
    type: eventType,
    direction,
    event_details: eventDetails,
  };

  await processConversationEvent(appUserId, scopedUserId, event);
}

async function processConversationEvent(appUserId: string, scopedUserId: string, event: Event) {
  const conversationId = `${appUserId}_${scopedUserId}`;
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationDoc = await getDoc(conversationRef);

  if (!conversationDoc.exists()) {
    // Create new conversation
    const newConversation: Conversation = {
      created_at: Date.now(),
      updated_at: Date.now(),
      app_user_id: appUserId,
      scoped_user_id: scopedUserId,
      status: 'ignored',
      events: [event],
    };

    if (event.direction === 'received') {
      // Get conversation history from Instagram API
      const messages = await getInstagramConversationHistory(appUserId, scopedUserId);
      
      if (event.type === 'message') {
        // Remove triggering message from history
        const filteredMessages = messages.filter(msg => msg.id !== event.event_details.id);
        
        newConversation.status = filteredMessages.length === 0 ? 'sending_message' : 'ignored';
      }
    }

    await setDoc(conversationRef, newConversation);
  } else {
    const conversation = conversationDoc.data() as Conversation;

    // Check if conversation is ignored or event already exists
    if (conversation.status === 'ignored' || 
        conversation.events.some(e => e.event_details.id === event.event_details.id)) {
      return;
    }

    // Update conversation
    const updates: Partial<Conversation> = {
      updated_at: Date.now(),
      events: [...conversation.events, event],
    };

    if (event.direction === 'received') {
      if (event.type === 'message') {
        updates.status = 'sending_message';
      }
    } else {
      updates.status = 'waiting_message';
    }

    await updateDoc(conversationRef, updates);
  }
}

async function getInstagramConversationHistory(appUserId: string, scopedUserId: string): Promise<InstagramMessage[]> {
  console.log(appUserId, scopedUserId);
  // Implementation of Instagram API call to get conversation history
  return [];
}

// Verify the signature from Instagram
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature || !APP_SECRET) return false;

  const expectedSignature = crypto
    .createHmac('sha256', APP_SECRET)
    .update(payload)
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}
