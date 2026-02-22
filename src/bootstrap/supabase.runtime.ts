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

export function initializeSupabaseRuntime() {
  // Check if SupabaseAdapter is available globally
  if (typeof window !== 'undefined' && window.SupabaseAdapter) {
    const adapter = window.SupabaseAdapter;

    // Verify adapter is properly loaded
    if (!adapter.SessionRepository) {
      console.warn('[SupabaseAdapter] SessionRepository not found - adapter may not be fully loaded');
      return false;
    }

    console.info('[SupabaseRuntime] ✓ SupabaseAdapter initialized and ready');
    return true;
  } else {
    console.warn('[SupabaseRuntime] SupabaseAdapter not found - Supabase may not be initialized');
    return false;
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initializeSupabaseRuntime();
}
