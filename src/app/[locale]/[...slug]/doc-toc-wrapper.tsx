"use client";

import { Toc, extractTocFromMdx } from "@/components/layout/toc";

export function DocTocWrapper({ content }: { content: string }) {
  const items = extractTocFromMdx(content);
  return <Toc items={items} />;
}
