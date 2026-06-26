// ════════════════════════════════════════════════════════════
// GET /rss.xml — RSS 2.0 feed of the latest published articles.
// Revalidates hourly.
// ════════════════════════════════════════════════════════════
import { getLatestArticles } from '@/lib/articles';

export const revalidate = 3600;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel.com';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const articles = await getLatestArticles(30);

  const items = articles
    .map((a) => {
      const url = `${SITE_URL}/news/${a.slug}`;
      const date = a.published_at ? new Date(a.published_at).toUTCString() : '';
      return `
    <item>
      <title>${esc(a.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      ${date ? `<pubDate>${date}</pubDate>` : ''}
      ${a.summary ? `<description>${esc(a.summary)}</description>` : ''}
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>GTA6Intel — Latest GTA 6 News</title>
    <link>${SITE_URL}</link>
    <description>Breaking GTA 6 news, confirmed details, leaks, and analysis.</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
