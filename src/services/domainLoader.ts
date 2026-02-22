/**
 * Domain Services Loader
 *
 * Ensures all Domain layer services (/js/domain/*.js) are loaded
 * and available globally via window.Domain
 *
 * This module imports the legacy domain files so that Vite includes them
 * in the production bundle. Without this import, the files are ignored
 * and services remain undefined at runtime.
 *
 * Legacy files expected:
 * - /js/domain/planningState.service.js
 * - /js/domain/index.js
 */

// Import legacy domain services to ensure they're loaded
// This makes them available as window.Domain and window.PlanningStateService
import "/js/domain/planningState.service.js";

/**
 * Ensure Domain layer is loaded
 * Call this early in app initialization (App.tsx)
 */
export function ensureDomainLoaded() {
  if (typeof window !== 'undefined') {
    // Verify Domain is available after import
    if (!(window as any).Domain) {
      console.warn('[DomainLoader] Domain object not found after loading');
    }
    if (!(window as any).PlanningStateService) {
      console.warn('[DomainLoader] PlanningStateService not found after loading');
    }
  }
  return true;
}

export default {
  ensureDomainLoaded
};
