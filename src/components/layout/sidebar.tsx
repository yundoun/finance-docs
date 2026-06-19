"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { CategoryGroup } from "@/ports/docs";
import type { Locale } from "@/config/site";
import { cn } from "@/lib/utils";

interface SidebarProps {
  categories: CategoryGroup[];
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ categories, isOpen, onClose }: SidebarProps) {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as Locale) ?? "ko";

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white px-4 pb-4 pt-8 transition-transform lg:sticky lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="space-y-6">
          {categories.map((group) => (
            <div key={group.slug}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {group.name}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const href = `/${locale}/${item.slug}`;
                  const isActive = pathname === href;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={href}
                        onClick={onClose}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-sm transition-colors",
                          isActive
                            ? "bg-primary-50 font-medium text-primary-700"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
