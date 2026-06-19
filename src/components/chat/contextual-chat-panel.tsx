"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, FileText, ArrowRight, Loader2 } from "lucide-react";
import { useServices } from "@/providers/service-provider";
import type { ChatMessage } from "@/ports/chat";
import { cn } from "@/lib/utils";

interface ContextualChatPanelProps {
  docTitle: string;
  docSlug: string;
  locale: string;
  relatedSlugs?: string[];
  relatedTitles?: Record<string, string>;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

let msgCounter = 0;

export function ContextualChatPanel({
  docTitle,
  docSlug,
  locale,
  relatedSlugs = [],
  relatedTitles = {},
}: ContextualChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const { chat: chatPort } = useServices();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMsg: Message = {
        id: `m-${++msgCounter}`,
        role: "user",
        content: content.trim(),
      };
      const assistantMsg: Message = {
        id: `m-${++msgCounter}`,
        role: "assistant",
        content: "",
      };

      const allMessages = [...messages, userMsg];
      setMessages([...allMessages, assistantMsg]);
      setInput("");
      setIsStreaming(true);
      abortRef.current = false;

      // Build context-aware messages for the port
      const systemContext: ChatMessage = {
        id: "ctx",
        role: "user",
        content: `[맥락: 사용자가 "${docTitle}" 문서(${docSlug})를 읽고 있습니다. 이 문서의 내용을 기반으로 답변해주세요. 답변 후 관련 문서를 추천해주세요.]`,
        timestamp: Date.now(),
      };

      const chatMessages: ChatMessage[] = [
        systemContext,
        ...allMessages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: Date.now(),
        })),
      ];

      try {
        let accumulated = "";
        for await (const token of chatPort.sendMessage(chatMessages)) {
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
    [chatPort, messages, isStreaming, docTitle, docSlug],
  );

  const handleSubmit = useCallback(() => {
    sendMessage(input);
  }, [sendMessage, input]);

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-600 text-white shadow-lg transition-all hover:bg-secondary-700 hover:shadow-xl lg:bottom-8 lg:right-8"
          aria-label="AI에게 질문하기"
        >
          <MessageCircle size={22} />
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => {
              abortRef.current = true;
              setIsOpen(false);
            }}
          />

          <div className="fixed bottom-0 right-0 top-14 z-40 flex w-full flex-col border-l border-neutral-200 bg-white shadow-xl sm:w-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Bot size={14} className="shrink-0 text-secondary-600" />
                  <span className="text-sm font-semibold text-neutral-900">
                    이 문서에 대해 질문
                  </span>
                </div>
                <p className="truncate text-xs text-neutral-500">{docTitle}</p>
              </div>
              <button
                onClick={() => {
                  abortRef.current = true;
                  setIsOpen(false);
                }}
                className="shrink-0 rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <EmptyState
                  docTitle={docTitle}
                  onAsk={sendMessage}
                  relatedSlugs={relatedSlugs}
                  relatedTitles={relatedTitles}
                  locale={locale}
                />
              ) : (
                <div className="space-y-4 p-4">
                  {messages.map((msg, i) => (
                    <MessageBubble
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
            <div className="border-t border-neutral-200 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="이 문서에 대해 질문하세요..."
                  rows={1}
                  disabled={isStreaming}
                  className="flex-1 resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-secondary-300 focus:bg-white focus:ring-2 focus:ring-secondary-100 disabled:opacity-50"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isStreaming}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                    input.trim() && !isStreaming
                      ? "bg-secondary-600 text-white hover:bg-secondary-700"
                      : "bg-neutral-100 text-neutral-400",
                  )}
                >
                  {isStreaming ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary-600 text-white" : "bg-secondary-100 text-secondary-700",
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-800",
        )}
      >
        {message.content ? (
          <SimpleMarkdown content={message.content} />
        ) : isStreaming ? (
          <span className="inline-flex gap-1 text-neutral-400">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SimpleMarkdown({ content }: { content: string }) {
  const html = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-black/10 px-1 py-0.5 text-xs font-mono">$1</code>')
    .replace(/\n/g, "<br />");

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function EmptyState({
  docTitle,
  onAsk,
  relatedSlugs,
  relatedTitles,
  locale,
}: {
  docTitle: string;
  onAsk: (q: string) => void;
  relatedSlugs: string[];
  relatedTitles: Record<string, string>;
  locale: string;
}) {
  const suggestions = [
    `"${docTitle}"을 쉽게 설명해줘`,
    "이 내용에서 가장 중요한 포인트는?",
    "실전에서 어떻게 활용해?",
  ];

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
        <Bot size={24} />
      </div>
      <p className="mb-1 text-sm font-medium text-neutral-900">
        궁금한 점을 물어보세요
      </p>
      <p className="mb-6 text-center text-xs text-neutral-500">
        현재 읽고 있는 문서를 기반으로 답변합니다
      </p>

      {/* Suggestion chips */}
      <div className="mb-6 flex w-full flex-col gap-2">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => onAsk(q)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-left text-xs text-neutral-600 transition-colors hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Related docs */}
      {relatedSlugs.length > 0 && (
        <div className="w-full border-t border-neutral-100 pt-4">
          <p className="mb-2 text-xs font-medium text-neutral-400">
            다음에 읽을 문서
          </p>
          {relatedSlugs.slice(0, 3).map((slug) => (
            <a
              key={slug}
              href={`/${locale}/${slug}`}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              <FileText size={13} className="shrink-0 text-neutral-400" />
              <span className="flex-1 truncate">
                {relatedTitles[slug] ?? slug}
              </span>
              <ArrowRight size={12} className="shrink-0 text-neutral-300" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
