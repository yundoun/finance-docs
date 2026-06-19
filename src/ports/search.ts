export interface SearchOptions {
  locale?: string;
  limit?: number;
}

export interface SearchResult {
  title: string;
  description: string;
  slug: string;
  locale: string;
  category: string;
  score: number;
  highlights?: string[];
}

export interface SearchPort {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}
