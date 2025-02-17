export type EventType = 'message' | 'message_reactions' | 'messaging_referral' | 'messaging_optins' | 'messaging_postbacks';
export type Direction = 'sent' | 'received';
export type ConversationStatus = 'sending_message' | 'waiting_message' | 'setted' | 'abandoned' | 'ignored';

export interface Event {
  date: number;
  type: EventType;
  direction: Direction;
  event_details: Record<string, unknown> & { id: string };
}

export interface Conversation {
  scoped_user_username: string;
  uuid: string;
  created_at: number;
  updated_at: number;
  instagram_user_id: string;
  scoped_user_id: string;
  status: ConversationStatus;
  events: Event[];
}

export interface InstagramMessage {
  id: string;
  text?: string;
  attachments?: Array<{
    type: string;
    payload: {
      url: string;
    };
  }>;
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
}

export interface InstagramReactionEvent {
  mid: string;
  action: string;
  reaction: string;
}

export interface InstagramPostbackEvent {
  mid: string;
  payload: string;
  title: string;
}

export interface InstagramReferralEvent {
  ref: string;
  source: string;
}

export interface MessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: InstagramMessageEvent;
  reaction?: InstagramReactionEvent;
  postback?: InstagramPostbackEvent;
  referral?: InstagramReferralEvent;
} 