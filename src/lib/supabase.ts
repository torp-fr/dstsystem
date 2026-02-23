import { createClient } from '@supabase/supabase-js';
import { USE_SUPABASE } from '@/config/runtime';

/**
 * Supabase Client — HARDENED PRODUCTION MODE
 *
 * This client is guarded by the runtime configuration.
 * If USE_SUPABASE is disabled, client creation will fail.
 * This prevents accidental fallback to mock/localStorage data.
 */

/**
 * Global Network Timeout Protection
 * Ensures requests don't hang indefinitely
 */
const NETWORK_TIMEOUT_MS = 15000; // 15 seconds

function createTimeoutFetch() {
  return async (url: string, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(
          `[NETWORK] Request timeout after ${NETWORK_TIMEOUT_MS}ms: ${url}`
        );
      }

      throw error;
    }
  };
}

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

// Create the Supabase client with timeout protection
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: createTimeoutFetch(),
  },
});

// Validate client initialization
if (!supabaseClient) {
  throw new Error('[PRODUCTION] Failed to initialize Supabase client');
}

// Export client with guard in place
export const supabase = supabaseClient;

// ============================================================
// NO GLOBAL EXPOSURE
// ============================================================
// Supabase client is accessed via ESM imports only
// No window.supabase dependency — pure module architecture

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
