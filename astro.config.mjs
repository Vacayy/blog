// @ts-check
import { defineConfig } from 'astro/config';
import { SITE } from './src/consts.ts';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // CSS가 작으므로 HTML에 인라인해 렌더 차단 요청을 없앤다.
    inlineStylesheets: 'always',
  },
  markdown: {
    // 원문의 따옴표를 그대로 둔다 (한글 앞뒤에서 여닫는 따옴표를 잘못 바꾸는 문제도 있음).
    smartypants: false,
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
