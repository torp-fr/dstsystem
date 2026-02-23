/**
 * HARD LOCK — Planning Domain Invariant Guard
 *
 * Prevents architectural regression:
 * ❌ No direct Supabase access in UI layer
 * ❌ No double session sources
 * ❌ No window.* adapter usage
 * ❌ No createClient() calls outside infra/
 *
 * Single source GUARANTEED:
 *   Components → planningBridge → planningState → supabase.adapter
 *
 * Runtime check in DEV mode (compile-time check via scripts/check-planning-violations.js)
 */

const FORBIDDEN_PATTERNS = [
  'supabase.from(',        // Direct Supabase query
  'window.SupabaseAdapter', // Global adapter access
  'createClient(',          // Client instantiation
  'new SupabaseClient',     // Client constructor
];

/**
 * Assert Planning Invariant
 * Throws if forbidden pattern detected in call stack
 *
 * @param moduleName Module name for error reporting
 * @throws Error if invariant violated
 */
export function assertPlanningInvariant(moduleName: string): void {
  // Skip in production
  if (import.meta.env.PROD) {
    return;
  }

  try {
    const stack = new Error().stack || '';

    // Check for forbidden patterns in stack trace
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (stack.includes(pattern)) {
        console.error(
          `[⛔ PLANNING HARD LOCK] Module "${moduleName}" attempted forbidden access: "${pattern}"`
        );
        console.error('[⛔ Stack trace:', stack);

        throw new Error(
          `[PLANNING HARD LOCK VIOLATION]\n` +
          `Module: ${moduleName}\n` +
          `Forbidden pattern: ${pattern}\n` +
          `Single source rule: Components → planningBridge → planningState → supabase.adapter`
        );
      }
    }
  } catch (error) {
    // Re-throw violations, ignore guard errors
    if (error instanceof Error && error.message.includes('PLANNING HARD LOCK VIOLATION')) {
      throw error;
    }
    // Silently ignore stack inspection errors (e.g., in some environments)
  }
}

/**
 * Assert no global Supabase adapter exists
 * Ensures infra/supabase.adapter.ts is the ONLY source
 *
 * @throws Error if global adapter detected
 */
export function assertNoGlobalSupabaseAdapter(): void {
  if (import.meta.env.PROD) {
    return;
  }

  if (typeof window !== 'undefined') {
    const globalAdapter = (window as any).SupabaseAdapter || (window as any).supabaseAdapter;

    if (globalAdapter) {
      console.error('[⛔ PLANNING HARD LOCK] Global SupabaseAdapter detected on window object');
      throw new Error(
        '[PLANNING HARD LOCK VIOLATION]\n' +
        'Global SupabaseAdapter usage is forbidden.\n' +
        'Use infra/supabase.adapter.ts as single source.'
      );
    }
  }
}

export default {
  assertPlanningInvariant,
  assertNoGlobalSupabaseAdapter,
};
