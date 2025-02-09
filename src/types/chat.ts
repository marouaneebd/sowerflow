export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export type ChatRole = ChatMessage["role"]; 