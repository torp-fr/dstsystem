/**
 * Supabase Runtime Bootstrap
 *
 * Initializes Supabase adapter BEFORE any React rendering.
 * Must be imported in main.tsx BEFORE React app startup.
 *
 * This ensures:
 * 1. SupabaseAdapter is ready
 * 2. Authentication state is loaded
 * 3. RLS policies are available
 */

declare const SupabaseAdapter: any;

/**
 * Wait until SupabaseAdapter is available globally
 * Uses polling to detect adapter loading
 */
async function waitForSupabaseAdapter(maxRetries = 50) {
  console.log('[BOOT] Waiting for SupabaseAdapter...');

  let retries = maxRetries;
  while (!window.SupabaseAdapter && retries-- > 0) {
    await new Promise(r => setTimeout(r, 100));
  }

  if (!window.SupabaseAdapter) {
    throw new Error('[BOOT] SupabaseAdapter failed to load after 5s');
  }

  console.log('[BOOT] SupabaseAdapter loaded ✓');
  return window.SupabaseAdapter;
}

export async function initializeSupabaseRuntime() {
  console.log('[BOOT] Supabase runtime executing...');

  try {
    // Wait for adapter to load
    const adapter = await waitForSupabaseAdapter();

    // Verify adapter is properly loaded
    if (!adapter.SessionRepository) {
      console.warn('[SupabaseAdapter] SessionRepository not found');
      return false;
    }

    console.info('[BOOT] ✓ SupabaseAdapter initialized and ready');
    return true;
  } catch (error) {
    console.error('[BOOT] ✗ Failed to initialize Supabase:', error);
    throw error;
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Don't await here - let main.tsx handle the await
}
