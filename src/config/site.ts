export const siteConfig = {
  name: "Finance Docs",
  description:
    "AI에게 물어볼 수 있는 금융 교과서 — 주식, ETF, 세금, 계좌까지",
  logo: { type: "text" as const, text: "Finance Docs" },
  github: "https://github.com/yundoun/finance-docs",

  chatLayout: "page" as "page" | "side-panel" | "floating",

  features: {
    darkMode: false,
    languageSwitch: true,
    search: true,
    chat: true,
  },

  locales: ["ko", "en"] as const,
  defaultLocale: "ko" as const,

  mcpServerUrl:
    process.env.NEXT_PUBLIC_MCP_SERVER_URL ?? "http://localhost:3000",
} as const;

export type Locale = (typeof siteConfig.locales)[number];
