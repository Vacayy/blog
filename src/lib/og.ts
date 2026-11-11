import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { SITE } from '../consts';

// 빌드 시에만 쓰이는 폰트. 클라이언트로는 전송되지 않는다.
const fontDir = join(process.cwd(), 'src/assets/fonts');
const fonts = Promise.all([
  readFile(join(fontDir, 'Pretendard-Regular.otf')),
  readFile(join(fontDir, 'Pretendard-Bold.otf')),
]);

/** 1200x630 OG 이미지를 PNG로 만든다. */
export async function renderOgImage(title: string, subtitle: string = SITE.title) {
  const [regular, bold] = await fonts;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          padding: '80px',
          background: '#ffffff',
          color: '#1a1a1a',
          fontFamily: 'Pretendard',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: 64, fontWeight: 700, lineHeight: 1.3, wordBreak: 'keep-all' },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: 32, color: '#6b6b6b', borderTop: '2px solid #e5e5e5', paddingTop: 32 },
              children: subtitle,
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Pretendard', data: regular, weight: 400, style: 'normal' },
        { name: 'Pretendard', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );

  return new Resvg(svg).render().asPng();
}
