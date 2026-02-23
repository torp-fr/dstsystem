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
 * Import the TypeScript planning service
 */
import * as planningState from '@/domain/planningState.service';

/**
 * Get planning sessions with safe fallback
 * Uses the TypeScript planningState service
 *
 * @param filters Optional filters (dateFrom, dateTo, region, status)
 * @returns Sessions array or null if service unavailable
 */
export async function getPlanningSessionsSafe(filters?: {
  dateFrom?: string;
  dateTo?: string;
  region?: string;
  status?: string;
}): Promise<PlanningResult | null> {
  try {
    // Call the TypeScript planning service
    const result = await planningState.getPlanningSessions(filters || {});
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
export async function getClientPlanningSafe(clientId: string): Promise<ClientPlanningResult | null> {
  try {
    if (!clientId) {
      console.debug('[PlanningBridge] clientId required');
      return null;
    }

    // Call the TypeScript planning service
    const result = await planningState.getClientPlanning(clientId);
    return result;
  } catch (error) {
    console.warn('[PlanningBridge] Error calling getClientPlanning:', error);
    return null;
  }
}

/**
 * Get session planning details with safe fallback
 *
 * @param sessionId Session identifier
 * @returns Session details or null if service unavailable
 */
export async function getSessionPlanningDetailsSafe(sessionId: string): Promise<SessionPlanningDetails | null> {
  try {
    if (!sessionId) {
      console.debug('[PlanningBridge] sessionId required');
      return null;
    }

    // Call the TypeScript planning service
    const result = await planningState.getSessionPlanningDetails(sessionId);
    return result;
  } catch (error) {
    console.warn('[PlanningBridge] Error calling getSessionPlanningDetails:', error);
    return null;
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
