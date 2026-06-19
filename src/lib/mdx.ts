import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { DocFrontmatter, DocContent, CategoryGroup } from "@/ports/docs";

const CONTENT_DIR = path.join(process.cwd(), "content/docs");

export function getDocBySlug(
  locale: string,
  slug: string[],
): DocContent | null {
  const filePath = path.join(CONTENT_DIR, locale, ...slug) + ".mdx";
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    frontmatter: data as DocFrontmatter,
    content,
    slug: slug.join("/"),
    locale,
  };
}

export function getAllDocSlugs(): { locale: string; slug: string[] }[] {
  const results: { locale: string; slug: string[] }[] = [];

  for (const locale of ["ko", "en"]) {
    const localeDir = path.join(CONTENT_DIR, locale);
    if (!fs.existsSync(localeDir)) continue;
    walkDir(localeDir, localeDir, locale, results);
  }

  return results;
}

function walkDir(
  dir: string,
  base: string,
  locale: string,
  results: { locale: string; slug: string[] }[],
) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, base, locale, results);
    } else if (entry.name.endsWith(".mdx")) {
      const rel = path.relative(base, full).replace(/\.mdx$/, "");
      results.push({ locale, slug: rel.split(path.sep) });
    }
  }
}

const CATEGORY_ORDER = ["basics", "accounts", "tax", "strategy", "glossary"];

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  ko: {
    basics: "기초",
    accounts: "계좌",
    tax: "세금",
    strategy: "전략",
    glossary: "용어",
  },
  en: {
    basics: "Basics",
    accounts: "Accounts",
    tax: "Tax",
    strategy: "Strategy",
    glossary: "Glossary",
  },
};

export function getCategoryTree(locale: string): CategoryGroup[] {
  const localeDir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(localeDir)) return [];

  const groups: CategoryGroup[] = [];

  for (const dir of fs.readdirSync(localeDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;

    const catDir = path.join(localeDir, dir.name);
    const items = fs
      .readdirSync(catDir)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => {
        const raw = fs.readFileSync(path.join(catDir, f), "utf-8");
        const { data } = matter(raw);
        return {
          title: (data as DocFrontmatter).title,
          slug: `${dir.name}/${f.replace(/\.mdx$/, "")}`,
          difficulty: (data as DocFrontmatter).difficulty ?? "beginner",
        };
      });

    if (items.length > 0) {
      groups.push({
        name: CATEGORY_LABELS[locale]?.[dir.name] ?? dir.name,
        slug: dir.name,
        items,
      });
    }
  }

  groups.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.slug);
    const bi = CATEGORY_ORDER.indexOf(b.slug);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return groups;
}
