"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ChatPageLayout } from "@/components/chat";
import { SearchModal, useSearchShortcut } from "@/components/search/search-modal";

export function ChatPageClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  useSearchShortcut(openSearch);

  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? undefined;

  return (
    <>
      <Header onSearchOpen={openSearch} />
      <ChatPageLayout initialQuery={initialQuery} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
