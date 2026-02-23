/**
 * Planning Domain Bootstrap — SYNCHRONOUS
 *
 * Initializes all Planning domain services.
 * Called from main.tsx BEFORE React render.
 * No async/await. No polling. Deterministic.
 */

import { initPlanningStateService, isPlanningStateReady } from './planningState.service';

let _bootstrapped = false;

/**
 * Bootstrap planning domain synchronously
 * Safe to call multiple times (guard prevents re-initialization)
 */
export async function bootstrapPlanningDomain() {
  if (_bootstrapped) {
    console.debug('[PlanningDomain] Already bootstrapped');
    return true;
  }

  try {
    console.log('[PlanningDomain] Bootstrapping...');

    // Initialize Planning State Service
    const stateReady = await initPlanningStateService();

    if (!stateReady) {
      console.error('[PlanningDomain] Planning state service failed to initialize');
      return false;
    }

    _bootstrapped = true;
    console.info('[PlanningDomain] ✓ Bootstrap complete - Adapter READY');
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
