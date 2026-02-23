/**
 * Supabase Adapter — Direct ESM Import
 *
 * Direct instantiation of Supabase client via @supabase/supabase-js.
 * No global scripts. No polling. No bootstrap runtime.
 * Pure ESM architecture: import and use immediately.
 *
 * Environment variables (from .env):
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Public API key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

/**
 * Supabase client instance
 * Direct instantiation — available immediately at module load time
 * No async initialization required
 */
export const supabaseAdapter = createClient(supabaseUrl, supabaseKey);

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

export default supabaseAdapter;
