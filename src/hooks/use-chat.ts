"use client";

import { useState, useCallback, useRef } from "react";
import { useServices } from "@/providers/service-provider";
import type { ChatMessage } from "@/ports/chat";

let msgId = 0;
function nextId() {
  return `msg-${++msgId}-${Date.now()}`;
}

export function useChat() {
  const { chat: chatPort } = useServices();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMsg: ChatMessage = {
        id: nextId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      const assistantMsg: ChatMessage = {
        id: nextId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages([...updatedMessages, assistantMsg]);
      setIsStreaming(true);
      abortRef.current = false;

      try {
        const stream = chatPort.sendMessage(updatedMessages);
        let accumulated = "";

        for await (const token of stream) {
          if (abortRef.current) break;
          accumulated += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: accumulated } : m,
            ),
          );
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "죄송합니다. 응답을 가져오는 중 오류가 발생했습니다." }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [chatPort, messages, isStreaming],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { messages, sendMessage, isStreaming, clearMessages, stopStreaming };
}
