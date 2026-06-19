"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { ChatPageLayout } from "@/components/chat";
import { SearchModal, useSearchShortcut } from "@/components/search/search-modal";

export function ChatPageClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  useSearchShortcut(openSearch);

  return (
    <>
      <Header onSearchOpen={openSearch} />
      <ChatPageLayout />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
