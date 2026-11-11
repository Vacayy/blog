import { getCollection } from 'astro:content';

/** 공개된 글을 최신순으로 반환한다. 초안은 개발 서버에서만 보인다. */
export async function getPosts() {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

const formatter = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeZone: 'Asia/Seoul' });
export const formatDate = (date: Date) => formatter.format(date);

type Post = Awaited<ReturnType<typeof getPosts>>[number];

/** LLM이 읽기 좋은 순수 Markdown 문서로 글을 변환한다. */
export function postToMarkdown(post: Post, site: URL) {
  const { title, description, date, updated } = post.data;
  const url = new URL(`/posts/${post.id}/`, site).href;
  const meta = [`- URL: ${url}`, `- 작성: ${date.toISOString().slice(0, 10)}`];
  if (updated) meta.push(`- 수정: ${updated.toISOString().slice(0, 10)}`);
  return `# ${title}\n\n> ${description}\n\n${meta.join('\n')}\n\n${post.body?.trim() ?? ''}\n`;
}
