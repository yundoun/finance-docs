import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RelatedCardsProps {
  locale: string;
  slugs: string[];
  titles: Record<string, string>;
}

export function RelatedCards({ locale, slugs, titles }: RelatedCardsProps) {
  if (slugs.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">
        관련 문서
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slugs.map((slug) => (
          <Link
            key={slug}
            href={`/${locale}/${slug}`}
            className="group flex items-center justify-between rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/30"
          >
            <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-700">
              {titles[slug] ?? slug}
            </span>
            <ArrowRight
              size={16}
              className="text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-600"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
