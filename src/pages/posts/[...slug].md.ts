import type { APIContext, GetStaticPaths } from 'astro';
import { getPosts, postToMarkdown } from '../../lib/posts';

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

type Props = { post: Awaited<ReturnType<typeof getPosts>>[number] };

export function GET({ props, site }: APIContext<Props>) {
  return new Response(postToMarkdown(props.post, site!), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
