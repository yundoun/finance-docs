"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessageBubble } from "./chat-message";
import { ChatInput } from "./chat-input";
import { cn } from "@/lib/utils";

interface ChatContainerProps {
  className?: string;
  initialQuery?: string;
}

export function ChatContainer({ className, initialQuery }: ChatContainerProps) {
  const { messages, sendMessage, isStreaming, stopStreaming } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialSentRef = useRef(false);

  // Auto-send initial query from URL param (e.g. /chat?q=...)
  useEffect(() => {
    if (initialQuery && !initialSentRef.current && messages.length === 0) {
      initialSentRef.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery, sendMessage, messages.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((msg, i) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                isStreaming={
                  isStreaming &&
                  i === messages.length - 1 &&
                  msg.role === "assistant"
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isStreaming}
        isStreaming={isStreaming}
        onStop={stopStreaming}
      />
    </div>
  );
}

function ChatEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 6v6l4 2" strokeLinecap="round" />
          <circle cx={12} cy={12} r={10} />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-neutral-900">
        금융 AI 어시스턴트
      </h2>
      <p className="mb-8 max-w-md text-center text-sm text-neutral-500">
        주식, ETF, 세금, 계좌 등 금융에 대해 질문하세요.
        문서 기반 RAG로 정확한 답변을 제공합니다.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {[
          "ISA 세제혜택이 뭐야?",
          "ETF와 주식의 차이는?",
          "30대 자산배분 추천해줘",
        ].map((q) => (
          <span
            key={q}
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600"
          >
            {q}
          </span>
        ))}
      </div>
    </div>
  );
}
