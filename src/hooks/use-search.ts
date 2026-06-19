"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useServices } from "@/providers/service-provider";
import type { SearchResult } from "@/ports/search";

export function useSearch(locale: string = "ko") {
  const { search: searchPort } = useServices();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await searchPort.search(q, { locale, limit: 10 });
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchPort, locale],
  );

  const updateQuery = useCallback(
    (q: string) => {
      setQuery(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(q), 250);
    },
    [doSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { query, setQuery: updateQuery, results, isLoading };
}
