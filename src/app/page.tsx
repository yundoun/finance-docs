import type { Metadata } from "next";
import { LandingPageClient } from "./landing-page-client";
import { getCategoryTree } from "@/lib/mdx";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function Home() {
  const categories = getCategoryTree("ko");

  return <LandingPageClient categories={categories} />;
}
