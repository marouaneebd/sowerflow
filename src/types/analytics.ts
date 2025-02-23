import { Conversation } from "./conversation";

export interface Analytics {
    conversations: Array<Conversation>;
    stats: {
      totalConversations: number;
      settedConversations: number;
      conversionRate: number;
    };
  }