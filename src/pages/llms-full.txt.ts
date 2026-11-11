import type { APIContext } from 'astro';
import { SITE } from '../consts';
import { getPosts, postToMarkdown } from '../lib/posts';

export async function GET({ site }: APIContext) {
  const posts = await getPosts();
  const header = `# ${SITE.title}\n\n> ${SITE.description}\n`;
  const body = [header, ...posts.map((p) => postToMarkdown(p, site!))].join('\n---\n\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
