# CLAUDE.md

Juyeong Kim의 개인 블로그(https://juyeong.kim). 생각을 담은 글 위주의 담백한 정적 사이트다. Astro 7, Cloudflare Workers(정적 자산, `wrangler.jsonc`).

## 원칙

꾸밈보다 웹 표준과 가벼움. 아래는 지켜야 하는 기준이다.

- **클라이언트 JavaScript 0.** 인터랙션이 필요해도 HTML/CSS로 먼저 해결한다. JS를 넣어야 하면 먼저 사용자와 상의한다.
- **웹폰트 없음.** 시스템 폰트 스택만 쓴다. Pretendard는 OG 이미지 생성(빌드 타임)에만 쓴다.
- **CSS는 `src/styles/global.css` 하나**, HTML에 인라인된다. 유틸리티 CSS 프레임워크를 들이지 않는다.
- **외부 스크립트 금지.** 분석(Cloudflare Web Analytics)은 Cloudflare가 주입하므로 코드에 넣지 않는다.
- **Lighthouse 4개 항목 100**(모바일)이 기준. 바꾼 뒤 점수가 떨어지면 원인을 고친다.
- 다크 모드는 `prefers-color-scheme`만 따른다(토글 없음).

## 구조

| 경로 | 역할 |
|---|---|
| `src/consts.ts` | 사이트 URL·제목·설명·저자·연락처. 전역 문구는 여기서 바꾼다 |
| `src/content/posts/YYYY-MM-DD-<slug>.md` | 글. URL은 `/posts/<slug>/` |
| `src/layouts/Base.astro` | 모든 `<head>`: SEO, OpenGraph, JSON-LD |
| `src/lib/posts.ts` | 글 목록·날짜 포맷·LLM용 Markdown 변환 |
| `src/lib/og.ts` | OG 이미지(1200×630) 생성 |
| `src/pages/` | 페이지와 `sitemap.xml`, `rss.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, 글별 `.md`, OG png 엔드포인트 |

## SEO/AEO 체크

새 페이지나 메타 관련 변경 시 확인한다.
- 모든 공개 페이지: canonical, description, og:*, JSON-LD. 비공개(404, draft)는 `noindex`.
- 새 공개 페이지는 `src/pages/sitemap.xml.ts`에도 추가한다(글은 자동).
- URL은 `trailingSlash: 'always'`. 내부 링크도 `/about/`처럼 끝에 `/`를 붙인다.
- Markdown의 smartypants는 꺼져 있다(원문 따옴표 보존). 다시 켜지 않는다.

## 명령

```sh
pnpm dev | pnpm build | pnpm preview | pnpm check
```

`astro check`는 TypeScript 7을 지원하지 않아 TypeScript 6으로 고정했다.

## 운영

- 배포: `main` push → Cloudflare Workers Builds(`pnpm build` → `pnpm exec wrangler deploy`). pnpm 설치 스크립트 허용 목록은 `pnpm-workspace.yaml`.
- 도메인: 후이즈 등록, Cloudflare DNS. www→루트 301은 리디렉션 규칙, HTTP→HTTPS는 "항상 HTTPS 사용".
- Cloudflare에서 꺼 둔 것: 이메일 주소 난독화(JS 주입), Bot Fight 모드(AI 크롤러 차단 위험), workers.dev 프로덕션 URL(중복 주소).
- 통계: Cloudflare Web Analytics(자동 삽입). 검색: Google Search Console, Bing(GSC에서 가져옴), 네이버 서치어드바이저(`Base.astro`의 `naver-site-verification` 태그 — 지우지 않는다).

## 글 작업

글 작성·이전·발행은 `write-post` skill을 따른다.

## 커밋

- 메시지는 한국어, prefix는 영어(`feat:`, `fix:`, `post:`, `docs:`, `chore:`).
- 사용자가 요청할 때만 커밋·push한다. `main` push가 곧 배포다.
