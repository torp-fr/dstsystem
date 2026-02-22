/**
 * PlanningStateService
 *
 * READ-ONLY projection layer for dashboard display.
 * Aggregates and formats planning data from Supabase.
 *
 * NO database writes allowed.
 * NO automation, scoring, or prediction logic.
 * NO realtime subscriptions.
 *
 * This is a VIEW MODEL ONLY.
 * Controllers handle all mutations.
 *
 * Data Flow:
 * Supabase → SupabaseAdapter → Domain Repositories → PlanningStateService → Dashboard UI
 */

const PlanningStateService = (function() {
  'use strict';

  // ============================================================
  // GUARD: Check required dependencies
  // ============================================================

  if (typeof RoleGuardService === 'undefined') {
    console.warn('[PlanningStateService] RoleGuardService missing — abort init');
    return null;
  }

  if (typeof SupabaseAdapter === 'undefined') {
    console.warn('[PlanningStateService] SupabaseAdapter missing — abort init');
    return null;
  }

  // ============================================================
  // CONSTANTS
  // ============================================================

  const SESSION_STATUS = {
    PENDING_CONFIRMATION: 'pending_confirmation',
    CONFIRMED: 'confirmed',
    OPERATIONAL: 'operational',
    COMPLETED: 'completed'
  };

  // ============================================================
  // 1. GET PLANNING SESSIONS (Aggregated Planning List)
  // ============================================================

  /**
   * Get aggregated planning sessions with staffing state
   *
   * READ-ONLY: Fetches sessions and counts operators
   * NO mutations, NO automation logic
   *
   * @param {Object} filters - { dateFrom?, dateTo?, region?, status? }
   * @returns {Object} { success, sessions: [...], count, error }
   *
   * Session shape:
   * {
   *   id, date, regionId, clientId, status, marketplaceVisible, setupIds,
   *   staffing: {
   *     minOperators,
   *     acceptedOperators,
   *     pendingApplications,
   *     isOperational (acceptedOperators >= minOperators)
   *   }
   * }
   */
  function getPlanningSessions(filters = {}) {
    try {
      // GUARD: User can view sessions
      if (!RoleGuardService.can('*', 'view_planning_sessions')) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          sessions: [],
          count: 0
        };
      }

      const adapter = SupabaseAdapter;

      // Build query
      let query = adapter.query('shooting_sessions');

      // Apply date filters
      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }

      // Apply status filter
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply region filter (if applicable)
      if (filters.region) {
        query = query.eq('region_id', filters.region);
      }

      // Order by date
      query = query.order('date', { ascending: true });

      // Execute query
      const sessions = query.execute();

      if (!sessions || sessions.length === 0) {
        return {
          success: true,
          sessions: [],
          count: 0,
          message: 'No sessions found matching filters'
        };
      }

      // Enrich each session with staffing data
      const enrichedSessions = sessions.map(session => {
        return _enrichSessionWithStaffing(session);
      });

      // Filter by role visibility
      const visibleSessions = enrichedSessions.filter(session => {
        return _canViewSession(session);
      });

      return {
        success: true,
        sessions: visibleSessions,
        count: visibleSessions.length,
        message: `Found ${visibleSessions.length} sessions`
      };
    } catch (error) {
      console.error('[PlanningStateService.getPlanningSessions]', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        details: error.message,
        sessions: [],
        count: 0
      };
    }
  }

  // ============================================================
  // 2. GET SESSION PLANNING DETAILS (Detailed View)
  // ============================================================

  /**
   * Get detailed planning view for a specific session
   *
   * READ-ONLY: Fetches session + all operator applications
   * NO mutations
   *
   * @param {string} sessionId - Session ID
   * @returns {Object} {
   *   success,
   *   session: { id, date, clientId, status, ... },
   *   operators: {
   *     accepted: [ { operatorId, name, acceptedAt } ],
   *     pending: [ { operatorId, name, appliedAt } ],
   *     rejected: [ { operatorId, name, rejectedAt } ]
   *   },
   *   staffingState: { isOperational, acceptedCount, pendingCount },
   *   error
   * }
   */
  function getSessionPlanningDetails(sessionId) {
    try {
      // GUARD: User can view this session
      if (!RoleGuardService.can('*', 'view_session_details')) {
        return {
          success: false,
          error: 'UNAUTHORIZED'
        };
      }

      const adapter = SupabaseAdapter;

      // Fetch session
      const session = adapter.query('shooting_sessions')
        .eq('id', sessionId)
        .single();

      if (!session) {
        return {
          success: false,
          error: 'SESSION_NOT_FOUND',
          details: `Session ${sessionId} not found`
        };
      }

      // GUARD: Can view this specific session
      if (!_canViewSession(session)) {
        return {
          success: false,
          error: 'FORBIDDEN',
          details: 'You do not have access to this session'
        };
      }

      // Fetch all operator applications for this session
      const applications = adapter.query('session_operators')
        .eq('session_id', sessionId)
        .order('applied_at', { ascending: false })
        .execute();

      // Enrich applications with operator details
      const acceptedOps = [];
      const pendingOps = [];
      const rejectedOps = [];

      applications.forEach(app => {
        const operator = _getOperatorDetails(app.operator_id);

        const opData = {
          operatorId: app.operator_id,
          name: operator ? operator.name : 'Unknown',
          email: operator ? operator.email : null,
          appliedAt: app.applied_at,
          acceptedAt: app.accepted_at || null,
          rejectedAt: app.rejected_at || null
        };

        if (app.status === 'accepted') {
          acceptedOps.push(opData);
        } else if (app.status === 'pending') {
          pendingOps.push(opData);
        } else if (app.status === 'rejected') {
          rejectedOps.push(opData);
        }
      });

      // Get operator requirement
      const minOperators = session.operator_requirement?.minOperators || 1;
      const isOperational = acceptedOps.length >= minOperators;

      return {
        success: true,
        session: {
          id: session.id,
          date: session.date,
          clientId: session.client_id,
          status: session.status,
          marketplaceVisible: session.marketplace_visible,
          setupIds: session.setup_ids,
          operatorRequirement: session.operator_requirement,
          notes: session.notes,
          createdAt: session.created_at,
          updatedAt: session.updated_at
        },
        operators: {
          accepted: acceptedOps,
          pending: pendingOps,
          rejected: rejectedOps
        },
        staffingState: {
          minOperators: minOperators,
          acceptedCount: acceptedOps.length,
          pendingCount: pendingOps.length,
          rejectedCount: rejectedOps.length,
          isOperational: isOperational
        },
        message: `Session details loaded (${acceptedOps.length} accepted, ${pendingOps.length} pending)`
      };
    } catch (error) {
      console.error('[PlanningStateService.getSessionPlanningDetails]', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        details: error.message
      };
    }
  }

  // ============================================================
  // 3. GET OPERATOR PLANNING (Operator Dashboard)
  // ============================================================

  /**
   * Get operator's schedule of accepted sessions
   *
   * READ-ONLY: Shows only sessions where operator status='accepted'
   *
   * @param {string} operatorId - Operator ID
   * @returns {Object} {
   *   success,
   *   operatorId,
   *   upcomingSessions: [ { sessionId, date, regionId, clientId, status } ],
   *   count,
   *   error
   * }
   */
  function getOperatorPlanning(operatorId) {
    try {
      // GUARD: Operator can view own schedule
      const currentUser = RoleGuardService.getCurrentUser();
      if (currentUser.role === 'operator' && currentUser.operatorId !== operatorId) {
        return {
          success: false,
          error: 'FORBIDDEN',
          details: 'Operators can only view their own schedule'
        };
      }

      // GUARD: Can view operator planning
      if (!RoleGuardService.can('*', 'view_operator_planning')) {
        return {
          success: false,
          error: 'UNAUTHORIZED'
        };
      }

      const adapter = SupabaseAdapter;

      // Fetch operator's ACCEPTED applications
      const applications = adapter.query('session_operators')
        .eq('operator_id', operatorId)
        .eq('status', 'accepted')
        .order('applied_at', { ascending: true })
        .execute();

      if (!applications || applications.length === 0) {
        return {
          success: true,
          operatorId: operatorId,
          upcomingSessions: [],
          count: 0,
          message: 'No accepted sessions'
        };
      }

      // Fetch session details for each application
      const upcomingSessions = applications
        .map(app => {
          const session = adapter.query('shooting_sessions')
            .eq('id', app.session_id)
            .single();

          if (!session) return null;

          return {
            sessionId: session.id,
            date: session.date,
            regionId: session.region_id,
            clientId: session.client_id,
            status: session.status,
            setupIds: session.setup_ids,
            acceptedAt: app.accepted_at
          };
        })
        .filter(s => s !== null)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        success: true,
        operatorId: operatorId,
        upcomingSessions: upcomingSessions,
        count: upcomingSessions.length,
        message: `Operator has ${upcomingSessions.length} accepted sessions`
      };
    } catch (error) {
      console.error('[PlanningStateService.getOperatorPlanning]', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        details: error.message,
        upcomingSessions: [],
        count: 0
      };
    }
  }

  // ============================================================
  // 4. GET CLIENT PLANNING (Client Dashboard)
  // ============================================================

  /**
   * Get client's sessions and staffing status
   *
   * READ-ONLY: Shows client's own sessions with operator counts
   *
   * @param {string} clientId - Client ID
   * @returns {Object} {
   *   success,
   *   clientId,
   *   sessions: [ { sessionId, date, status, operatorCount, isOperational } ],
   *   count,
   *   error
   * }
   */
  function getClientPlanning(clientId) {
    try {
      // GUARD: Client can view own sessions
      const currentUser = RoleGuardService.getCurrentUser();
      if (currentUser.role === 'client' && currentUser.clientId !== clientId) {
        return {
          success: false,
          error: 'FORBIDDEN',
          details: 'Clients can only view their own sessions'
        };
      }

      // GUARD: Can view client planning
      if (!RoleGuardService.can('*', 'view_client_planning')) {
        return {
          success: false,
          error: 'UNAUTHORIZED'
        };
      }

      const adapter = SupabaseAdapter;

      // Fetch client's sessions
      const sessions = adapter.query('shooting_sessions')
        .eq('client_id', clientId)
        .order('date', { ascending: true })
        .execute();

      if (!sessions || sessions.length === 0) {
        return {
          success: true,
          clientId: clientId,
          sessions: [],
          count: 0,
          message: 'No sessions found'
        };
      }

      // Enrich with operator counts
      const clientSessions = sessions.map(session => {
        const staffing = _getStaffingState(session.id, session.operator_requirement);

        return {
          sessionId: session.id,
          date: session.date,
          status: session.status,
          marketplaceVisible: session.marketplace_visible,
          operatorCount: staffing.acceptedOperators,
          minRequired: staffing.minOperators,
          isOperational: staffing.isOperational,
          pendingApplications: staffing.pendingApplications,
          setupIds: session.setup_ids
        };
      });

      return {
        success: true,
        clientId: clientId,
        sessions: clientSessions,
        count: clientSessions.length,
        message: `Client has ${clientSessions.length} sessions`
      };
    } catch (error) {
      console.error('[PlanningStateService.getClientPlanning]', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        details: error.message,
        sessions: [],
        count: 0
      };
    }
  }

  // ============================================================
  // INTERNAL HELPERS (NO MUTATION LOGIC)
  // ============================================================

  /**
   * Enrich session with staffing state
   * Pure data mapping — NO business logic
   */
  function _enrichSessionWithStaffing(session) {
    const staffing = _getStaffingState(session.id, session.operator_requirement);

    return {
      id: session.id,
      date: session.date,
      regionId: session.region_id,
      clientId: session.client_id,
      status: session.status,
      marketplaceVisible: session.marketplace_visible,
      setupIds: session.setup_ids,
      staffing: {
        minOperators: staffing.minOperators,
        acceptedOperators: staffing.acceptedOperators,
        pendingApplications: staffing.pendingApplications,
        isOperational: staffing.isOperational
      }
    };
  }

  /**
   * Get staffing state for a session
   * Counts accepted and pending operators
   */
  function _getStaffingState(sessionId, operatorRequirement) {
    const adapter = SupabaseAdapter;

    const minOperators = operatorRequirement?.minOperators || 1;

    // Count by status
    const applications = adapter.query('session_operators')
      .eq('session_id', sessionId)
      .execute();

    let acceptedCount = 0;
    let pendingCount = 0;

    applications.forEach(app => {
      if (app.status === 'accepted') {
        acceptedCount++;
      } else if (app.status === 'pending') {
        pendingCount++;
      }
    });

    return {
      minOperators: minOperators,
      acceptedOperators: acceptedCount,
      pendingApplications: pendingCount,
      isOperational: acceptedCount >= minOperators
    };
  }

  /**
   * Check if user can view this session
   * Respects RoleGuardService visibility rules
   */
  function _canViewSession(session) {
    const user = RoleGuardService.getCurrentUser();

    // Enterprise sees all
    if (user.role === 'enterprise') {
      return true;
    }

    // Client sees own sessions only
    if (user.role === 'client') {
      return session.clientId === user.clientId;
    }

    // Operator sees marketplace OR assigned sessions
    if (user.role === 'operator') {
      // Can see marketplace sessions
      if (session.status === 'confirmed' && session.marketplaceVisible) {
        return true;
      }

      // Can see sessions where assigned
      const adapter = SupabaseAdapter;
      const assignment = adapter.query('session_operators')
        .eq('session_id', session.id)
        .eq('operator_id', user.operatorId)
        .single();

      return assignment !== null;
    }

    return false;
  }

  /**
   * Get operator details by ID
   */
  function _getOperatorDetails(operatorId) {
    const adapter = SupabaseAdapter;

    const operator = adapter.query('operators')
      .eq('id', operatorId)
      .single();

    return operator;
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    // Planning views
    getPlanningSessions,
    getSessionPlanningDetails,

    // Dashboard views
    getOperatorPlanning,
    getClientPlanning
  };
})();

// ============================================================
// CONSOLE EXAMPLES (Testing)
// ============================================================

/*

// ENTERPRISE DASHBOARD
const allSessions = PlanningStateService.getPlanningSessions({
  dateFrom: '2025-03-01',
  dateTo: '2025-03-31'
});
console.log('Enterprise sees:', allSessions.sessions.length, 'sessions');
// [
//   {
//     id: 'sess_123',
//     date: '2025-03-15',
//     status: 'confirmed',
//     marketplaceVisible: true,
//     staffing: {
//       minOperators: 2,
//       acceptedOperators: 1,
//       pendingApplications: 3,
//       isOperational: false ← CRITICAL: needs 1 more
//     }
//   }
// ]

// OPERATOR DASHBOARD
const operatorSchedule = PlanningStateService.getOperatorPlanning('op_jean_dupont');
console.log('Operator has:', operatorSchedule.upcomingSessions.length, 'accepted sessions');
// {
//   operatorId: 'op_jean_dupont',
//   upcomingSessions: [
//     {
//       sessionId: 'sess_123',
//       date: '2025-03-15',
//       status: 'confirmed',
//       acceptedAt: '2025-02-20T16:00:00Z'
//     }
//   ],
//   count: 1
// }

// CLIENT DASHBOARD
const clientSessions = PlanningStateService.getClientPlanning('client_gendarme_01');
console.log('Client sessions:', clientSessions.sessions.length);
// {
//   clientId: 'client_gendarme_01',
//   sessions: [
//     {
//       sessionId: 'sess_123',
//       date: '2025-03-15',
//       status: 'confirmed',
//       operatorCount: 1,
//       minRequired: 2,
//       isOperational: false,
//       pendingApplications: 3
//     }
//   ],
//   count: 1
// }

// SESSION DETAILS
const sessionDetails = PlanningStateService.getSessionPlanningDetails('sess_123');
console.log(JSON.stringify(sessionDetails, null, 2));
// {
//   success: true,
//   session: {
//     id: 'sess_123',
//     date: '2025-03-15',
//     clientId: 'client_gendarme_01',
//     status: 'confirmed',
//     marketplaceVisible: true
//   },
//   operators: {
//     accepted: [
//       { operatorId: 'op_jean_dupont', name: 'Jean Dupont', acceptedAt: '2025-02-20T16:00:00Z' }
//     ],
//     pending: [
//       { operatorId: 'op_marie_martin', name: 'Marie Martin', appliedAt: '2025-02-20T15:00:00Z' },
//       { operatorId: 'op_pierre_fontaine', name: 'Pierre Fontaine', appliedAt: '2025-02-20T14:30:00Z' }
//     ],
//     rejected: []
//   },
//   staffingState: {
//     minOperators: 2,
//     acceptedCount: 1,
//     pendingCount: 2,
//     isOperational: false
//   }
// }

*/

// Global export
if (typeof window !== 'undefined') {
  if (!window.Domain) window.Domain = {};
  window.Domain.PlanningStateService = PlanningStateService;
}
