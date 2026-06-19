# 진행 상황

> 마지막 갱신: 2026-06-18

## 현재 위치

**Next.js 초기화 + shadcn/ui 세팅 완료. F1(레이아웃 + MDX 렌더링) 구현 시작 전.**

## 콘텐츠 현황

- MDX 11개 (ko 6 + en 5)
- 한국어: basics/stocks, basics/etf, glossary/valuation, accounts/isa, tax/capital-gains-tax, strategy/asset-allocation
- 영어: example 4개 + getting-started 1개

## 프론트엔드 구현 Phase

| Phase | 내용 | 상태 |
|:-----:|------|:----:|
| F1 | 레이아웃 (Header, Sidebar, DocPage, Footer, TOC) + MDX 렌더링 | ⬜ |
| F2 | ⌘K 검색 모달 (SearchPort + RestSearchAdapter) | ⬜ |
| F3 | 챗봇 페이지 (ChatPort + SseChatAdapter + ChatPageLayout) | ⬜ |
| F4 | 랜딩 페이지 (Hero, CategoryCards, ChatPreview) | ⬜ |
| F5 | 챗봇 레이아웃 변형 (SidePanel, FloatingButton) | ⬜ |

## 설계 문서 위치

기획/설계 문서는 `finance-docs-mcp/docs/` 에 있음:
- `docs/planning/PROJECT-BLUEPRINT.md` — Lean Canvas, IA, 로드맵
- `docs/planning/OPEN-QUESTIONS.md` — 결정 사항 6건
- `docs/design/FRONTEND-SPEC.md` — 디자인 스펙 (컬러, 타이포, 레이아웃)
- `docs/design/FRONTEND-ARCHITECTURE.md` — 포트앤어댑터 아키텍처
- `docs/design/CONTENT-TEMPLATE.md` — MDX 작성 템플릿
- `docs/design/QUALITY-CHECKLIST.md` — 문서 품질 체크리스트
