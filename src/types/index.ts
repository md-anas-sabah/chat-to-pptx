export interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "thinking" | "action" | "normal";
  actionDetails?: string;
}

export interface Slide {
  title: string;
  content: string;
  layout?: string;
  backgroundColor?: string;
  image?: string;
}

export interface ChatHistory {
  id: string;
  timestamp: Date;
  title: string;
  messages: Message[];
  slides: Slide[];
}
