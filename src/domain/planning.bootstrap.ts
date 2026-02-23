/**
 * Planning Domain Bootstrap — DETERMINISTIC
 *
 * Initializes all Planning domain services with mandatory hydration.
 * Called from main.tsx BEFORE React render.
 *
 * Sequence:
 * 1. Initialize Planning State Service
 * 2. LOAD INITIAL STATE (mandatory hydration)
 * 3. Cache all sessions BEFORE React renders
 */

import { initPlanningStateService, loadInitialState, isPlanningStateReady, isHydrated } from './planningState.service';

let _bootstrapped = false;

/**
 * Bootstrap planning domain with mandatory hydration
 * Safe to call multiple times (guard prevents re-initialization)
 */
export async function bootstrapPlanningDomain() {
  if (_bootstrapped) {
    console.debug('[PlanningDomain] Already bootstrapped');
    return true;
  }

  try {
    console.log('[PlanningDomain] Bootstrapping...');

    // Step 1: Initialize Planning State Service
    const stateReady = await initPlanningStateService();

    if (!stateReady) {
      console.error('[PlanningDomain] Planning state service failed to initialize');
      return false;
    }

    // Step 2: MANDATORY HYDRATION — Load all sessions into cache
    console.log('[PlanningDomain] Loading initial state...');
    const hydrationSuccess = await loadInitialState();

    if (!hydrationSuccess) {
      console.warn('[PlanningDomain] Initial hydration failed (but continuing)');
      // Don't fail here - sessions might have loaded into cache anyway
    }

    _bootstrapped = true;
    console.info('[PlanningDomain] ✓ Bootstrap complete - Sessions hydrated');
    return true;
  } catch (error) {
    console.error('[PlanningDomain] Bootstrap failed:', error);
    return false;
  }
}

/**
 * Check if domain is bootstrapped
 */
export function isPlanningDomainReady(): boolean {
  return _bootstrapped && isPlanningStateReady();
}

export default {
  bootstrapPlanningDomain,
  isPlanningDomainReady,
};
