"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { SearchModal, useSearchShortcut } from "@/components/search/search-modal";
import type { CategoryGroup } from "@/ports/docs";

interface DocsLayoutClientProps {
  children: React.ReactNode;
  categories: CategoryGroup[];
}

export function DocsLayoutClient({
  children,
  categories,
}: DocsLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  useSearchShortcut(openSearch);

  return (
    <>
      <Header
        onMenuToggle={() => setSidebarOpen((v) => !v)}
        isMenuOpen={sidebarOpen}
        onSearchOpen={openSearch}
      />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 px-4">
        <Sidebar
          categories={categories}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <Footer />

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
