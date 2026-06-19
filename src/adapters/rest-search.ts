import type { SearchPort, SearchOptions, SearchResult } from "@/ports/search";
import { siteConfig } from "@/config/site";

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
      const data = await res.json();
      return data.results ?? data ?? [];
    } catch {
      return [];
    }
  }
}
