// ═══════════════════════════════════════════════════════════
// /api/youtube/monitor
// Called by Vercel Cron every 6 hours.
// Checks Rockstar's YouTube for new GTA 6 videos.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { runYouTubeMonitor } from '@/lib/youtube'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runYouTubeMonitor()
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: result
    })
  } catch (error) {
    console.error('YouTube monitor failed:', error)
    return NextResponse.json({ success: false, error: 'Monitor failed' }, { status: 500 })
  }
}
