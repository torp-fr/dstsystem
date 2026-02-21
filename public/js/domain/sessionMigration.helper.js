/* ============================================================
   DST-SYSTEM — Session Migration Helper

   Defensive field handling for backward compatibility.
   Non-breaking migration utilities.

   Used to ensure sessions have required resource binding fields
   without modifying existing sessions that lack them.

   ============================================================ */

const SessionMigrationHelper = (function() {
  'use strict';

  /**
   * Ensure session has all required resource binding fields
   * Adds missing fields with safe defaults.
   * Does NOT persist - only ensures object structure.
   *
   * @param {Object} session - Session object
   * @returns {Object} Session with guaranteed fields
   */
  function ensureSessionResourceFields(session) {
    try {
      if (!session || typeof session !== 'object') {
        console.warn('[SessionMigrationHelper] Invalid session object:', session);
        return null;
      }

      // Ensure regionId exists
      if (!('regionId' in session)) {
        session.regionId = null;
      }

      // Ensure setupIds exists and is array
      if (!('setupIds' in session)) {
        session.setupIds = [];
      } else if (!Array.isArray(session.setupIds)) {
        // Convert to array if not already
        session.setupIds = Array.isArray(session.setupIds)
          ? session.setupIds
          : [];
      }

      // Handle legacy setupId field (single setup)
      if ('setupId' in session && session.setupId && !session.setupIds.includes(session.setupId)) {
        session.setupIds.push(session.setupId);
      }

      return session;
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in ensureSessionResourceFields:', error);
      return session;
    }
  }

  /**
   * Migrate batch of sessions to have resource fields
   * Does NOT persist - returns modified copies.
   *
   * @param {Array} sessions - Array of session objects
   * @returns {Array} Sessions with guaranteed fields
   */
  function ensureSessionsResourceFields(sessions) {
    try {
      if (!Array.isArray(sessions)) {
        console.warn('[SessionMigrationHelper] Input is not an array');
        return [];
      }

      return sessions.map(session => ensureSessionResourceFields(session));
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in ensureSessionsResourceFields:', error);
      return sessions;
    }
  }

  /**
   * Check if session has legacy setupId field
   * @param {Object} session - Session object
   * @returns {boolean} True if session has setupId (not setupIds)
   */
  function hasLegacySetupField(session) {
    try {
      return session && 'setupId' in session;
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in hasLegacySetupField:', error);
      return false;
    }
  }

  /**
   * Check if session has new resource binding fields
   * @param {Object} session - Session object
   * @returns {boolean} True if session has setupIds and regionId
   */
  function hasResourceBindingFields(session) {
    try {
      return session &&
             'setupIds' in session &&
             Array.isArray(session.setupIds) &&
             'regionId' in session;
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in hasResourceBindingFields:', error);
      return false;
    }
  }

  /**
   * Count sessions missing resource fields
   * @param {Array} sessions - Array of session objects
   * @returns {Object} Statistics
   *   {
   *     total,
   *     withResourceFields,
   *     missingFields,
   *     withLegacyField,
   *     percentageMigrated
   *   }
   */
  function assessMigrationStatus(sessions) {
    try {
      if (!Array.isArray(sessions)) {
        return { error: 'Input must be array' };
      }

      const total = sessions.length;
      const withResourceFields = sessions.filter(s => hasResourceBindingFields(s)).length;
      const missingFields = total - withResourceFields;
      const withLegacyField = sessions.filter(s => hasLegacySetupField(s)).length;
      const percentageMigrated = total > 0
        ? Math.round((withResourceFields / total) * 100)
        : 0;

      return {
        total,
        withResourceFields,
        missingFields,
        withLegacyField,
        percentageMigrated,
        summary: `${withResourceFields}/${total} sessions have resource fields (${percentageMigrated}%)`
      };
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in assessMigrationStatus:', error);
      return { error: error.message };
    }
  }

  /**
   * Safe field access helper
   * Gets setup IDs from session, handling legacy field
   *
   * @param {Object} session - Session object
   * @returns {Array} Setup IDs (array)
   */
  function getSetupIds(session) {
    try {
      if (!session) return [];

      // Prefer new field
      if (Array.isArray(session.setupIds) && session.setupIds.length > 0) {
        return session.setupIds;
      }

      // Fallback to legacy field
      if (session.setupId) {
        return [session.setupId];
      }

      return [];
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in getSetupIds:', error);
      return [];
    }
  }

  /**
   * Safe field access helper
   * Gets region ID from session
   *
   * @param {Object} session - Session object
   * @returns {string|null} Region ID or null
   */
  function getRegionId(session) {
    try {
      return (session && session.regionId) || null;
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in getRegionId:', error);
      return null;
    }
  }

  /**
   * Check if session references any setups
   * @param {Object} session - Session object
   * @returns {boolean} True if session has setup references
   */
  function hasSetupReferences(session) {
    try {
      const setupIds = getSetupIds(session);
      return setupIds.length > 0;
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in hasSetupReferences:', error);
      return false;
    }
  }

  /**
   * Filter sessions by resource binding status
   * @param {Array} sessions - Array of sessions
   * @param {boolean} withResources - If true, return with resources; if false, return without
   * @returns {Array} Filtered sessions
   */
  function filterByResourceStatus(sessions, withResources = true) {
    try {
      if (!Array.isArray(sessions)) return [];

      if (withResources) {
        return sessions.filter(s => hasSetupReferences(s));
      } else {
        return sessions.filter(s => !hasSetupReferences(s));
      }
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in filterByResourceStatus:', error);
      return [];
    }
  }

  /**
   * Create normalized session object with all fields
   * Safe for new and legacy sessions
   *
   * @param {Object} session - Session object
   * @returns {Object} Normalized session with all fields
   */
  function normalizeSession(session) {
    try {
      if (!session) return null;

      const normalized = {
        ...session,
        id: session.id,
        date: session.date || session.scheduledDate || null,
        regionId: getRegionId(session),
        setupIds: getSetupIds(session),
        // Preserve other fields
        ...(session.clientId && { clientId: session.clientId }),
        ...(session.status && { status: session.status }),
        ...(session.operatorIds && { operatorIds: session.operatorIds })
      };

      return normalized;
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in normalizeSession:', error);
      return session;
    }
  }

  /**
   * Validate session resource binding
   * @param {Object} session - Session object
   * @returns {Object} Validation result
   */
  function validateSessionBinding(session) {
    try {
      if (!session) {
        return {
          valid: false,
          errors: ['Session is null or undefined']
        };
      }

      const errors = [];

      // Check required fields
      if (!session.id) errors.push('Session missing ID');
      if (!session.date && !session.scheduledDate) errors.push('Session missing date');

      // Check resource fields
      if (!('regionId' in session)) errors.push('Session missing regionId field');
      if (!('setupIds' in session)) errors.push('Session missing setupIds field');

      // Check data types
      if ('regionId' in session && session.regionId && typeof session.regionId !== 'string') {
        errors.push('regionId must be string or null');
      }
      if ('setupIds' in session && !Array.isArray(session.setupIds)) {
        errors.push('setupIds must be array');
      }

      return {
        valid: errors.length === 0,
        errors,
        session: {
          id: session.id,
          hasRegionId: 'regionId' in session,
          hasSetupIds: 'setupIds' in session,
          setupCount: Array.isArray(session.setupIds) ? session.setupIds.length : 0
        }
      };
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in validateSessionBinding:', error);
      return {
        valid: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Debug: Print session field status
   * @param {Object} session - Session object
   * @returns {Object} Debug info
   */
  function debugSession(session) {
    try {
      if (!session) {
        return { error: 'Session is null' };
      }

      return {
        id: session.id,
        date: session.date || session.scheduledDate || 'MISSING',
        hasRegionId: 'regionId' in session,
        regionId: session.regionId || 'null',
        hasSetupIds: 'setupIds' in session,
        setupIds: session.setupIds || [],
        hasLegacySetupId: 'setupId' in session,
        setupId: session.setupId || 'null',
        fields: Object.keys(session)
      };
    } catch (error) {
      console.error('[SessionMigrationHelper] Error in debugSession:', error);
      return { error: error.message };
    }
  }

  // Public API
  return {
    ensureSessionResourceFields,
    ensureSessionsResourceFields,
    hasLegacySetupField,
    hasResourceBindingFields,
    assessMigrationStatus,
    getSetupIds,
    getRegionId,
    hasSetupReferences,
    filterByResourceStatus,
    normalizeSession,
    validateSessionBinding,
    debugSession
  };
})();
