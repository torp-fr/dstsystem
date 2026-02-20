/* ============================================================
   DST-SYSTEM — Module Capacity Service

   Computes SESSION CAPACITY based on selected MODULES.

   Business Rule:
   Session.capacityMax = MIN(capacityMax of all selected modules)

   This ensures the session respects the most restrictive module.

   Example:
   Module A: capacityMax = 12 people
   Module B: capacityMax = 8 people
   Session using both: capacityMax = 8

   ============================================================ */

const ModuleCapacityService = (function() {
  'use strict';

  /**
   * Get module by ID
   * @param {string} moduleId - Module identifier
   * @returns {Object|null} Module object or null
   */
  function _getModuleById(moduleId) {
    try {
      if (!moduleId) return null;

      if (typeof DB !== 'undefined' && DB.modules && DB.modules.getById) {
        return DB.modules.getById(moduleId);
      }

      // Fallback: check localStorage
      const stored = localStorage.getItem('dst_modules');
      const modules = stored ? JSON.parse(stored) : [];
      return modules.find(m => m.id === moduleId) || null;
    } catch (error) {
      console.error('[ModuleCapacityService] Error in _getModuleById:', error);
      return null;
    }
  }

  /**
   * Get default capacity if no module specifies one
   * @returns {number} Default capacity
   */
  function _getDefaultCapacity() {
    // System default: 20 people per session
    return 20;
  }

  /**
   * Compute session capacity from selected modules
   * @param {Array} moduleIds - List of module IDs selected for the session
   * @returns {Object} Capacity analysis
   *   {
   *     capacityMax,          // Minimum capacity across modules
   *     limitingModuleId,     // Module that sets the limit (if any)
   *     moduleDetails: [       // Details for each module
   *       { moduleId, moduleName, capacityMax }
   *     ],
   *     hasRestriction        // True if a module limited the capacity
   *   }
   */
  function computeSessionCapacity(moduleIds) {
    try {
      if (!moduleIds || !Array.isArray(moduleIds) || moduleIds.length === 0) {
        // No modules selected: use default capacity
        return {
          success: true,
          capacityMax: _getDefaultCapacity(),
          limitingModuleId: null,
          moduleDetails: [],
          hasRestriction: false,
          note: 'No modules selected - using system default'
        };
      }

      const moduleDetails = [];
      let minCapacity = Infinity;
      let limitingModuleId = null;

      // Process each module
      for (const moduleId of moduleIds) {
        const module = _getModuleById(moduleId);

        if (!module) {
          console.warn(`[ModuleCapacityService] Module ${moduleId} not found`);
          continue;
        }

        // Get capacity for this module
        const capacity = module.capacityMax || _getDefaultCapacity();

        moduleDetails.push({
          moduleId: module.id,
          moduleName: module.name || 'Unknown Module',
          capacityMax: capacity,
          hasLimit: module.capacityMax !== undefined && module.capacityMax !== null
        });

        // Track minimum capacity
        if (capacity < minCapacity) {
          minCapacity = capacity;
          limitingModuleId = module.id;
        }
      }

      // If no valid modules found, use default
      if (minCapacity === Infinity) {
        minCapacity = _getDefaultCapacity();
        limitingModuleId = null;
      }

      return {
        success: true,
        capacityMax: minCapacity,
        limitingModuleId,
        moduleCount: moduleIds.length,
        moduleDetails,
        hasRestriction: limitingModuleId !== null,
        note: limitingModuleId
          ? `Limited by ${moduleDetails.find(m => m.moduleId === limitingModuleId)?.moduleName || 'Module'}`
          : 'Using system default capacity'
      };
    } catch (error) {
      console.error('[ModuleCapacityService] Error in computeSessionCapacity:', error);
      return {
        success: false,
        error: error.message,
        capacityMax: _getDefaultCapacity(),
        limitingModuleId: null,
        moduleDetails: [],
        hasRestriction: false
      };
    }
  }

  /**
   * Validate if number of participants fits the modules' capacity
   * @param {Array} moduleIds - List of module IDs
   * @param {number} participantCount - Number of participants for the session
   * @returns {Object} Validation result
   *   {
   *     isValid,
   *     capacityMax,
   *     participantCount,
   *     message
   *   }
   */
  function validateParticipantCount(moduleIds, participantCount) {
    try {
      if (!Number.isInteger(participantCount) || participantCount < 0) {
        throw new Error('Participant count must be a non-negative integer');
      }

      const capacity = computeSessionCapacity(moduleIds);

      if (!capacity.success) {
        return {
          success: false,
          isValid: false,
          error: capacity.error,
          participantCount
        };
      }

      const isValid = participantCount <= capacity.capacityMax;

      return {
        success: true,
        isValid,
        capacityMax: capacity.capacityMax,
        participantCount,
        limitingModuleId: capacity.limitingModuleId,
        message: isValid
          ? `${participantCount} participants is within capacity of ${capacity.capacityMax}`
          : `${participantCount} participants exceeds capacity of ${capacity.capacityMax}. ${capacity.note}`
      };
    } catch (error) {
      console.error('[ModuleCapacityService] Error in validateParticipantCount:', error);
      return {
        success: false,
        isValid: false,
        error: error.message,
        participantCount
      };
    }
  }

  /**
   * Get capacity summary for display
   * @param {Array} moduleIds - List of module IDs
   * @returns {Object} Summary object for UI rendering
   */
  function getCapacitySummary(moduleIds) {
    try {
      const capacity = computeSessionCapacity(moduleIds);

      if (!capacity.success) {
        return {
          text: 'Capacity: Error loading modules',
          icon: 'error'
        };
      }

      const moduleNames = capacity.moduleDetails
        .map(m => m.moduleName)
        .join(', ');

      return {
        capacityMax: capacity.capacityMax,
        moduleCount: capacity.moduleCount,
        text: `Session capacity: ${capacity.capacityMax} people`,
        details: `Based on ${capacity.moduleCount} module${capacity.moduleCount !== 1 ? 's' : ''}`,
        modulesUsed: moduleNames,
        hasRestriction: capacity.hasRestriction,
        limitingModule: capacity.limitingModuleId
          ? capacity.moduleDetails.find(m => m.moduleId === capacity.limitingModuleId)?.moduleName
          : null
      };
    } catch (error) {
      console.error('[ModuleCapacityService] Error in getCapacitySummary:', error);
      return {
        text: 'Capacity: Error',
        icon: 'error'
      };
    }
  }

  /**
   * Check if a module has a capacity restriction
   * @param {string} moduleId - Module identifier
   * @returns {boolean} True if module has capacityMax defined
   */
  function hasCapacityRestriction(moduleId) {
    try {
      if (!moduleId) return false;

      const module = _getModuleById(moduleId);
      return module && module.capacityMax !== undefined && module.capacityMax !== null;
    } catch (error) {
      console.error('[ModuleCapacityService] Error in hasCapacityRestriction:', error);
      return false;
    }
  }

  /**
   * Get all modules with capacity restrictions
   * @returns {Array} Modules that have capacityMax defined
   */
  function getRestrictedModules() {
    try {
      if (typeof DB !== 'undefined' && DB.modules && DB.modules.getAll) {
        const allModules = DB.modules.getAll();
        return allModules.filter(m => m.capacityMax !== undefined && m.capacityMax !== null);
      }

      const stored = localStorage.getItem('dst_modules');
      const modules = stored ? JSON.parse(stored) : [];
      return modules.filter(m => m.capacityMax !== undefined && m.capacityMax !== null);
    } catch (error) {
      console.error('[ModuleCapacityService] Error in getRestrictedModules:', error);
      return [];
    }
  }

  // Public API
  return {
    computeSessionCapacity,
    validateParticipantCount,
    getCapacitySummary,
    hasCapacityRestriction,
    getRestrictedModules
  };
})();
