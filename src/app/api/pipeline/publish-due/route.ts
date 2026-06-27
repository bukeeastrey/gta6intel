// GET /api/pipeline/publish-due — manual/external trigger for the
// "auto-publish if you didn't respond" safety net. (Also runs at the end
// of every ingest.) Protected by CRON_SECRET.
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { publishDueDrafts } from '@/lib/pipeline/ingest';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get('authorization') === `Bearer ${secret}`) return true;
  return new URL(req.url).searchParams.get('key') === secret;
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const published = await publishDueDrafts(supabase);
  return NextResponse.json({ ok: true, published });
}
