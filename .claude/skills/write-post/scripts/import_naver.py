#!/usr/bin/env python3
"""네이버 블로그 글(스마트에디터 ONE)을 이 블로그의 Markdown 글로 변환한다.

사용법:
  python3 -I import_naver.py <네이버 글 URL> <slug>

  예) python3 -I import_naver.py https://blog.naver.com/febist/224397817119 technology-and-humanity

결과: src/content/posts/YYYY-MM-DD-<slug>.md 를 만든다(이미 있으면 중단).
- 본문 텍스트는 원문 그대로 옮긴다(따옴표, 띄어쓰기 포함).
- 문단 전체가 굵은 글씨면 `##` 소제목으로 바꾼다. 소제목 단계(##/###)는 사람이 검토한다.
- YouTube 임베드는 썸네일 우선(facade) iframe으로 바꾼다.
- 이미지 등 처리하지 못한 요소는 `<!-- TODO -->` 주석으로 남기고 경고를 출력한다.
- description은 비워 두므로 직접 채워야 빌드된다.
"""

import html
import json
import re
import sys
import urllib.request
from pathlib import Path

POSTS_DIR = Path(__file__).resolve().parents[4] / 'src/content/posts'


def fetch(url: str) -> str:
    m = re.search(r'blog\.naver\.com/(?:PostView\.naver\?blogId=)?([\w-]+)(?:/|&logNo=)(\d+)', url)
    if not m:
        sys.exit(f'네이버 블로그 글 URL이 아닙니다: {url}')
    blog_id, log_no = m.groups()
    view = f'https://blog.naver.com/PostView.naver?blogId={blog_id}&logNo={log_no}'
    req = urllib.request.Request(view, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read().decode('utf-8')


def text_of(fragment: str) -> str:
    t = re.sub(r'<br\s*/?>', '\n', fragment)
    t = re.sub(r'<[^>]+>', '', t)
    return html.unescape(t).replace('​', '').strip()


def youtube_embed(video_id: str, title: str) -> str:
    """썸네일만 먼저 보여 주고, 누르면 그 자리에서 재생되는 iframe. 페이지에 JS를 추가하지 않는다."""
    srcdoc = (
        '<style>*{margin:0;padding:0}html,body{height:100%;overflow:hidden;background:#000}'
        'a,img{display:block;width:100%;height:100%}img{object-fit:cover}'
        'span{position:absolute;inset:0;margin:auto;width:68px;height:48px;border-radius:12px;'
        'background:#f00;color:#fff;font:24px/48px sans-serif;text-align:center}</style>'
        f"<a href='https://www.youtube-nocookie.com/embed/{video_id}?autoplay=1'>"
        f"<img src='https://i.ytimg.com/vi/{video_id}/hqdefault.jpg' alt='YouTube 영상 재생'><span>▶</span></a>"
    )
    title = html.escape(title, quote=True)
    return (
        f'<iframe src="https://www.youtube-nocookie.com/embed/{video_id}" srcdoc="{srcdoc}" '
        f'title="{title}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; web-share" '
        'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    )


def convert(page: str) -> tuple[str, str, list[str], list[str]]:
    title = re.search(r'<title>(.*?)\s*:\s*네이버 블로그</title>', page)
    title = html.unescape(title.group(1)) if title else 'TODO 제목'
    date = re.search(r'se_publishDate[^>]*>\s*(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.', page)
    date = f'{date.group(1)}-{int(date.group(2)):02d}-{int(date.group(3)):02d}' if date else 'TODO'

    body = page[page.find('se-main-container'):]
    parts = re.split(r'(?=<div class="se-component )', body)
    blocks, warnings = [], []

    for part in parts:
        kind = re.match(r'<div class="se-component (se-[a-zA-Z]+)', part)
        if not kind:
            continue
        kind = kind.group(1)

        if kind in ('se-text', 'se-quotation'):
            for p in re.findall(r'<p class="se-text-paragraph[^"]*"[^>]*>(.*?)</p>', part, re.S):
                t = text_of(p)
                if not t:
                    continue
                if kind == 'se-quotation':
                    blocks.append('> ' + t.replace('\n', '\n> '))
                elif re.fullmatch(r'\s*(?:<span[^>]*>\s*)*<b>.*</b>(?:\s*</span>)*\s*', p, re.S):
                    blocks.append('## ' + t)
                else:
                    blocks.append(t)
        elif kind == 'se-oembed':
            data = html.unescape(re.search(r"data-module='(.*?)'", part, re.S).group(1))
            info = json.loads(data)['data']
            vid = re.search(r'(?:v=|youtu\.be/|embed/)([\w-]{11})', info.get('inputUrl', '') + info.get('html', ''))
            if vid:
                blocks.append(youtube_embed(vid.group(1), info.get('title', 'YouTube 영상')))
            else:
                blocks.append(f"<!-- TODO 임베드: {info.get('inputUrl')} -->")
                warnings.append(f"임베드(YouTube 아님): {info.get('inputUrl')}")
        elif kind == 'se-horizontalLine':
            blocks.append('---')
        elif kind == 'se-documentTitle':
            continue
        else:
            src = re.search(r'(?:data-lazy-src|src)="([^"]+)"', part)
            note = src.group(1) if src else kind
            blocks.append(f'<!-- TODO {kind}: {note} -->')
            warnings.append(f'처리하지 못한 요소 {kind}: {note}')

    md = '\n\n'.join(blocks) + '\n'
    fm = f'---\ntitle: {title}\ndescription: TODO\ndate: {date}\n---\n\n'
    return date, fm + md, [b for b in blocks if b.startswith('## ')], warnings


def main() -> None:
    if len(sys.argv) != 3 or not re.fullmatch(r'[a-z0-9-]+', sys.argv[2]):
        sys.exit(__doc__)
    url, slug = sys.argv[1], sys.argv[2]
    date, md, headings, warnings = convert(fetch(url))
    out = POSTS_DIR / f'{date}-{slug}.md'
    if out.exists():
        sys.exit(f'이미 있는 파일입니다: {out}')
    out.write_text(md, encoding='utf-8')
    print(f'작성: {out}')
    print('소제목:', *headings, sep='\n  ')
    for w in warnings:
        print('경고:', w)


if __name__ == '__main__':
    main()
