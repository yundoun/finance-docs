import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center text-sm text-neutral-500">
          <p className="max-w-xl">
            이 사이트는 금융 교육 목적으로 제작되었으며, 투자 권유나 특정
            금융상품 추천이 아닙니다. 투자 판단은 본인의 책임입니다.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 transition-colors hover:text-neutral-600"
            >
              GitHub
            </a>
            <span className="text-neutral-300">|</span>
            <span>
              &copy; {new Date().getFullYear()} {siteConfig.name}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
