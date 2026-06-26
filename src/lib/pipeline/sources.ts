// ════════════════════════════════════════════════════════════
// Sources — reads active rows from the `sources` table and pulls
// their RSS feeds into a flat list of candidate items.
// ════════════════════════════════════════════════════════════
import Parser from 'rss-parser';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface FeedItem {
  title: string;
  link: string;
  snippet: string;
  isoDate: string | null;
  sourceId: string;
  sourceName: string;
}

const parser = new Parser({ timeout: 9000 });

export async function loadFeedItems(
  supabase: SupabaseClient,
  perSource = 8
): Promise<FeedItem[]> {
  // Active sources that actually have an RSS URL.
  const { data: sources, error } = await supabase
    .from('sources')
    .select('id, name, rss_url, is_active')
    .eq('is_active', true)
    .not('rss_url', 'is', null);

  if (error || !sources?.length) {
    if (error) console.error('[sources]', error.message);
    return [];
  }

  const all: FeedItem[] = [];

  for (const src of sources) {
    try {
      const feed = await parser.parseURL(src.rss_url as string);
      const items = (feed.items || []).slice(0, perSource);
      for (const it of items) {
        if (!it.link || !it.title) continue;
        all.push({
          title: it.title.trim(),
          link: it.link.trim(),
          snippet: (it.contentSnippet || it.content || '').slice(0, 1200),
          isoDate: it.isoDate || (it.pubDate ? new Date(it.pubDate).toISOString() : null),
          sourceId: src.id as string,
          sourceName: src.name as string,
        });
      }
    } catch (e) {
      console.error(`[sources] feed failed: ${src.name}`, (e as Error).message);
    }
  }

  // Newest first.
  all.sort((a, b) => (b.isoDate || '').localeCompare(a.isoDate || ''));
  return all;
}
