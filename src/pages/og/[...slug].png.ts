import type { APIContext, GetStaticPaths } from 'astro';
import { getPosts } from '../../lib/posts';
import { renderOgImage } from '../../lib/og';

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { title: post.data.title } }));
}) satisfies GetStaticPaths;

export async function GET({ props }: APIContext<{ title: string }>) {
  const png = await renderOgImage(props.title);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
