import { createClient } from '@supabase/supabase-js'

// ─── Public client (browser / frontend) ──────────────────
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Admin client (server / pipeline only) ───────────────
// Uses service role key — NEVER expose to browser
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Types ───────────────────────────────────────────────
export type Article = {
  id: string
  title: string
  slug: string
  body: string | null
  summary: string | null
  category: 'news' | 'analysis' | 'guide' | 'roundup'
  label: 'CONFIRMED' | 'RUMOR' | 'LEAK' | 'ANALYSIS'
  source_url: string | null
  source_name: string | null
  image_url: string | null
  is_published: boolean
  auto_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Source = {
  id: string
  name: string
  rss_url: string | null
  site_url: string | null
  trust_level: number
  is_active: boolean
  last_fetched: string | null
}

export type Subscriber = {
  id: string
  email: string
  subscribed_at: string
  is_active: boolean
}
