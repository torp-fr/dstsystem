/**
 * Domain Services Bootstrap
 *
 * Ensures all Domain layer services are loaded in correct dependency order.
 * This is critical because some services (e.g., planningState.service.js)
 * depend on others (e.g., roleGuard.service.js) being available first.
 *
 * Load order matters:
 * 1. index.js - Creates window.Domain object
 * 2. Repositories (setup, account, operatorAvailability)
 * 3. Engines/Services (availability, moduleCapacity, sessionResource)
 * 4. Core services (roleGuard, planningRealtime)
 * 5. Dependent services (planningState, operatorAutoMatch, staffingRisk)
 */

export async function ensureDomainBootstrap() {
  if (typeof window === 'undefined') {
    console.warn('[DomainBootstrap] Not in browser environment');
    return;
  }

  // Already loaded?
  if ((window as any).Domain && (window as any).Domain._bootstrapped) {
    console.debug('[DomainBootstrap] Domain already bootstrapped');
    return;
  }

  try {
    console.info('[DomainBootstrap] Loading Domain services...');

    // 1. Core Domain object
    await import('/js/domain/index.js');

    // 2. Repositories (no dependencies on services)
    await import('/js/domain/setup.repository.js');
    await import('/js/domain/account.repository.js');
    await import('/js/domain/operatorAvailability.repository.js');

    // 3. Engines & Services (independent)
    await import('/js/domain/availability.engine.js');
    await import('/js/domain/moduleCapacity.service.js');
    await import('/js/domain/sessionResource.service.js');
    await import('/js/domain/sessionMigration.helper.js');

    // 4. Core services (roleGuard is needed by planningState)
    await import('/js/domain/roleGuard.service.js');
    await import('/js/domain/planningRealtime.service.js');

    // 5. Dependent services (depends on roleGuard, etc.)
    await import('/js/domain/planningState.service.js');
    await import('/js/domain/operatorAutoMatch.service.js');
    await import('/js/domain/staffingRisk.service.js');

    // Mark as bootstrapped to prevent re-loading
    if ((window as any).Domain) {
      (window as any).Domain._bootstrapped = true;
    }

    console.info('[DomainBootstrap] ✓ All Domain services loaded successfully');
    console.debug('[DomainBootstrap] window.Domain available:', !!(window as any).Domain);
    console.debug('[DomainBootstrap] window.PlanningStateService available:', !!(window as any).PlanningStateService);
    console.debug('[DomainBootstrap] window.RoleGuardService available:', !!(window as any).Domain?.RoleGuardService);
  } catch (error) {
    console.error('[DomainBootstrap] Failed to load Domain services:', error);
    // Don't throw - allow app to continue with degraded mode
  }
}

export default {
  ensureDomainBootstrap
};
