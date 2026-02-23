/**
 * Supabase Adapter Instance
 *
 * Central, typed access to the global SupabaseAdapter.
 * Eliminates direct window.SupabaseAdapter dependencies throughout the codebase.
 * Adapter is loaded via deferred script in index.html and accessed here.
 */

declare global {
  interface Window {
    SupabaseAdapter: any;
  }
}

/**
 * Get the SupabaseAdapter instance
 * @throws Error if adapter is not initialized
 */
export function getAdapter() {
  if (!window.SupabaseAdapter) {
    throw new Error('[Adapter] SupabaseAdapter not initialized');
  }
  return window.SupabaseAdapter;
}

/**
 * Check if adapter is available
 */
export function isAdapterReady(): boolean {
  return !!window.SupabaseAdapter;
}

/**
 * Export typed instance for use throughout the app
 * Use this import instead of accessing window.SupabaseAdapter directly
 */
export const supabaseAdapter = {
  get instance() {
    return getAdapter();
  },
  isReady() {
    return isAdapterReady();
  },
};

export default supabaseAdapter;
