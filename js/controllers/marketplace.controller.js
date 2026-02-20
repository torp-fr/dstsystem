const MarketplaceController = (function() {
  'use strict';

  // ============================================================
  // OPERATOR: Apply to Session
  // ============================================================

  /**
   * Operator applies to a marketplace session
   * Creates session_operators row with status='pending'
   * Enterprise will accept or reject
   *
   * @param {string} sessionId - Session to apply to
   * @param {string} operatorId - Operator applying
   * @returns {Object} { success, application, error }
   */
  function applyToSession(sessionId, operatorId) {
    try {
      // GUARD: Operator role only
      if (!RoleGuardService.can('operator', 'apply_to_session')) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          details: 'Only operators can apply to sessions'
        };
      }

      // GUARD: Check session exists and is marketplace visible
      const adapter = SupabaseAdapter;
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

      if (session.status !== 'confirmed' || !session.marketplace_visible) {
        return {
          success: false,
          error: 'SESSION_NOT_AVAILABLE',
          details: 'Session is not available on marketplace'
        };
      }

      // GUARD: Check operator hasn't already applied
      const existing = adapter.query('session_operators')
        .eq('session_id', sessionId)
        .eq('operator_id', operatorId)
        .single();

      if (existing) {
        return {
          success: false,
          error: 'ALREADY_APPLIED',
          details: 'You have already applied to this session'
        };
      }

      // Call Workflow to apply
      const result = Workflows.OperatorMarketplace.applyToSession({
        sessionId: sessionId,
        operatorId: operatorId,
        status: 'pending',
        applied_at: new Date().toISOString()
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          details: result.details
        };
      }

      return {
        success: true,
        application: result.application,
        message: 'Application sent. Enterprise will review and accept or reject.'
      };
    } catch (error) {
      console.error('[MarketplaceController.applyToSession]', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        details: error.message
      };
    }
  }

  // ============================================================
  // ENTERPRISE: Accept Operator
  // ============================================================

  /**
   * Enterprise accepts an operator's application
   * Sets session_operators status='accepted'
   *
   * @param {string} sessionId - Session
   * @param {string} operatorId - Operator to accept
   * @returns {Object} { success, application, error }
   */
  function acceptOperator(sessionId, operatorId) {
    try {
      // GUARD: Enterprise role only
      if (!RoleGuardService.can('enterprise', 'accept_operator')) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          details: 'Only enterprise can accept operators'
        };
      }

      // GUARD: Application must exist and be pending
      const adapter = SupabaseAdapter;
      const application = adapter.query('session_operators')
        .eq('session_id', sessionId)
        .eq('operator_id', operatorId)
        .single();

      if (!application) {
        return {
          success: false,
          error: 'APPLICATION_NOT_FOUND',
          details: `Operator ${operatorId} has not applied to session ${sessionId}`
        };
      }

      if (application.status !== 'pending') {
        return {
          success: false,
          error: 'INVALID_STATUS',
          details: `Application status is ${application.status}, not pending`
        };
      }

      // Call Workflow to accept
      const result = Workflows.OperatorMarketplace.acceptOperator({
        sessionId: sessionId,
        operatorId: operatorId,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          details: result.details
        };
      }

      return {
        success: true,
        application: result.application,
        message: `Operator ${operatorId} accepted for session ${sessionId}`
      };
    } catch (error) {
      console.error('[MarketplaceController.acceptOperator]', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        details: error.message
      };
    }
  }

  // ============================================================
  // ENTERPRISE: Reject Operator
  // ============================================================

  /**
   * Enterprise rejects an operator's application
   * Sets session_operators status='rejected'
   *
   * @param {string} sessionId - Session
   * @param {string} operatorId - Operator to reject
   * @returns {Object} { success, application, error }
   */
  function rejectOperator(sessionId, operatorId) {
    try {
      // GUARD: Enterprise role only
      if (!RoleGuardService.can('enterprise', 'reject_operator')) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          details: 'Only enterprise can reject operators'
        };
      }

      // GUARD: Application must exist and be pending
      const adapter = SupabaseAdapter;
      const application = adapter.query('session_operators')
        .eq('session_id', sessionId)
        .eq('operator_id', operatorId)
        .single();

      if (!application) {
        return {
          success: false,
          error: 'APPLICATION_NOT_FOUND',
          details: `Operator ${operatorId} has not applied to session ${sessionId}`
        };
      }

      if (application.status !== 'pending') {
        return {
          success: false,
          error: 'INVALID_STATUS',
          details: `Application status is ${application.status}, not pending`
        };
      }

      // Call Workflow to reject
      const result = Workflows.OperatorMarketplace.rejectOperator({
        sessionId: sessionId,
        operatorId: operatorId,
        status: 'rejected',
        rejected_at: new Date().toISOString()
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          details: result.details
        };
      }

      return {
        success: true,
        application: result.application,
        message: `Operator ${operatorId} rejected for session ${sessionId}`
      };
    } catch (error) {
      console.error('[MarketplaceController.rejectOperator]', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        details: error.message
      };
    }
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    // Operator functions
    applyToSession,

    // Enterprise functions
    acceptOperator,
    rejectOperator
  };
})();

// Global export
if (typeof window !== 'undefined') {
  window.MarketplaceController = MarketplaceController;
}
