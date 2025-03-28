import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import {
  WebhookEntry,
  Conversation,
  ConversationStatus,
  Event
} from '@/types/conversation';
import { Profile } from '@/types/profile';
import { Media } from '@/types/media';

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
      const profilesRef = adminDb.collection('profiles');
      const profileSnapshot = await profilesRef
        .where('instagram.userId', '==', entry.id)
        .limit(1)
        .get();

      if (profileSnapshot.empty) {
        console.error(`No user found for Instagram ID: ${entry.id}`);
        continue;
      }

      const profile: Profile = profileSnapshot.docs[0].data() as Profile;
      const uuid = profile.uuid;
      const accessToken = profile.instagram?.access_token;

      if (!accessToken) {
        console.log(`No access token found for Instagram ID: ${entry.id}`);
        continue;
      }

      // Process change events
      if (entry.changes) {
        for (const changeEvent of entry.changes) {
          // Get the scoped_user_id from the from.id for changes
          const scoped_user_id = changeEvent.value?.from?.id;

          if (!scoped_user_id) {
            console.error(`No scoped_user_id found for change event: ${JSON.stringify(changeEvent)}`);
            continue;
          }

          let description = '';

          // If this is a media-related event, fetch the caption
          if (changeEvent.value?.media?.id && changeEvent.value?.text) {
            const mediaDetails = await getMediaDetails(
              changeEvent.value.media.id,
              accessToken,
              uuid,
              entry.id // instagram_user_id
            ) as Media;
            if (mediaDetails.caption) {
              description += "L'utilisateur a fait un commentaire sur une publication Instagram.";
              description += `Description de la publication: ${mediaDetails.caption}`;
              description += `Commentaire de l'utilisateur: ${changeEvent.value.text}`;
            }
          }

          const event: Event = {
            date: entry.time,
            type: changeEvent.field,
            direction: 'received',
            description: description,
            event_details: {
              comment: changeEvent.value
            }
          };

          await processConversationEvent(uuid, entry.id, scoped_user_id, event, accessToken);
        }
      }

      // Process messaging events
      if (entry.messaging) {
        for (const messagingEvent of entry.messaging) {
          let description = '';
          // Get the scoped_user_id as the other party in the conversation
          const scoped_user_id = messagingEvent.sender.id === entry.id
            ? messagingEvent.recipient.id
            : messagingEvent.sender.id;

          if (!scoped_user_id) {
            console.error(`No scoped_user_id found for messaging event: ${JSON.stringify(messagingEvent)}`);
            continue;
          }

          if (messagingEvent?.message?.text) {
            description += messagingEvent.message.text;
          }

          if (messagingEvent?.message?.attachments) {
            for (const attachment of messagingEvent.message.attachments) {
              if (attachment.payload?.title) {
                description += `L'utilisateur a envoyé une pièce jointe dont le titre est ${attachment?.payload?.title}`;
              }
            }
          }

          const event: Event = {
            date: messagingEvent.timestamp,
            type: messagingEvent?.message ? 'message' : messagingEvent?.reaction ? 'message_reactions' : messagingEvent?.postback ? 'messaging_postbacks' : messagingEvent?.referral ? 'messaging_referral' : 'messaging_seen',
            direction: messagingEvent.sender.id === entry.id ? 'sent' : 'received',
            description: description,
            event_details: messagingEvent
          };

          await processConversationEvent(uuid, entry.id, scoped_user_id, event, accessToken);
        }
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
  const conversationRef = adminDb.collection('conversations').doc(conversationId);
  const conversationDoc = await conversationRef.get();

  if (!conversationDoc.exists) {
    const fetchInstagramProfile = await fetch(`https://graph.instagram.com/v22.0/${scoped_user_id}?access_token=${accessToken}`);
    const instagramProfile = await fetchInstagramProfile.json();

    let status: ConversationStatus = 'ignored';
    if (event.direction === 'received' && ['message', 'messaging_postbacks', 'messaging_referral', 'messaging_optins', 'comments', 'live_comments'].includes(event.type)) {
      status = 'sending_message';
    }

    // Create new conversation
    const newConversation: Conversation = {
      uuid: uuid,
      created_at: Date.now(),
      updated_at: Date.now(),
      instagram_user_id: instagram_user_id,
      scoped_user_id: scoped_user_id,
      scoped_user_username: instagramProfile.username,
      scoped_user_bio: instagramProfile.biography || '',
      status: status,
      events: [event],
    };

    await conversationRef.set(newConversation);
  } else {
    const conversation = conversationDoc.data() as Conversation;

    // Check if conversation is ignored or event already exists
    if (conversation.status === 'ignored' ||
      conversation.events.some(e => event.type === 'message' && event.event_details?.message?.mid === e.event_details?.message?.mid) ||
      ((event.type === 'comments' ||
      event.type === 'live_comments') &&
      conversation.status !== 'abandoned')
    ) {
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

    await conversationRef.update(updates);
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
async function getMediaDetails(mediaId: string, accessToken: string, uuid: string, instagram_user_id: string) {
  const media_document_id = `${instagram_user_id}_${mediaId}`;
  try {
    // First check if media exists in Firebase
    const mediaRef = adminDb.collection('medias').doc(media_document_id);
    const mediaDoc = await mediaRef.get();

    if (mediaDoc.exists) {
      return mediaDoc.data() as Media;
    }

    // If not found in Firebase, fetch from Instagram API
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${mediaId}?fields=caption,media_url,permalink,media_product_type,timestamp&access_token=${accessToken}`
    );
    const data = await response.json();

    if (!data || data.error) {
      console.error('Error fetching from Instagram API:', data.error);
      return null;
    }

    // Create new media object
    const newMedia: Media = {
      id: mediaId,
      uuid: uuid,
      instagram_user_id: data.owner?.id,
      created_at: Date.now(),
      updated_at: Date.now(),
      media_product_type: data.media_product_type,
      caption: data.caption || '',
      media_url: data.media_url || '',
      permalink: data.permalink || '',
      timestamp: new Date(data.timestamp).getTime()
    };

    // Store in Firebase
    await mediaRef.set(newMedia);

    return newMedia as Media;
  } catch (error) {
    console.error('Error in getMediaDetails:', error);
    return null;
  }
}
