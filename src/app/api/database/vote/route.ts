// POST /api/database/vote  { id, prev, next }  (prev/next: 'up' | 'down' | null)
// Applies the change of a user's vote — add, remove (toggle off), or switch.
// Back-compat: { id, dir } still works as "add a vote in dir".
// Best-effort (no auth); the client stores its choice to discourage repeats.
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

type Dir = 'up' | 'down' | null;
const norm = (v: unknown): Dir => (v === 'up' || v === 'down' ? v : null);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id?: string; prev?: unknown; next?: unknown; dir?: unknown };
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const from = norm(body.prev);
    const to = 'next' in body ? norm(body.next) : norm(body.dir); // back-compat with { dir }

    const supabase = createSupabaseAdminClient();
    const { data: row, error } = await supabase
      .from('database_entries')
      .select('votes_up, votes_down')
      .eq('id', id)
      .maybeSingle();
    if (error || !row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const up = Math.max(0, Number(row.votes_up ?? 0) + (to === 'up' ? 1 : 0) - (from === 'up' ? 1 : 0));
    const down = Math.max(0, Number(row.votes_down ?? 0) + (to === 'down' ? 1 : 0) - (from === 'down' ? 1 : 0));

    const { data: updated, error: upErr } = await supabase
      .from('database_entries')
      .update({ votes_up: up, votes_down: down })
      .eq('id', id)
      .select('votes_up, votes_down')
      .single();
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, ...updated });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
