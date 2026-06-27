// ════════════════════════════════════════════════════════════
// POST /api/admin/upload — uploads an image to Supabase Storage and
// returns its public URL. Password-protected (admin only). The browser
// sends the file; the server uses the service-role key to store it in
// the public "article-images" bucket.
// ════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { isAdmin, unauthorized } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BUCKET = process.env.ADMIN_IMAGE_BUCKET || 'article-images';
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!OK_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Use JPG, PNG, WEBP, GIF or AVIF' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image too large (max 8 MB)' }, { status: 400 });
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `articles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
