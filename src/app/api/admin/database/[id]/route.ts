// GET/PATCH/DELETE /api/admin/database/:id
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { isAdmin, unauthorized } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return unauthorized();
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('database_entries').select('*').eq('id', id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, entry: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return unauthorized();
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  try {
    const b = await req.json();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const k of ['category','name','subtitle','image_url','summary','body','slug','status','video_url']) {
      if (typeof b[k] === 'string') patch[k] = b[k];
    }
    if (Array.isArray(b.attributes)) patch.attributes = b.attributes;
    if (Array.isArray(b.related)) patch.related = b.related;
    if (Array.isArray(b.gallery)) patch.gallery = b.gallery;
    if (Array.isArray(b.videos)) patch.videos = b.videos;
    if (typeof b.popular === 'boolean') patch.popular = b.popular;
    if (typeof b.is_published === 'boolean') patch.is_published = b.is_published;
    const { error } = await supabase.from('database_entries').update(patch).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return unauthorized();
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('database_entries').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
