// ════════════════════════════════════════════════════════════
// Video queries — mapped to the `videos` table.
// Public read is open (RLS: "Public can read videos").
// ════════════════════════════════════════════════════════════
import { createSupabaseServerClient } from './supabaseServer';

export interface Video {
  id: string;
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  category: 'trailer' | 'video' | 'stream';
  channel_title: string | null;
}

const V_COLUMNS =
  'id, youtube_id, title, description, thumbnail_url, published_at, created_at, category, channel_title';

function toVideo(r: Record<string, unknown>): Video {
  return {
    id: String(r.id),
    youtube_id: String(r.youtube_id),
    title: String(r.title),
    description: (r.description as string) ?? null,
    thumbnail_url: (r.thumbnail_url as string) ?? null,
    published_at: (r.published_at as string) ?? (r.created_at as string) ?? null,
    category: ((r.category as string) as Video['category']) ?? 'video',
    channel_title: (r.channel_title as string) ?? null,
  };
}

export async function getVideos(limit = 24): Promise<Video[]> {
  const supabase = createSupabaseServerClient();

  // Preferred query (includes category + channel_title).
  const full = await supabase
    .from('videos')
    .select(V_COLUMNS)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (!full.error) {
    return (full.data ?? []).map((r) => toVideo(r as Record<string, unknown>));
  }

  // Resilience: if the optional columns haven't been added to the DB yet, a
  // missing column would otherwise fail the WHOLE query and hide every video.
  // Fall back to the core columns so videos still render.
  console.error('[getVideos] full select failed, falling back:', full.error.message);
  const basic = await supabase
    .from('videos')
    .select('id, youtube_id, title, description, thumbnail_url, published_at, created_at')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (basic.error) {
    console.error('[getVideos]', basic.error.message);
    return [];
  }
  return (basic.data ?? []).map((r) => toVideo(r as Record<string, unknown>));
}


/**
 * Videos of one category, newest first.
 * Queried directly (not sliced out of a "recent videos" list) — trailers are old
 * (2023/2025) and would otherwise be pushed out of the recency window by the
 * daily pipeline ingest.
 */
export async function getVideosByCategory(
  category: 'trailer' | 'video' | 'stream',
  limit = 20
): Promise<Video[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('videos')
    .select(V_COLUMNS)
    .eq('category', category)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) {
    console.error('[getVideosByCategory]', error.message);
    return [];
  }
  return (data ?? []).map((r) => toVideo(r as Record<string, unknown>));
}
