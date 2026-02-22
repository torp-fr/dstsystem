/* ============================================================
   DST-SYSTEM — Planning Real-Time Service

   REAL-TIME SYNCHRONIZATION LAYER (READ-ONLY)

   Purpose:
   - Subscribe to Supabase realtime changes
   - Maintain in-memory projection of planning state
   - Provide instant query methods for UI dashboards
   - NO database writes, NO workflow logic

   Architecture:

   ┌─────────────────────────────────────────┐
   │       Supabase Database (Real)          │
   │  - shooting_sessions                    │
   │  - session_operators                    │
   │  - operators                            │
   └────────────────┬────────────────────────┘
                    │
                    ↓ (Realtime Channel)
   ┌─────────────────────────────────────────┐
   │   PlanningRealtime (This Service)       │
   │   - Listen for postgres_changes         │
   │   - Update in-memory state              │
   └────────────────┬────────────────────────┘
                    │
                    ↓ (Query Methods)
   ┌─────────────────────────────────────────┐
   │     UI Dashboards (Real-Time Sync)      │
   │  - Planning view                        │
   │  - Operator availability                │
   │  - Session occupancy                    │
   └─────────────────────────────────────────┘

   State Structure:

   PlanningState = {
     sessionsByDate: {
       '2025-03-10': [
         {
           id, clientId, date, status,
           operatorIds: ['op_123'],
           operatorApplications: [...]
         }
       ]
     },
     operatorsBusy: {
       'op_123': ['2025-03-10', '2025-03-11']
     },
     setupsBusy: {
       'setup_1': ['2025-03-10']
     },
     operatorsAvailable: {
       'op_123': {
         name, email, region,
         availability: { unavailableDates: [] }
       }
     }
   }

   ============================================================ */

const PlanningRealtimeService = (function() {
  'use strict';

  // Get Supabase client
  const supabase = window.supabase;

  if (!supabase) {
    console.warn('[PlanningRealtimeService] Supabase client not ready — delaying init');
    // Return a stub object to prevent crashes
    return {
      initialize: async () => {
        console.warn('[PlanningRealtimeService] Service not initialized — Supabase not available');
        return;
      },
      cleanup: async () => {},
      getDailyPlanning: () => ({ date: '', sessions: [], operatorsBusy: [], setupsBusy: [] }),
      getOperatorLoad: () => [],
      isSetupAvailable: () => false,
      getAvailableOperatorsForSession: () => [],
      getSessionOperators: () => [],
      getMonitor: () => ({}),
      getRawState: () => ({})
    };
  }

  // ============================================================
  // IN-MEMORY STATE
  // ============================================================

  let planningState = {
    sessionsByDate: {},      // date → [sessions]
    operatorsBusy: {},       // operatorId → [dates]
    setupsBusy: {},          // setupId → [dates]
    operatorsAvailable: {},  // operatorId → {name, email, region}
    subscriptions: [],       // Active subscriptions
    syncStatus: 'initializing'
  };

  // Monitor for debugging
  let monitor = {
    totalSessions: 0,
    totalAssignments: 0,
    totalOperators: 0,
    lastUpdate: null,
    updateCount: 0
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  /**
   * Initialize service and load initial state
   *
   * Steps:
   * 1. Load all sessions from Supabase
   * 2. Load all session_operators from Supabase
   * 3. Load all operators from Supabase
   * 4. Subscribe to realtime channels
   * 5. Mark as ready
   *
   * @returns {Promise<void>}
   */
  async function initialize() {
    try {
      console.log('[PlanningRealtimeService] Initializing...');

      // STEP 1: Load all sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('shooting_sessions')
        .select('*');

      if (sessionsError) throw sessionsError;

      sessions.forEach(session => {
        _addSessionToState(session);
      });

      console.log(`[PlanningRealtimeService] Loaded ${sessions.length} sessions`);

      // STEP 2: Load all session_operators
      const { data: assignments, error: assignmentsError } = await supabase
        .from('session_operators')
        .select('*');

      if (assignmentsError) throw assignmentsError;

      assignments.forEach(assignment => {
        _updateOperatorAssignment(assignment);
      });

      console.log(`[PlanningRealtimeService] Loaded ${assignments.length} assignments`);

      // STEP 3: Load all operators
      const { data: operators, error: operatorsError } = await supabase
        .from('operators')
        .select('*');

      if (operatorsError) throw operatorsError;

      operators.forEach(operator => {
        _addOperatorToState(operator);
      });

      console.log(`[PlanningRealtimeService] Loaded ${operators.length} operators`);

      // STEP 4: Subscribe to realtime changes
      await _subscribeToRealtime();

      // STEP 5: Mark as ready
      planningState.syncStatus = 'ready';
      monitor.lastUpdate = new Date();

      console.log('[PlanningRealtimeService] Initialization complete');
    } catch (error) {
      console.error('[PlanningRealtimeService] Initialization failed:', error);
      planningState.syncStatus = 'error';
      throw error;
    }
  }

  // ============================================================
  // REALTIME SUBSCRIPTIONS
  // ============================================================

  /**
   * Subscribe to Supabase realtime changes
   *
   * Listens for:
   * - shooting_sessions INSERT/UPDATE/DELETE
   * - session_operators INSERT/UPDATE/DELETE
   * - operators UPDATE (availability changes)
   *
   * @returns {Promise<void>}
   */
  async function _subscribeToRealtime() {
    try {
      // Subscribe to planning updates channel
      const channel = supabase.channel('planning-updates', {
        config: {
          broadcast: { self: true },
          presence: { key: 'planning_service' },
          private: false
        }
      });

      // SUBSCRIBE: Sessions changes
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shooting_sessions'
      }, (payload) => {
        console.log('[PlanningRealtimeService] Session change:', payload.eventType, payload.new?.id);

        if (payload.eventType === 'INSERT') {
          _addSessionToState(payload.new);
        } else if (payload.eventType === 'UPDATE') {
          _updateSessionInState(payload.new);
        } else if (payload.eventType === 'DELETE') {
          _removeSessionFromState(payload.old);
        }

        monitor.updateCount++;
        monitor.lastUpdate = new Date();
      });

      // SUBSCRIBE: Operator assignments changes
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'session_operators'
      }, (payload) => {
        console.log('[PlanningRealtimeService] Assignment change:', payload.eventType, payload.new?.operator_id);

        if (payload.eventType === 'INSERT') {
          _updateOperatorAssignment(payload.new);
        } else if (payload.eventType === 'UPDATE') {
          _updateOperatorAssignment(payload.new);
        } else if (payload.eventType === 'DELETE') {
          _removeOperatorAssignment(payload.old);
        }

        monitor.updateCount++;
        monitor.lastUpdate = new Date();
      });

      // SUBSCRIBE: Operator availability changes
      channel.on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'operators'
      }, (payload) => {
        console.log('[PlanningRealtimeService] Operator update:', payload.new?.id);

        _addOperatorToState(payload.new);

        monitor.updateCount++;
        monitor.lastUpdate = new Date();
      });

      // Subscribe to channel
      await channel.subscribe((status) => {
        console.log('[PlanningRealtimeService] Subscription status:', status);

        if (status === 'SUBSCRIBED') {
          console.log('[PlanningRealtimeService] Realtime channel active');
          planningState.subscriptions.push(channel);
        }
      });
    } catch (error) {
      console.error('[PlanningRealtimeService] Subscription failed:', error);
      throw error;
    }
  }

  // ============================================================
  // STATE UPDATE HELPERS
  // ============================================================

  /**
   * Add session to planning state
   *
   * @param {Object} session - Session from Supabase
   */
  function _addSessionToState(session) {
    const date = session.date;

    if (!planningState.sessionsByDate[date]) {
      planningState.sessionsByDate[date] = [];
    }

    // Remove old version if exists
    planningState.sessionsByDate[date] = planningState.sessionsByDate[date]
      .filter(s => s.id !== session.id);

    // Add new version
    planningState.sessionsByDate[date].push({
      id: session.id,
      clientId: session.client_id,
      date: session.date,
      status: session.status,
      setupIds: session.setup_ids || [],
      operatorIds: [],  // Will be populated by assignments
      operatorApplications: [],
      marketplaceVisible: session.marketplace_visible
    });

    // Track setup busy times
    (session.setup_ids || []).forEach(setupId => {
      if (!planningState.setupsBusy[setupId]) {
        planningState.setupsBusy[setupId] = [];
      }
      if (!planningState.setupsBusy[setupId].includes(date)) {
        planningState.setupsBusy[setupId].push(date);
      }
    });

    monitor.totalSessions = Object.values(planningState.sessionsByDate)
      .reduce((sum, sessions) => sum + sessions.length, 0);
  }

  /**
   * Update session in planning state
   *
   * @param {Object} session - Updated session
   */
  function _updateSessionInState(session) {
    const date = session.date;

    if (planningState.sessionsByDate[date]) {
      const index = planningState.sessionsByDate[date]
        .findIndex(s => s.id === session.id);

      if (index >= 0) {
        // Update fields (keep operatorIds)
        const existing = planningState.sessionsByDate[date][index];
        planningState.sessionsByDate[date][index] = {
          ...existing,
          status: session.status,
          marketplaceVisible: session.marketplace_visible,
          setupIds: session.setup_ids || []
        };
      }
    }
  }

  /**
   * Remove session from planning state
   *
   * @param {Object} session - Deleted session
   */
  function _removeSessionFromState(session) {
    const date = session.date;

    if (planningState.sessionsByDate[date]) {
      planningState.sessionsByDate[date] = planningState.sessionsByDate[date]
        .filter(s => s.id !== session.id);

      if (planningState.sessionsByDate[date].length === 0) {
        delete planningState.sessionsByDate[date];
      }
    }

    monitor.totalSessions = Object.values(planningState.sessionsByDate)
      .reduce((sum, sessions) => sum + sessions.length, 0);
  }

  /**
   * Update operator assignment in state
   *
   * @param {Object} assignment - session_operators row
   */
  function _updateOperatorAssignment(assignment) {
    const operatorId = assignment.operator_id;
    const sessionId = assignment.session_id;
    const date = _findSessionDate(sessionId);

    if (!date) return;

    // Find session
    const session = planningState.sessionsByDate[date]
      ?.find(s => s.id === sessionId);

    if (!session) return;

    // Only add to operatorIds if accepted
    if (assignment.status === 'accepted' && !session.operatorIds.includes(operatorId)) {
      session.operatorIds.push(operatorId);

      // Track operator busy time
      if (!planningState.operatorsBusy[operatorId]) {
        planningState.operatorsBusy[operatorId] = [];
      }
      if (!planningState.operatorsBusy[operatorId].includes(date)) {
        planningState.operatorsBusy[operatorId].push(date);
      }
    } else if (assignment.status !== 'accepted' && session.operatorIds.includes(operatorId)) {
      // Remove from operatorIds if not accepted
      session.operatorIds = session.operatorIds.filter(id => id !== operatorId);

      // Remove from busy times if not assigned to other sessions that day
      const otherAssignments = planningState.sessionsByDate[date]
        ?.some(s => s.id !== sessionId && s.operatorIds.includes(operatorId));

      if (!otherAssignments && planningState.operatorsBusy[operatorId]) {
        planningState.operatorsBusy[operatorId] = planningState.operatorsBusy[operatorId]
          .filter(d => d !== date);
      }
    }

    // Add to operatorApplications
    if (!session.operatorApplications.find(app => app.operatorId === operatorId)) {
      session.operatorApplications.push({
        operatorId,
        status: assignment.status,
        appliedAt: assignment.applied_at,
        respondedAt: assignment.responded_at,
        rejectionReason: assignment.rejection_reason
      });
    } else {
      // Update existing
      const app = session.operatorApplications.find(app => app.operatorId === operatorId);
      app.status = assignment.status;
      app.respondedAt = assignment.responded_at;
      app.rejectionReason = assignment.rejection_reason;
    }

    monitor.totalAssignments = Object.values(planningState.sessionsByDate)
      .reduce((sum, sessions) => sum + sessions.reduce((s, session) => s + session.operatorIds.length, 0), 0);
  }

  /**
   * Remove operator assignment from state
   *
   * @param {Object} assignment - Deleted session_operators row
   */
  function _removeOperatorAssignment(assignment) {
    const operatorId = assignment.operator_id;
    const sessionId = assignment.session_id;
    const date = _findSessionDate(sessionId);

    if (!date) return;

    const session = planningState.sessionsByDate[date]
      ?.find(s => s.id === sessionId);

    if (session) {
      session.operatorIds = session.operatorIds.filter(id => id !== operatorId);
      session.operatorApplications = session.operatorApplications
        .filter(app => app.operatorId !== operatorId);
    }

    monitor.totalAssignments = Object.values(planningState.sessionsByDate)
      .reduce((sum, sessions) => sum + sessions.reduce((s, session) => s + session.operatorIds.length, 0), 0);
  }

  /**
   * Add operator to state
   *
   * @param {Object} operator - Operator from Supabase
   */
  function _addOperatorToState(operator) {
    planningState.operatorsAvailable[operator.id] = {
      id: operator.id,
      name: operator.name,
      email: operator.email,
      region: operator.region,
      availability: operator.availability || { unavailableDates: [] },
      isActive: operator.is_active !== false
    };

    monitor.totalOperators = Object.keys(planningState.operatorsAvailable).length;
  }

  /**
   * Find session date by ID
   *
   * @param {string} sessionId - Session ID
   * @returns {string|null} Session date or null
   */
  function _findSessionDate(sessionId) {
    for (const [date, sessions] of Object.entries(planningState.sessionsByDate)) {
      if (sessions.some(s => s.id === sessionId)) {
        return date;
      }
    }
    return null;
  }

  // ============================================================
  // PUBLIC QUERY METHODS (READ-ONLY)
  // ============================================================

  /**
   * Get daily planning for specific date
   *
   * Returns all sessions and operator assignments for that day
   *
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Object} Daily planning
   *   {
   *     date,
   *     sessions: [...],
   *     operatorsBusy: [operatorIds],
   *     setupsBusy: [setupIds]
   *   }
   */
  function getDailyPlanning(date) {
    return {
      date,
      sessions: planningState.sessionsByDate[date] || [],
      operatorsBusy: Object.entries(planningState.operatorsBusy)
        .filter(([_, dates]) => dates.includes(date))
        .map(([opId, _]) => opId),
      setupsBusy: Object.entries(planningState.setupsBusy)
        .filter(([_, dates]) => dates.includes(date))
        .map(([setupId, _]) => setupId)
    };
  }

  /**
   * Get operator workload
   *
   * Returns all sessions where operator is assigned
   *
   * @param {string} operatorId - Operator ID
   * @returns {Array} Array of sessions
   */
  function getOperatorLoad(operatorId) {
    const load = [];

    for (const [date, sessions] of Object.entries(planningState.sessionsByDate)) {
      sessions.forEach(session => {
        if (session.operatorIds.includes(operatorId)) {
          load.push({
            ...session,
            date
          });
        }
      });
    }

    return load.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Check if setup is available on date
   *
   * @param {string} setupId - Setup ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {boolean} True if available
   */
  function isSetupAvailable(setupId, date) {
    const busyDates = planningState.setupsBusy[setupId] || [];
    return !busyDates.includes(date);
  }

  /**
   * Get available operators for session
   *
   * Returns operators NOT yet assigned to session
   *
   * @param {string} sessionId - Session ID
   * @returns {Array} Available operators
   */
  function getAvailableOperatorsForSession(sessionId) {
    const date = _findSessionDate(sessionId);
    if (!date) return [];

    const session = planningState.sessionsByDate[date]
      ?.find(s => s.id === sessionId);

    if (!session) return [];

    const available = [];

    for (const [operatorId, operator] of Object.entries(planningState.operatorsAvailable)) {
      // Not already assigned
      if (session.operatorIds.includes(operatorId)) continue;

      // Already applied (pending or accepted)
      if (session.operatorApplications.some(app => app.operatorId === operatorId)) continue;

      // Not in unavailable dates
      const unavailableDates = operator.availability?.unavailableDates || [];
      if (unavailableDates.includes(date)) continue;

      available.push({
        ...operator,
        busyDates: planningState.operatorsBusy[operatorId] || []
      });
    }

    return available;
  }

  /**
   * Get all operators applied to session (any status)
   *
   * @param {string} sessionId - Session ID
   * @returns {Array} All applications
   */
  function getSessionOperators(sessionId) {
    const date = _findSessionDate(sessionId);
    if (!date) return [];

    const session = planningState.sessionsByDate[date]
      ?.find(s => s.id === sessionId);

    if (!session) return [];

    return session.operatorApplications.map(app => ({
      ...planningState.operatorsAvailable[app.operatorId],
      applicationStatus: app.status,
      appliedAt: app.appliedAt,
      respondedAt: app.respondedAt,
      rejectionReason: app.rejectionReason
    }));
  }

  /**
   * Get monitoring info for debugging
   *
   * @returns {Object} Monitor data
   */
  function getMonitor() {
    return {
      ...monitor,
      syncStatus: planningState.syncStatus,
      datesCovered: Object.keys(planningState.sessionsByDate).length,
      operatorsInSystem: Object.keys(planningState.operatorsAvailable).length
    };
  }

  /**
   * Get raw state (for advanced debugging only)
   *
   * @returns {Object} Full planning state
   */
  function getRawState() {
    return JSON.parse(JSON.stringify(planningState));
  }

  // ============================================================
  // CLEANUP
  // ============================================================

  /**
   * Unsubscribe from realtime channels
   *
   * @returns {Promise<void>}
   */
  async function cleanup() {
    try {
      for (const subscription of planningState.subscriptions) {
        await supabase.removeChannel(subscription);
      }
      planningState.subscriptions = [];
      planningState.syncStatus = 'stopped';
      console.log('[PlanningRealtimeService] Cleanup complete');
    } catch (error) {
      console.error('[PlanningRealtimeService] Cleanup failed:', error);
      throw error;
    }
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    // Lifecycle
    initialize,
    cleanup,

    // Query methods
    getDailyPlanning,
    getOperatorLoad,
    isSetupAvailable,
    getAvailableOperatorsForSession,
    getSessionOperators,

    // Debugging
    getMonitor,
    getRawState
  };
})();

// Make service globally available
if (typeof window !== 'undefined') {
  window.PlanningRealtimeService = PlanningRealtimeService;
}
