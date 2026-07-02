// ════════════════════════════════════════════════════════════
// Email sending via Resend (REST API — no extra npm dependency).
// Adds a signed unsubscribe link + List-Unsubscribe headers to every
// message for deliverability and one-click unsubscribe (RFC 8058).
// Requires env: RESEND_API_KEY, EMAIL_FROM (verified domain),
//               UNSUBSCRIBE_SECRET (any random string).
// ════════════════════════════════════════════════════════════
import crypto from 'crypto';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || 'GTA6Intel <news@gta6intel-gg.com>';
const SECRET = process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || 'change-me';

export function unsubToken(email: string): string {
  return crypto.createHmac('sha256', SECRET).update(email.toLowerCase()).digest('hex').slice(0, 32);
}

export function verifyUnsub(email: string, token: string): boolean {
  const expected = unsubToken(email);
  const a = Buffer.from(expected);
  const b = Buffer.from(token || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function unsubUrl(email: string): string {
  return `${SITE_URL}/api/unsubscribe?e=${encodeURIComponent(email.toLowerCase())}&t=${unsubToken(email)}`;
}

function footer(email: string): string {
  return `<hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
<p style="font:12px/1.5 Arial,sans-serif;color:#999">You're receiving this because you subscribed to GTA6Intel.
<a href="${unsubUrl(email)}" style="color:#999">Unsubscribe</a>.</p>`;
}

export type SendResult = { sent: number; failed: number; error?: string };

/** Send `html` to a list of recipients, chunked to Resend's 100/batch limit. */
export async function sendBroadcast(subject: string, html: string, recipients: string[]): Promise<SendResult> {
  if (!RESEND_KEY) return { sent: 0, failed: recipients.length, error: 'RESEND_API_KEY not set' };
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    const batch = chunk.map((email) => ({
      from: FROM,
      to: [email],
      subject,
      html: html + footer(email),
      headers: {
        'List-Unsubscribe': `<${unsubUrl(email)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }));
    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
      if (res.ok) sent += chunk.length;
      else {
        failed += chunk.length;
        console.error('[email] batch failed', res.status, await res.text().catch(() => ''));
      }
    } catch (e) {
      failed += chunk.length;
      console.error('[email] batch error', (e as Error).message);
    }
    // gentle pacing to stay under rate limits
    if (i + 100 < recipients.length) await new Promise((r) => setTimeout(r, 600));
  }
  return { sent, failed };
}

/** Welcome email sent right after someone subscribes to The Intel Drop. */
export async function sendWelcome(email: string): Promise<SendResult> {
  const subject = 'Welcome to The Intel Drop';
  const html = `<div style="font:16px/1.6 Arial,sans-serif;color:#0F0F0F;max-width:560px;margin:0 auto">
  <h1 style="color:#FF5C00;font-size:22px;margin:0 0 12px">You're in.</h1>
  <p>Welcome to <b>The Intel Drop</b> — GTA6Intel's newsletter. You'll get the week's most important <b>Grand Theft Auto VI</b> news: confirmed drops, credible leaks, and sharp analysis, always clearly labeled so you know what to trust.</p>
  <p>GTA 6 launches <b>November 19, 2026</b>. We'll keep you ahead of it — no spam, no made-up details.</p>
  <p style="margin:22px 0"><a href="${SITE_URL}" style="display:inline-block;background:#FF5C00;color:#fff;text-decoration:none;font-weight:700;padding:11px 22px;border-radius:100px">Explore GTA6Intel &rarr;</a></p>
  <p style="color:#666">See you in your inbox,<br/>The GTA6Intel team</p>
</div>`;
  return sendBroadcast(subject, html, [email]);
}
