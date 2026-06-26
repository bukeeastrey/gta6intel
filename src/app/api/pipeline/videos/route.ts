// ════════════════════════════════════════════════════════════
// GET /api/pipeline/videos — pulls recent GTA 6 videos from the
// YouTube Data API into the `videos` table (high-res thumbnails,
// deduped by youtube_id). Protected by CRON_SECRET.
// ════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { fetchWithTimeout } from '@/lib/pipeline/util';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const QUERY = process.env.PIPELINE_YT_QUERY || 'GTA 6';

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get('authorization') === `Bearer ${secret}`) return true;
  return new URL(req.url).searchParams.get('key') === secret;
}

interface YtItem {
  id: { videoId?: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: Record<string, { url: string }>;
  };
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return NextResponse.json({ error: 'Missing YOUTUBE_API_KEY' }, { status: 500 });

  const supabase = createSupabaseAdminClient();
  let added = 0;

  try {
    const api = new URL('https://www.googleapis.com/youtube/v3/search');
    api.searchParams.set('part', 'snippet');
    api.searchParams.set('q', QUERY);
    api.searchParams.set('type', 'video');
    api.searchParams.set('order', 'date');
    api.searchParams.set('maxResults', '12');
    api.searchParams.set('videoEmbeddable', 'true');
    api.searchParams.set('key', key);

    const res = await fetchWithTimeout(api.toString(), 9000);
    if (!res.ok) {
      return NextResponse.json({ error: `YouTube ${res.status}` }, { status: 502 });
    }
    const data = (await res.json()) as { items?: YtItem[] };

    for (const it of data.items || []) {
      const ytId = it.id?.videoId;
      if (!ytId) continue;
      const t = it.snippet.thumbnails;
      const thumb = (t.maxres || t.standard || t.high || t.medium || t.default)?.url ?? null;

      // upsert by unique youtube_id → no duplicates.
      const { error } = await supabase
        .from('videos')
        .upsert(
          {
            youtube_id: ytId,
            title: it.snippet.title,
            description: it.snippet.description,
            thumbnail_url: thumb,
            published_at: it.snippet.publishedAt,
          },
          { onConflict: 'youtube_id', ignoreDuplicates: true }
        );
      if (!error) added++;
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, processed: added });
}
