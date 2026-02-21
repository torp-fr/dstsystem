import { createClient } from '@supabase/supabase-js';
import { USE_SUPABASE } from '@/config/runtime';

/**
 * Supabase Client — HARDENED PRODUCTION MODE
 *
 * This client is guarded by the runtime configuration.
 * If USE_SUPABASE is disabled, client creation will fail.
 * This prevents accidental fallback to mock/localStorage data.
 */

// PRODUCTION GUARD: Fail fast if Supabase disabled
if (!USE_SUPABASE) {
  throw new Error(
    '[PRODUCTION] Supabase client is required but USE_SUPABASE is disabled. ' +
    'Check src/config/runtime.ts'
  );
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create the Supabase client
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Validate client initialization
if (!supabaseClient) {
  throw new Error('[PRODUCTION] Failed to initialize Supabase client');
}

// Export client with guard in place
export const supabase = supabaseClient;

// Development info logging
if (typeof window !== 'undefined' && USE_SUPABASE) {
  console.info('[DST-SYSTEM] ✅ Supabase production runtime is active');
}

// Export a helper to check if user is authenticated
export const checkAuth = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Helper to get session
export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};
