// ════════════════════════════════════════════════════════════
// Images — pulls the source article's social-share image
// (og:image), and only accepts it if it's high resolution.
// Returns null if none/too small (article then uses a gradient).
// ════════════════════════════════════════════════════════════
import { fetchWithTimeout } from './util';

const MIN_WIDTH = 1200; // "high resolution only"

function meta(html: string, prop: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`,
    'i'
  );
  const m = html.match(re) || html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`, 'i')
  );
  return m ? m[1] : null;
}

export async function getHighResImage(articleUrl: string): Promise<{ url: string; alt: string | null } | null> {
  try {
    const res = await fetchWithTimeout(articleUrl, 9000);
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 200_000); // header region is enough

    let img = meta(html, 'og:image:secure_url') || meta(html, 'og:image') || meta(html, 'twitter:image');
    if (!img) return null;

    // Normalize protocol-relative / relative URLs.
    if (img.startsWith('//')) img = 'https:' + img;
    else if (img.startsWith('/')) {
      const u = new URL(articleUrl);
      img = `${u.protocol}//${u.host}${img}`;
    }

    // If the page declares a width and it's too small, reject it.
    const wStr = meta(html, 'og:image:width');
    if (wStr && Number(wStr) > 0 && Number(wStr) < MIN_WIDTH) return null;

    const alt = meta(html, 'og:image:alt') || meta(html, 'og:title');
    return { url: img, alt: alt ? alt.slice(0, 280) : null };
  } catch (e) {
    console.error('[images]', (e as Error).message);
    return null;
  }
}
