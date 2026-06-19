"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Search, X, FileText, Loader2, Bot, ArrowRight } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { useServices } from "@/providers/service-provider";
import type { Locale } from "@/config/site";
import type { ChatMessage } from "@/ports/chat";
import { cn } from "@/lib/utils";

type Tab = "search" | "ai";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const params = useParams();
  const locale = (params?.locale as Locale) ?? "ko";
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, isLoading } = useSearch(locale);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tab, setTab] = useState<Tab>("search");

  // AI state
  const { chat: chatPort } = useServices();
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAsked, setAiAsked] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
      setTab("search");
      setAiAnswer("");
      setAiAsked(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleSelect = useCallback(
    (slug: string) => {
      router.push(`/${locale}/${slug}`);
      onClose();
    },
    [router, locale, onClose],
  );

  const askAi = useCallback(async () => {
    if (!query.trim() || aiLoading) return;
    setTab("ai");
    setAiLoading(true);
    setAiAsked(true);
    setAiAnswer("");
    abortRef.current = false;

    const msg: ChatMessage = {
      id: "search-ai",
      role: "user",
      content: query.trim(),
      timestamp: Date.now(),
    };

    try {
      let accumulated = "";
      for await (const token of chatPort.sendMessage([msg])) {
        if (abortRef.current) break;
        accumulated += token;
        setAiAnswer(accumulated);
      }
    } catch {
      setAiAnswer("죄송합니다. 응답을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  }, [query, aiLoading, chatPort]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Tab") {
        e.preventDefault();
        setTab((t) => (t === "search" ? "ai" : "search"));
      } else if (tab === "search") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && !e.shiftKey) {
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex].slug);
          }
        }
      } else if (tab === "ai" && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        askAi();
      }
    },
    [onClose, tab, results, selectedIndex, handleSelect, askAi],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          abortRef.current = true;
          onClose();
        }}
      />

      {/* Modal */}
      <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
          <Search size={18} className="shrink-0 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              tab === "search" ? "문서 검색..." : "AI에게 질문하세요..."
            }
            className="flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          />
          {(isLoading || aiLoading) && (
            <Loader2
              size={16}
              className="shrink-0 animate-spin text-neutral-400"
            />
          )}
          <button
            onClick={() => {
              abortRef.current = true;
              onClose();
            }}
            className="shrink-0 text-neutral-400 hover:text-neutral-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-100 px-4">
          <button
            onClick={() => setTab("search")}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
              tab === "search"
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-neutral-500 hover:text-neutral-700",
            )}
          >
            <FileText size={13} />
            문서 검색
          </button>
          <button
            onClick={() => {
              setTab("ai");
              if (query.trim() && !aiAsked) askAi();
            }}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
              tab === "ai"
                ? "border-secondary-600 text-secondary-700"
                : "border-transparent text-neutral-500 hover:text-neutral-700",
            )}
          >
            <Bot size={13} />
            AI에게 질문
          </button>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {tab === "search" ? (
            <SearchResults
              query={query}
              results={results}
              isLoading={isLoading}
              selectedIndex={selectedIndex}
              onSelect={handleSelect}
              onAskAi={() => {
                setTab("ai");
                askAi();
              }}
            />
          ) : (
            <AiAnswer
              query={query}
              answer={aiAnswer}
              isLoading={aiLoading}
              asked={aiAsked}
              results={results}
              locale={locale}
              onAsk={askAi}
              onNavigate={(slug) => {
                abortRef.current = true;
                handleSelect(slug);
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2 text-xs text-neutral-400">
          <span>
            <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono">
              Tab
            </kbd>{" "}
            탭 전환
            {tab === "search" && (
              <span className="ml-2">
                <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono">
                  ↵
                </kbd>{" "}
                선택
              </span>
            )}
            {tab === "ai" && !aiAsked && (
              <span className="ml-2">
                <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono">
                  ↵
                </kbd>{" "}
                질문
              </span>
            )}
          </span>
          <span>
            <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono">
              Esc
            </kbd>{" "}
            닫기
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Search Results Tab ── */

function SearchResults({
  query,
  results,
  isLoading,
  selectedIndex,
  onSelect,
  onAskAi,
}: {
  query: string;
  results: { slug: string; title: string; description: string }[];
  isLoading: boolean;
  selectedIndex: number;
  onSelect: (slug: string) => void;
  onAskAi: () => void;
}) {
  return (
    <div className="p-2">
      {!query && (
        <p className="px-3 py-6 text-center text-sm text-neutral-400">
          키워드를 입력하세요
        </p>
      )}

      {query && results.length === 0 && !isLoading && (
        <div className="px-3 py-6 text-center">
          <p className="mb-3 text-sm text-neutral-500">검색 결과가 없습니다</p>
          <button
            onClick={onAskAi}
            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary-50 px-3 py-2 text-xs font-medium text-secondary-700 transition-colors hover:bg-secondary-100"
          >
            <Bot size={13} />
            AI에게 물어보기
          </button>
        </div>
      )}

      {results.map((result, index) => (
        <button
          key={result.slug}
          onClick={() => onSelect(result.slug)}
          className={cn(
            "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
            index === selectedIndex
              ? "bg-primary-50 text-primary-700"
              : "text-neutral-700 hover:bg-neutral-50",
          )}
        >
          <FileText size={16} className="mt-0.5 shrink-0 text-neutral-400" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{result.title}</p>
            <p className="truncate text-xs text-neutral-500">
              {result.description}
            </p>
          </div>
        </button>
      ))}

      {/* Prompt to try AI when results exist */}
      {query && results.length > 0 && (
        <button
          onClick={onAskAi}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-neutral-500 transition-colors hover:bg-secondary-50 hover:text-secondary-700"
        >
          <Bot size={14} className="shrink-0" />
          <span>
            &quot;{query}&quot; — AI에게 직접 질문하기
          </span>
        </button>
      )}
    </div>
  );
}

/* ── AI Answer Tab ── */

function AiAnswer({
  query,
  answer,
  isLoading,
  asked,
  results,
  locale,
  onAsk,
  onNavigate,
}: {
  query: string;
  answer: string;
  isLoading: boolean;
  asked: boolean;
  results: { slug: string; title: string; description: string }[];
  locale: string;
  onAsk: () => void;
  onNavigate: (slug: string) => void;
}) {
  if (!query.trim()) {
    return (
      <div className="px-4 py-8 text-center">
        <Bot size={24} className="mx-auto mb-2 text-neutral-300" />
        <p className="text-sm text-neutral-400">
          질문을 입력하고 Enter를 누르세요
        </p>
      </div>
    );
  }

  if (!asked) {
    return (
      <div className="px-4 py-8 text-center">
        <button
          onClick={onAsk}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary-700"
        >
          <Bot size={16} />
          &quot;{query}&quot; 질문하기
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* AI answer */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-1.5">
          <Bot size={14} className="text-secondary-600" />
          <span className="text-xs font-medium text-secondary-700">
            AI 답변
          </span>
          {isLoading && (
            <Loader2 size={12} className="animate-spin text-neutral-400" />
          )}
        </div>
        <div className="text-sm leading-relaxed text-neutral-700">
          {answer ? (
            <AiMarkdown content={answer} />
          ) : isLoading ? (
            <span className="inline-flex gap-1 text-neutral-400">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
            </span>
          ) : null}
        </div>
      </div>

      {/* Related documents */}
      {results.length > 0 && (
        <div className="border-t border-neutral-100 pt-3">
          <p className="mb-2 text-xs font-medium text-neutral-400">
            관련 문서
          </p>
          <div className="space-y-1">
            {results.slice(0, 3).map((r) => (
              <button
                key={r.slug}
                onClick={() => onNavigate(r.slug)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-primary-50"
              >
                <FileText size={14} className="shrink-0 text-primary-400" />
                <span className="flex-1 truncate text-xs font-medium text-neutral-700">
                  {r.title}
                </span>
                <ArrowRight size={12} className="shrink-0 text-neutral-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AiMarkdown({ content }: { content: string }) {
  const html = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /`(.+?)`/g,
      '<code class="rounded bg-neutral-100 px-1 py-0.5 text-xs font-mono">$1</code>',
    )
    .replace(/\n/g, "<br />");

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Global ⌘K listener — mount once in a layout */
export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpen();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onOpen]);
}
