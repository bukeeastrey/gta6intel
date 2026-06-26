// ════════════════════════════════════════════════════════════
// Server-only Supabase client.
// Used by Server Components / route handlers for data fetching.
// Reads the public anon key — fine for public read access guarded
// by Row Level Security. Never import this into a client component.
// ════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (.env.local / Vercel).'
  );
}

/**
 * A fresh client per call keeps things safe for the request/ISR model
 * (no shared mutable auth state between requests).
 */
export function createSupabaseServerClient() {
  return createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
