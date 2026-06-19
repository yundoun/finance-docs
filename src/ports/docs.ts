export interface DocFrontmatter {
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  related: string[];
  updated: string;
}

export interface DocContent {
  frontmatter: DocFrontmatter;
  content: string;
  slug: string;
  locale: string;
}

export interface CategoryItem {
  title: string;
  slug: string;
  difficulty: DocFrontmatter["difficulty"];
}

export interface CategoryGroup {
  name: string;
  slug: string;
  items: CategoryItem[];
}
