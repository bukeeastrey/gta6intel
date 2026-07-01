// GET/POST /api/unsubscribe?e=<email>&t=<token> — marks a subscriber as
// unsubscribed. The token is an HMAC of the email, so links can't be forged.
// POST supports RFC 8058 one-click unsubscribe from the List-Unsubscribe header.
import { verifyUnsub } from '@/lib/email';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

function page(message: string) {
  const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe · GTA6Intel</title></head>
<body style="font:16px/1.6 Arial,sans-serif;background:#F4F1ED;color:#0F0F0F;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
<div style="max-width:440px;text-align:center;padding:24px">
<h1 style="color:#FF5C00;margin:0 0 8px">GTA6Intel</h1>
<p>${message}</p>
<p><a href="${SITE_URL}" style="color:#FF5C00">Back to the site →</a></p>
</div></body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

async function handle(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get('e') || '').toLowerCase();
  const token = url.searchParams.get('t') || '';
  if (!email || !verifyUnsub(email, token)) {
    return page('This unsubscribe link is invalid or has expired.');
  }
  const supabase = createSupabaseServerClient();
  await supabase.from('subscribers').update({ unsubscribed: true }).eq('email', email);
  return page('You have been unsubscribed. Sorry to see you go — you can resubscribe anytime.');
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
