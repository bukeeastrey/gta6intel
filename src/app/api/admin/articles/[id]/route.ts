// PATCH  /api/admin/articles/:id → update fields (publish, feature, edit)
// DELETE /api/admin/articles/:id → delete article
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { isAdmin, unauthorized } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const LABELS = ['CONFIRMED', 'RUMOR', 'LEAK', 'ANALYSIS'];
const CATEGORIES = ['news', 'analysis', 'guide', 'roundup'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return unauthorized();
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  try {
    const b = await req.json();
    const patch: Record<string, unknown> = {};

    if (typeof b.title === 'string') patch.title = b.title.trim();
    if (typeof b.body === 'string') patch.body = b.body.trim();
    if (typeof b.summary === 'string') patch.summary = b.summary.slice(0, 200);
    if (typeof b.image_url === 'string') patch.image_url = b.image_url || null;
    if (typeof b.source_name === 'string') patch.source_name = b.source_name;
    if (typeof b.source_url === 'string') patch.source_url = b.source_url || null;
    if (LABELS.includes(b.label)) patch.label = b.label;
    if (CATEGORIES.includes(b.category)) patch.category = b.category;
    if (typeof b.featured === 'boolean') patch.featured = b.featured;
    if (typeof b.is_published === 'boolean') {
      patch.is_published = b.is_published;
      // first time it goes live, stamp published_at
      if (b.is_published) patch.published_at = b.published_at || new Date().toISOString();
    }
    patch.updated_at = new Date().toISOString();

    const { error } = await supabase.from('articles').update(patch).eq('id', id);
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
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
