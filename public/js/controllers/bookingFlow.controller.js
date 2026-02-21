const BookingFlowController = (function() {
  'use strict';

  // ============================================================
  // CLIENT: Create Session Request
  // ============================================================

  /**
   * Client creates a session request
   * Status: pending_confirmation (NOT visible to marketplace yet)
   *
   * @param {Object} data - { clientId, date, setupIds, operatorRequirement, notes }
   * @returns {Object} { success, session, error }
   */
  function createSessionRequest(data) {
    try {
      // GUARD: Client role only
      if (!RoleGuardService.can('client', 'create_session_request')) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          details: 'Only clients can create session requests'
        };
      }

      // GUARD: Validate required fields
      if (!data.clientId || !data.date || !data.setupIds || data.setupIds.length === 0) {
        return {
          success: false,
          error: 'INVALID_DATA',
          details: 'Missing clientId, date, or setupIds'
        };
      }

      // Call Workflow to create booking
      const result = Workflows.Booking.createSessionBooking({
        clientId: data.clientId,
        date: data.date,
        setupIds: data.setupIds,
        operatorRequirement: data.operatorRequirement || { minOperators: 1, preferredOperators: 1 },
        notes: data.notes || '',
        status: 'pending_confirmation',      // NOT confirmed yet
        marketplace_visible: false             // NOT visible to operators yet
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
        session: result.session,
        message: 'Session request created. Awaiting enterprise confirmation.'
      };
    } catch (error) {
      console.error('[BookingFlowController.createSessionRequest]', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        details: error.message
      };
    }
  }

  // ============================================================
  // ENTERPRISE: Confirm Session (Make it Public)
  // ============================================================

  /**
   * Enterprise confirms a session request
   * Sets marketplace_visible = true (operators can now see it)
   * Status changes: pending_confirmation → confirmed
   *
   * @param {string} sessionId - Session to confirm
   * @returns {Object} { success, session, error }
   */
  function enterpriseConfirmSession(sessionId) {
    try {
      // GUARD: Enterprise role only
      if (!RoleGuardService.can('enterprise', 'confirm_session')) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          details: 'Only enterprise can confirm sessions'
        };
      }

      // GUARD: Session must exist and be pending
      const adapter = SupabaseAdapter;
      const session = adapter.query('shooting_sessions').eq('id', sessionId).single();

      if (!session) {
        return {
          success: false,
          error: 'SESSION_NOT_FOUND',
          details: `Session ${sessionId} not found`
        };
      }

      if (session.status !== 'pending_confirmation') {
        return {
          success: false,
          error: 'INVALID_STATUS',
          details: `Session must be pending_confirmation, is ${session.status}`
        };
      }

      // Call Workflow to confirm
      const result = Workflows.Booking.confirmSessionBooking({
        sessionId: sessionId,
        status: 'confirmed',
        marketplace_visible: true
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
        session: result.session,
        message: 'Session confirmed and now visible on marketplace'
      };
    } catch (error) {
      console.error('[BookingFlowController.enterpriseConfirmSession]', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        details: error.message
      };
    }
  }

  // ============================================================
  // OPERATOR: View Marketplace Sessions
  // ============================================================

  /**
   * Operator views marketplace sessions
   * Only confirmed sessions that are visible on marketplace
   *
   * @param {Object} options - { filters, sortBy, limit }
   * @returns {Object} { success, sessions, count, error }
   */
  function getMarketplaceSessions(options = {}) {
    try {
      // GUARD: Operator role only
      if (!RoleGuardService.can('operator', 'view_marketplace')) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          details: 'Only operators can view marketplace'
        };
      }

      const adapter = SupabaseAdapter;

      // Query: confirmed sessions that are marketplace visible
      let query = adapter.query('shooting_sessions')
        .eq('status', 'confirmed')
        .eq('marketplace_visible', true)
        .order(options.sortBy || 'date', { ascending: true });

      // Apply filters if provided
      if (options.filters) {
        if (options.filters.date) {
          query = query.gte('date', options.filters.date);
        }
        if (options.filters.region) {
          // Filter by operator's region if needed
          query = query.eq('region', options.filters.region);
        }
      }

      // Apply limit
      const limit = options.limit || 50;
      query = query.limit(limit);

      // Execute query
      const sessions = query.execute();

      if (!sessions) {
        return {
          success: true,
          sessions: [],
          count: 0,
          message: 'No marketplace sessions available'
        };
      }

      return {
        success: true,
        sessions: sessions,
        count: sessions.length,
        message: `Found ${sessions.length} marketplace sessions`
      };
    } catch (error) {
      console.error('[BookingFlowController.getMarketplaceSessions]', error);
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
  // PUBLIC API
  // ============================================================

  return {
    // Client-side functions
    createSessionRequest,

    // Enterprise-side functions
    enterpriseConfirmSession,

    // Operator-side functions
    getMarketplaceSessions
  };
})();

// Global export
if (typeof window !== 'undefined') {
  window.BookingFlowController = BookingFlowController;
}
