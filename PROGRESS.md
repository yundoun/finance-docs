# 진행 상황

> 마지막 갱신: 2026-06-19

## 현재 위치

**F1~F4 구현 완료 + UX 개선 (AI 통합) 완료. F5(챗봇 레이아웃 변형) 구현 시작 전.**

## 콘텐츠 현황

- MDX 11개 (ko 6 + en 5)
- 한국어: basics/stocks, basics/etf, glossary/valuation, accounts/isa, tax/capital-gains-tax, strategy/asset-allocation
- 영어: example 4개 + getting-started 1개

## 프론트엔드 구현 Phase

| Phase | 내용 | 상태 |
|:-----:|------|:----:|
| F1 | 레이아웃 (Header, Sidebar, DocPage, Footer, TOC) + MDX 렌더링 | ✅ |
| F2 | ⌘K 검색 모달 (SearchPort + RestSearchAdapter) | ✅ |
| F3 | 챗봇 페이지 (ChatPort + SseChatAdapter + ChatPageLayout) | ✅ |
| F4 | 랜딩 페이지 (Hero, CategoryCards, MCP 안내) | ✅ |
| UX | AI 통합 — 통합 검색 모달, 맥락 챗봇, 학습 안내 히어로 | ✅ |
| F5 | 챗봇 레이아웃 변형 (SidePanel, FloatingButton) | ⬜ |

## UX 개선 — AI 통합 (사례 기반)

### 참고 사례
- Vercel Docs: ⌘K 모달에 AI 답변 통합
- GitBook: 현재 페이지 맥락 인식 챗봇 + URL 딥링크
- Perplexity: 인라인 출처 번호 + 문서 참조
- Khanmigo: 소크라테스식 학습 안내 + 맥락 인식

### 구현 내용

#### 1. ⌘K 통합 모달 (Vercel/ReadMe 패턴)
- `src/components/search/search-modal.tsx` — 완전 리라이트
- "문서 검색" / "AI에게 질문" 2개 탭 (Tab 키로 전환)
- AI 탭: 스트리밍 답변 + 하단에 관련 문서 카드
- 검색 결과 없을 때 "AI에게 물어보기" CTA 표시
- 검색 결과 있을 때도 하단에 "AI에게 직접 질문하기" 링크

#### 2. 문서 페이지 맥락 챗봇 (GitBook/Khanmigo 패턴)
- `src/components/chat/contextual-chat-panel.tsx` — 신규
- 문서 페이지 우하단 플로팅 버튼 → 사이드 패널 (400px)
- 현재 문서 제목/slug를 맥락으로 ChatPort에 전달
- Empty state: 문서 기반 질문 제안 3개 + 관련 문서 "다음 읽기"
- 모바일: 풀 너비 + backdrop

#### 3. 랜딩 히어로 = 학습 안내 (Khanmigo 패턴)
- `src/app/landing-page-client.tsx` — 리디자인
- 히어로 입력이 검색바 → 채팅 입력으로 변경
- 칩 클릭 또는 직접 입력 → 인라인 AI 답변 스트리밍
- 답변 후 "이어서 대화하기" + "문서 둘러보기" CTA
- 기존 Mock 챗 프리뷰 섹션 제거 (히어로가 실제 채팅)

## 아키텍처 요약

### 포트앤어댑터 (3개 Port)
```
SearchPort → RestSearchAdapter → useSearch → SearchModal
ChatPort   → SseChatAdapter   → useChat   → ChatContainer / ContextualChat / HeroChat
DocsPort   → StaticMdxAdapter → lib/mdx   → DocPage
```

### 컴포넌트 레이어
```
ports/      ← 인터페이스 (순수 타입)
adapters/   ← 구현체 (fetch, SSE)
providers/  ← DI (ServiceProvider — Search + Chat)
hooks/      ← Port 기반 훅
components/ ← 순수 UI
app/        ← Next.js 라우트
```

### MCP 서버 연동
- 검색: `GET {MCP_SERVER}/api/search?q=...&locale=ko`
- 챗봇: `POST {MCP_SERVER}/chat` (SSE 스트리밍)
- 배포: `https://finance-docs-mcp.fly.dev`
- 환경변수: `NEXT_PUBLIC_MCP_SERVER_URL`

## 설계 문서 위치

기획/설계 문서는 `finance-docs-mcp/docs/` 에 있음:
- `docs/planning/PROJECT-BLUEPRINT.md` — Lean Canvas, IA, 로드맵
- `docs/planning/OPEN-QUESTIONS.md` — 결정 사항 6건
- `docs/design/FRONTEND-SPEC.md` — 디자인 스펙 (컬러, 타이포, 레이아웃)
- `docs/design/FRONTEND-ARCHITECTURE.md` — 포트앤어댑터 아키텍처
- `docs/design/CONTENT-TEMPLATE.md` — MDX 작성 템플릿
- `docs/design/QUALITY-CHECKLIST.md` — 문서 품질 체크리스트
