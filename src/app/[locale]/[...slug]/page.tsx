import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getDocBySlug, getAllDocSlugs } from "@/lib/mdx";
import { mdxComponents } from "@/components/doc/mdx-components";
import { DifficultyBadge } from "@/components/doc/difficulty-badge";
import { SummaryBox } from "@/components/doc/summary-box";
import { Disclaimer } from "@/components/doc/disclaimer";
import { RelatedCards } from "@/components/doc/related-cards";
import { DocTocWrapper } from "./doc-toc-wrapper";
import { ContextualChatPanel } from "@/components/chat/contextual-chat-panel";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; slug: string[] }>;
}

export async function generateStaticParams() {
  return getAllDocSlugs().map(({ locale, slug }) => ({
    locale,
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = getDocBySlug(locale, slug);
  if (!doc) return {};
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  };
}

function extractSummary(content: string): {
  summary: string | null;
  contentWithoutSummary: string;
} {
  const match = content.match(/## 한 줄 요약\s*\n\n(.+?)(\n\n|\n##)/s);
  const summary = match?.[1]?.trim() ?? null;
  // Remove the "한 줄 요약" section from MDX to avoid duplication
  const contentWithoutSummary = summary
    ? content.replace(/## 한 줄 요약\s*\n\n.+?(\n\n|\n(?=##))/s, "$1")
    : content;
  return { summary, contentWithoutSummary };
}

function getRelatedTitles(
  locale: string,
  related: string[],
): Record<string, string> {
  const titles: Record<string, string> = {};
  for (const slug of related) {
    const doc = getDocBySlug(locale, slug.split("/"));
    if (doc) titles[slug] = doc.frontmatter.title;
  }
  return titles;
}

export default async function DocPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const doc = getDocBySlug(locale, slug);
  if (!doc) notFound();

  const { frontmatter, content: rawContent } = doc;
  const { summary, contentWithoutSummary } = extractSummary(rawContent);
  const relatedTitles = getRelatedTitles(locale, frontmatter.related ?? []);

  return (
    <div className="flex flex-1">
      {/* Main content */}
      <article className="min-w-0 flex-1 max-w-[800px] py-8 lg:pl-8 lg:pr-8">
        {/* Meta */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {frontmatter.difficulty && (
            <DifficultyBadge difficulty={frontmatter.difficulty} />
          )}
          {frontmatter.updated && (
            <span className="text-xs text-neutral-400">
              {frontmatter.updated} 기준
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          {frontmatter.title}
        </h1>
        <p className="mb-2 text-base text-neutral-500">
          {frontmatter.description}
        </p>

        {/* Summary box */}
        {summary && <SummaryBox>{summary}</SummaryBox>}

        {/* MDX body */}
        <div className="prose">
          <MDXRemote
            source={contentWithoutSummary}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>

        {/* Related */}
        <RelatedCards
          locale={locale}
          slugs={frontmatter.related ?? []}
          titles={relatedTitles}
        />

        {/* Disclaimer */}
        <Disclaimer />
      </article>

      {/* TOC */}
      <DocTocWrapper content={contentWithoutSummary} />

      {/* Contextual chat panel */}
      <ContextualChatPanel
        docTitle={frontmatter.title}
        docSlug={slug.join("/")}
        locale={locale}
        relatedSlugs={frontmatter.related ?? []}
        relatedTitles={relatedTitles}
      />
    </div>
  );
}
