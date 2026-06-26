// ════════════════════════════════════════════════════════════
// Supabase ADMIN client — uses the SERVICE ROLE key. Server-only.
// This bypasses RLS, so it must NEVER be imported into client code.
// Used exclusively by the pipeline to write articles/videos/logs.
// ════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
