/* ============================================================
   DST-SYSTEM — Staffing Risk Engine

   READ-ONLY RISK ANALYSIS LAYER (NO database writes)

   Purpose:
   - Evaluate FUTURE risk for sessions (not just current status)
   - Detect sessions becoming risky soon
   - Identify operator overload situations
   - Calculate founder fallback probability
   - Provide proactive alerts

   Architecture:

   ┌─────────────────────────────────────────┐
   │     PlanningRealtimeService (State)      │
   │     OperatorAutoMatchEngine (Suggests)   │
   └────────────────┬────────────────────────┘
                    │
                    ↓ (Combines analysis)
   ┌─────────────────────────────────────────┐
   │   StaffingRiskEngine (This Layer)        │
   │   - Time-based risk analysis             │
   │   - Operator overload detection          │
   │   - Probability calculations             │
   │   - Proactive recommendations            │
   └────────────────┬────────────────────────┘
                    │
                    ↓ (Risk alerts)
   ┌─────────────────────────────────────────┐
   │     Dashboard / Alert Systems            │
   │     - Risk visualization                 │
   │     - Proactive notifications            │
   └─────────────────────────────────────────┘

   Risk Levels:
   - LOW:      Fully staffed
   - MEDIUM:   Limited candidates or approaching deadline
   - HIGH:     Deadline < 5 days + understaffed
   - CRITICAL: Deadline < 48h + understaffed

   NO DATABASE WRITES — Pure analysis layer

   ============================================================ */

const StaffingRiskEngine = (function() {
  'use strict';

  // ============================================================
  // DEPENDENCIES
  // ============================================================

  /**
   * Get required services
   */
  function _getServices() {
    const planning = window.PlanningRealtimeService;
    const autoMatch = window.OperatorAutoMatchEngine;

    if (!planning || !autoMatch) {
      throw new Error('[StaffingRiskEngine] Dependencies not initialized: PlanningRealtimeService or OperatorAutoMatchEngine');
    }

    return { planning, autoMatch };
  }

  // ============================================================
  // CONSTANTS
  // ============================================================

  const RISK_LEVELS = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  };

  const RISK_THRESHOLDS = {
    CRITICAL_HOURS: 48,       // < 48 hours
    HIGH_DAYS: 5,             // < 5 days
    MEDIUM_STAFFING: 50,      // < 50% staffed
    OVERLOAD_SESSIONS: 4      // > 4 sessions = overloaded
  };

  // ============================================================
  // PUBLIC METHODS (READ-ONLY ANALYSIS)
  // ============================================================

  /**
   * Get all sessions with risk evaluation
   *
   * Returns sessions sorted by risk level (CRITICAL first)
   * and days until session (sooner first)
   *
   * @returns {Array} Sessions with risk data
   *   [
   *     {
   *       sessionId, date, daysUntil,
   *       riskLevel: 'LOW|MEDIUM|HIGH|CRITICAL',
   *       staffingGap: N,
   *       staffingPercent: 0-100,
   *       candidateCount: N,
   *       fallbackProbability: 0-100,
   *       riskFactors: [reasons],
   *       recommendedActions: [actions]
   *     }
   *   ]
   */
  function getRiskSessions() {
    try {
      const { planning, autoMatch } = _getServices();
      const rawState = planning.getRawState();
      const riskSessions = [];

      // Iterate all sessions
      for (const [date, sessions] of Object.entries(rawState.sessionsByDate)) {
        sessions.forEach(session => {
          // Only analyze confirmed sessions
          if (session.status !== 'confirmed') return;

          const riskData = _calculateSessionRisk(
            session,
            date,
            rawState,
            autoMatch
          );

          if (riskData) {
            riskSessions.push(riskData);
          }
        });
      }

      // Sort by: risk level (worst first), then by days (soonest first)
      return riskSessions.sort((a, b) => {
        const riskOrder = {
          'CRITICAL': 0,
          'HIGH': 1,
          'MEDIUM': 2,
          'LOW': 3
        };

        if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        }

        return a.daysUntil - b.daysUntil;
      });
    } catch (error) {
      console.error('[StaffingRiskEngine.getRiskSessions]', error);
      return [];
    }
  }

  /**
   * Get detailed risk for a specific session
   *
   * Includes:
   * - Risk level and reasoning
   * - Staffing gap analysis
   * - Candidate evaluation
   * - Founder fallback probability
   * - Recommended actions
   * - Risk trend
   *
   * @param {string} sessionId - Session ID
   * @returns {Object} Detailed risk analysis
   *   {
   *     sessionId, date, daysUntil,
   *     riskLevel, staffingGap, staffingPercent,
   *     candidateCount, availableCandidates,
   *     fallbackProbability,
   *     riskFactors: [],
   *     recommendedActions: [],
   *     timeline: {
   *       hoursUntil, minutesUntil,
   *       isCriticalWindow: boolean
   *     }
   *   }
   */
  function getSessionRisk(sessionId) {
    try {
      const { planning, autoMatch } = _getServices();
      const rawState = planning.getRawState();

      // Find session
      let sessionDate = null;
      let sessionData = null;

      for (const [date, sessions] of Object.entries(rawState.sessionsByDate)) {
        const found = sessions.find(s => s.id === sessionId);
        if (found) {
          sessionDate = date;
          sessionData = found;
          break;
        }
      }

      if (!sessionData) {
        return {
          sessionId,
          error: 'SESSION_NOT_FOUND',
          riskLevel: null
        };
      }

      // Get risk calculation
      const riskData = _calculateSessionRisk(
        sessionData,
        sessionDate,
        rawState,
        autoMatch
      );

      if (!riskData) {
        return {
          sessionId,
          riskLevel: RISK_LEVELS.LOW,
          reason: 'Fully staffed'
        };
      }

      // Add detailed timeline
      const daysUntil = _daysUntil(sessionDate);
      const hoursUntil = daysUntil * 24;
      const minutesUntil = hoursUntil * 60;

      return {
        ...riskData,
        timeline: {
          daysUntil,
          hoursUntil,
          minutesUntil,
          isCriticalWindow: hoursUntil < RISK_THRESHOLDS.CRITICAL_HOURS
        }
      };
    } catch (error) {
      console.error('[StaffingRiskEngine.getSessionRisk]', error);
      return {
        sessionId,
        error: error.message,
        riskLevel: null
      };
    }
  }

  /**
   * Evaluate operator overload risk
   *
   * Returns operator status and overload risk.
   *
   * Overload defined as: > 4 confirmed sessions on same date
   *
   * @param {string} operatorId - Operator ID
   * @returns {Object} Operator overload analysis
   *   {
   *     operatorId, name, region,
   *     currentLoad: N,
   *     isOverloaded: boolean,
   *     overloadSessions: [{ date, sessionId }],
   *     riskLevel: 'LOW|MEDIUM|HIGH',
   *     busyDates: [dates],
   *     maxLoadDate: '2025-03-15',
   *     maxLoadCount: N
   *   }
   */
  function getOperatorOverload(operatorId) {
    try {
      const { planning } = _getServices();
      const rawState = planning.getRawState();

      // Find operator
      const operator = rawState.operatorsAvailable[operatorId];
      if (!operator) {
        return {
          operatorId,
          error: 'OPERATOR_NOT_FOUND'
        };
      }

      // Count sessions by date
      const sessionsByDate = {};

      for (const [date, sessions] of Object.entries(rawState.sessionsByDate)) {
        const assigned = sessions.filter(s =>
          s.status === 'confirmed' && s.operatorIds.includes(operatorId)
        );

        if (assigned.length > 0) {
          sessionsByDate[date] = assigned;
        }
      }

      // Find overload situations
      const overloadSessions = [];
      let maxLoadCount = 0;
      let maxLoadDate = null;

      for (const [date, sessions] of Object.entries(sessionsByDate)) {
        if (sessions.length > RISK_THRESHOLDS.OVERLOAD_SESSIONS) {
          overloadSessions.push({
            date,
            sessionCount: sessions.length,
            sessions: sessions.map(s => ({
              sessionId: s.id,
              clientId: s.clientId
            }))
          });
        }

        if (sessions.length > maxLoadCount) {
          maxLoadCount = sessions.length;
          maxLoadDate = date;
        }
      }

      const totalLoad = Object.values(sessionsByDate).reduce((sum, sessions) => sum + sessions.length, 0);
      const isOverloaded = overloadSessions.length > 0;

      // Determine risk level for overload
      let riskLevel = RISK_LEVELS.LOW;
      if (isOverloaded) {
        if (maxLoadCount > 6) {
          riskLevel = RISK_LEVELS.CRITICAL;
        } else if (maxLoadCount > 5) {
          riskLevel = RISK_LEVELS.HIGH;
        } else {
          riskLevel = RISK_LEVELS.MEDIUM;
        }
      }

      return {
        operatorId,
        name: operator.name,
        email: operator.email,
        region: operator.region,
        currentLoad: totalLoad,
        isOverloaded,
        overloadCount: overloadSessions.length,
        overloadSessions,
        riskLevel,
        busyDates: Object.keys(sessionsByDate).sort(),
        maxLoadDate,
        maxLoadCount,
        availabilityStatus: operator.isActive ? 'ACTIVE' : 'INACTIVE'
      };
    } catch (error) {
      console.error('[StaffingRiskEngine.getOperatorOverload]', error);
      return {
        operatorId,
        error: error.message
      };
    }
  }

  // ============================================================
  // INTERNAL HELPER FUNCTIONS
  // ============================================================

  /**
   * Calculate risk for a single session
   *
   * @param {Object} session - Session object
   * @param {string} date - Session date
   * @param {Object} rawState - Planning state
   * @param {Object} autoMatch - AutoMatchEngine
   * @returns {Object|null} Risk data or null if not at risk
   */
  function _calculateSessionRisk(session, date, rawState, autoMatch) {
    // Must have setup assigned
    if (!session.setupIds || session.setupIds.length === 0) {
      return null;
    }

    const minRequired = session.operatorRequirement?.minOperators || 1;
    const assigned = session.operatorIds.length;
    const staffingGap = Math.max(0, minRequired - assigned);
    const staffingPercent = Math.round((assigned / minRequired) * 100);

    // Get suggestions to count candidates
    const suggestions = autoMatch.getSuggestedOperators(session.id);
    const availableCandidates = suggestions.candidates.filter(c => c.scoring.available).length;
    const totalCandidates = suggestions.candidates.length;

    // Calculate days until session
    const daysUntil = _daysUntil(date);
    const hoursUntil = daysUntil * 24;

    // Determine risk level
    let riskLevel = RISK_LEVELS.LOW;
    const riskFactors = [];
    const recommendedActions = [];

    // CRITICAL: < 48 hours + understaffed
    if (hoursUntil < RISK_THRESHOLDS.CRITICAL_HOURS && staffingGap > 0) {
      riskLevel = RISK_LEVELS.CRITICAL;
      riskFactors.push(`Session in ${hoursUntil} hours with ${staffingGap} gap`);
      recommendedActions.push('URGENT_FOUNDER_NOTIFICATION');
      recommendedActions.push('ALLOW_EMERGENCY_ASSIGNMENT');
    }
    // HIGH: < 5 days + < 50% staffed
    else if (daysUntil < RISK_THRESHOLDS.HIGH_DAYS && staffingPercent < RISK_THRESHOLDS.MEDIUM_STAFFING) {
      riskLevel = RISK_LEVELS.HIGH;
      riskFactors.push(`${daysUntil} days until session`);
      riskFactors.push(`Only ${staffingPercent}% staffed`);
      recommendedActions.push('ACCELERATE_APPLICATIONS');
      recommendedActions.push('CONTACT_CANDIDATES');
    }
    // MEDIUM: limited candidates OR approaching deadline with gap
    else if (totalCandidates === 1 && staffingGap > 0) {
      riskLevel = RISK_LEVELS.MEDIUM;
      riskFactors.push('Only 1 candidate available');
      recommendedActions.push('SECURE_BACKUP_CANDIDATES');
      recommendedActions.push('PREPARE_FALLBACK_PLAN');
    } else if (daysUntil < RISK_THRESHOLDS.HIGH_DAYS && staffingGap > 0) {
      riskLevel = RISK_LEVELS.MEDIUM;
      riskFactors.push(`${daysUntil} days until session with gap`);
      recommendedActions.push('MONITOR_CLOSELY');
      recommendedActions.push('PREPARE_FALLBACK_PLAN');
    }
    // LOW: fully staffed
    else if (staffingGap === 0) {
      riskLevel = RISK_LEVELS.LOW;
      riskFactors.push('Fully staffed');
    }

    // Skip if fully staffed and low risk (no risk data needed)
    if (riskLevel === RISK_LEVELS.LOW && staffingGap === 0) {
      return null;
    }

    // Calculate fallback probability
    const fallbackProbability = _calculateFallbackProbability(
      staffingGap,
      availableCandidates,
      daysUntil,
      riskLevel
    );

    return {
      sessionId: session.id,
      clientId: session.clientId,
      date,
      daysUntil,
      riskLevel,
      staffingGap,
      staffingPercent,
      candidateCount: totalCandidates,
      availableCandidates,
      fallbackProbability,
      riskFactors,
      recommendedActions
    };
  }

  /**
   * Calculate probability founder fallback will be needed
   *
   * Higher probability if:
   * - Larger staffing gap
   * - Fewer available candidates
   * - Closer to session date
   * - Higher risk level
   *
   * @returns {number} 0-100 probability
   */
  function _calculateFallbackProbability(
    staffingGap,
    availableCandidates,
    daysUntil,
    riskLevel
  ) {
    let probability = 0;

    // Base probability from risk level
    switch (riskLevel) {
      case RISK_LEVELS.CRITICAL:
        probability = 80;
        break;
      case RISK_LEVELS.HIGH:
        probability = 50;
        break;
      case RISK_LEVELS.MEDIUM:
        probability = 20;
        break;
      default:
        probability = 0;
    }

    // Adjust by staffing gap (each operator missing = +15%)
    probability += staffingGap * 15;

    // Adjust by candidate scarcity (fewer candidates = more risk)
    if (availableCandidates === 0) {
      probability += 40;
    } else if (availableCandidates === 1) {
      probability += 20;
    } else if (availableCandidates < staffingGap) {
      probability += 10;
    }

    // Adjust by time urgency (closer = more risk)
    if (daysUntil === 0) {
      probability += 20;
    } else if (daysUntil === 1) {
      probability += 15;
    } else if (daysUntil < 3) {
      probability += 10;
    }

    // Cap at 100%
    return Math.min(100, probability);
  }

  /**
   * Calculate days until a session date
   *
   * @param {string} dateStr - Date string (YYYY-MM-DD)
   * @returns {number} Days until (negative = past)
   */
  function _daysUntil(dateStr) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sessionDate = new Date(dateStr);
    sessionDate.setHours(0, 0, 0, 0);

    const diffTime = sessionDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    // Main analysis methods
    getRiskSessions,
    getSessionRisk,
    getOperatorOverload,

    // Constants for reference
    RISK_LEVELS
  };
})();

// Make service globally available
if (typeof window !== 'undefined') {
  window.StaffingRiskEngine = StaffingRiskEngine;
}
