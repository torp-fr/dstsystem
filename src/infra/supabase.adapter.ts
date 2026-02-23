/**
 * Supabase Adapter — SINGLE SOURCE OF TRUTH
 *
 * Direct instantiation of Supabase client via @supabase/supabase-js.
 * ⚠️ CRITICAL: This is the ONLY place where createClient() is called.
 * No other files may instantiate Supabase.
 *
 * Features:
 * - Network timeout protection (15s)
 * - Environment validation at load time
 * - Sync instantiation (no polling)
 * - Production guard (USE_SUPABASE config)
 *
 * Environment variables (from .env):
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Public API key
 * - USE_SUPABASE: Runtime config flag
 */

import { createClient } from '@supabase/supabase-js';
import { USE_SUPABASE } from '@/config/runtime';

/**
 * HARD LOCK — Prevent global SupabaseAdapter usage
 * This file is the ONLY source of Supabase instantiation
 */
if (typeof window !== 'undefined') {
  const global = window as any;

  // Prevent accidental re-assignment
  Object.defineProperty(global, 'SupabaseAdapter', {
    value: null,
    writable: false,
    configurable: false,
  });

  // Warn if something tries to attach a global adapter
  if (global.SupabaseAdapter !== undefined && global.SupabaseAdapter !== null) {
    console.error(
      '[⛔ HARD LOCK] Attempt to create global SupabaseAdapter. ' +
      'This violates Planning invariant. Use infra/supabase.adapter.ts as single source.'
    );
    throw new Error('[HARD LOCK] Global SupabaseAdapter forbidden.');
  }
}

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
    '[PRODUCTION] Supabase adapter is required but USE_SUPABASE is disabled. ' +
    'Check src/config/runtime.ts'
  );
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

/**
 * ⚠️ SINGLE SOURCE OF TRUTH — ONLY createClient() call in entire codebase
 * Create the Supabase client with timeout protection
 */
const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: createTimeoutFetch(),
  },
});

// Validate client initialization
if (!supabaseClient) {
  throw new Error('[PRODUCTION] Failed to initialize Supabase client');
}

/**
 * Export as supabaseAdapter (infrastructure layer name)
 */
export const supabaseAdapter = supabaseClient;

/**
 * Also export as supabase for compatibility with existing code
 * (many files import from @/lib/supabase which re-exports this)
 */
export const supabase = supabaseClient;

/**
 * Adapter is always ready (sync instantiation)
 */
export function isAdapterReady(): boolean {
  return !!supabaseAdapter;
}

/**
 * Get typed adapter instance
 */
export function getAdapter() {
  if (!supabaseAdapter) {
    throw new Error('Supabase adapter not initialized');
  }
  return supabaseAdapter;
}

/**
 * Check if user is authenticated
 */
export const checkAuth = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

/**
 * Get current session
 */
export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

// Development info logging
if (typeof window !== 'undefined' && USE_SUPABASE) {
  console.info('[DST-SYSTEM] ✅ Supabase production runtime is active');
}

export default supabaseAdapter;

