/* ============================================================
   DST-SYSTEM — Availability Engine

   CORE BUSINESS LOGIC:
   Calculate available SETUPS per date and region.
   This is the foundation for session booking.

   A SETUP = one simulator + one operator requirement + one region.
   If a session books a setup, that setup is unavailable that day.

   Booking Model: Similar to booking.com
   - Each region has N setups
   - Each session books 1 setup per day
   - Operator availability is a PLANNING HINT (enterprise validates)

   ============================================================ */

const AvailabilityEngine = (function() {
  'use strict';

  /**
   * Get sessions that use any setup in the given region on a specific date
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} regionId - Region identifier
   * @returns {Array} Sessions using setups in this region on this date
   */
  function _getSessionsOnDateInRegion(date, regionId) {
    try {
      // Get all sessions
      const sessions = typeof DB !== 'undefined' && DB.sessions
        ? DB.sessions.getAll()
        : [];

      // Get setups in this region
      const setups = SetupRepository.getByRegion(regionId);
      const setupIds = setups.map(s => s.id);

      // Filter sessions that:
      // 1. Have a date matching the requested date
      // 2. Use a setup from this region
      // 3. Are active (not cancelled)
      return sessions.filter(session => {
        const sessionDate = session.date || session.scheduledDate;

        // CRITICAL FIX: Handle both new (setupIds array) and legacy (setupId string) fields
        const sessionSetupIds = session.setupIds || (session.setupId ? [session.setupId] : []);

        // Check if session uses any setup in this region
        const usesRegionSetup = sessionSetupIds.some(sessionSetupId =>
          setupIds.includes(sessionSetupId)
        );

        return sessionDate === date &&
               usesRegionSetup &&
               session.status !== 'cancelled';
      });
    } catch (error) {
      console.error('[AvailabilityEngine] Error in _getSessionsOnDateInRegion:', error);
      return [];
    }
  }

  /**
   * Count setups already used by sessions on a date
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} regionId - Region identifier
   * @returns {number} Number of setups currently used
   */
  function _countUsedSetups(date, regionId) {
    try {
      const sessions = _getSessionsOnDateInRegion(date, regionId);

      // CRITICAL FIX: Count actual setups used, not sessions
      // A session may use multiple setups
      const usedSetupIds = new Set();

      sessions.forEach(session => {
        // Handle both new (setupIds array) and legacy (setupId string) fields
        const sessionSetupIds = session.setupIds || (session.setupId ? [session.setupId] : []);
        sessionSetupIds.forEach(setupId => {
          usedSetupIds.add(setupId);
        });
      });

      return usedSetupIds.size;
    } catch (error) {
      console.error('[AvailabilityEngine] Error in _countUsedSetups:', error);
      return 0;
    }
  }

  /**
   * Get operators available on a specific date
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Array} List of available operator IDs
   */
  function _getAvailableOperators(date) {
    try {
      // Get all operators
      const operators = typeof DB !== 'undefined' && DB.operators
        ? DB.operators.getAll()
        : [];

      // Filter by operator availability declaration
      // If operator has declared unavailable dates, exclude
      return operators.filter(operator => {
        if (!operator || !operator.id) return false;
        return OperatorAvailabilityRepository.isAvailableOnDate(operator.id, date);
      });
    } catch (error) {
      console.error('[AvailabilityEngine] Error in _getAvailableOperators:', error);
      return [];
    }
  }

  /**
   * Count setups in a region that have an available operator
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} regionId - Region identifier
   * @returns {number} Number of setups with available operators
   */
  function _countSetupsWithAvailableOperators(date, regionId) {
    try {
      const setups = SetupRepository.getByRegion(regionId);
      const availableOperators = _getAvailableOperators(date);
      const availableOperatorIds = availableOperators.map(op => op.id);

      // Count setups that have at least one available operator
      // Note: In real system, operator-setup assignments would be tracked
      // For now, we assume operators are pool-based (any available can work any setup)
      if (availableOperators.length === 0) {
        return 0; // No operators available = no setups can work
      }

      return setups.length; // All setups can work if operators are available
    } catch (error) {
      console.error('[AvailabilityEngine] Error in _countSetupsWithAvailableOperators:', error);
      return 0;
    }
  }

  /**
   * Get available setups for a specific date and region
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} regionId - Region identifier
   * @returns {Object} Availability information
   *   {
   *     date,
   *     regionId,
   *     totalSetups,          // Total setups in region
   *     usedSetups,           // Setups booked by existing sessions
   *     availableSetups,      // Free setups
   *     setupsWithOperators,  // Setups with available operators
   *     operatorsAvailable,   // Count of available operators
   *     isAvailable,          // True if at least 1 setup available
   *     details: {
   *       usedBy: []          // Sessions using setups this day
   *     }
   *   }
   */
  function getAvailableSetups(date, regionId) {
    try {
      if (!date || !regionId) {
        throw new Error('Date and regionId are required');
      }

      // Get total setups in region
      const setups = SetupRepository.getByRegion(regionId);
      const activeSetups = setups.filter(s => s.active !== false);
      const totalSetups = activeSetups.length;

      // Count used setups
      const usedSetups = _countUsedSetups(date, regionId);

      // Calculate free setups
      const freeSetups = Math.max(0, totalSetups - usedSetups);

      // Get operator availability
      const availableOperators = _getAvailableOperators(date);
      const operatorsAvailable = availableOperators.length;

      // CRITICAL FIX: availableSetups = MIN(setupsFree, operatorsAvailable)
      // This ensures we never book more setups than we have operators for
      const availableSetups = Math.min(freeSetups, operatorsAvailable);

      // Get sessions using setups this day
      const sessionsUsing = _getSessionsOnDateInRegion(date, regionId);

      return {
        success: true,
        date,
        regionId,
        totalSetups,
        usedSetups,
        freeSetups,
        availableSetups,
        operatorsAvailable,
        isAvailable: availableSetups > 0,
        details: {
          usedBy: sessionsUsing.map(s => {
            const sessionSetupIds = s.setupIds || (s.setupId ? [s.setupId] : []);
            return {
              sessionId: s.id,
              clientId: s.clientId,
              setupIds: sessionSetupIds
            };
          })
        }
      };
    } catch (error) {
      console.error('[AvailabilityEngine] Error in getAvailableSetups:', error);
      return {
        success: false,
        error: error.message,
        availableSetups: 0,
        isAvailable: false
      };
    }
  }

  /**
   * Check if a specific number of setups are available on a date
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} regionId - Region identifier
   * @param {number} setupRequiredCount - Number of setups needed (default: 1)
   * @returns {boolean} True if enough setups are available
   */
  function isDateAvailable(date, regionId, setupRequiredCount = 1) {
    try {
      if (!date || !regionId) {
        throw new Error('Date and regionId are required');
      }

      const availability = getAvailableSetups(date, regionId);
      return availability.success &&
             availability.availableSetups >= setupRequiredCount &&
             availability.operatorsAvailable > 0;
    } catch (error) {
      console.error('[AvailabilityEngine] Error in isDateAvailable:', error);
      return false;
    }
  }

  /**
   * Get availability calendar for a region (next 90 days)
   * @param {string} regionId - Region identifier
   * @param {number} daysAhead - Number of days to calculate (default: 90)
   * @returns {Object} Calendar with availability per day
   */
  function getAvailabilityCalendar(regionId, daysAhead = 90) {
    try {
      if (!regionId) {
        throw new Error('RegionId is required');
      }

      const calendar = {
        success: true,
        regionId,
        startDate: new Date().toISOString().split('T')[0],
        daysAhead,
        totalSetups: SetupRepository.getByRegion(regionId).filter(s => s.active !== false).length,
        days: []
      };

      // Generate calendar for next N days
      const today = new Date();
      for (let i = 0; i < daysAhead; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const availability = getAvailableSetups(dateStr, regionId);
        calendar.days.push({
          date: dateStr,
          dayOfWeek: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
          availableSetups: availability.availableSetups,
          operatorsAvailable: availability.operatorsAvailable,
          isAvailable: availability.isAvailable,
          usedSetups: availability.usedSetups
        });
      }

      // Summary statistics
      const availableDays = calendar.days.filter(d => d.isAvailable).length;
      calendar.summary = {
        totalDays: calendar.days.length,
        availableDays,
        utilizationPercentage: calendar.totalSetups > 0
          ? Math.round(((calendar.daysAhead * calendar.totalSetups) -
               calendar.days.reduce((sum, d) => sum + d.availableSetups, 0)) /
              (calendar.daysAhead * calendar.totalSetups) * 100)
          : 0
      };

      return calendar;
    } catch (error) {
      console.error('[AvailabilityEngine] Error in getAvailabilityCalendar:', error);
      return {
        success: false,
        error: error.message,
        days: []
      };
    }
  }

  /**
   * Get first available date in next N days
   * @param {string} regionId - Region identifier
   * @param {number} daysAhead - Max days to search (default: 90)
   * @returns {string|null} First available date or null
   */
  function getFirstAvailableDate(regionId, daysAhead = 90) {
    try {
      if (!regionId) {
        throw new Error('RegionId is required');
      }

      const today = new Date();
      for (let i = 0; i < daysAhead; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        if (isDateAvailable(dateStr, regionId)) {
          return dateStr;
        }
      }

      return null;
    } catch (error) {
      console.error('[AvailabilityEngine] Error in getFirstAvailableDate:', error);
      return null;
    }
  }

  /**
   * Get next N available dates
   * @param {string} regionId - Region identifier
   * @param {number} count - Number of available dates to return (default: 5)
   * @param {number} maxDaysSearch - Maximum days to search (default: 180)
   * @returns {Array} List of available dates
   */
  function getAvailableDates(regionId, count = 5, maxDaysSearch = 180) {
    try {
      if (!regionId) {
        throw new Error('RegionId is required');
      }

      const availableDates = [];
      const today = new Date();

      for (let i = 0; i < maxDaysSearch && availableDates.length < count; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        if (isDateAvailable(dateStr, regionId)) {
          availableDates.push(dateStr);
        }
      }

      return availableDates;
    } catch (error) {
      console.error('[AvailabilityEngine] Error in getAvailableDates:', error);
      return [];
    }
  }

  /**
   * Get availability analysis for capacity planning
   * @param {string} regionId - Region identifier
   * @param {number} daysAhead - Number of days to analyze (default: 90)
   * @returns {Object} Capacity analysis
   */
  function getCapacityAnalysis(regionId, daysAhead = 90) {
    try {
      if (!regionId) {
        throw new Error('RegionId is required');
      }

      const calendar = getAvailabilityCalendar(regionId, daysAhead);

      if (!calendar.success) {
        return { success: false, error: calendar.error };
      }

      const analysis = {
        success: true,
        regionId,
        period: {
          days: daysAhead,
          startDate: calendar.startDate
        },
        capacity: {
          totalSetups: calendar.totalSetups,
          potentialSessionSlots: calendar.totalSetups * daysAhead
        },
        utilization: {
          bookedSessionSlots: calendar.days.reduce((sum, d) => sum + d.usedSetups, 0),
          utilizationPercentage: calendar.summary.utilizationPercentage,
          peakDay: null,
          slowestDay: null
        },
        constraints: {
          daysWithoutOperators: calendar.days.filter(d => d.operatorsAvailable === 0).length,
          daysFullyBooked: calendar.days.filter(d => d.availableSetups === 0).length,
          daysPartiallyAvailable: calendar.days.filter(d => d.availableSetups > 0 && d.availableSetups < calendar.totalSetups).length
        }
      };

      // Find peak and slowest days
      if (calendar.days.length > 0) {
        let peakDay = calendar.days[0];
        let slowestDay = calendar.days[0];

        calendar.days.forEach(day => {
          if (day.usedSetups > peakDay.usedSetups) peakDay = day;
          if (day.usedSetups < slowestDay.usedSetups) slowestDay = day;
        });

        analysis.utilization.peakDay = {
          date: peakDay.date,
          usedSetups: peakDay.usedSetups,
          availableSetups: peakDay.availableSetups
        };

        analysis.utilization.slowestDay = {
          date: slowestDay.date,
          usedSetups: slowestDay.usedSetups,
          availableSetups: slowestDay.availableSetups
        };
      }

      return analysis;
    } catch (error) {
      console.error('[AvailabilityEngine] Error in getCapacityAnalysis:', error);
      return { success: false, error: error.message };
    }
  }

  // Public API
  return {
    getAvailableSetups,
    isDateAvailable,
    getAvailabilityCalendar,
    getFirstAvailableDate,
    getAvailableDates,
    getCapacityAnalysis
  };
})();
