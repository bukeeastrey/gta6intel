// GET  /api/admin/articles  → list ALL articles (published + drafts)
// POST /api/admin/articles  → create a new article
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { isAdmin, unauthorized } from '@/lib/admin';
import { slugify, sha256 } from '@/lib/pipeline/util';

export const dynamic = 'force-dynamic';

const LABELS = ['CONFIRMED', 'RUMOR', 'LEAK', 'ANALYSIS'];
const CATEGORIES = ['news', 'analysis', 'guide', 'roundup'];

export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, summary, label, category, image_url, source_name, source_url, is_published, auto_published, featured, published_at, created_at')
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, articles: data ?? [] });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const supabase = createSupabaseAdminClient();
  try {
    const b = await req.json();
    const title = String(b.title || '').trim();
    const body = String(b.body || '').trim();
    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }
    const label = LABELS.includes(b.label) ? b.label : 'CONFIRMED';
    const category = CATEGORIES.includes(b.category) ? b.category : 'news';
    const slug = `${slugify(title)}-${sha256(title + Date.now()).slice(0, 6)}`;
    const publish = b.is_published !== false; // default publish

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        body,
        summary: String(b.summary || '').slice(0, 200),
        label,
        category,
        image_url: b.image_url ? String(b.image_url) : null,
        source_name: b.source_name ? String(b.source_name) : 'GTA6Intel',
        source_url: b.source_url ? String(b.source_url) : null,
        featured: Boolean(b.featured),
        is_published: publish,
        auto_published: false,
        published_at: publish ? new Date().toISOString() : null,
      })
      .select('id, slug')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, article: data });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
