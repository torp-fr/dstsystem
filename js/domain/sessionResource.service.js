/* ============================================================
   DST-SYSTEM — Session Resource Service

   Safe binding of sessions to setups.
   Non-breaking migration layer.

   Responsibilities:
   - Assign/release setups to/from sessions
   - Validate setup availability for sessions
   - Retrieve setup objects linked to sessions
   - Handle missing fields defensively

   ============================================================ */

const SessionResourceService = (function() {
  'use strict';

  /**
   * Ensure session has resource binding fields
   * @param {Object} session - Session object
   * @returns {Object} Session with guaranteed fields
   */
  function _ensureSessionFields(session) {
    if (!session) return null;

    return {
      ...session,
      regionId: session.regionId || null,
      setupIds: Array.isArray(session.setupIds) ? session.setupIds : []
    };
  }

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

      // Fallback: search localStorage
      const stored = localStorage.getItem('dst_sessions');
      if (stored) {
        const sessions = JSON.parse(stored);
        return sessions.find(s => s.id === sessionId) || null;
      }

      return null;
    } catch (error) {
      console.error('[SessionResourceService] Error in _getSession:', error);
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
      console.error('[SessionResourceService] Error in _saveSession:', error);
      return { error: error.message };
    }
  }

  /**
   * Get setup by ID
   * @param {string} setupId - Setup identifier
   * @returns {Object|null} Setup object or null
   */
  function _getSetup(setupId) {
    try {
      if (!setupId) return null;
      return SetupRepository.getById(setupId);
    } catch (error) {
      console.error('[SessionResourceService] Error in _getSetup:', error);
      return null;
    }
  }

  /**
   * Check if setup is already assigned to another session on same date
   * @param {string} setupId - Setup identifier
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} excludeSessionId - Session ID to exclude from check
   * @returns {boolean} True if setup is already in use
   */
  function _isSetupInUseOnDate(setupId, date, excludeSessionId = null) {
    try {
      if (!setupId || !date) return false;

      // Get all sessions
      const allSessions = typeof DB !== 'undefined' && DB.sessions && DB.sessions.getAll
        ? DB.sessions.getAll()
        : [];

      // Check if any session (except excludeSessionId) uses this setup on this date
      const conflicting = allSessions.filter(session => {
        const sessionDate = session.date || session.scheduledDate;
        const setupIds = session.setupIds || [];

        return sessionDate === date &&
               setupIds.includes(setupId) &&
               session.status !== 'cancelled' &&
               session.id !== excludeSessionId;
      });

      return conflicting.length > 0;
    } catch (error) {
      console.error('[SessionResourceService] Error in _isSetupInUseOnDate:', error);
      return false;
    }
  }

  /**
   * Assign setup to session
   * @param {string} sessionId - Session identifier
   * @param {string} setupId - Setup identifier
   * @returns {Object} Result with success status
   *   {
   *     success,
   *     sessionId,
   *     setupId,
   *     setupIds: [],
   *     message
   *   }
   */
  function assignSetupToSession(sessionId, setupId) {
    try {
      if (!sessionId || !setupId) {
        throw new Error('Session ID and Setup ID are required');
      }

      // Load session
      let session = _getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Ensure fields exist
      session = _ensureSessionFields(session);

      // Check if setup exists
      const setup = _getSetup(setupId);
      if (!setup) {
        throw new Error(`Setup ${setupId} not found`);
      }

      // Check if setup already assigned
      if (session.setupIds.includes(setupId)) {
        return {
          success: true,
          sessionId,
          setupId,
          setupIds: session.setupIds,
          message: 'Setup already assigned to this session'
        };
      }

      // Get session date
      const sessionDate = session.date || session.scheduledDate;
      if (!sessionDate) {
        throw new Error('Session must have a date');
      }

      // Check if setup is in use on this date
      if (_isSetupInUseOnDate(setupId, sessionDate, sessionId)) {
        throw new Error(`Setup ${setupId} is already booked on ${sessionDate}`);
      }

      // Assign setup: add to array
      session.setupIds.push(setupId);

      // Update region if not set
      if (!session.regionId && setup.regionIds && setup.regionIds.length > 0) {
        session.regionId = setup.regionIds[0];
      }

      // Save session
      const saved = _saveSession(session);

      if (saved.error) {
        throw new Error(`Failed to save session: ${saved.error}`);
      }

      return {
        success: true,
        sessionId,
        setupId,
        setupIds: saved.setupIds,
        regionId: saved.regionId,
        message: `Setup ${setupId} assigned to session ${sessionId}`
      };
    } catch (error) {
      console.error('[SessionResourceService] Error in assignSetupToSession:', error);
      return {
        success: false,
        sessionId,
        setupId,
        error: error.message
      };
    }
  }

  /**
   * Release setup from session
   * @param {string} sessionId - Session identifier
   * @param {string} setupId - Setup identifier
   * @returns {Object} Result with success status
   */
  function releaseSetupFromSession(sessionId, setupId) {
    try {
      if (!sessionId || !setupId) {
        throw new Error('Session ID and Setup ID are required');
      }

      // Load session
      let session = _getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Ensure fields exist
      session = _ensureSessionFields(session);

      // Check if setup is assigned
      const setupIndex = session.setupIds.indexOf(setupId);
      if (setupIndex === -1) {
        return {
          success: true,
          sessionId,
          setupId,
          setupIds: session.setupIds,
          message: 'Setup was not assigned to this session'
        };
      }

      // Remove setup
      session.setupIds.splice(setupIndex, 1);

      // If no more setups, clear region
      if (session.setupIds.length === 0) {
        session.regionId = null;
      }

      // Save session
      const saved = _saveSession(session);

      if (saved.error) {
        throw new Error(`Failed to save session: ${saved.error}`);
      }

      return {
        success: true,
        sessionId,
        setupId,
        setupIds: saved.setupIds,
        message: `Setup ${setupId} released from session ${sessionId}`
      };
    } catch (error) {
      console.error('[SessionResourceService] Error in releaseSetupFromSession:', error);
      return {
        success: false,
        sessionId,
        setupId,
        error: error.message
      };
    }
  }

  /**
   * Validate if setup can be assigned to session on given date
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} regionId - Region identifier
   * @param {number} setupRequiredCount - Number of setups needed
   * @returns {Object} Validation result
   */
  function validateSetupAvailability(date, regionId, setupRequiredCount = 1) {
    try {
      if (!date || !regionId) {
        throw new Error('Date and regionId are required');
      }

      // Use AvailabilityEngine
      if (typeof AvailabilityEngine === 'undefined') {
        throw new Error('AvailabilityEngine not available');
      }

      const availability = AvailabilityEngine.getAvailableSetups(date, regionId);

      return {
        success: availability.success,
        date,
        regionId,
        totalSetups: availability.totalSetups,
        availableSetups: availability.availableSetups,
        requiredSetups: setupRequiredCount,
        isValid: availability.success &&
                 availability.availableSetups >= setupRequiredCount,
        message: availability.success
          ? `${availability.availableSetups} setups available, ${setupRequiredCount} required`
          : availability.error
      };
    } catch (error) {
      console.error('[SessionResourceService] Error in validateSetupAvailability:', error);
      return {
        success: false,
        date,
        regionId,
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Get setup objects linked to session
   * @param {string} sessionId - Session identifier
   * @returns {Object} Result with setup details
   *   {
   *     success,
   *     sessionId,
   *     setups: [],
   *     count
   *   }
   */
  function getSessionSetups(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      // Load session
      const session = _getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Get setup IDs
      const setupIds = session.setupIds || [];

      // Load setup objects
      const setups = setupIds
        .map(setupId => _getSetup(setupId))
        .filter(setup => setup !== null);

      return {
        success: true,
        sessionId,
        setups,
        count: setups.length,
        setupIds,
        regionId: session.regionId || null
      };
    } catch (error) {
      console.error('[SessionResourceService] Error in getSessionSetups:', error);
      return {
        success: false,
        sessionId,
        setups: [],
        count: 0,
        error: error.message
      };
    }
  }

  /**
   * Get session with resource binding info
   * @param {string} sessionId - Session identifier
   * @returns {Object} Session with resource info
   */
  function getSessionWithResources(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      // Load session
      let session = _getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Ensure fields
      session = _ensureSessionFields(session);

      // Get setups
      const setupIds = session.setupIds || [];
      const setups = setupIds
        .map(setupId => _getSetup(setupId))
        .filter(setup => setup !== null);

      return {
        success: true,
        session: {
          ...session,
          resources: {
            setupIds,
            setups,
            setupCount: setups.length,
            regionId: session.regionId
          }
        }
      };
    } catch (error) {
      console.error('[SessionResourceService] Error in getSessionWithResources:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if session has required resources
   * @param {string} sessionId - Session identifier
   * @param {number} minSetups - Minimum setups required
   * @returns {Object} Result with validation
   */
  function validateSessionResources(sessionId, minSetups = 1) {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const sessionResult = getSessionSetups(sessionId);
      if (!sessionResult.success) {
        throw new Error(sessionResult.error);
      }

      const hasMinimum = sessionResult.count >= minSetups;

      return {
        success: true,
        sessionId,
        setupCount: sessionResult.count,
        requiredCount: minSetups,
        isValid: hasMinimum,
        message: hasMinimum
          ? `Session has ${sessionResult.count} setups (requires ${minSetups})`
          : `Session has ${sessionResult.count} setups but requires ${minSetups}`
      };
    } catch (error) {
      console.error('[SessionResourceService] Error in validateSessionResources:', error);
      return {
        success: false,
        sessionId,
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Clear all setups from session (release all)
   * @param {string} sessionId - Session identifier
   * @returns {Object} Result with cleared state
   */
  function clearSessionSetups(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      // Load session
      let session = _getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Clear setups
      const clearedCount = (session.setupIds || []).length;
      session.setupIds = [];
      session.regionId = null;

      // Save
      const saved = _saveSession(session);

      if (saved.error) {
        throw new Error(`Failed to save session: ${saved.error}`);
      }

      return {
        success: true,
        sessionId,
        clearedCount,
        message: `Cleared ${clearedCount} setups from session ${sessionId}`
      };
    } catch (error) {
      console.error('[SessionResourceService] Error in clearSessionSetups:', error);
      return {
        success: false,
        sessionId,
        error: error.message
      };
    }
  }

  // Public API
  return {
    assignSetupToSession,
    releaseSetupFromSession,
    validateSetupAvailability,
    getSessionSetups,
    getSessionWithResources,
    validateSessionResources,
    clearSessionSetups
  };
})();
