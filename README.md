# juyeong.kim

Juyeong Kim의 개인 블로그. Astro로 만든 정적 사이트이고 Cloudflare Workers(정적 자산)로 서비스한다.

클라이언트 JavaScript 없음, 웹폰트 없음(시스템 폰트), CSS는 HTML에 인라인. Lighthouse 모바일 4개 항목 100점을 기준으로 유지한다.

## 명령어

```sh
pnpm install
pnpm dev       # 개발 서버 (draft 글도 보임)
pnpm build     # dist/ 에 정적 빌드
pnpm preview   # 빌드 결과 미리보기
pnpm check     # 타입 체크
```

## 글 쓰기

`src/content/posts/YYYY-MM-DD-<slug>.md` 파일을 만든다. URL은 날짜를 뺀 `/posts/<slug>/`이다. slug는 발행 후 바꾸지 않는다.

```md
---
title: 제목
description: 검색 결과와 공유 카드에 나오는 요약 (80~150자)
date: 2026-11-11
updated: 2026-11-12   # 선택. 의미 있는 수정을 했을 때
draft: true           # 선택. true면 배포 빌드에서 제외
---
```

글마다 OG 이미지(`/og/<slug>.png`)와 Markdown 버전(`/posts/<slug>.md`)이 빌드 때 자동 생성된다.

네이버 블로그 글을 옮길 때:

```sh
python3 -I .claude/skills/write-post/scripts/import_naver.py <네이버 글 URL> <slug>
```

자세한 규칙(description 작성, 이미지, YouTube 임베드, 검증)은 [`.claude/skills/write-post/SKILL.md`](.claude/skills/write-post/SKILL.md)에 있다.

## 발행

`main`에 push하면 Cloudflare Workers Builds가 빌드해 배포한다(1~2분).

```sh
git add src/content/posts/2026-11-11-new-post.md
git commit -m "post: 새 글 제목"
git push
```

## 설정

사이트 주소, 제목, 설명, 저자, 연락처는 `src/consts.ts` 한 곳에서 바꾼다.

## 포함된 것

- SEO: canonical, meta description, JSON-LD(WebSite, BlogPosting, ProfilePage), sitemap(lastmod 포함), robots.txt
- OpenGraph/Twitter 카드, 글별 OG 이미지 자동 생성(satori + resvg)
- AEO: `/llms.txt`, `/llms-full.txt`, 글별 Markdown
- RSS(`/rss.xml`), 라이트/다크 모드, 빌드 타임 코드 하이라이팅(Shiki)

## 운영

### Cloudflare
- 도메인: `juyeong.kim`(등록: 후이즈, DNS: Cloudflare)
- Workers 설정: `wrangler.jsonc`(서버 코드 없이 `dist`만 서비스). 빌드 명령 `pnpm build`, 배포 명령 `pnpm exec wrangler deploy`
- Node는 `.node-version`, pnpm은 `package.json`의 `packageManager`로 고정. 설치 스크립트 허용 목록은 `pnpm-workspace.yaml`
- `www.juyeong.kim` → `https://juyeong.kim` 301 리다이렉트
- 끄고 유지할 설정과 이유:
  - 이메일 주소 난독화: 켜면 페이지에 JS가 주입된다
  - Bot Fight 모드: AI 에이전트와 크롤러를 막을 수 있다
  - Rocket Loader 등 자동 최적화: 필요 없다
- AI Crawl Control: 검색, 에이전트 허용. robots.txt에 Bot Preference Sync 내용이 앞에 붙는다
- 통계: Cloudflare Web Analytics(쿠키 없음, Core Web Vitals 포함)

### 검색엔진
- Google Search Console, Bing Webmaster Tools, 네이버 서치어드바이저에 등록하고 `https://juyeong.kim/sitemap.xml`을 제출한다. Bing은 ChatGPT 검색과 Copilot의 색인이다
- 네이버에서 옮긴 글은 네이버 원문 끝에 새 주소 링크를 단다

## 라이선스

OG 이미지에 쓰는 Pretendard 폰트(`src/assets/fonts/`)는 SIL Open Font License 1.1을 따른다.
