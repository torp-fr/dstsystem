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

import * as planningState from '@/domain/planningState.service';

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

interface SessionPlanningDetails {
  success: boolean;
  session?: any;
  operators?: {
    accepted: any[];
    pending: any[];
    rejected: any[];
  };
  staffingState?: any;
  error?: string;
}

/**
 * Get planning sessions with safe fallback
 * Uses the TypeScript planningState service
 * ALWAYS returns a result object, NEVER null
 *
 * @param filters Optional filters (dateFrom, dateTo, region, status)
 * @returns Sessions array (always array, never null)
 */
export async function getPlanningSessionsSafe(filters?: {
  dateFrom?: string;
  dateTo?: string;
  region?: string;
  status?: string;
}): Promise<PlanningResult> {
  try {
    // Call the TypeScript planning service
    const result = await planningState.getPlanningSessions(filters || {});
    return result ?? { success: false, sessions: [] };
  } catch (error) {
    console.warn('[PlanningBridge] Error calling getPlanningSessions:', error);
    return { success: false, sessions: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get client planning sessions with safe fallback
 * ALWAYS returns a result object, NEVER null
 *
 * @param clientId Client identifier
 * @returns Client sessions (always array, never null)
 */
export async function getClientPlanningSafe(clientId: string): Promise<ClientPlanningResult> {
  try {
    if (!clientId) {
      console.debug('[PlanningBridge] clientId required');
      return { success: false, sessions: [], error: 'clientId required' };
    }

    // Call the TypeScript planning service
    const result = await planningState.getClientPlanning(clientId);
    return result ?? { success: false, sessions: [] };
  } catch (error) {
    console.warn('[PlanningBridge] Error calling getClientPlanning:', error);
    return { success: false, sessions: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get session planning details with safe fallback
 * ALWAYS returns a result object, NEVER null
 *
 * @param sessionId Session identifier
 * @returns Session details (never null)
 */
export async function getSessionPlanningDetailsSafe(sessionId: string): Promise<SessionPlanningDetails> {
  try {
    if (!sessionId) {
      console.debug('[PlanningBridge] sessionId required');
      return { success: false, error: 'sessionId required' };
    }

    // Call the TypeScript planning service
    const result = await planningState.getSessionPlanningDetails(sessionId);
    return result ?? { success: false, error: 'No result' };
  } catch (error) {
    console.warn('[PlanningBridge] Error calling getSessionPlanningDetails:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete session with safe fallback
 *
 * @param sessionId Session identifier
 * @returns { success: boolean, error?: string }
 */
export async function deleteSessionSafe(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sessionId) {
      return { success: false, error: 'sessionId required' };
    }

    // Call the TypeScript planning service
    const result = await planningState.deleteSession(sessionId);
    return result;
  } catch (error) {
    console.warn('[PlanningBridge] Error calling deleteSession:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Check if PlanningStateService is available and hydrated
 * Useful for conditional rendering or early returns
 */
export function isPlanningServiceAvailable(): boolean {
  try {
    return planningState.isPlanningStateReady() && planningState.isHydrated();
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
  getSessionPlanningDetailsSafe,
  deleteSessionSafe,
  isPlanningServiceAvailable,
  getEmptyPlanningResult,
  getEmptyClientPlanningResult,
};
