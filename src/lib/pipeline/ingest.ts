// ════════════════════════════════════════════════════════════
// Ingest orchestrator — the heart of the auto-publish pipeline.
//   1. Load RSS items from active sources
//   2. Skip anything already seen (seen_urls dedupe)
//   3. Claude writes an original article
//   4. Grab a high-res image
//   5. Insert as PUBLISHED (fully auto), mark url as seen
//   6. Draft a tweet → tweet_queue as 'pending' (manual approval)
//   7. Log the run to pipeline_logs
// Each item is wrapped in try/catch so one failure can't kill the run.
// ════════════════════════════════════════════════════════════
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { loadFeedItems } from './sources';
import { writeArticle, draftTweet } from './claude';
import { getHighResImage } from './images';
import { sha256, slugify } from './util';

// Keep small so each serverless run stays within the timeout.
const MAX_PER_RUN = Number(process.env.PIPELINE_MAX_PER_RUN || 3);
// Hard cap on items inspected per run (each may cost one Claude call),
// so a run of mostly-irrelevant items can't blow the time/cost budget.
const MAX_EXAMINE = Number(process.env.PIPELINE_MAX_EXAMINE || 10);

export interface IngestResult {
  fetched: number;
  created: number;
  skipped: number;
  errors: number;
  titles: string[];
}

export async function runIngest(): Promise<IngestResult> {
  const supabase = createSupabaseAdminClient();
  const started = Date.now();
  const result: IngestResult = { fetched: 0, created: 0, skipped: 0, errors: 0, titles: [] };

  const items = await loadFeedItems(supabase);
  result.fetched = items.length;

  let examined = 0;
  for (const item of items) {
    if (result.created >= MAX_PER_RUN || examined >= MAX_EXAMINE) break;

    const urlHash = sha256(item.link);
    try {
      // 1) Dedupe — have we seen this URL before?
      const { data: seen } = await supabase
        .from('seen_urls')
        .select('url_hash')
        .eq('url_hash', urlHash)
        .maybeSingle();
      if (seen) {
        result.skipped++;
        continue;
      }

      // Only count toward the examine budget once we know it's new
      // (a new item triggers Claude calls / network work).
      examined++;

      // 2) Claude writes the article (or skips if not GTA-related).
      const article = await writeArticle(item);
      if (article === 'SKIP') {
        // Not about GTA 6 — remember it so we don't reprocess.
        await supabase.from('seen_urls').insert({ url_hash: urlHash, source_url: item.link });
        result.skipped++;
        continue;
      }
      if (!article) {
        result.errors++;
        // Mark as seen anyway so we don't retry a bad item forever.
        await supabase.from('seen_urls').insert({ url_hash: urlHash, source_url: item.link });
        continue;
      }

      // 3) High-res image (optional).
      const image = await getHighResImage(item.link);

      // 4) Unique slug.
      const slug = `${slugify(article.title)}-${urlHash.slice(0, 6)}`;

      // 5) Insert as PUBLISHED.
      const { data: inserted, error: insErr } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          slug,
          summary: article.summary,
          body: article.body,
          label: article.label,
          category: article.category,
          source_url: item.link,
          source_name: item.sourceName,
          image_url: image?.url ?? null,
          is_published: true,
          auto_published: true,
          published_at: item.isoDate || new Date().toISOString(),
        })
        .select('id, slug')
        .single();

      if (insErr || !inserted) {
        result.errors++;
        console.error('[ingest] insert failed', insErr?.message);
        continue;
      }

      // 6) Mark URL as seen.
      await supabase.from('seen_urls').insert({ url_hash: urlHash, source_url: item.link });

      // 7) Draft a tweet → queue for manual approval (NOT auto-posted).
      const tweet = await draftTweet(article.title, inserted.slug);
      if (tweet) {
        await supabase.from('tweet_queue').insert({
          article_id: inserted.id,
          tweet_text: tweet,
          status: 'pending',
        });
      }

      result.created++;
      result.titles.push(article.title);
    } catch (e) {
      result.errors++;
      console.error('[ingest] item failed', (e as Error).message);
    }
  }

  // Log the run.
  try {
    await supabase.from('pipeline_logs').insert({
      source_name: 'rss-ingest',
      items_fetched: result.fetched,
      items_new: result.created,
      items_published: result.created,
      error_message: result.errors ? `${result.errors} errors` : null,
      duration_ms: Date.now() - started,
    });
  } catch (e) {
    console.error('[ingest] log failed', (e as Error).message);
  }

  return result;
}
