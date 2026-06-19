import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatPageClient } from "./chat-page-client";

export const metadata: Metadata = {
  title: "AI 챗봇",
  description: "금융 교육 AI 챗봇 — 문서 기반 RAG로 정확한 답변을 제공합니다",
};

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageClient />
    </Suspense>
  );
}
