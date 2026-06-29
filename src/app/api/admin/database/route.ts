// GET  /api/admin/database         → list all entries (any status)
// POST /api/admin/database         → create entry
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { isAdmin, unauthorized } from '@/lib/admin';
import { slugify, sha256 } from '@/lib/pipeline/util';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('database_entries')
    .select('id, slug, category, name, subtitle, image_url, popular, is_published, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, entries: data ?? [] });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const supabase = createSupabaseAdminClient();
  try {
    const b = await req.json();
    const name = String(b.name || '').trim();
    const category = String(b.category || '').trim();
    if (!name || !category) return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    const slug = String(b.slug || '').trim() || `${slugify(name)}-${sha256(name + Date.now()).slice(0, 5)}`;
    const { data, error } = await supabase
      .from('database_entries')
      .insert({
        slug, category, name,
        subtitle: b.subtitle || null,
        image_url: b.image_url || null,
        summary: b.summary || null,
        body: b.body || null,
        attributes: Array.isArray(b.attributes) ? b.attributes : [],
        related: Array.isArray(b.related) ? b.related : [],
        status: typeof b.status === 'string' ? b.status : 'confirmed',
        gallery: Array.isArray(b.gallery) ? b.gallery : [],
        video_url: b.video_url || null,
        videos: Array.isArray(b.videos) ? b.videos : [],
        popular: Boolean(b.popular),
        is_published: b.is_published !== false,
      })
      .select('id, slug')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, entry: data });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
