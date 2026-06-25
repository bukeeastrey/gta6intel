// ═══════════════════════════════════════════════════════════
// /api/pipeline/trigger
// Called automatically by Vercel Cron every 30 minutes.
// Protected by CRON_SECRET so only Vercel can trigger it.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { runPipeline } from '@/lib/pipeline'

export const maxDuration = 60 // Allow up to 60s for pipeline to run

export async function GET(request: NextRequest) {
  // Verify this is coming from Vercel Cron (or manual admin trigger)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('⚙️ Pipeline triggered at', new Date().toISOString())
    const result = await runPipeline()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: result
    })
  } catch (error) {
    console.error('Pipeline trigger failed:', error)
    return NextResponse.json(
      { success: false, error: 'Pipeline failed' },
      { status: 500 }
    )
  }
}
