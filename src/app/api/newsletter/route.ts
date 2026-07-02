// ════════════════════════════════════════════════════════════
// POST /api/newsletter — newsletter signup.
// Inserts into `subscribers` (RLS policy "Public can subscribe"
// allows anonymous inserts). Duplicate email = treated as success.
// ════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { sendWelcome } from '@/lib/email';

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
      // 23505 = unique violation → already subscribed, that's fine (no re-welcome).
      if (error.code === '23505') return NextResponse.json({ ok: true, already: true });
      console.error('[newsletter]', error.message);
      return NextResponse.json({ error: 'Could not subscribe' }, { status: 500 });
    }

    // New subscriber → send the welcome email (best-effort; never block signup).
    try {
      await sendWelcome(email);
    } catch (e) {
      console.error('[newsletter] welcome email failed', (e as Error).message);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
