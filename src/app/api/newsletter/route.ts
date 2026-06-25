// ═══════════════════════════════════════════════════════════
// /api/newsletter
// POST: Subscribe an email to GTA6Intel Weekly
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('subscribers')
      .insert({ email: email.toLowerCase().trim() })

    if (error) {
      // Duplicate email — already subscribed
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already subscribed!' })
      }
      throw error
    }

    return NextResponse.json({ message: 'Subscribed successfully!' })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
