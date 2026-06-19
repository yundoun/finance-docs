import type { SearchPort, SearchOptions, SearchResult } from "@/ports/search";
import { siteConfig } from "@/config/site";

interface McpSearchResult {
  chunkId: string;
  docPath: string;
  title: string;
  breadcrumb: string;
  score: number;
  snippet: string;
  category: string;
  locale: string;
}

// docPath → 한글 제목 매핑 (빌드 시 MDX frontmatter에서 가져올 수 없으므로 하드코딩)
// TODO: /api/docs 엔드포인트 추가 시 동적으로 교체
const DOC_TITLES: Record<string, string> = {
  "ko/basics/stocks.mdx": "주식이란",
  "ko/basics/etf.mdx": "ETF (상장지수펀드)",
  "ko/accounts/isa.mdx": "ISA (개인종합자산관리계좌)",
  "ko/tax/capital-gains-tax.mdx": "양도소득세 (주식 매매 차익 과세)",
  "ko/glossary/valuation.mdx": "밸류에이션 지표 (PER, PBR, ROE, EPS)",
  "ko/strategy/asset-allocation.mdx": "자산배분 전략",
};

function getDocTitle(docPath: string, breadcrumb: string): string {
  if (DOC_TITLES[docPath]) return DOC_TITLES[docPath];
  // Fallback: breadcrumb의 중간 부분 사용 (e.g. "Basics > Etf > ..." → "Etf")
  const parts = breadcrumb.split(" > ");
  return parts.length >= 2 ? parts.slice(0, -1).join(" — ") : breadcrumb;
}

export class RestSearchAdapter implements SearchPort {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? siteConfig.mcpServerUrl;
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const params = new URLSearchParams({ q: query });
    if (options?.locale) params.set("locale", options.locale);
    if (options?.limit) params.set("limit", String(options.limit));

    try {
      const res = await fetch(`${this.baseUrl}/api/search?${params}`);
      if (!res.ok) return [];
      const json = await res.json();
      const raw: McpSearchResult[] = Array.isArray(json) ? json : (json.results ?? []);

      // Deduplicate by docPath (MCP returns chunk-level results)
      const seen = new Set<string>();
      const results: SearchResult[] = [];

      for (const item of raw) {
        if (seen.has(item.docPath)) continue;
        seen.add(item.docPath);

        // Convert docPath "ko/accounts/isa.mdx" → slug "accounts/isa"
        const slug = item.docPath
          .replace(/^(ko|en)\//, "")
          .replace(/\.mdx$/, "");

        const locale = item.docPath.startsWith("en/") ? "en" : "ko";

        const docTitle = getDocTitle(item.docPath, item.breadcrumb);

        results.push({
          title: docTitle,
          description: item.snippet.substring(0, 100).replace(/\n/g, " ").trim(),
          slug,
          locale,
          category: item.category,
          score: item.score,
        });
      }

      return results;
    } catch {
      return [];
    }
  }
}
