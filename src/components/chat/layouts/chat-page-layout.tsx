"use client";

import { ChatContainer } from "../chat-container";
import { Trash2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";

export function ChatPageLayout() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Chat header bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div>
          <h1 className="text-base font-semibold text-neutral-900">
            AI 챗봇
          </h1>
          <p className="text-xs text-neutral-500">
            문서 기반 RAG — 금융 교육 목적
          </p>
        </div>
        <ClearButton />
      </div>

      {/* Chat container fills remaining space */}
      <ChatContainer className="flex-1" />
    </div>
  );
}

function ClearButton() {
  const { messages, clearMessages } = useChat();

  if (messages.length === 0) return null;

  return (
    <button
      onClick={clearMessages}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
    >
      <Trash2 size={14} />
      대화 초기화
    </button>
  );
}
