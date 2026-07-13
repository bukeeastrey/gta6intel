// Admin video manager API.
//   GET    → list all videos
//   POST   → add a video by YouTube URL/ID (title+thumb auto-fetched via oEmbed)
//   PATCH  → change a video's category (trailer | video | stream)
//   DELETE → remove a video
import { NextResponse } from 'next/server';
import { isAdmin, unauthorized } from '@/lib/admin';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const CATS = ['trailer', 'video', 'stream'];

/** Pull the 11-char id out of any YouTube URL (or accept a bare id). */
function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m =
    s.match(/[?&]v=([\w-]{11})/) ||
    s.match(/youtu\.be\/([\w-]{11})/) ||
    s.match(/\/embed\/([\w-]{11})/) ||
    s.match(/\/shorts\/([\w-]{11})/);
  return m ? m[1] : null;
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('videos')
    .select('id, youtube_id, title, thumbnail_url, published_at, category, channel_title')
    .order('published_at', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ videos: data ?? [] });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const b = (await req.json().catch(() => ({}))) as { url?: string; category?: string; title?: string };
  const id = parseYouTubeId(String(b.url ?? ''));
  if (!id) return NextResponse.json({ error: 'Could not read a YouTube ID from that link.' }, { status: 400 });
  const category = CATS.includes(String(b.category)) ? String(b.category) : 'video';

  // Best-effort metadata from YouTube's public oEmbed endpoint.
  let title = (b.title ?? '').trim();
  let channel: string | null = null;
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    if (r.ok) {
      const j = (await r.json()) as { title?: string; author_name?: string };
      if (!title && j.title) title = j.title;
      channel = j.author_name ?? null;
    }
  } catch { /* offline is fine — fall back to the manual title */ }
  if (!title) title = `YouTube video ${id}`;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('videos').upsert(
    {
      youtube_id: id,
      title,
      thumbnail_url: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      published_at: new Date().toISOString(),
      category,
      channel_title: channel,
    },
    { onConflict: 'youtube_id' }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, youtube_id: id, title, channel_title: channel, category });
}

export async function PATCH(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const b = (await req.json().catch(() => ({}))) as { id?: string; category?: string };
  if (!b.id || !CATS.includes(String(b.category))) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('videos').update({ category: b.category }).eq('id', b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const b = (await req.json().catch(() => ({}))) as { id?: string };
  if (!b.id) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('videos').delete().eq('id', b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
