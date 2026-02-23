/**
 * Supabase Runtime Bootstrap
 *
 * Initializes Supabase adapter BEFORE any React rendering.
 * Must be imported in main.tsx BEFORE React app startup.
 *
 * This ensures:
 * 1. SupabaseAdapter is ready (loaded via deferred script in index.html)
 * 2. Authentication state is loaded
 * 3. RLS policies are available
 */

import { isAdapterReady } from '@/infra/supabase.adapter';

/** Flag indicating Supabase is bootstrapped and ready */
let supabaseReady = false;

/**
 * Wait until SupabaseAdapter is available globally
 * Uses polling to detect when deferred script loads (max 5s)
 */
async function waitForSupabaseAdapter(maxRetries = 50) {
  console.log('[BOOT] Waiting for SupabaseAdapter (deferred script)...');

  let retries = maxRetries;
  while (!isAdapterReady() && retries-- > 0) {
    await new Promise(r => setTimeout(r, 100));
  }

  if (!isAdapterReady()) {
    throw new Error('[BOOT] SupabaseAdapter failed to load after 5s');
  }

  console.log('[BOOT] SupabaseAdapter loaded ✓');
  return true;
}

/**
 * Initialize Supabase bootstrap
 * Called with top-level await in main.tsx
 */
export async function initializeSupabaseRuntime() {
  console.log('[BOOT] Supabase runtime executing...');

  try {
    // Wait for adapter to load
    await waitForSupabaseAdapter();

    // Verify adapter is properly initialized
    const adapter = window.SupabaseAdapter;
    if (!adapter?.SessionRepository) {
      console.warn('[BOOT] SessionRepository not found on adapter');
      throw new Error('SupabaseAdapter incomplete');
    }

    supabaseReady = true;
    console.info('[BOOT] ✓ SupabaseAdapter initialized and ready');
    return true;
  } catch (error) {
    console.error('[BOOT] ✗ Failed to initialize Supabase:', error);
    throw error;
  }
}

/**
 * Check if Supabase is ready
 */
export function isSupabaseReady(): boolean {
  return supabaseReady;
}
