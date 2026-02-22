/* ============================================================
   DST-SYSTEM — Operator Auto-Match Engine

   READ-ONLY INTELLIGENCE LAYER (NO database writes)

   Purpose:
   - Analyze PlanningRealtimeService state
   - Detect sessions needing operators
   - Suggest best operator candidates
   - Support founder fallback for critical staffing

   Architecture:

   ┌─────────────────────────────────────────┐
   │     PlanningRealtimeService (State)      │
   │     - Sessions (status, operators)       │
   │     - Operators (availability, load)     │
   │     - Busy times (constraints)           │
   └────────────────┬────────────────────────┘
                    │
                    ↓ (Analysis)
   ┌─────────────────────────────────────────┐
   │   OperatorAutoMatchEngine (This Layer)   │
   │   - Detect understaffed sessions         │
   │   - Score operator candidates            │
   │   - Suggest best matches                 │
   │   - Check founder fallback               │
   └────────────────┬────────────────────────┘
                    │
                    ↓ (Query Results)
   ┌─────────────────────────────────────────┐
   │     Workflow Layer (Takes Action)        │
   │     - Use suggestions to apply operators │
   │     - Or trigger founder fallback logic  │
   └─────────────────────────────────────────┘

   NO DATABASE WRITES — Pure analysis layer

   ============================================================ */

const OperatorAutoMatchEngine = (function() {
  'use strict';

  // ============================================================
  // DEPENDENCIES
  // ============================================================

  /**
   * Get PlanningRealtimeService
   * Must be initialized before using this engine
   */
  function _getPlanningService() {
    if (!window.PlanningRealtimeService) {
      throw new Error('[OperatorAutoMatchEngine] PlanningRealtimeService not initialized');
    }
    return window.PlanningRealtimeService;
  }

  // ============================================================
  // PUBLIC METHODS (READ-ONLY ANALYSIS)
  // ============================================================

  /**
   * Get all sessions needing operators
   *
   * Detects sessions that meet ALL criteria:
   * 1. status === 'confirmed'
   * 2. Has at least one setup assigned
   * 3. operatorIds.length < operatorRequirement.minOperators
   *
   * Returns sessions sorted by priority:
   * - Most understaffed first
   * - Then by date (earlier first)
   *
   * @returns {Array} Sessions needing operators
   *   [
   *     {
   *       id, clientId, date, status,
   *       operatorIds: [...], setupIds: [...],
   *       operatorRequirement: { minOperators: N },
   *       staffingGap: N,  // How many more operators needed
   *       staffingPercent: 0-100
   *     }
   *   ]
   */
  function getSessionsNeedingOperators() {
    try {
      const planning = _getPlanningService();
      const rawState = planning.getRawState();
      const sessionsNeedingOps = [];

      // Iterate all sessions by date
      for (const [date, sessions] of Object.entries(rawState.sessionsByDate)) {
        sessions.forEach(session => {
          // Check criteria for needing operators
          if (_isSessionUnderStaffed(session)) {
            const minRequired = session.operatorRequirement?.minOperators || 1;
            const staffingGap = minRequired - session.operatorIds.length;

            sessionsNeedingOps.push({
              id: session.id,
              clientId: session.clientId,
              date: session.date,
              status: session.status,
              operatorIds: [...session.operatorIds],
              setupIds: [...session.setupIds],
              operatorRequirement: session.operatorRequirement || { minOperators: 1 },
              staffingGap,
              staffingPercent: Math.round((session.operatorIds.length / minRequired) * 100)
            });
          }
        });
      }

      // Sort by priority: most understaffed first, then by date
      return sessionsNeedingOps.sort((a, b) => {
        // Primary: larger gap (more understaffed)
        if (a.staffingGap !== b.staffingGap) {
          return b.staffingGap - a.staffingGap;
        }
        // Secondary: earlier date
        return new Date(a.date) - new Date(b.date);
      });
    } catch (error) {
      console.error('[OperatorAutoMatchEngine.getSessionsNeedingOperators]', error);
      return [];
    }
  }

  /**
   * Get suggested operator candidates for a session
   *
   * Scores available operators based on:
   * 1. Region match (100 points)
   * 2. Availability (operator not busy on that date)
   * 3. Current load (operators with less load scored higher)
   * 4. Not already assigned or applied
   *
   * Returns operators sorted by score (highest first)
   *
   * @param {string} sessionId - Session ID
   * @returns {Object} Suggestion results
   *   {
   *     sessionId,
   *     sessionDate,
   *     sessionRegion,
   *     candidates: [
   *       {
   *         operatorId, name, email, region,
   *         score: 0-100,
   *         scoring: {
   *           regionMatch: boolean,
   *           available: boolean,
   *           currentLoad: N sessions,
   *           alreadyApplied: boolean
   *         }
   *       }
   *     ],
   *     suggestedCount: N,
   *     founderFallbackRequired: false|reason
   *   }
   */
  function getSuggestedOperators(sessionId) {
    try {
      const planning = _getPlanningService();
      const rawState = planning.getRawState();

      // Find session
      const sessionInfo = _findSessionInState(rawState, sessionId);
      if (!sessionInfo) {
        return {
          sessionId,
          error: 'SESSION_NOT_FOUND',
          candidates: [],
          suggestedCount: 0,
          founderFallbackRequired: false
        };
      }

      const { session, date } = sessionInfo;
      const sessionRegion = session.region || null;
      const candidates = [];

      // Score each available operator
      for (const [operatorId, operator] of Object.entries(rawState.operatorsAvailable)) {
        // Skip if already assigned
        if (session.operatorIds.includes(operatorId)) {
          continue;
        }

        // Check if already applied (pending or accepted)
        const alreadyApplied = session.operatorApplications.some(
          app => app.operatorId === operatorId
        );

        // Check availability
        const unavailableDates = operator.availability?.unavailableDates || [];
        const isAvailable = !unavailableDates.includes(date) && operator.isActive !== false;

        // Check region match
        const regionMatch = sessionRegion && operator.region === sessionRegion;

        // Get current load (number of sessions on this date)
        const currentLoad = (rawState.operatorsBusy[operatorId] || []).length;

        // Calculate score (0-100)
        let score = 0;

        // Region match: 40 points
        if (regionMatch) {
          score += 40;
        }

        // Availability: 30 points
        if (isAvailable) {
          score += 30;
        }

        // Load balance: 30 points (operators with lower load score higher)
        // Score decreases by 1 point for each session they're already doing
        const maxLoad = 5; // Arbitrary max to prevent negative scores
        const loadScore = Math.max(0, 30 - (currentLoad * 6));
        score += loadScore;

        // Only include if available or if it's the only option
        if (isAvailable || currentLoad === 0) {
          candidates.push({
            operatorId: operator.id,
            name: operator.name,
            email: operator.email,
            region: operator.region,
            score: Math.round(score),
            scoring: {
              regionMatch,
              available: isAvailable,
              currentLoad,
              alreadyApplied
            }
          });
        }
      }

      // Sort by score (highest first)
      candidates.sort((a, b) => b.score - a.score);

      // Check if founder fallback required
      const founderRequired = _isFounderFallbackRequired(candidates, sessionId);

      return {
        sessionId,
        sessionDate: date,
        sessionRegion,
        candidates,
        suggestedCount: Math.min(candidates.length, 3), // Top 3 suggestions
        founderFallbackRequired: founderRequired
      };
    } catch (error) {
      console.error('[OperatorAutoMatchEngine.getSuggestedOperators]', error);
      return {
        sessionId,
        error: error.message,
        candidates: [],
        suggestedCount: 0,
        founderFallbackRequired: false
      };
    }
  }

  /**
   * Check if founder fallback is required for a session
   *
   * Returns true if:
   * 1. Session is confirmed and needs operators
   * 2. No available operators exist
   * 3. No pending applications exist
   *
   * Use this to trigger fallback logic:
   * - Notify founders/managers
   * - Allow assignment without operator consent
   * - Mark session for manual review
   *
   * @param {string} sessionId - Session ID
   * @returns {Object} Fallback status
   *   {
   *     required: boolean,
   *     sessionId,
   *     sessionDate,
   *     reason: 'NO_OPERATOR_AVAILABLE' | 'NO_QUALIFIED_OPERATOR' | null,
   *     fallbackActions: [
   *       'NOTIFY_FOUNDERS',
   *       'ALLOW_FORCED_ASSIGNMENT',
   *       'MARK_FOR_REVIEW'
   *     ]
   *   }
   */
  function isFounderFallbackRequired(sessionId) {
    try {
      const planning = _getPlanningService();
      const rawState = planning.getRawState();

      // Find session
      const sessionInfo = _findSessionInState(rawState, sessionId);
      if (!sessionInfo) {
        return {
          required: false,
          sessionId,
          reason: null,
          fallbackActions: []
        };
      }

      const { session, date } = sessionInfo;

      // Check if session is confirmed and understaffed
      if (session.status !== 'confirmed' || !_isSessionUnderStaffed(session)) {
        return {
          required: false,
          sessionId,
          reason: null,
          fallbackActions: []
        };
      }

      // Get available operators
      const suggestions = getSuggestedOperators(sessionId);

      // No candidates available at all
      if (suggestions.candidates.length === 0) {
        return {
          required: true,
          sessionId,
          sessionDate: date,
          reason: 'NO_OPERATOR_AVAILABLE',
          fallbackActions: [
            'NOTIFY_FOUNDERS',
            'ALLOW_FORCED_ASSIGNMENT',
            'MARK_FOR_REVIEW'
          ]
        };
      }

      // Have candidates but none are available
      const availableCandidates = suggestions.candidates.filter(c => c.scoring.available);
      if (availableCandidates.length === 0) {
        return {
          required: true,
          sessionId,
          sessionDate: date,
          reason: 'NO_QUALIFIED_OPERATOR',
          fallbackActions: [
            'NOTIFY_FOUNDERS',
            'ALLOW_FORCED_ASSIGNMENT',
            'MARK_FOR_REVIEW'
          ]
        };
      }

      // Have available operators
      return {
        required: false,
        sessionId,
        reason: null,
        fallbackActions: []
      };
    } catch (error) {
      console.error('[OperatorAutoMatchEngine.isFounderFallbackRequired]', error);
      return {
        required: false,
        sessionId,
        reason: null,
        fallbackActions: []
      };
    }
  }

  // ============================================================
  // INTERNAL HELPER FUNCTIONS
  // ============================================================

  /**
   * Check if a session is understaffed
   *
   * @param {Object} session - Session object
   * @returns {boolean} True if understaffed
   */
  function _isSessionUnderStaffed(session) {
    // Must be confirmed
    if (session.status !== 'confirmed') {
      return false;
    }

    // Must have at least one setup
    if (!session.setupIds || session.setupIds.length === 0) {
      return false;
    }

    // Must have fewer operators than required
    const minRequired = session.operatorRequirement?.minOperators || 1;
    return session.operatorIds.length < minRequired;
  }

  /**
   * Find a session in the planning state
   *
   * @param {Object} state - Planning state
   * @param {string} sessionId - Session ID
   * @returns {Object|null} { session, date } or null
   */
  function _findSessionInState(state, sessionId) {
    for (const [date, sessions] of Object.entries(state.sessionsByDate)) {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        return { session, date };
      }
    }
    return null;
  }

  /**
   * Check if founder fallback is required
   *
   * @param {Array} candidates - Candidate operators
   * @param {string} sessionId - Session ID
   * @returns {boolean|Object} False or fallback reason
   */
  function _isFounderFallbackRequired(candidates, sessionId) {
    // No candidates at all
    if (candidates.length === 0) {
      return true;
    }

    // Have candidates but none are available
    const availableCandidates = candidates.filter(c => c.scoring.available);
    return availableCandidates.length === 0;
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    // Main analysis methods
    getSessionsNeedingOperators,
    getSuggestedOperators,
    isFounderFallbackRequired
  };
})();

// Make service globally available
if (typeof window !== 'undefined') {
  window.OperatorAutoMatchEngine = OperatorAutoMatchEngine;
}
