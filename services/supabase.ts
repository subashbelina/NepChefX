import { createClient } from '@supabase/supabase-js';

function requireEnv(name: string) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name} (set it in .env, restart Expo)`);
  return v;
}

export function isSupabaseConfigured() {
  return !!process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() && !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
}

/**
 * Client-side Supabase client.
 * - Uses EXPO_PUBLIC_* vars (safe for client)
 * - Auth session persistence disabled (this app currently doesn’t use Supabase Auth)
 */
export const supabase = createClient(
  requireEnv('EXPO_PUBLIC_SUPABASE_URL'),
  requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);

