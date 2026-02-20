/* ============================================================
   DST-SYSTEM — Operator Marketplace Workflow

   Permet aux opérateurs de se positionner sur des sessions.

   Modèle métier:
   - Opérateur voit sessions confirmées disponibles
   - Opérateur propose sa participation (applyToSession)
   - Entreprise accepte/refuse (acceptOperator/rejectOperator)
   - Traçabilité complète des candidatures

   Règles:
   - Session doit être status: 'confirmed'
   - marketplaceVisible doit être true
   - operatorApplications[] trace les candidatures
   - operatorIds[] contient les acceptés

   ============================================================ */

const OperatorMarketplaceWorkflow = (function() {
  'use strict';

  /**
   * Get session by ID
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
      console.error('[OperatorMarketplaceWorkflow] Error in _getSession:', error);
      return null;
    }
  }

  /**
   * Get operator by ID
   * @param {string} operatorId - Operator identifier
   * @returns {Object|null} Operator object or null
   */
  function _getOperator(operatorId) {
    try {
      if (!operatorId) return null;

      if (typeof DB !== 'undefined' && DB.operators && DB.operators.getById) {
        return DB.operators.getById(operatorId);
      }

      const stored = localStorage.getItem('dst_operators');
      if (stored) {
        const operators = JSON.parse(stored);
        return operators.find(o => o.id === operatorId) || null;
      }

      return null;
    } catch (error) {
      console.error('[OperatorMarketplaceWorkflow] Error in _getOperator:', error);
      return null;
    }
  }

  /**
   * Save session
   * @param {Object} session - Session object
   * @returns {Object} Saved session
   */
  function _saveSession(session) {
    try {
      if (!session || !session.id) {
        throw new Error('Session must have an ID');
      }

      if (typeof DB !== 'undefined' && DB.sessions && DB.sessions.update) {
        return DB.sessions.update(session.id, session);
      }

      const stored = localStorage.getItem('dst_sessions');
      let sessions = stored ? JSON.parse(stored) : [];

      const index = sessions.findIndex(s => s.id === session.id);
      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.push(session);
      }

      localStorage.setItem('dst_sessions', JSON.stringify(sessions));
      return session;
    } catch (error) {
      console.error('[OperatorMarketplaceWorkflow] Error in _saveSession:', error);
      return { error: error.message };
    }
  }

  /**
   * Ensure session has marketplace fields
   * @param {Object} session - Session object
   * @returns {Object} Session with guaranteed fields
   */
  function _ensureMarketplaceFields(session) {
    if (!session) return null;

    return {
      ...session,
      marketplaceVisible: session.marketplaceVisible !== false,
      operatorApplications: Array.isArray(session.operatorApplications)
        ? session.operatorApplications
        : [],
      operatorIds: Array.isArray(session.operatorIds)
        ? session.operatorIds
        : []
    };
  }

  /**
   * Apply to session as operator
   *
   * Opérateur propose sa participation à une session confirmée.
   *
   * @param {string} operatorId - Operator identifier
   * @param {string} sessionId - Session identifier
   * @returns {Object} Result with success status
   *   {
   *     success,
   *     operatorId,
   *     sessionId,
   *     applicationId,
   *     status: 'pending'
   *   }
   */
  function applyToSession(operatorId, sessionId) {
    try {
      if (!operatorId || !sessionId) {
        throw new Error('operatorId and sessionId required');
      }

      // ===== STEP 1: Verify operator exists =====
      const operator = _getOperator(operatorId);
      if (!operator) {
        throw new Error(`Operator ${operatorId} not found`);
      }

      // ===== STEP 2: Load session =====
      let session = _getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Ensure marketplace fields
      session = _ensureMarketplaceFields(session);

      // ===== STEP 3: Verify session is confirmed =====
      if (session.status !== 'confirmed') {
        return {
          success: false,
          error: 'INVALID_SESSION_STATUS',
          message: `Session status is ${session.status}, must be 'confirmed'`,
          operatorId,
          sessionId
        };
      }

      // ===== STEP 4: Verify session is visible on marketplace =====
      if (!session.marketplaceVisible) {
        return {
          success: false,
          error: 'SESSION_NOT_VISIBLE',
          message: 'Session is not visible on marketplace',
          operatorId,
          sessionId
        };
      }

      // ===== STEP 5: Check if operator already applied =====
      const existingApp = session.operatorApplications.find(
        app => app.operatorId === operatorId
      );

      if (existingApp && existingApp.status !== 'rejected') {
        return {
          success: false,
          error: 'ALREADY_APPLIED',
          message: `Operator already applied with status: ${existingApp.status}`,
          operatorId,
          sessionId,
          applicationId: existingApp.id
        };
      }

      // ===== STEP 6: Check if operator already accepted =====
      if (session.operatorIds && session.operatorIds.includes(operatorId)) {
        return {
          success: false,
          error: 'ALREADY_ACCEPTED',
          message: 'Operator already assigned to this session',
          operatorId,
          sessionId
        };
      }

      // ===== STEP 7: Create application =====
      const applicationId = `app_${operatorId}_${sessionId}_${Date.now()}`;

      const application = {
        id: applicationId,
        operatorId,
        operatorName: operator.name || 'Unknown',
        status: 'pending',
        appliedAt: new Date().toISOString(),
        respondedAt: null
      };

      // Remove old rejected application if exists
      session.operatorApplications = session.operatorApplications.filter(
        app => !(app.operatorId === operatorId && app.status === 'rejected')
      );

      // Add new application
      session.operatorApplications.push(application);

      // ===== STEP 8: Save session =====
      const saved = _saveSession(session);

      if (saved.error) {
        throw new Error(`Failed to save session: ${saved.error}`);
      }

      return {
        success: true,
        operatorId,
        sessionId,
        applicationId,
        status: 'pending',
        message: `Application ${applicationId} submitted`,
        appliedAt: application.appliedAt
      };
    } catch (error) {
      console.error('[OperatorMarketplaceWorkflow] Error in applyToSession:', error);
      return {
        success: false,
        error: 'APPLICATION_FAILED',
        message: error.message,
        operatorId,
        sessionId
      };
    }
  }

  /**
   * Accept operator for session
   *
   * Entreprise accepte la candidature d'un opérateur.
   *
   * @param {string} operatorId - Operator identifier
   * @param {string} sessionId - Session identifier
   * @returns {Object} Result with success status
   */
  function acceptOperator(operatorId, sessionId) {
    try {
      if (!operatorId || !sessionId) {
        throw new Error('operatorId and sessionId required');
      }

      // ===== STEP 1: Load session =====
      let session = _getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      session = _ensureMarketplaceFields(session);

      // ===== STEP 2: Find application =====
      const appIndex = session.operatorApplications.findIndex(
        app => app.operatorId === operatorId
      );

      if (appIndex === -1) {
        return {
          success: false,
          error: 'APPLICATION_NOT_FOUND',
          message: `No application found for operator ${operatorId}`,
          operatorId,
          sessionId
        };
      }

      // ===== STEP 3: Check application status =====
      const application = session.operatorApplications[appIndex];

      if (application.status !== 'pending') {
        return {
          success: false,
          error: 'INVALID_APPLICATION_STATUS',
          message: `Application status is ${application.status}, expected 'pending'`,
          operatorId,
          sessionId,
          applicationId: application.id
        };
      }

      // ===== STEP 4: Accept application =====
      session.operatorApplications[appIndex].status = 'accepted';
      session.operatorApplications[appIndex].respondedAt = new Date().toISOString();

      // ===== STEP 5: Add operator to session =====
      if (!session.operatorIds) {
        session.operatorIds = [];
      }

      if (!session.operatorIds.includes(operatorId)) {
        session.operatorIds.push(operatorId);
      }

      // ===== STEP 6: Save session =====
      const saved = _saveSession(session);

      if (saved.error) {
        throw new Error(`Failed to save session: ${saved.error}`);
      }

      return {
        success: true,
        operatorId,
        sessionId,
        applicationId: application.id,
        status: 'accepted',
        message: `Operator ${operatorId} accepted for session ${sessionId}`,
        respondedAt: session.operatorApplications[appIndex].respondedAt
      };
    } catch (error) {
      console.error('[OperatorMarketplaceWorkflow] Error in acceptOperator:', error);
      return {
        success: false,
        error: 'ACCEPTANCE_FAILED',
        message: error.message,
        operatorId,
        sessionId
      };
    }
  }

  /**
   * Reject operator application
   *
   * Entreprise refuse la candidature d'un opérateur.
   *
   * @param {string} operatorId - Operator identifier
   * @param {string} sessionId - Session identifier
   * @param {string} reason - Optional rejection reason
   * @returns {Object} Result with success status
   */
  function rejectOperator(operatorId, sessionId, reason) {
    try {
      if (!operatorId || !sessionId) {
        throw new Error('operatorId and sessionId required');
      }

      // ===== STEP 1: Load session =====
      let session = _getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      session = _ensureMarketplaceFields(session);

      // ===== STEP 2: Find application =====
      const appIndex = session.operatorApplications.findIndex(
        app => app.operatorId === operatorId
      );

      if (appIndex === -1) {
        return {
          success: false,
          error: 'APPLICATION_NOT_FOUND',
          message: `No application found for operator ${operatorId}`,
          operatorId,
          sessionId
        };
      }

      // ===== STEP 3: Reject application =====
      const application = session.operatorApplications[appIndex];
      application.status = 'rejected';
      application.respondedAt = new Date().toISOString();
      if (reason) {
        application.rejectionReason = reason;
      }

      // ===== STEP 4: Remove from operatorIds if accepted =====
      if (session.operatorIds && session.operatorIds.includes(operatorId)) {
        session.operatorIds = session.operatorIds.filter(id => id !== operatorId);
      }

      // ===== STEP 5: Save session =====
      const saved = _saveSession(session);

      if (saved.error) {
        throw new Error(`Failed to save session: ${saved.error}`);
      }

      return {
        success: true,
        operatorId,
        sessionId,
        applicationId: application.id,
        status: 'rejected',
        message: `Operator ${operatorId} rejected for session ${sessionId}`,
        rejectionReason: reason || null,
        respondedAt: application.respondedAt
      };
    } catch (error) {
      console.error('[OperatorMarketplaceWorkflow] Error in rejectOperator:', error);
      return {
        success: false,
        error: 'REJECTION_FAILED',
        message: error.message,
        operatorId,
        sessionId
      };
    }
  }

  /**
   * List open marketplace sessions in region
   *
   * Retourne les sessions visibles sur le marché d'opérateurs.
   * Sessions doivent être:
   * - status: 'confirmed'
   * - marketplaceVisible: true
   * - avoir au moins un setup assigné
   *
   * @param {string} regionId - Region identifier
   * @returns {Object} Result with sessions list
   */
  function listOpenMarketplaceSessions(regionId) {
    try {
      if (!regionId) {
        throw new Error('regionId required');
      }

      // Get all sessions
      const allSessions = typeof DB !== 'undefined' && DB.sessions && DB.sessions.getAll
        ? DB.sessions.getAll()
        : [];

      // Filter marketplace sessions
      const openSessions = allSessions.filter(session => {
        // Must be confirmed
        if (session.status !== 'confirmed') return false;

        // Must be visible on marketplace
        if (session.marketplaceVisible === false) return false;

        // Must have setups assigned
        const setupIds = session.setupIds || [];
        if (setupIds.length === 0) return false;

        // Must be in correct region
        if (session.regionId !== regionId) return false;

        // Must not be cancelled
        if (session.cancelled) return false;

        return true;
      });

      // Enrich sessions with application info
      const enriched = openSessions.map(session => {
        const apps = session.operatorApplications || [];
        return {
          id: session.id,
          date: session.date,
          regionId: session.regionId,
          moduleIds: session.moduleIds,
          capacityMax: session.capacityMax,
          requestedParticipants: session.requestedParticipants,
          setupIds: session.setupIds,
          status: session.status,
          createdAt: session.createdAt,
          // Marketplace specific
          openPositions: (session.capacityMax || 0) - (session.operatorIds?.length || 0),
          totalApplications: apps.length,
          pendingApplications: apps.filter(a => a.status === 'pending').length,
          acceptedOperators: session.operatorIds?.length || 0
        };
      });

      return {
        success: true,
        regionId,
        sessions: enriched,
        count: enriched.length,
        summary: {
          totalSessions: enriched.length,
          totalOpenPositions: enriched.reduce((sum, s) => sum + s.openPositions, 0),
          totalApplications: enriched.reduce((sum, s) => sum + s.totalApplications, 0)
        }
      };
    } catch (error) {
      console.error('[OperatorMarketplaceWorkflow] Error in listOpenMarketplaceSessions:', error);
      return {
        success: false,
        error: 'LIST_FAILED',
        message: error.message,
        regionId,
        sessions: []
      };
    }
  }

  /**
   * Get operator's applications
   *
   * @param {string} operatorId - Operator identifier
   * @returns {Object} Result with applications
   */
  function getOperatorApplications(operatorId) {
    try {
      if (!operatorId) {
        throw new Error('operatorId required');
      }

      // Get all sessions
      const allSessions = typeof DB !== 'undefined' && DB.sessions && DB.sessions.getAll
        ? DB.sessions.getAll()
        : [];

      // Find applications
      const applications = [];

      allSessions.forEach(session => {
        const apps = session.operatorApplications || [];
        const opApps = apps.filter(app => app.operatorId === operatorId);

        opApps.forEach(app => {
          applications.push({
            applicationId: app.id,
            sessionId: session.id,
            sessionDate: session.date,
            regionId: session.regionId,
            moduleIds: session.moduleIds,
            capacityMax: session.capacityMax,
            setupIds: session.setupIds,
            applicationStatus: app.status,
            appliedAt: app.appliedAt,
            respondedAt: app.respondedAt,
            rejectionReason: app.rejectionReason || null
          });
        });
      });

      return {
        success: true,
        operatorId,
        applications,
        count: applications.length,
        summary: {
          total: applications.length,
          pending: applications.filter(a => a.applicationStatus === 'pending').length,
          accepted: applications.filter(a => a.applicationStatus === 'accepted').length,
          rejected: applications.filter(a => a.applicationStatus === 'rejected').length
        }
      };
    } catch (error) {
      console.error('[OperatorMarketplaceWorkflow] Error in getOperatorApplications:', error);
      return {
        success: false,
        error: 'FETCH_FAILED',
        message: error.message,
        operatorId,
        applications: []
      };
    }
  }

  /**
   * Get session marketplace details
   *
   * @param {string} sessionId - Session identifier
   * @returns {Object} Session with marketplace details
   */
  function getSessionMarketplaceDetails(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('sessionId required');
      }

      const session = _getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const ensured = _ensureMarketplaceFields(session);
      const apps = ensured.operatorApplications || [];

      return {
        success: true,
        sessionId,
        session: {
          id: session.id,
          date: session.date,
          regionId: session.regionId,
          moduleIds: session.moduleIds,
          capacityMax: session.capacityMax,
          requestedParticipants: session.requestedParticipants,
          setupIds: session.setupIds,
          status: session.status,
          marketplaceVisible: ensured.marketplaceVisible,
          createdAt: session.createdAt
        },
        operators: {
          acceptedCount: ensured.operatorIds?.length || 0,
          acceptedIds: ensured.operatorIds || [],
          openPositions: (session.capacityMax || 0) - (ensured.operatorIds?.length || 0)
        },
        applications: {
          total: apps.length,
          pending: apps.filter(a => a.status === 'pending').map(a => ({
            applicationId: a.id,
            operatorId: a.operatorId,
            operatorName: a.operatorName,
            appliedAt: a.appliedAt
          })),
          accepted: apps.filter(a => a.status === 'accepted').map(a => ({
            applicationId: a.id,
            operatorId: a.operatorId,
            operatorName: a.operatorName,
            acceptedAt: a.respondedAt
          })),
          rejected: apps.filter(a => a.status === 'rejected').map(a => ({
            applicationId: a.id,
            operatorId: a.operatorId,
            operatorName: a.operatorName,
            rejectionReason: a.rejectionReason,
            rejectedAt: a.respondedAt
          }))
        }
      };
    } catch (error) {
      console.error('[OperatorMarketplaceWorkflow] Error in getSessionMarketplaceDetails:', error);
      return {
        success: false,
        error: 'DETAILS_FAILED',
        message: error.message,
        sessionId
      };
    }
  }

  // Public API
  return {
    applyToSession,
    acceptOperator,
    rejectOperator,
    listOpenMarketplaceSessions,
    getOperatorApplications,
    getSessionMarketplaceDetails
  };
})();
