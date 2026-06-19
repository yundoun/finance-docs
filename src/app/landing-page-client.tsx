"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Send,
  TrendingUp,
  Landmark,
  Receipt,
  BarChart3,
  BookOpen,
  ArrowRight,
  MessageCircle,
  Code,
  Bot,
  FileText,
  Loader2,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Footer } from "@/components/layout/footer";
import { SearchModal, useSearchShortcut } from "@/components/search/search-modal";
import { useServices } from "@/providers/service-provider";
import type { CategoryGroup } from "@/ports/docs";
import type { ChatMessage } from "@/ports/chat";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  basics: <TrendingUp size={24} />,
  accounts: <Landmark size={24} />,
  tax: <Receipt size={24} />,
  strategy: <BarChart3 size={24} />,
  glossary: <BookOpen size={24} />,
};

const EXAMPLE_QUERIES = [
  "투자 처음인데 뭐부터 해야 해?",
  "ISA 세제혜택이 뭐야?",
  "ETF와 주식의 차이는?",
  "30대 자산배분 전략 추천해줘",
];

interface LandingPageClientProps {
  categories: CategoryGroup[];
}

export function LandingPageClient({ categories }: LandingPageClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  useSearchShortcut(openSearch);

  // Hero chat state
  const { chat: chatPort } = useServices();
  const [heroInput, setHeroInput] = useState("");
  const [heroAnswer, setHeroAnswer] = useState("");
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroAsked, setHeroAsked] = useState(false);
  const heroAbortRef = useRef(false);
  const heroAnswerRef = useRef<HTMLDivElement>(null);

  const askHero = useCallback(
    async (question: string) => {
      if (!question.trim() || heroLoading) return;
      setHeroInput(question);
      setHeroLoading(true);
      setHeroAsked(true);
      setHeroAnswer("");
      heroAbortRef.current = false;

      const msg: ChatMessage = {
        id: "hero",
        role: "user",
        content: question.trim(),
        timestamp: Date.now(),
      };

      try {
        let acc = "";
        for await (const token of chatPort.sendMessage([msg])) {
          if (heroAbortRef.current) break;
          acc += token;
          setHeroAnswer(acc);
        }
      } catch {
        setHeroAnswer("죄송합니다. 응답을 가져오는 중 오류가 발생했습니다.");
      } finally {
        setHeroLoading(false);
      }

      // Scroll to answer
      setTimeout(() => {
        heroAnswerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    [chatPort, heroLoading],
  );

  return (
    <>
      {/* Minimal header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-bold text-primary-700">
            {siteConfig.logo.text}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={openSearch}
              className="flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-700"
            >
              <Search size={14} />
              <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium">
                ⌘K
              </kbd>
            </button>
            <Link
              href="/chat"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              AI 챗봇
            </Link>
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 transition-colors hover:text-neutral-900"
              aria-label="GitHub"
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — Learning-path oriented */}
        <section className="bg-gradient-to-b from-primary-50/60 to-white px-4 pb-16 pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              금융, 어디서부터 시작할지
              <br />
              <span className="text-primary-600">AI에게 물어보세요</span>
            </h1>
            <p className="mb-8 text-base text-neutral-500 sm:text-lg">
              학습 경로 추천부터 개념 설명까지 — 질문하면 문서와 함께 안내합니다
            </p>

            {/* Chat input */}
            <div className="mx-auto max-w-lg">
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 shadow-sm transition-shadow focus-within:border-primary-300 focus-within:shadow-md">
                <Bot size={18} className="shrink-0 text-secondary-500" />
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") askHero(heroInput);
                  }}
                  placeholder="금융에 대해 질문하세요..."
                  className="flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                  disabled={heroLoading}
                />
                <button
                  onClick={() => askHero(heroInput)}
                  disabled={!heroInput.trim() || heroLoading}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:bg-neutral-100 disabled:text-neutral-400"
                >
                  {heroLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>

              {/* Example query chips */}
              {!heroAsked && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {EXAMPLE_QUERIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => askHero(q)}
                      className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-secondary-300 hover:text-secondary-700"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hero AI Answer */}
            {heroAsked && (
              <div
                ref={heroAnswerRef}
                className="mx-auto mt-8 max-w-lg rounded-xl border border-neutral-200 bg-white p-5 text-left shadow-sm"
              >
                {/* User question */}
                <div className="mb-4 flex items-start gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
                    <MessageCircle size={12} />
                  </div>
                  <p className="text-sm font-medium text-neutral-900">
                    {heroInput}
                  </p>
                </div>

                {/* AI answer */}
                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
                    <Bot size={12} />
                  </div>
                  <div className="min-w-0 flex-1 text-sm leading-relaxed text-neutral-700">
                    {heroAnswer ? (
                      <HeroMarkdown content={heroAnswer} />
                    ) : heroLoading ? (
                      <span className="inline-flex gap-1 text-neutral-400">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* CTA to full chat */}
                {!heroLoading && heroAnswer && (
                  <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3">
                    <Link
                      href="/chat"
                      className="flex items-center gap-1.5 rounded-lg bg-secondary-50 px-3 py-2 text-xs font-medium text-secondary-700 transition-colors hover:bg-secondary-100"
                    >
                      <MessageCircle size={13} />
                      이어서 대화하기
                    </Link>
                    <Link
                      href="/ko/basics/stocks"
                      className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
                    >
                      <FileText size={13} />
                      문서 둘러보기
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Category cards */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-neutral-900">
              카테고리별 문서
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/ko/${cat.items[0]?.slug ?? cat.slug}`}
                  className="group rounded-xl border border-neutral-200 p-6 transition-all hover:border-primary-300 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                    {CATEGORY_ICONS[cat.slug] ?? <BookOpen size={24} />}
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-neutral-900">
                    {cat.name}
                  </h3>
                  <p className="mb-3 text-sm text-neutral-500">
                    {cat.items.map((i) => i.title).join(", ")}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600">
                    {cat.items.length}개 문서
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* MCP section */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600">
                <Code size={12} />
                개발자용
              </div>
              <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                MCP 서버로 연결하세요
              </h2>
              <p className="text-sm text-neutral-500">
                AI 어시스턴트에서 금융 문서를 직접 검색하고 질문할 수 있습니다
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 text-sm">
              <div className="flex items-center gap-2 border-b border-neutral-700 px-4 py-2">
                <span className="text-xs text-neutral-400">.mcp.json</span>
              </div>
              <pre className="overflow-x-auto p-4 leading-relaxed text-neutral-300">
                <code>{`{
  "mcpServers": {
    "finance-docs": {
      "command": "npx",
      "args": ["-y", "finance-docs-mcp"],
      "env": {
        "DOCS_PATH": "./content/docs"
      }
    }
  }
}`}</code>
              </pre>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function HeroMarkdown({ content }: { content: string }) {
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
