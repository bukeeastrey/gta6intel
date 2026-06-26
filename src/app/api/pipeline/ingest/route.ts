// ════════════════════════════════════════════════════════════
// GET /api/pipeline/ingest — runs the auto-publish pipeline.
// Protected by CRON_SECRET. Vercel Cron sends it automatically as
// "Authorization: Bearer <CRON_SECRET>". You can also trigger
// manually with ?key=<CRON_SECRET> (handy for testing / external
// schedulers like cron-job.org).
// ════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import { runIngest } from '@/lib/pipeline/ingest';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds (Hobby max)

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  const url = new URL(req.url);
  return url.searchParams.get('key') === secret;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await runIngest();
  return NextResponse.json({ ok: true, ...result });
}
