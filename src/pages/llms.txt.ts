import type { APIContext } from 'astro';
import { SITE } from '../consts';
import { getPosts } from '../lib/posts';

// https://llmstxt.org/
export async function GET({ site }: APIContext) {
  const posts = await getPosts();
  const link = (path: string) => new URL(path, site).href;

  const body = [
    `# ${SITE.title}`,
    `> ${SITE.description}`,
    `${SITE.author}의 개인 블로그. 아래 글 링크는 본문을 Markdown으로 제공한다. 전체 본문을 한 번에 보려면 ${link('/llms-full.txt')}.`,
    '## 글',
    posts.map((p) => `- [${p.data.title}](${link(`/posts/${p.id}.md`)}): ${p.data.description}`).join('\n'),
    '## 소개',
    `- [${SITE.author} 소개](${link('/about/')})`,
  ].join('\n\n');

  return new Response(body + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
