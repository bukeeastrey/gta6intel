// ════════════════════════════════════════════════════════════
// POST /api/newsletter — newsletter signup.
// Inserts into `subscribers` (RLS policy "Public can subscribe"
// allows anonymous inserts). Duplicate email = treated as success.
// ════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('subscribers').insert({ email });

    if (error) {
      // 23505 = unique violation → already subscribed, that's fine.
      if (error.code === '23505') return NextResponse.json({ ok: true, already: true });
      console.error('[newsletter]', error.message);
      return NextResponse.json({ error: 'Could not subscribe' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
