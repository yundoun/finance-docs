import { getCategoryTree } from "@/lib/mdx";
import { DocsLayoutClient } from "./docs-layout-client";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const categories = getCategoryTree(locale);

  return <DocsLayoutClient categories={categories}>{children}</DocsLayoutClient>;
}
