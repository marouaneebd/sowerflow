export type EventType = 'message' | 'message_reactions' | 'messaging_referral' | 'messaging_optins' | 'messaging_postbacks' | 'messaging_seen' | 'comments' | 'live_comments';
export type Direction = 'sent' | 'received';
export type ConversationStatus = 'sending_message' | 'waiting_message' | 'setted' | 'abandoned' | 'ignored';


export interface WebhookEntry {
  id: string;
  time: number;
  messaging?: Array<{
    sender: { id: string };
    recipient: { id: string };
    timestamp: number;
    message?: InstagramMessageEvent;
    reaction?: InstagramReactionEvent;
    postback?: InstagramPostbackEvent;
    referral?: InstagramReferralEvent;
    read?: InstagramSeenEvent;
  }>;
  changes?: Array<{
    field: 'comments' | 'live_comments';
    value: CommentingEvent;
  }>;
}

export interface Conversation {
  created_at: number;
  updated_at: number;
  uuid: string;
  instagram_user_id: string;
  scoped_user_id: string;
  scoped_user_username: string;
  scoped_user_bio: string;
  abandon_reason?: string;
  setted_reason?: string;
  status: ConversationStatus;
  events: Event[];
}

export interface Event {
  date: number;
  type: EventType;
  direction: Direction;
  description: string;
  event_details: EventDetails;
}

export interface EventDetails {
  message?: InstagramMessageEvent;
  reaction?: InstagramReactionEvent;
  postback?: InstagramPostbackEvent;
  referral?: InstagramReferralEvent;
  read?: InstagramSeenEvent;
  comment?: InstagramCommentEvent;
  live_comment?: InstagramLiveCommentEvent;
}

export interface InstagramMessageEvent {
  mid: string;
  text?: string;
  attachments?: Array<{
    type: string;
    payload: {
      url: string;
    };
  }>;
  is_echo?: boolean;
  is_deleted?: boolean;
  is_unsupported?: boolean;
  quick_reply?: {
    payload: string;
  };
  referral?: {
    ref: string;
    ad_id: string;
    source: string;
    type: string;
    ads_context_data?: {
      ad_title: string;
      photo_url?: string;
      video_url?: string;
    };
  };
  reply_to?: {
    mid?: string;
    story?: {
      url: string;
      id: string;
    };
  };
}

export interface InstagramReactionEvent {
  mid: string;
  action: 'react' | 'unreact';
  reaction?: 'love';
  emoji?: string;
}

export interface InstagramPostbackEvent {
  mid: string;
  title: string;
  payload: string;
}

export interface InstagramReferralEvent {
  ref: string;
  source: string;
  type?: 'OPEN_THREAD';
}

export interface InstagramSeenEvent {
  mid: string;
}

export interface CommentingEvent {
  from: {
    id: string;
    username: string;
  };
  comment_id: string;
  parent_id?: string;
  text: string;
  media: {
    id: string;
    ad_id?: string;
    ad_title?: string;
    original_media_id?: string;
    media_product_type?: string;
  };
}

export type InstagramCommentEvent = CommentingEvent;
export type InstagramLiveCommentEvent = CommentingEvent;
