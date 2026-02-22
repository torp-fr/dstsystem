/* ============================================================
   DST-SYSTEM — Setup Repository

   Gère l'accès aux données SETUP
   Wraps DB layer sans le modifier
   ============================================================ */

const SetupRepository = (function() {
  'use strict';

  /**
   * Get all setups
   * @returns {Array} List of all setups
   */
  function getAll() {
    try {
      // If DB.setups exists, use it; otherwise use empty fallback
      if (typeof DB !== 'undefined' && DB.setups && DB.setups.getAll) {
        return DB.setups.getAll();
      }
      // Fallback for localStorage-based storage
      const stored = localStorage.getItem('dst_setups');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[SetupRepository] Error in getAll:', error);
      return [];
    }
  }

  /**
   * Get setups by region ID
   * @param {string} regionId - Region identifier
   * @returns {Array} Setups available in this region
   */
  function getByRegion(regionId) {
    try {
      if (!regionId) return [];

      // If DB has region-specific method, use it
      if (typeof DB !== 'undefined' && DB.setups && DB.setups.getByRegion) {
        return DB.setups.getByRegion(regionId);
      }

      // Fallback: filter from all setups
      const allSetups = getAll();
      return allSetups.filter(setup =>
        setup.regionIds && setup.regionIds.includes(regionId)
      );
    } catch (error) {
      console.error('[SetupRepository] Error in getByRegion:', error);
      return [];
    }
  }

  /**
   * Get setup by ID
   * @param {string} setupId - Setup identifier
   * @returns {Object|null} Setup object or null
   */
  function getById(setupId) {
    try {
      if (!setupId) return null;

      if (typeof DB !== 'undefined' && DB.setups && DB.setups.getById) {
        return DB.setups.getById(setupId);
      }

      const allSetups = getAll();
      return allSetups.find(setup => setup.id === setupId) || null;
    } catch (error) {
      console.error('[SetupRepository] Error in getById:', error);
      return null;
    }
  }

  /**
   * Get active setups only
   * @returns {Array} Active setups
   */
  function getActive() {
    try {
      const allSetups = getAll();
      return allSetups.filter(setup => setup.active !== false);
    } catch (error) {
      console.error('[SetupRepository] Error in getActive:', error);
      return [];
    }
  }

  /**
   * Create a new setup
   * @param {Object} setupData - Setup information
   *   @param {string} setupData.name - Setup name
   *   @param {Array} setupData.regionIds - List of region IDs
   *   @param {boolean} [setupData.active] - Active status (default: true)
   * @returns {Object} Created setup with ID
   */
  function create(setupData) {
    try {
      if (!setupData || !setupData.name) {
        throw new Error('Setup name is required');
      }
      if (!setupData.regionIds || !Array.isArray(setupData.regionIds) || setupData.regionIds.length === 0) {
        throw new Error('Setup must be linked to at least one region');
      }

      const newSetup = {
        id: `setup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: setupData.name,
        regionIds: setupData.regionIds,
        active: setupData.active !== false,
        createdAt: new Date().toISOString()
      };

      if (typeof DB !== 'undefined' && DB.setups && DB.setups.create) {
        return DB.setups.create(newSetup);
      }

      // Fallback: persist to localStorage
      const allSetups = getAll();
      allSetups.push(newSetup);
      localStorage.setItem('dst_setups', JSON.stringify(allSetups));

      return newSetup;
    } catch (error) {
      console.error('[SetupRepository] Error in create:', error);
      return { error: error.message };
    }
  }

  /**
   * Update setup
   * @param {string} setupId - Setup identifier
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated setup
   */
  function update(setupId, updates) {
    try {
      if (!setupId) {
        throw new Error('Setup ID is required');
      }

      if (typeof DB !== 'undefined' && DB.setups && DB.setups.update) {
        return DB.setups.update(setupId, updates);
      }

      // Fallback: update in localStorage
      const allSetups = getAll();
      const setupIndex = allSetups.findIndex(s => s.id === setupId);

      if (setupIndex === -1) {
        throw new Error(`Setup ${setupId} not found`);
      }

      allSetups[setupIndex] = {
        ...allSetups[setupIndex],
        ...updates,
        id: setupId // Prevent ID change
      };

      localStorage.setItem('dst_setups', JSON.stringify(allSetups));
      return allSetups[setupIndex];
    } catch (error) {
      console.error('[SetupRepository] Error in update:', error);
      return { error: error.message };
    }
  }

  /**
   * Delete setup (soft delete by deactivating)
   * @param {string} setupId - Setup identifier
   * @returns {Object} Result with success status
   */
  function delete_setup(setupId) {
    try {
      if (!setupId) {
        throw new Error('Setup ID is required');
      }

      return update(setupId, { active: false });
    } catch (error) {
      console.error('[SetupRepository] Error in delete:', error);
      return { error: error.message };
    }
  }

  // Public API
  return {
    getAll,
    getByRegion,
    getById,
    getActive,
    create,
    update,
    delete: delete_setup
  };
})();
