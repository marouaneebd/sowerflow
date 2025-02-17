import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/app/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import {
  MessagingEvent,
  Event,
  EventType,
  Direction,
  Conversation
} from '@/types/instagram';

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

    console.log(JSON.stringify(body));

    // Process each entry in the webhook
    for (const entry of body.entry) {
      // Find the user UID from profiles collection
      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where('instagram.userId', '==', entry.id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error(`No user found for Instagram ID: ${entry.id}`);
        continue;
      }

      const uuid = querySnapshot.docs[0].id;
      const accessToken = querySnapshot.docs[0].data().instagram.accessToken;
      // Handle messaging events
      if (entry.messaging) {
        for (const messagingEvent of entry.messaging) {
          await processMessagingEvent(messagingEvent, entry.id, uuid, accessToken);
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processMessagingEvent(messagingEvent: MessagingEvent, instagram_user_id: string, uuid: string, accessToken: string) {
  // Validate required fields
  if (!messagingEvent.sender?.id || !messagingEvent.recipient?.id || !messagingEvent.timestamp) {
    console.error('Missing required fields in messaging event');
    return;
  }

  const senderId = messagingEvent.sender.id;
  const recipientId = messagingEvent.recipient.id;

  let scopedUserId: string;
  let direction: Direction;

  if (senderId === instagram_user_id) {
    scopedUserId = recipientId;
    direction = 'sent';
  } else {
    scopedUserId = senderId;
    direction = 'received';
  }

  let eventType: EventType;
  let eventDetails: Record<string, unknown> & { id: string };

  if (messagingEvent.message) {
    eventType = 'message';
    eventDetails = {
      id: messagingEvent.message.mid,
      text: messagingEvent.message.text || '',
      attachments: messagingEvent.message.attachments || [],
      is_echo: messagingEvent.message.is_echo || false
    } as Record<string, unknown> & { id: string };
  } else if (messagingEvent.reaction) {
    eventType = 'message_reactions';
    eventDetails = {
      id: messagingEvent.reaction.mid,
      action: messagingEvent.reaction.action || '',
      reaction: messagingEvent.reaction.reaction || ''
    } as Record<string, unknown> & { id: string };
  } else if (messagingEvent.postback) {
    eventType = 'messaging_postbacks';
    eventDetails = {
      id: messagingEvent.postback.mid,
      payload: messagingEvent.postback.payload || '',
      title: messagingEvent.postback.title || ''
    } as Record<string, unknown> & { id: string };
  } else if (messagingEvent.referral) {
    eventType = 'messaging_referral';
    eventDetails = {
      id: `${messagingEvent.timestamp}_referral`,
      ref: messagingEvent.referral.ref || '',
      source: messagingEvent.referral.source || ''
    } as Record<string, unknown> & { id: string };
  } else {
    console.log('Unsupported event type');
    return;
  }

  const event: Event = {
    date: messagingEvent.timestamp,
    type: eventType,
    direction,
    event_details: eventDetails,
  };

  await processConversationEvent(uuid, instagram_user_id, scopedUserId, event, accessToken);
}

async function processConversationEvent(uuid: string, instagram_user_id: string, scopedUserId: string, event: Event, accessToken: string) {
  const conversationId = `${instagram_user_id}_${scopedUserId}`;
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationDoc = await getDoc(conversationRef);

  if (!conversationDoc.exists()) {

    const fetchProfile = await fetch(`https://graph.instagram.com/v22.0/${scopedUserId}?access_token=${accessToken}`);
    const { username } = await fetchProfile.json();
    // Create new conversation
    const newConversation: Conversation = {
      uuid: uuid,
      created_at: Date.now(),
      updated_at: Date.now(),
      instagram_user_id: instagram_user_id,
      scoped_user_id: scopedUserId,
      scoped_user_username: username.username,
      status: 'sending_message',
      events: [event],
    };

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

    if (event.type === 'message') {
      if (event.direction === 'received') {
        updates.status = 'sending_message';
      } else {
        if (event.event_details.is_echo) {
          updates.status = 'ignored';
        } else {
          updates.status = 'sending_message';
        }
      }
    }

    await updateDoc(conversationRef, updates);
  }
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
