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
}

const V_COLUMNS =
  'id, youtube_id, title, description, thumbnail_url, published_at, created_at, category';

function toVideo(r: Record<string, unknown>): Video {
  return {
    id: String(r.id),
    youtube_id: String(r.youtube_id),
    title: String(r.title),
    description: (r.description as string) ?? null,
    thumbnail_url: (r.thumbnail_url as string) ?? null,
    published_at: (r.published_at as string) ?? (r.created_at as string) ?? null,
    category: ((r.category as string) as Video['category']) ?? 'video',
  };
}

export async function getVideos(limit = 24): Promise<Video[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('videos')
    .select(V_COLUMNS)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error('[getVideos]', error.message);
    return [];
  }
  return (data ?? []).map((r) => toVideo(r as Record<string, unknown>));
}
