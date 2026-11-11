---
name: write-post
description: 이 블로그에 글을 새로 쓰거나, 네이버 블로그 글을 옮겨 오거나, 기존 글을 수정·발행할 때 사용한다. 파일명·frontmatter 규칙, description 작성법, 임베드 방식, 발행 전 검증 절차를 담고 있다.
---

# 글 작성·발행

## 파일

- 위치: `src/content/posts/YYYY-MM-DD-<slug>.md`
- URL은 날짜를 뺀 `/posts/<slug>/`. 변환은 `src/content.config.ts`의 `generateId`가 한다.
- slug는 영문 소문자·숫자·하이픈. **발행 후에는 바꾸지 않는다.** 바꾸면 검색 색인과 외부 링크가 끊긴다.
- 파일명 날짜와 frontmatter `date`를 같게 맞춘다.

## frontmatter

```yaml
---
title: 글 제목
description: 검색 결과·공유 카드·llms.txt에 그대로 쓰이는 요약
date: 2026-09-01
updated: 2026-09-15   # 의미 있는 수정을 했을 때만. sitemap lastmod가 된다
draft: true           # 선택. 배포 빌드에서 제외, 개발 서버에서만 보임
---
```

### description 쓰는 법
- 80~150자. 글의 핵심 질문이나 주장을 한두 문장으로 쓴다.
- "~에 대한 글" 같은 메타 설명 대신 내용 자체를 쓴다. AI 답변 엔진이 이 문장을 인용 근거로 쓴다.
- 사용자가 써 주지 않았으면 초안을 쓰고, **초안이라고 명시해 확인받는다.**

## 본문 규칙
- 사용자가 준 글은 **문구를 고치지 않는다.** 맞춤법·문체 수정도 요청이 있을 때만 한다.
- 소제목은 `##`부터. `#`는 제목(frontmatter `title`)이 쓴다.
- 이미지: 글 파일 옆이 아니라 `src/assets/posts/<slug>/`에 두고 상대 경로로 참조한다. Astro가 빌드 때 최적화한다. alt 텍스트 필수.
- YouTube: 일반 iframe을 넣지 않는다(플레이어 JS ~1MB, 쿠키 → Lighthouse 감점). `scripts/import_naver.py`의 `youtube_embed()`가 만드는 썸네일 우선 iframe을 쓴다.
  ```sh
  python3 -I -c "import sys; sys.path.insert(0, '.claude/skills/write-post/scripts'); from import_naver import youtube_embed; print(youtube_embed('VIDEO_ID', '영상 제목'))"
  ```
- 그 밖의 외부 스크립트(트위터 위젯, 댓글 위젯 등)는 넣지 않는다. 링크로 대신한다.

## 네이버 블로그 글 옮기기

```sh
python3 -I .claude/skills/write-post/scripts/import_naver.py <네이버 글 URL> <slug>
```

실행 후 반드시:
1. `description: TODO`를 채운다(비어 있으면 의미 없는 요약이 나간다).
2. 출력된 소제목 목록을 보고 하위 소제목은 `###`로 내린다. 스크립트는 굵은 문단을 전부 `##`로 만든다.
3. `<!-- TODO -->` 주석(이미지 등)을 처리한다. 네이버 이미지는 직접 내려받아 `src/assets/posts/<slug>/`에 넣는다.
4. 원문 대조: 원문 문단 수와 빌드된 HTML의 문단 수·내용이 같은지 확인한다.
5. 사용자에게 네이버 원문 끝에 새 블로그 링크를 달도록 권한다(중복 콘텐츠 신호 정리).

## 발행 전 검증

```sh
pnpm build && pnpm check
```

- 빌드 로그에 `/posts/<slug>/index.html`, `/og/<slug>.png`, `/posts/<slug>.md`가 생성됐는지 본다.
- `dist/og/<slug>.png`를 열어 제목이 잘리지 않았는지 확인한다(제목이 매우 길면 줄바꿈 확인).
- 임베드나 이미지를 넣었으면 Lighthouse로 그 글을 측정한다. 4개 항목 모두 100이 기준이다.
  ```sh
  pnpm preview --port 4329 &
  npx -y lighthouse@12 http://localhost:4329/posts/<slug>/ --quiet --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo
  ```

## 발행
- `main`에 push하면 Cloudflare Workers Builds가 1~2분 안에 배포한다.
- 커밋 메시지: `post: <글 제목>` / 수정은 `post: <글 제목> 수정`.
- 커밋·push는 사용자가 요청했을 때만 한다.
