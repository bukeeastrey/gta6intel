// /api/cron/digest — builds a digest of recent articles and emails it to
// subscribers. Two ways to trigger:
//   • GET  with header  Authorization: Bearer <CRON_SECRET>   (scheduler/cron)
//   • POST with header  x-admin-password: <ADMIN_PASSWORD>    ("Send digest now")
import { NextResponse } from 'next/server';
import { getLatestArticles } from '@/lib/articles';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { isAdmin } from '@/lib/admin';
import { sendBroadcast } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';
const WINDOW_DAYS = 4; // look back this many days for "new" articles
const MAX_ITEMS = 6;

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function runDigest() {
  const all = await getLatestArticles(14);
  const cutoff = Date.now() - WINDOW_DAYS * 86400000;
  const recent = all
    .filter((a) => a.published_at && new Date(a.published_at).getTime() >= cutoff)
    .slice(0, MAX_ITEMS);
  if (recent.length === 0) return { ok: true, sent: 0, articles: 0, note: 'No new articles in window' };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('subscribers').select('email').eq('unsubscribed', false);
  if (error) return { ok: false, error: error.message };
  const emails = (data ?? []).map((r) => String(r.email)).filter(Boolean);
  if (emails.length === 0) return { ok: true, sent: 0, articles: recent.length, note: 'No subscribers' };

  const items = recent.map((a) => `
    <tr><td style="padding:0 0 20px">
      ${a.image_url ? `<a href="${SITE_URL}/news/${a.slug}"><img src="${a.image_url}" alt="" style="width:100%;max-width:520px;border-radius:8px;display:block;margin:0 0 8px"/></a>` : ''}
      <a href="${SITE_URL}/news/${a.slug}" style="font-size:17px;font-weight:800;color:#0F0F0F;text-decoration:none;line-height:1.3">${esc(a.title)}</a>
      ${a.summary ? `<p style="margin:5px 0 6px;font-size:14px;color:#555;line-height:1.55">${esc(a.summary)}</p>` : ''}
      <a href="${SITE_URL}/news/${a.slug}" style="font-size:13px;color:#FF5C00;font-weight:700;text-decoration:none">Read more &rarr;</a>
    </td></tr>`).join('');

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
    <h1 style="color:#FF5C00;font-size:22px;margin:0 0 4px">The Intel Drop</h1>
    <p style="margin:0 0 22px;color:#777;font-size:13px">The latest confirmed news, credible leaks and analysis from GTA6Intel.</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${items}</table>
    <p style="margin:24px 0 0"><a href="${SITE_URL}/news" style="background:#FF5C00;color:#fff;text-decoration:none;font-weight:700;padding:11px 22px;border-radius:100px;display:inline-block">See all GTA 6 news &rarr;</a></p>
  </div>`;

  const subject = `The Intel Drop - ${recent.length} new GTA 6 update${recent.length === 1 ? '' : 's'}`;
  const r = await sendBroadcast(subject, html, emails);
  return { ok: true, articles: recent.length, ...r };
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await runDigest());
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await runDigest());
}
