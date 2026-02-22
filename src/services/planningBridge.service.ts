/**
 * Planning Bridge Service
 *
 * Safe wrapper for accessing Domain.PlanningStateService
 * Eliminates direct window.Domain access patterns
 * Prevents "service not initialized" errors with graceful fallbacks
 *
 * This is a BRIDGE layer — does NOT replace Domain services
 * Domain services remain untouched in /js/domain/
 */

interface PlanningSession {
  id: string;
  date: string;
  regionId: string;
  clientId: string;
  status: string;
  marketplaceVisible: boolean;
  setupIds: string[];
  staffing: {
    minOperators: number;
    acceptedOperators: number;
    pendingApplications: number;
    isOperational: boolean;
  };
}

interface PlanningResult {
  success: boolean;
  sessions: PlanningSession[];
  count?: number;
  error?: string;
}

interface ClientPlanningResult {
  success: boolean;
  sessions: any[];
  error?: string;
}

/**
 * Safe accessor for PlanningStateService
 * Returns null if service not available
 */
function getPlanningService() {
  if (typeof window === 'undefined') {
    return null;
  }

  const domain = (window as any).Domain;
  if (!domain) {
    console.debug('[PlanningBridge] Domain object not found');
    return null;
  }

  const service = domain.PlanningStateService;
  if (!service) {
    console.debug('[PlanningBridge] PlanningStateService not found');
    return null;
  }

  return service;
}

/**
 * Get planning sessions with safe fallback
 *
 * @param filters Optional filters (dateFrom, dateTo, region, status)
 * @returns Sessions array or null if service unavailable
 */
export function getPlanningSessionsSafe(filters?: {
  dateFrom?: string;
  dateTo?: string;
  region?: string;
  status?: string;
}): PlanningResult | null {
  try {
    const service = getPlanningService();
    if (!service) {
      return null;
    }

    // Call service method with filters
    const result = service.getPlanningSessions(filters || {});
    return result;
  } catch (error) {
    console.warn('[PlanningBridge] Error calling getPlanningSessions:', error);
    return null;
  }
}

/**
 * Get client planning sessions with safe fallback
 *
 * @param clientId Client identifier
 * @returns Client sessions or null if service unavailable
 */
export function getClientPlanningSafe(clientId: string): ClientPlanningResult | null {
  try {
    if (!clientId) {
      console.debug('[PlanningBridge] clientId required');
      return null;
    }

    const service = getPlanningService();
    if (!service) {
      return null;
    }

    // Call service method
    const result = service.getClientPlanning(clientId);
    return result;
  } catch (error) {
    console.warn('[PlanningBridge] Error calling getClientPlanning:', error);
    return null;
  }
}

/**
 * Check if PlanningStateService is available
 * Useful for conditional rendering or early returns
 */
export function isPlanningServiceAvailable(): boolean {
  try {
    return getPlanningService() !== null;
  } catch {
    return false;
  }
}

/**
 * Get empty result structure for fallback rendering
 */
export function getEmptyPlanningResult(): PlanningResult {
  return {
    success: true,
    sessions: [],
    count: 0,
  };
}

/**
 * Get empty client planning result for fallback rendering
 */
export function getEmptyClientPlanningResult(): ClientPlanningResult {
  return {
    success: true,
    sessions: [],
  };
}

export default {
  getPlanningSessionsSafe,
  getClientPlanningSafe,
  isPlanningServiceAvailable,
  getEmptyPlanningResult,
  getEmptyClientPlanningResult,
};
