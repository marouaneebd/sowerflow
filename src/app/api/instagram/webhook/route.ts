import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/app/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import {
  WebhookEntry,
  Conversation,
  Event
} from '@/types/conversation';

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
    const body: { object: string; entry: WebhookEntry[] } = JSON.parse(rawBody);

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


      // Create a list of events from the entry
      const events: Event[] = [];

      if (entry.changes) {
        for (const changeEvent of entry.changes) {
          let description = '';
          
          // If this is a media-related event, fetch the caption
          if (changeEvent.value?.media?.id && changeEvent.value?.text) {
            const mediaDetails = await getMediaDetails(changeEvent.value.media.id, accessToken);
            if (mediaDetails?.caption) {
              description += "L'utilisateur a fait un commentaire sur une publication Instagram.";
              description += `Description de la publication: ${mediaDetails.caption}`;
              description += `Commentaire de l'utilisateur: ${changeEvent.value.text}`;
            }
          }

          events.push({
            date: entry.time,
            type: changeEvent.field,
            direction: 'received',
            description: description,
            event_details: {
              comment: changeEvent.value
            }
          });
        }
      }

      if (entry.messaging) {
        for (const messagingEvent of entry.messaging) {
          let description = '';

          if (messagingEvent?.message?.text) {
            description += messagingEvent.message.text;
          }

          events.push({
            date: messagingEvent.timestamp,
            type: messagingEvent?.message ? 'message' : messagingEvent?.reaction ? 'message_reactions' : messagingEvent?.postback ? 'messaging_postbacks' : messagingEvent?.referral ? 'messaging_referral' : 'messaging_seen',
            direction: messagingEvent.sender.id === entry.id ? 'sent' : 'received',
            description: description,
            event_details: messagingEvent
          });
        }
      }

      // Process events
      for (const event of events) {
        await processConversationEvent(uuid, entry.id, entry.id, event, accessToken);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processConversationEvent(uuid: string, instagram_user_id: string, scoped_user_id: string, event: Event, accessToken: string) {
  const conversationId = `${instagram_user_id}_${scoped_user_id}`;
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationDoc = await getDoc(conversationRef);

  if (!conversationDoc.exists()) {

    const fetchInstagramProfile = await fetch(`https://graph.instagram.com/v22.0/${scoped_user_id}?access_token=${accessToken}`);
    const instagramProfile = await fetchInstagramProfile.json();
    
    // Create new conversation
    const newConversation: Conversation = {
      uuid: uuid,
      created_at: Date.now(),
      updated_at: Date.now(),
      instagram_user_id: instagram_user_id,
      scoped_user_id: scoped_user_id,
      scoped_user_username: instagramProfile.username,
      scoped_user_bio: instagramProfile.biography || '',
      status: ['message', 'messaging_postbacks', 'messaging_referral', 'messaging_optins', 'comments', 'live_comments'].includes(event.type) ? 'sending_message' : 'ignored',
      events: [event],
    };

    await setDoc(conversationRef, newConversation);
  } else {
    const conversation = conversationDoc.data() as Conversation;

    // Check if conversation is ignored or event already exists
    if (conversation.status === 'ignored' ||
      conversation.events.some(e => e.event_details === event.event_details)) {
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
        if (event.event_details.message?.is_echo) {
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

// Helper function to fetch media details
async function getMediaDetails(mediaId: string, accessToken: string) {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${mediaId}?fields=caption,media_url,permalink&access_token=${accessToken}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching media details:', error);
    return null;
  }
}
