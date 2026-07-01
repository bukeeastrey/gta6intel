// POST /api/admin/broadcast — send an email to all active subscribers (or a
// single test address). GET returns the active subscriber count. Admin-gated.
import { NextResponse } from 'next/server';
import { isAdmin, unauthorized } from '@/lib/admin';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { sendBroadcast } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Hobby max; large lists need a queue (see READ-ME)

export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const supabase = createSupabaseServerClient();
  const { count } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('unsubscribed', false);
  return NextResponse.json({ count: count ?? 0 });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  let body: { subject?: string; html?: string; test?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const subject = (body.subject || '').trim();
  const html = (body.html || '').trim();
  if (!subject || !html) {
    return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
  }

  // Test send: one address only, no DB read.
  if (body.test) {
    const r = await sendBroadcast(subject, html, [body.test.trim().toLowerCase()]);
    return NextResponse.json({ ...r, test: true });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('email')
    .eq('unsubscribed', false);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const emails = (data ?? []).map((r) => String(r.email)).filter(Boolean);
  if (emails.length === 0) return NextResponse.json({ sent: 0, failed: 0, note: 'No active subscribers' });

  const r = await sendBroadcast(subject, html, emails);
  return NextResponse.json(r);
}
