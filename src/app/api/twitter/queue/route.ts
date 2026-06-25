// ═══════════════════════════════════════════════════════════
// /api/twitter/queue
// GET: View pending tweets waiting for approval
// PATCH: Approve or skip a tweet
// POST: Manually trigger posting approved tweets
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { postApprovedTweets } from '@/lib/twitter'

// GET — list pending tweets
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabaseAdmin
    .from('tweet_queue')
    .select('*, articles(title, slug)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ tweets: data || [] })
}

// PATCH — approve or skip a tweet
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, status } = await request.json()

  if (!['approved', 'skipped'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  await supabaseAdmin
    .from('tweet_queue')
    .update({ status })
    .eq('id', id)

  return NextResponse.json({ success: true })
}

// POST — post all approved tweets now
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posted = await postApprovedTweets()
  return NextResponse.json({ success: true, posted })
}
