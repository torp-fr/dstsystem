/**
 * Planning State Service — TypeScript Implementation
 *
 * CRITICAL: This replaces the old Domain.PlanningStateService from /js/domain/
 * Direct Supabase queries for session planning data.
 * No window dependencies. Sync initialization.
 */

import { supabaseAdapter } from '@/infra/supabase.adapter';

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

let _initialized = false;
let _hydrated = false;
let _cachedSessions: PlanningSession[] = [];

/**
 * Initialize Planning State Service
 * Called from planning.bootstrap.ts
 */
export async function initPlanningStateService() {
  if (_initialized) {
    console.debug('[PlanningState] Service already initialized');
    return true;
  }

  try {
    console.log('[PlanningState] Initializing...');

    // Verify Supabase adapter is ready
    if (!supabaseAdapter) {
      throw new Error('Supabase adapter not initialized');
    }

    _initialized = true;
    console.info('[PlanningState] ✓ Service initialized');
    return true;
  } catch (error) {
    console.error('[PlanningState] Initialization failed:', error);
    return false;
  }
}

/**
 * Load initial state — MANDATORY hydration
 * Called from planning.bootstrap.ts AFTER initPlanningStateService()
 * Ensures sessions are cached BEFORE any React rendering
 */
export async function loadInitialState() {
  if (_hydrated) {
    console.debug('[PlanningState] Already hydrated');
    return true;
  }

  try {
    console.log('[PlanningState] Loading initial state...');

    // Direct query to shooting_sessions table
    const { data, error } = await supabaseAdapter
      .from('shooting_sessions')
      .select('*')
      .order('session_date', { ascending: true });

    if (error) {
      console.warn('[PlanningState] No sessions returned from adapter', error);
      _cachedSessions = [];
    } else {
      // Transform response to match interface
      const sessions = (data || []).map((session: any) => ({
        id: session.id,
        date: session.session_date,
        regionId: session.region || '',
        clientId: session.client_id || '',
        status: session.status,
        marketplaceVisible: session.marketplace_visible || false,
        setupIds: session.setup_ids || [],
        staffing: {
          minOperators: session.min_operators || 0,
          acceptedOperators: session.accepted_operators || 0,
          pendingApplications: session.pending_operators || 0,
          isOperational: session.is_operational || false,
        },
      }));

      _cachedSessions = sessions;
    }

    _hydrated = true;
    console.log('[PlanningState] shooting_sessions rows:', data?.length);
    console.log('[PlanningState] Hydration complete:', _cachedSessions.length);
    return true;
  } catch (error) {
    console.error('[PlanningState] Hydration error:', error);
    _cachedSessions = [];
    _hydrated = true; // Mark as hydrated even on error
    return false;
  }
}

/**
 * Get cached sessions (from initial hydration)
 */
export function getCachedSessions(): PlanningSession[] {
  return _cachedSessions;
}

/**
 * Check if state is hydrated
 */
export function isHydrated(): boolean {
  return _hydrated;
}

/**
 * Get all planning sessions
 * ALWAYS returns an array, never null
 */
export async function getPlanningSessions(filters?: {
  dateFrom?: string;
  dateTo?: string;
  region?: string;
  status?: string;
}): Promise<PlanningResult> {
  try {
    if (!_initialized) {
      console.warn('[PlanningState] Service not initialized');
      return { success: false, sessions: [], error: 'Service not initialized' };
    }

    let query = supabaseAdapter
      .from('shooting_sessions')
      .select('*')
      .order('session_date', { ascending: true });

    // Apply filters if provided
    if (filters?.dateFrom) {
      query = query.gte('session_date', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('session_date', filters.dateTo);
    }
    if (filters?.region) {
      query = query.eq('region', filters.region);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[PlanningState] Query error:', error);
      return { success: false, sessions: [], error: error.message };
    }

    // Transform response to match interface
    const sessions = (data || []).map((session: any) => ({
      id: session.id,
      date: session.session_date,
      regionId: session.region || '',
      clientId: session.client_id || '',
      status: session.status,
      marketplaceVisible: session.marketplace_visible || false,
      setupIds: session.setup_ids || [],
      staffing: {
        minOperators: session.min_operators || 0,
        acceptedOperators: session.accepted_operators || 0,
        pendingApplications: session.pending_operators || 0,
        isOperational: session.is_operational || false,
      },
    }));

    console.log('[PlanningState] shooting_sessions rows:', data?.length);
    console.log(`[PlanningState] Retrieved ${sessions.length} sessions`);
    return { success: true, sessions: sessions ?? [], count };
  } catch (error) {
    console.error('[PlanningState] Fetch error:', error);
    return { success: false, sessions: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get client planning sessions
 */
export async function getClientPlanning(clientId: string) {
  try {
    if (!_initialized) {
      console.warn('[PlanningState] Service not initialized');
      return { success: false, sessions: [], error: 'Service not initialized' };
    }

    if (!clientId) {
      return { success: false, sessions: [], error: 'clientId required' };
    }

    const { data, error } = await supabaseAdapter
      .from('shooting_sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('session_date', { ascending: true });

    if (error) {
      console.error('[PlanningState] Client query error:', error);
      return { success: false, sessions: [], error: error.message };
    }

    // Transform response to match interface
    const sessions = (data || []).map((session: any) => ({
      id: session.id,
      date: session.session_date,
      regionId: session.region || '',
      clientId: session.client_id || '',
      status: session.status,
      marketplaceVisible: session.marketplace_visible || false,
      setupIds: session.setup_ids || [],
      staffing: {
        minOperators: session.min_operators || 0,
        acceptedOperators: session.accepted_operators || 0,
        pendingApplications: session.pending_operators || 0,
        isOperational: session.is_operational || false,
      },
    }));

    console.log('[PlanningState] shooting_sessions rows:', data?.length);
    return { success: true, sessions: sessions || [] };
  } catch (error) {
    console.error('[PlanningState] Client fetch error:', error);
    return { success: false, sessions: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get session planning details
 */
export async function getSessionPlanningDetails(sessionId: string) {
  try {
    if (!_initialized) {
      console.warn('[PlanningState] Service not initialized');
      return { success: false, error: 'Service not initialized' };
    }

    if (!sessionId) {
      return { success: false, error: 'sessionId required' };
    }

    const { data, error } = await supabaseAdapter
      .from('shooting_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('[PlanningState] Detail query error:', error);
      return { success: false, error: error.message };
    }

    console.log('[PlanningState] shooting_sessions single row');
    return { success: true, session: data };
  } catch (error) {
    console.error('[PlanningState] Detail fetch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete session
 */
export async function deleteSession(sessionId: string) {
  try {
    if (!_initialized) {
      console.warn('[PlanningState] Service not initialized');
      return { success: false, error: 'Service not initialized' };
    }

    if (!sessionId) {
      return { success: false, error: 'sessionId required' };
    }

    const { error } = await supabaseAdapter
      .from('shooting_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('[PlanningState] Delete error:', error);
      return { success: false, error: error.message };
    }

    console.log(`[PlanningState] shooting_sessions session ${sessionId} deleted`);
    return { success: true };
  } catch (error) {
    console.error('[PlanningState] Delete operation error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Check if service is initialized
 */
export function isPlanningStateReady(): boolean {
  return _initialized;
}

export default {
  initPlanningStateService,
  loadInitialState,
  getPlanningSessions,
  getCachedSessions,
  getClientPlanning,
  getSessionPlanningDetails,
  deleteSession,
  isPlanningStateReady,
  isHydrated,
};
