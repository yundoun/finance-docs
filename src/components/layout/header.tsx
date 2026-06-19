"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { siteConfig, type Locale } from "@/config/site";

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
  onSearchOpen?: () => void;
}

export function Header({ onMenuToggle, isMenuOpen, onSearchOpen }: HeaderProps) {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as Locale) ?? siteConfig.defaultLocale;

  const switchLocale = locale === "ko" ? "en" : "ko";
  const switchPath = pathname.replace(`/${locale}`, `/${switchLocale}`);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="text-neutral-500 hover:text-neutral-900 lg:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold text-primary-700"
        >
          {siteConfig.logo.text}
        </Link>

        {/* Chat link */}
        {siteConfig.features.chat && (
          <Link
            href="/chat"
            className="hidden text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 sm:inline"
          >
            AI 챗봇
          </Link>
        )}

        <div className="flex-1" />

        {/* Search trigger */}
        {siteConfig.features.search && (
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-white"
          >
            <Search size={14} />
            <span className="hidden sm:inline">검색</span>
            <kbd className="hidden rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-medium text-neutral-500 sm:inline">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Language switch */}
        {siteConfig.features.languageSwitch && (
          <Link
            href={switchPath}
            className="rounded-md px-2 py-1 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            {locale === "ko" ? "EN" : "KO"}
          </Link>
        )}

        {/* GitHub */}
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
    </header>
  );
}
