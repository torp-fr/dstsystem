/* ============================================================
   DST-SYSTEM — Booking Workflow

   Gère le cycle complet de réservation de session.

   Modèle métier:
   - Client réserve DATE + REGION (pas de SETUP choisi)
   - Système alloue automatiquement les setups disponibles
   - 2 phases: pending_confirmation → confirmed

   Règle fondamentale:
   availableSetups = MIN(freeSetups, operatorsAvailable)

   ============================================================ */

const BookingWorkflow = (function() {
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

      // Fallback: search localStorage
      const stored = localStorage.getItem('dst_sessions');
      if (stored) {
        const sessions = JSON.parse(stored);
        return sessions.find(s => s.id === sessionId) || null;
      }

      return null;
    } catch (error) {
      console.error('[BookingWorkflow] Error in _getSession:', error);
      return null;
    }
  }

  /**
   * Save or update session
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

      // Fallback: save to localStorage
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
      console.error('[BookingWorkflow] Error in _saveSession:', error);
      return { error: error.message };
    }
  }

  /**
   * Delete session from DB
   * @param {string} sessionId - Session identifier
   * @returns {boolean} Success status
   */
  function _deleteSession(sessionId) {
    try {
      if (!sessionId) return false;

      if (typeof DB !== 'undefined' && DB.sessions && DB.sessions.delete) {
        DB.sessions.delete(sessionId);
        return true;
      }

      // Fallback: delete from localStorage
      const stored = localStorage.getItem('dst_sessions');
      if (stored) {
        const sessions = JSON.parse(stored);
        const filtered = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem('dst_sessions', JSON.stringify(filtered));
        return true;
      }

      return false;
    } catch (error) {
      console.error('[BookingWorkflow] Error in _deleteSession:', error);
      return false;
    }
  }

  /**
   * Get available setups in region on date
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} regionId - Region identifier
   * @returns {Array} Available setup IDs
   */
  function _getAvailableSetupIds(date, regionId) {
    try {
      if (!date || !regionId) return [];

      // Get all setups in region
      const setups = SetupRepository.getByRegion(regionId);
      const activeSetups = setups.filter(s => s.active !== false);

      // Get availability info
      const availability = AvailabilityEngine.getAvailableSetups(date, regionId);

      // Get used setup IDs from details
      const usedSetupIds = new Set();
      (availability.details?.usedBy || []).forEach(usage => {
        const setupIds = usage.setupIds || (usage.setupId ? [usage.setupId] : []);
        setupIds.forEach(id => usedSetupIds.add(id));
      });

      // Return available setups (not in usedSetupIds)
      return activeSetups
        .filter(setup => !usedSetupIds.has(setup.id))
        .map(setup => setup.id);
    } catch (error) {
      console.error('[BookingWorkflow] Error in _getAvailableSetupIds:', error);
      return [];
    }
  }

  /**
   * Create session booking
   * Phase 1: Client requests session
   *
   * INPUT:
   * {
   *   clientId,              // Required: Client identifier
   *   regionId,              // Required: Region for session
   *   date,                  // Required: Session date (YYYY-MM-DD)
   *   moduleIds[],           // Required: Modules for session
   *   requestedParticipants, // Required: Number of participants
   *   offerId?               // Optional: Associated offer
   * }
   *
   * RETURNS:
   * {
   *   success,
   *   sessionId,
   *   session,
   *   message,
   *   capacityMax,
   *   availableSetups
   * }
   */
  function createSessionBooking(data) {
    try {
      // Validate input
      if (!data) {
        throw new Error('Booking data required');
      }

      const { clientId, regionId, date, moduleIds, requestedParticipants, offerId } = data;

      if (!clientId || !regionId || !date || !moduleIds || !Array.isArray(moduleIds)) {
        throw new Error('Missing required fields: clientId, regionId, date, moduleIds');
      }

      if (!requestedParticipants || requestedParticipants < 1) {
        throw new Error('requestedParticipants must be >= 1');
      }

      // ===== STEP 1: Validate module capacity =====
      if (typeof ModuleCapacityService === 'undefined') {
        throw new Error('ModuleCapacityService not available');
      }

      const capacityCheck = ModuleCapacityService.validateParticipantCount(
        moduleIds,
        requestedParticipants
      );

      if (!capacityCheck.isValid) {
        return {
          success: false,
          error: 'CAPACITY_EXCEEDED',
          message: capacityCheck.message,
          capacityMax: capacityCheck.capacityMax,
          requestedParticipants
        };
      }

      // ===== STEP 2: Verify date availability =====
      if (typeof AvailabilityEngine === 'undefined') {
        throw new Error('AvailabilityEngine not available');
      }

      const dateAvailable = AvailabilityEngine.isDateAvailable(date, regionId, 1);

      if (!dateAvailable) {
        return {
          success: false,
          error: 'NO_AVAILABILITY',
          message: `No setups available on ${date} in ${regionId}`,
          availableAlternatives: AvailabilityEngine.getAvailableDates(regionId, 5)
        };
      }

      // ===== STEP 3: Create session (pending confirmation) =====
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newSession = {
        id: sessionId,
        clientId,
        regionId,
        date,
        moduleIds,
        requestedParticipants,
        capacityMax: capacityCheck.capacityMax,
        status: 'pending_confirmation',
        setupIds: [],
        bookingSource: 'client_portal',
        createdAt: new Date().toISOString(),
        ...(offerId && { offerId })
      };

      const saved = _saveSession(newSession);

      if (saved.error) {
        throw new Error(`Failed to save session: ${saved.error}`);
      }

      // Get availability info for response
      const availability = AvailabilityEngine.getAvailableSetups(date, regionId);

      return {
        success: true,
        sessionId,
        session: saved,
        message: `Session ${sessionId} created - awaiting confirmation`,
        capacityMax: capacityCheck.capacityMax,
        availableSetups: availability.availableSetups,
        status: 'pending_confirmation'
      };
    } catch (error) {
      console.error('[BookingWorkflow] Error in createSessionBooking:', error);
      return {
        success: false,
        error: 'BOOKING_CREATION_FAILED',
        message: error.message
      };
    }
  }

  /**
   * Confirm session booking
   * Phase 2: Enterprise validates and allocates setup
   *
   * LOGIC:
   * 1. Load session
   * 2. Verify status === 'pending_confirmation'
   * 3. Re-check availability (might have changed)
   * 4. Find available setup
   * 5. Assign setup to session
   * 6. Mark session as 'confirmed'
   *
   * RETURNS:
   * {
   *   success,
   *   sessionId,
   *   allocatedSetupId,
   *   session,
   *   message
   * }
   */
  function confirmSessionBooking(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('Session ID required');
      }

      // ===== STEP 1: Load session =====
      const session = _getSession(sessionId);

      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // ===== STEP 2: Verify pending status =====
      if (session.status !== 'pending_confirmation') {
        return {
          success: false,
          error: 'INVALID_STATUS',
          message: `Session status is ${session.status}, expected 'pending_confirmation'`,
          sessionId
        };
      }

      // ===== STEP 3: VALIDATE STAFFING (NEW) =====
      // A session CANNOT be confirmed without operators
      // Operators must be accepted via OperatorMarketplace workflow
      if (typeof Workflows !== 'undefined' && Workflows.Staffing) {
        const staffingCheck = Workflows.Staffing.canConfirmSession(sessionId);

        if (!staffingCheck.canConfirm) {
          return {
            success: false,
            error: 'STAFFING_INVALID',
            message: 'Cannot confirm session: staffing requirements not met',
            sessionId,
            reasons: staffingCheck.reasons,
            staffingDetails: staffingCheck.details
          };
        }
      }

      // ===== STEP 4: Verify availability still valid =====
      const availability = AvailabilityEngine.getAvailableSetups(
        session.date,
        session.regionId
      );

      if (!availability.success) {
        return {
          success: false,
          error: 'AVAILABILITY_CHECK_FAILED',
          message: availability.error,
          sessionId
        };
      }

      if (availability.availableSetups < 1) {
        return {
          success: false,
          error: 'NO_SETUP_AVAILABLE',
          message: `No setups available on ${session.date} in ${session.regionId}`,
          sessionId,
          availableAlternatives: AvailabilityEngine.getAvailableDates(session.regionId, 5)
        };
      }

      // ===== STEP 5: Get available setup =====
      const availableSetupIds = _getAvailableSetupIds(session.date, session.regionId);

      if (availableSetupIds.length === 0) {
        return {
          success: false,
          error: 'NO_SETUP_FOUND',
          message: 'Could not find available setup in region',
          sessionId
        };
      }

      const setupIdToAssign = availableSetupIds[0];

      // ===== STEP 6: Assign setup via SessionResourceService =====
      if (typeof SessionResourceService === 'undefined') {
        throw new Error('SessionResourceService not available');
      }

      const assigned = SessionResourceService.assignSetupToSession(
        sessionId,
        setupIdToAssign
      );

      if (!assigned.success) {
        return {
          success: false,
          error: 'SETUP_ASSIGNMENT_FAILED',
          message: assigned.error,
          sessionId
        };
      }

      // ===== STEP 7: Update session status =====
      const updatedSession = _getSession(sessionId);

      if (!updatedSession) {
        throw new Error('Session disappeared after assignment');
      }

      updatedSession.status = 'confirmed';
      updatedSession.confirmedAt = new Date().toISOString();

      const finalSession = _saveSession(updatedSession);

      if (finalSession.error) {
        throw new Error(`Failed to update session: ${finalSession.error}`);
      }

      return {
        success: true,
        sessionId,
        allocatedSetupId: setupIdToAssign,
        session: finalSession,
        message: `Session ${sessionId} confirmed - setup ${setupIdToAssign} allocated`,
        status: 'confirmed'
      };
    } catch (error) {
      console.error('[BookingWorkflow] Error in confirmSessionBooking:', error);
      return {
        success: false,
        error: 'CONFIRMATION_FAILED',
        message: error.message,
        sessionId
      };
    }
  }

  /**
   * Cancel pending booking
   * Delete session if still pending confirmation
   *
   * RETURNS:
   * {
   *   success,
   *   sessionId,
   *   message
   * }
   */
  function cancelPendingBooking(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('Session ID required');
      }

      // Load session
      const session = _getSession(sessionId);

      if (!session) {
        return {
          success: true,
          sessionId,
          message: 'Session already deleted'
        };
      }

      // Only allow cancellation of pending bookings
      if (session.status !== 'pending_confirmation') {
        return {
          success: false,
          error: 'INVALID_STATUS',
          message: `Cannot cancel session with status '${session.status}'`,
          sessionId
        };
      }

      // Delete session
      const deleted = _deleteSession(sessionId);

      if (!deleted) {
        throw new Error('Failed to delete session');
      }

      return {
        success: true,
        sessionId,
        message: `Pending booking ${sessionId} cancelled`,
        status: 'cancelled'
      };
    } catch (error) {
      console.error('[BookingWorkflow] Error in cancelPendingBooking:', error);
      return {
        success: false,
        error: 'CANCELLATION_FAILED',
        message: error.message,
        sessionId
      };
    }
  }

  /**
   * Get booking status
   * @param {string} sessionId - Session identifier
   * @returns {Object} Booking information
   */
  function getBookingStatus(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('Session ID required');
      }

      const session = _getSession(sessionId);

      if (!session) {
        return {
          success: false,
          error: 'SESSION_NOT_FOUND',
          sessionId
        };
      }

      // Get setup info if assigned
      let setupInfo = null;
      if (session.setupIds && session.setupIds.length > 0) {
        setupInfo = session.setupIds.map(setupId => {
          const setup = SetupRepository.getById(setupId);
          return setup ? { id: setupId, name: setup.name } : { id: setupId };
        });
      }

      return {
        success: true,
        sessionId,
        session: {
          id: session.id,
          clientId: session.clientId,
          date: session.date,
          regionId: session.regionId,
          status: session.status,
          setupIds: session.setupIds || [],
          setups: setupInfo,
          capacityMax: session.capacityMax,
          requestedParticipants: session.requestedParticipants,
          createdAt: session.createdAt,
          confirmedAt: session.confirmedAt || null
        },
        isPending: session.status === 'pending_confirmation',
        isConfirmed: session.status === 'confirmed'
      };
    } catch (error) {
      console.error('[BookingWorkflow] Error in getBookingStatus:', error);
      return {
        success: false,
        error: 'STATUS_CHECK_FAILED',
        message: error.message,
        sessionId
      };
    }
  }

  /**
   * Check availability for potential booking
   * Does NOT create session, just validates availability
   *
   * @param {string} regionId - Region identifier
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {Array} moduleIds - Module IDs
   * @param {number} participantCount - Number of participants
   * @returns {Object} Availability analysis
   */
  function checkAvailability(regionId, date, moduleIds, participantCount) {
    try {
      if (!regionId || !date) {
        throw new Error('regionId and date required');
      }

      // Check capacity
      const capacityCheck = ModuleCapacityService.validateParticipantCount(
        moduleIds || [],
        participantCount || 1
      );

      // Check setup availability
      const setupAvailability = AvailabilityEngine.getAvailableSetups(date, regionId);

      // Check if booking possible
      const canBook = setupAvailability.isAvailable && capacityCheck.isValid;

      return {
        success: true,
        regionId,
        date,
        canBook,
        capacity: {
          isValid: capacityCheck.isValid,
          capacityMax: capacityCheck.capacityMax,
          requestedParticipants: participantCount,
          message: capacityCheck.message
        },
        availability: {
          isAvailable: setupAvailability.isAvailable,
          availableSetups: setupAvailability.availableSetups,
          operatorsAvailable: setupAvailability.operatorsAvailable,
          totalSetups: setupAvailability.totalSetups,
          usedSetups: setupAvailability.usedSetups
        }
      };
    } catch (error) {
      console.error('[BookingWorkflow] Error in checkAvailability:', error);
      return {
        success: false,
        error: 'AVAILABILITY_CHECK_FAILED',
        message: error.message
      };
    }
  }

  /**
   * Get suggested alternative dates if booking unavailable
   * @param {string} regionId - Region identifier
   * @param {number} count - Number of dates to suggest
   * @returns {Array} Available dates
   */
  function getSuggestedDates(regionId, count = 5) {
    try {
      if (!regionId) {
        throw new Error('regionId required');
      }

      return AvailabilityEngine.getAvailableDates(regionId, count);
    } catch (error) {
      console.error('[BookingWorkflow] Error in getSuggestedDates:', error);
      return [];
    }
  }

  // Public API
  return {
    createSessionBooking,
    confirmSessionBooking,
    cancelPendingBooking,
    getBookingStatus,
    checkAvailability,
    getSuggestedDates
  };
})();
