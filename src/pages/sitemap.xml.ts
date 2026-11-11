import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';

// 글의 수정일을 lastmod로 넣기 위해 직접 생성한다.
export async function GET({ site }: APIContext) {
  const posts = await getPosts();
  const latest = posts[0] && (posts[0].data.updated ?? posts[0].data.date);

  const entries: { path: string; lastmod?: Date }[] = [
    { path: '/', lastmod: latest },
    { path: '/about/' },
    ...posts.map((p) => ({ path: `/posts/${p.id}/`, lastmod: p.data.updated ?? p.data.date })),
  ];

  const urls = entries
    .map(({ path, lastmod }) => {
      const loc = `<loc>${new URL(path, site).href}</loc>`;
      return `<url>${loc}${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`;
    })
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
