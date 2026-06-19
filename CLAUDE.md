# finance-docs

금융/투자/재테크 교육 문서 사이트. Next.js 16 + shadcn/ui + Tailwind CSS 4.
MDX 기반 한/영 이중 언어 콘텐츠를 제공하며, AI 검색과 RAG 챗봇은 형제 레포(finance-docs-mcp)에서 처리.

## 레포 구조

```
finance-docs/              ← 이 레포 (프론트엔드 + 콘텐츠)
finance-docs-mcp/          ← 형제 레포 (MCP 서버 + 검색 엔진 + RAG)
```

## 핵심 경로

| 대상 | 경로 |
|------|------|
| MDX 콘텐츠 (한국어) | `content/docs/ko/` |
| MDX 콘텐츠 (영어) | `content/docs/en/` |
| 문서 작성 가이드 | `content/conventions/` |
| Next.js 앱 | `src/app/` |
| 컴포넌트 | `src/components/` |
| Port 인터페이스 | `src/ports/` |
| Adapter 구현체 | `src/adapters/` |
| Hook | `src/hooks/` |
| 사이트 설정 | `src/config/site.ts` |

## 세션 규칙

1. **작업 시작 전**: `PROGRESS.md` 읽고 현재 상태 파악
2. **작업 종료 전**: `PROGRESS.md` 갱신
3. **설계 참조**: `finance-docs-mcp/docs/design/FRONTEND-SPEC.md`, `FRONTEND-ARCHITECTURE.md`

## 기술 스택

- Next.js 16 (App Router, SSG)
- TypeScript strict
- Tailwind CSS 4 + shadcn/ui
- Pretendard (한글) + Inter (영문) 폰트
- 검색/챗봇 API: `finance-docs-mcp` 서버 (REST + SSE)

## 아키텍처 원칙

- **포트앤어댑터**: SearchPort, ChatPort, DocsPort 인터페이스 → Adapter 교체 가능
- **챗봇 레이아웃**: config 한 줄로 page/side-panel/floating 전환
- **모듈 분리**: 검색 모달, 챗봇, 문서 렌더링 각각 독립적으로 다른 프로젝트에 이식 가능

## 콘텐츠 규칙

- 특정 종목/상품명 금지 (삼성전자, KODEX, TIGER 등)
- 모든 수치에 기준 시점 필수 ("2026년 6월 기준")
- 면책 조항 모든 MDX 하단 필수
- related 3개 이상
- 문서 템플릿: `content/conventions/` 참조

## MCP 서버 연동

```
검색: GET {MCP_SERVER}/api/search?q=ISA&locale=ko
챗봇: POST {MCP_SERVER}/chat (SSE 스트리밍)
헬스: GET {MCP_SERVER}/health
```

환경변수: `NEXT_PUBLIC_MCP_SERVER_URL` (기본값: http://localhost:3000)
