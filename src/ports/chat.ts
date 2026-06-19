export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatPort {
  sendMessage(messages: ChatMessage[]): AsyncIterable<string>;
}
