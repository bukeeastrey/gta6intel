// POST /api/database/vote  { id, dir: 'up' | 'down' }
// Increments a database entry's vote tally. Best-effort (no auth);
// the client stores a voted flag to discourage repeats.
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { id, dir } = await req.json();
    if (!id || (dir !== 'up' && dir !== 'down')) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }
    const supabase = createSupabaseAdminClient();
    const { data: row, error } = await supabase
      .from('database_entries')
      .select('votes_up, votes_down')
      .eq('id', id)
      .maybeSingle();
    if (error || !row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const patch =
      dir === 'up'
        ? { votes_up: Number(row.votes_up ?? 0) + 1 }
        : { votes_down: Number(row.votes_down ?? 0) + 1 };

    const { data: updated, error: upErr } = await supabase
      .from('database_entries')
      .update(patch)
      .eq('id', id)
      .select('votes_up, votes_down')
      .single();
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, ...updated });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
