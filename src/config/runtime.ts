/**
 * Runtime Configuration
 *
 * Controls the application's data layer mode:
 * - true: Production mode with Supabase as single source of truth
 * - false: Development mode with mock/localStorage fallbacks (not recommended)
 *
 * IMPORTANT:
 * - Supabase must be initialized and RLS policies active
 * - All fallback paths are disabled in production mode
 * - localStorage is obsolete and should not be used
 */

export const USE_SUPABASE = true;

/**
 * Feature flags for gradual rollout (if needed in future)
 * Currently all are tied to USE_SUPABASE
 */
export const RUNTIME_CONFIG = {
  // Database layer
  useSuperbase: USE_SUPABASE,
  disableMockData: USE_SUPABASE,
  disableLocalStorage: USE_SUPABASE,

  // Authentication
  requireAuth: USE_SUPABASE,
  enforceRLS: USE_SUPABASE,

  // Data validation
  validateRLSPolicies: USE_SUPABASE,

  // Logging
  logSupabaseQueries: !USE_SUPABASE, // Only log in dev mode
  logRLSViolations: USE_SUPABASE,    // Always log violations
} as const;

/**
 * Runtime guards
 * Use these to prevent accidental fallbacks to mock data
 */
export const assertSupabaseEnabled = () => {
  if (!USE_SUPABASE) {
    throw new Error(
      'Supabase is required but USE_SUPABASE is disabled. ' +
      'Check src/config/runtime.ts'
    );
  }
};

export const assertAuthRequired = () => {
  if (!RUNTIME_CONFIG.requireAuth) {
    throw new Error(
      'Authentication is required but not enforced. ' +
      'Check src/config/runtime.ts'
    );
  }
};

export const assertRLSEnforced = () => {
  if (!RUNTIME_CONFIG.enforceRLS) {
    throw new Error(
      'RLS enforcement is disabled. ' +
      'This is a security risk in production. ' +
      'Check src/config/runtime.ts'
    );
  }
};

/**
 * Type-safe config getter
 */
export type RuntimeConfig = typeof RUNTIME_CONFIG;

export function getRuntimeConfig(): RuntimeConfig {
  return RUNTIME_CONFIG;
}

/**
 * Environment Variable Validation
 * Verify Supabase credentials are configured
 */
function validateSupabaseEnv() {
  if (USE_SUPABASE) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error(
        '[RUNTIME] ❌ Missing VITE_SUPABASE_URL\n' +
        'Required for production mode (USE_SUPABASE=true).\n' +
        'Set via: environment variables or .env file\n' +
        'Get from: Supabase Dashboard → Settings → API'
      );
    }

    if (!supabaseKey) {
      throw new Error(
        '[RUNTIME] ❌ Missing VITE_SUPABASE_ANON_KEY\n' +
        'Required for production mode (USE_SUPABASE=true).\n' +
        'Set via: environment variables or .env file\n' +
        'Get from: Supabase Dashboard → Settings → API → anon key'
      );
    }

    // Log success in production mode
    if (typeof window !== 'undefined') {
      console.info('[RUNTIME] ✅ Supabase environment validated');
    }
  }
}

/**
 * Validation on startup
 */
if (typeof window !== 'undefined') {
  // Validate Supabase environment
  validateSupabaseEnv();

  // Browser environment - verify Supabase is available
  if (USE_SUPABASE && !window.__SUPABASE_INITIALIZED__) {
    console.warn(
      '[RUNTIME] Supabase is enabled but not initialized. ' +
      'Make sure SupabaseAdapter is initialized before first data access.'
    );
  }

  // Warn if mock data is being used in production
  if (USE_SUPABASE && (window.localStorage?.getItem('mock_data') || (window as any).__USE_MOCK_DATA__)) {
    console.error(
      '[RUNTIME] Mock data detected with USE_SUPABASE=true. ' +
      'This indicates a configuration error. ' +
      'Clear localStorage and restart.'
    );
  }
}

export default RUNTIME_CONFIG;
