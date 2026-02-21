/* ============================================================
   DST-SYSTEM — Operator Availability Repository

   Gère la disponibilité des opérateurs
   Model logique:
   {
     operatorId,
     unavailableDates[],  // Dates where operator cannot work
     availableDates[]     // Optional: explicit available dates
   }

   IMPORTANT: This is a PLANNING HINT only.
   Enterprise validation takes precedence.
   ============================================================ */

const OperatorAvailabilityRepository = (function() {
  'use strict';

  /**
   * Get all operator availability records
   * @returns {Array} List of all operator availability entries
   */
  function getAll() {
    try {
      if (typeof DB !== 'undefined' && DB.operatorAvailability && DB.operatorAvailability.getAll) {
        return DB.operatorAvailability.getAll();
      }

      const stored = localStorage.getItem('dst_operator_availability');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[OperatorAvailabilityRepository] Error in getAll:', error);
      return [];
    }
  }

  /**
   * Get availability record for specific operator
   * @param {string} operatorId - Operator identifier
   * @returns {Object|null} Operator availability or null
   */
  function getByOperator(operatorId) {
    try {
      if (!operatorId) return null;

      if (typeof DB !== 'undefined' && DB.operatorAvailability && DB.operatorAvailability.getByOperator) {
        return DB.operatorAvailability.getByOperator(operatorId);
      }

      const all = getAll();
      return all.find(record => record.operatorId === operatorId) || null;
    } catch (error) {
      console.error('[OperatorAvailabilityRepository] Error in getByOperator:', error);
      return null;
    }
  }

  /**
   * Check if operator is available on specific date
   * @param {string} operatorId - Operator identifier
   * @param {string} date - Date (YYYY-MM-DD format)
   * @returns {boolean} True if available (no blocker found)
   */
  function isAvailableOnDate(operatorId, date) {
    try {
      if (!operatorId || !date) return false;

      const availability = getByOperator(operatorId);
      if (!availability) return true; // No restriction = available

      // Check if date is in unavailable dates
      const unavailableDates = availability.unavailableDates || [];
      if (unavailableDates.includes(date)) {
        return false; // Date is unavailable
      }

      // If availableDates is specified, only those dates are available
      const availableDates = availability.availableDates || [];
      if (availableDates.length > 0) {
        return availableDates.includes(date); // Must be in available list
      }

      // No restriction = available
      return true;
    } catch (error) {
      console.error('[OperatorAvailabilityRepository] Error in isAvailableOnDate:', error);
      return false;
    }
  }

  /**
   * Get list of unavailable dates for operator
   * @param {string} operatorId - Operator identifier
   * @returns {Array} List of unavailable dates (YYYY-MM-DD)
   */
  function getUnavailableDates(operatorId) {
    try {
      if (!operatorId) return [];

      const availability = getByOperator(operatorId);
      return availability?.unavailableDates || [];
    } catch (error) {
      console.error('[OperatorAvailabilityRepository] Error in getUnavailableDates:', error);
      return [];
    }
  }

  /**
   * Set unavailable date for operator
   * @param {string} operatorId - Operator identifier
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Object} Updated availability record
   */
  function addUnavailableDate(operatorId, date) {
    try {
      if (!operatorId || !date) {
        throw new Error('Operator ID and date are required');
      }

      if (typeof DB !== 'undefined' && DB.operatorAvailability && DB.operatorAvailability.addUnavailableDate) {
        return DB.operatorAvailability.addUnavailableDate(operatorId, date);
      }

      const all = getAll();
      let availability = all.find(record => record.operatorId === operatorId);

      if (!availability) {
        availability = {
          operatorId,
          unavailableDates: [],
          availableDates: []
        };
        all.push(availability);
      }

      // Add date if not already present
      if (!availability.unavailableDates.includes(date)) {
        availability.unavailableDates.push(date);
        availability.unavailableDates.sort(); // Keep sorted
      }

      localStorage.setItem('dst_operator_availability', JSON.stringify(all));
      return availability;
    } catch (error) {
      console.error('[OperatorAvailabilityRepository] Error in addUnavailableDate:', error);
      return { error: error.message };
    }
  }

  /**
   * Remove unavailable date
   * @param {string} operatorId - Operator identifier
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Object} Updated availability record
   */
  function removeUnavailableDate(operatorId, date) {
    try {
      if (!operatorId || !date) {
        throw new Error('Operator ID and date are required');
      }

      if (typeof DB !== 'undefined' && DB.operatorAvailability && DB.operatorAvailability.removeUnavailableDate) {
        return DB.operatorAvailability.removeUnavailableDate(operatorId, date);
      }

      const all = getAll();
      const availability = all.find(record => record.operatorId === operatorId);

      if (availability) {
        availability.unavailableDates = availability.unavailableDates.filter(d => d !== date);
        localStorage.setItem('dst_operator_availability', JSON.stringify(all));
      }

      return availability || null;
    } catch (error) {
      console.error('[OperatorAvailabilityRepository] Error in removeUnavailableDate:', error);
      return { error: error.message };
    }
  }

  /**
   * Get list of available dates (if specified as whitelist)
   * @param {string} operatorId - Operator identifier
   * @returns {Array} List of available dates (YYYY-MM-DD) or empty if no whitelist
   */
  function getAvailableDates(operatorId) {
    try {
      if (!operatorId) return [];

      const availability = getByOperator(operatorId);
      return availability?.availableDates || [];
    } catch (error) {
      console.error('[OperatorAvailabilityRepository] Error in getAvailableDates:', error);
      return [];
    }
  }

  /**
   * Set explicit available dates (whitelist mode)
   * @param {string} operatorId - Operator identifier
   * @param {Array} dates - List of available dates (YYYY-MM-DD)
   * @returns {Object} Updated availability record
   */
  function setAvailableDates(operatorId, dates) {
    try {
      if (!operatorId) {
        throw new Error('Operator ID is required');
      }

      if (!Array.isArray(dates)) {
        throw new Error('Dates must be an array');
      }

      if (typeof DB !== 'undefined' && DB.operatorAvailability && DB.operatorAvailability.setAvailableDates) {
        return DB.operatorAvailability.setAvailableDates(operatorId, dates);
      }

      const all = getAll();
      let availability = all.find(record => record.operatorId === operatorId);

      if (!availability) {
        availability = {
          operatorId,
          unavailableDates: [],
          availableDates: []
        };
        all.push(availability);
      }

      availability.availableDates = dates.sort();
      localStorage.setItem('dst_operator_availability', JSON.stringify(all));
      return availability;
    } catch (error) {
      console.error('[OperatorAvailabilityRepository] Error in setAvailableDates:', error);
      return { error: error.message };
    }
  }

  /**
   * Clear all availability restrictions for operator
   * @param {string} operatorId - Operator identifier
   * @returns {Object} Cleared availability record
   */
  function clearAvailability(operatorId) {
    try {
      if (!operatorId) {
        throw new Error('Operator ID is required');
      }

      if (typeof DB !== 'undefined' && DB.operatorAvailability && DB.operatorAvailability.clearAvailability) {
        return DB.operatorAvailability.clearAvailability(operatorId);
      }

      const all = getAll();
      let availability = all.find(record => record.operatorId === operatorId);

      if (availability) {
        availability.unavailableDates = [];
        availability.availableDates = [];
        localStorage.setItem('dst_operator_availability', JSON.stringify(all));
      }

      return availability || {
        operatorId,
        unavailableDates: [],
        availableDates: []
      };
    } catch (error) {
      console.error('[OperatorAvailabilityRepository] Error in clearAvailability:', error);
      return { error: error.message };
    }
  }

  // Public API
  return {
    getAll,
    getByOperator,
    isAvailableOnDate,
    getUnavailableDates,
    addUnavailableDate,
    removeUnavailableDate,
    getAvailableDates,
    setAvailableDates,
    clearAvailability
  };
})();
