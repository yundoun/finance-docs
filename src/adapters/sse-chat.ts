import type { ChatPort, ChatMessage } from "@/ports/chat";
import { siteConfig } from "@/config/site";

export class SseChatAdapter implements ChatPort {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? siteConfig.mcpServerUrl;
  }

  async *sendMessage(messages: ChatMessage[]): AsyncIterable<string> {
    const res = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!res.ok) {
      throw new Error(`Chat request failed: ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content ?? parsed.token ?? parsed.content ?? data;
            if (typeof token === "string" && token) {
              yield token;
            }
          } catch {
            // Plain text SSE — yield as-is
            if (data) yield data;
          }
        }
      }
    }
  }
}
