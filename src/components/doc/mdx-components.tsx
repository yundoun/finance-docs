import type { MDXComponents } from "mdx/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-");
}

export const mdxComponents: MDXComponents = {
  h2: ({ children, ...props }) => {
    const id = slugify(String(children));
    return (
      <h2 id={id} {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    const id = slugify(String(children));
    return (
      <h3 id={id} {...props}>
        {children}
      </h3>
    );
  },
  table: (props) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
};
