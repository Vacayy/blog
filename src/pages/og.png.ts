import { SITE } from '../consts';
import { renderOgImage } from '../lib/og';

export async function GET() {
  const png = await renderOgImage(SITE.title, SITE.description);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
