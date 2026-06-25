// ═══════════════════════════════════════════════════════════
// /api/articles
// GET: Paginated list of published articles with filters
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const category = searchParams.get('category')
  const label = searchParams.get('label')
  const search = searchParams.get('search')

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (category) query = query.eq('category', category)
  if (label) query = query.eq('label', label)
  if (search) query = query.textSearch('title', search)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    articles: data,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  })
}
