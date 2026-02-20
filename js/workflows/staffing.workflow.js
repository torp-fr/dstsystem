/* ============================================================
   DST-SYSTEM — Staffing Validation Workflow

   Gère la VALIDATION de la disponibilité opérationnelle
   AVANT la confirmation de session.

   Ce n'est PAS un marketplace.
   Ce n'est PAS une réservation.
   C'est VALIDATION UNIQUEMENT.

   Modèle métier:
   - Une session CANNOT être confirmée sans opérateurs
   - Les opérateurs doivent être acceptés via OperatorMarketplace
   - La validation vérifie les dépendances avant confirmation
   - Pas d'assignment automatique
   - Pas de logique marketplace

   Règles:
   1. operatorIds.length >= operatorRequirement.minOperators (default 1)
   2. setupIds.length >= 1
   3. status === 'pending_confirmation'

   Si ces règles ne sont pas satisfaites:
   → confirmation REJECTED avec reasons explicites

   ============================================================ */

const StaffingWorkflow = (function() {
  'use strict';

  /**
   * Load session from DB
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} Session object or null
   */
  function _getSession(sessionId) {
    try {
      if (!sessionId) return null;

      if (typeof DB !== 'undefined' && DB.sessions && DB.sessions.getById) {
        return DB.sessions.getById(sessionId);
      }

      const stored = localStorage.getItem('dst_sessions');
      if (stored) {
        const sessions = JSON.parse(stored);
        return sessions.find(s => s.id === sessionId) || null;
      }

      return null;
    } catch (error) {
      console.error('[StaffingWorkflow] Error in _getSession:', error);
      return null;
    }
  }

  /**
   * Get minimum operators required
   * Defaults to 1 if not specified
   *
   * @param {Object} session - Session object
   * @returns {number} Minimum operators required
   */
  function _getMinOperatorsRequired(session) {
    if (!session) return 1;

    // If operatorRequirement exists and has minOperators, use it
    if (session.operatorRequirement && typeof session.operatorRequirement.minOperators === 'number') {
      return session.operatorRequirement.minOperators;
    }

    // Default: at least 1 operator required
    return 1;
  }

  /**
   * Validate staffing for session
   *
   * Vérifie que le nombre d'opérateurs acceptés
   * est >= au minimum requis.
   *
   * @param {string} sessionId - Session identifier
   * @returns {Object} Validation result
   *   {
   *     success,
   *     sessionId,
   *     isValid: boolean,
   *     requiredOperators: number,
   *     assignedOperators: number,
   *     missingOperators: number
   *   }
   */
  function validateStaffing(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('sessionId required');
      }

      // ===== STEP 1: Load session =====
      const session = _getSession(sessionId);

      if (!session) {
        return {
          success: false,
          error: 'SESSION_NOT_FOUND',
          message: `Session ${sessionId} not found`,
          sessionId
        };
      }

      // ===== STEP 2: Get requirements =====
      const requiredOperators = _getMinOperatorsRequired(session);
      const assignedOperators = (session.operatorIds && Array.isArray(session.operatorIds))
        ? session.operatorIds.length
        : 0;

      // ===== STEP 3: Calculate gap =====
      const missingOperators = Math.max(0, requiredOperators - assignedOperators);
      const isValid = missingOperators === 0;

      return {
        success: true,
        sessionId,
        isValid,
        requiredOperators,
        assignedOperators,
        missingOperators
      };
    } catch (error) {
      console.error('[StaffingWorkflow] Error in validateStaffing:', error);
      return {
        success: false,
        error: 'VALIDATION_FAILED',
        message: error.message,
        sessionId
      };
    }
  }

  /**
   * Check if session can be confirmed
   *
   * Vérifie que TOUTES les dépendances sont satisfaites:
   * - Staffing: operatorIds.length >= minOperators
   * - Setup: setupIds.length >= 1
   * - Status: === 'pending_confirmation'
   *
   * @param {string} sessionId - Session identifier
   * @returns {Object} Confirmation check result
   *   {
   *     success,
   *     canConfirm: boolean,
   *     reasons: Array<string>
   *   }
   *   Reasons: [
   *     "NO_OPERATOR_ASSIGNED",
   *     "NO_SETUP_ASSIGNED",
   *     "INVALID_STATUS"
   *   ]
   */
  function canConfirmSession(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('sessionId required');
      }

      // ===== STEP 1: Load session =====
      const session = _getSession(sessionId);

      if (!session) {
        return {
          success: false,
          error: 'SESSION_NOT_FOUND',
          message: `Session ${sessionId} not found`,
          sessionId,
          canConfirm: false,
          reasons: ['SESSION_NOT_FOUND']
        };
      }

      const reasons = [];

      // ===== STEP 2: Check status =====
      if (session.status !== 'pending_confirmation') {
        reasons.push('INVALID_STATUS');
      }

      // ===== STEP 3: Check setup assignment =====
      const setupIds = session.setupIds || [];
      if (setupIds.length === 0) {
        reasons.push('NO_SETUP_ASSIGNED');
      }

      // ===== STEP 4: Check staffing =====
      const staffingValidation = validateStaffing(sessionId);

      if (!staffingValidation.isValid) {
        reasons.push('NO_OPERATOR_ASSIGNED');
      }

      // ===== STEP 5: Determine result =====
      const canConfirm = reasons.length === 0;

      return {
        success: true,
        sessionId,
        canConfirm,
        reasons,
        details: {
          status: session.status,
          setups: setupIds.length,
          operators: staffingValidation.assignedOperators,
          operatorsRequired: staffingValidation.requiredOperators
        }
      };
    } catch (error) {
      console.error('[StaffingWorkflow] Error in canConfirmSession:', error);
      return {
        success: false,
        error: 'CHECK_FAILED',
        message: error.message,
        sessionId,
        canConfirm: false,
        reasons: ['INTERNAL_ERROR']
      };
    }
  }

  /**
   * Get detailed staffing status for session
   *
   * Retourne un objet détaillé sur la disponibilité
   * opérationnelle de la session.
   *
   * @param {string} sessionId - Session identifier
   * @returns {Object} Detailed staffing status
   *   {
   *     sessionId,
   *     requiredOperators: number,
   *     assignedOperators: number,
   *     openPositions: number,
   *     isFull: boolean,
   *     isStaffed: boolean,
   *     applicationsPending: number,
   *     applicationsAccepted: number,
   *     operatorsList: Array<string>
   *   }
   */
  function getStaffingStatus(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('sessionId required');
      }

      // ===== STEP 1: Load session =====
      const session = _getSession(sessionId);

      if (!session) {
        return {
          success: false,
          error: 'SESSION_NOT_FOUND',
          message: `Session ${sessionId} not found`,
          sessionId
        };
      }

      // ===== STEP 2: Get requirements =====
      const requiredOperators = _getMinOperatorsRequired(session);
      const assignedOperators = (session.operatorIds && Array.isArray(session.operatorIds))
        ? session.operatorIds.length
        : 0;

      // ===== STEP 3: Count capacity =====
      const capacityMax = session.capacityMax || 0;
      const openPositions = Math.max(0, capacityMax - assignedOperators);

      // ===== STEP 4: Count applications =====
      const operatorApplications = session.operatorApplications || [];
      const applicationsPending = operatorApplications.filter(
        app => app.status === 'pending'
      ).length;

      const applicationsAccepted = operatorApplications.filter(
        app => app.status === 'accepted'
      ).length;

      // ===== STEP 5: Check staffing status =====
      const isFull = assignedOperators >= capacityMax;
      const isStaffed = assignedOperators >= requiredOperators;

      return {
        success: true,
        sessionId,
        staffing: {
          requiredOperators,
          assignedOperators,
          openPositions,
          isFull,
          isStaffed
        },
        applications: {
          pending: applicationsPending,
          accepted: applicationsAccepted,
          total: operatorApplications.length
        },
        operators: {
          assignedIds: session.operatorIds || [],
          count: assignedOperators
        },
        capacity: {
          max: capacityMax,
          used: assignedOperators,
          available: openPositions
        }
      };
    } catch (error) {
      console.error('[StaffingWorkflow] Error in getStaffingStatus:', error);
      return {
        success: false,
        error: 'STATUS_FETCH_FAILED',
        message: error.message,
        sessionId
      };
    }
  }

  /**
   * Check if session has pending applications waiting for approval
   *
   * @param {string} sessionId - Session identifier
   * @returns {Object} Pending applications info
   */
  function hasPendingApplications(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('sessionId required');
      }

      const session = _getSession(sessionId);

      if (!session) {
        return {
          success: false,
          error: 'SESSION_NOT_FOUND',
          sessionId
        };
      }

      const operatorApplications = session.operatorApplications || [];
      const pending = operatorApplications.filter(app => app.status === 'pending');

      return {
        success: true,
        sessionId,
        hasPending: pending.length > 0,
        pendingCount: pending.length,
        pendingApplications: pending.map(app => ({
          applicationId: app.id,
          operatorId: app.operatorId,
          operatorName: app.operatorName,
          appliedAt: app.appliedAt
        }))
      };
    } catch (error) {
      console.error('[StaffingWorkflow] Error in hasPendingApplications:', error);
      return {
        success: false,
        error: 'CHECK_FAILED',
        message: error.message,
        sessionId,
        hasPending: false
      };
    }
  }

  // Public API
  return {
    validateStaffing,
    canConfirmSession,
    getStaffingStatus,
    hasPendingApplications
  };
})();
