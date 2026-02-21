/* ============================================================
   DST-SYSTEM — Account Repository

   COUCHE DATA pour la gestion des comptes utilisateurs.

   Modèle:
   - Repository pattern (CRUD only, no auth)
   - Support DB.accounts interface
   - Fallback localStorage
   - Backward compatible

   Rôles:
   - 'enterprise' : Administrateur/créateur de comptes
   - 'operator' : Participant marketplace
   - 'client' : Collectivité/organisation

   Propriétés:
   - linkedEntityId : clientId ou operatorId
   - tempPassword : true si credentials temporaires
   - isActive : false si désactivé

   NO AUTH LOGIC HERE.
   NO PASSWORD HASHING HERE.
   ONLY DATA PERSISTENCE.

   ============================================================ */

const AccountRepository = (function() {
  'use strict';

  /**
   * Get all accounts from storage
   * @returns {Array} All accounts
   */
  function _getAllAccounts() {
    try {
      if (typeof DB !== 'undefined' && DB.accounts && DB.accounts.getAll) {
        return DB.accounts.getAll() || [];
      }

      const stored = localStorage.getItem('dst_accounts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[AccountRepository] Error in _getAllAccounts:', error);
      return [];
    }
  }

  /**
   * Save all accounts to storage
   * @param {Array} accounts - Array of account objects
   * @returns {boolean} Success status
   */
  function _saveAllAccounts(accounts) {
    try {
      if (!Array.isArray(accounts)) {
        throw new Error('Accounts must be an array');
      }

      if (typeof DB !== 'undefined' && DB.accounts && DB.accounts.saveAll) {
        DB.accounts.saveAll(accounts);
        return true;
      }

      localStorage.setItem('dst_accounts', JSON.stringify(accounts));
      return true;
    } catch (error) {
      console.error('[AccountRepository] Error in _saveAllAccounts:', error);
      return false;
    }
  }

  /**
   * Validate account data
   * @param {Object} data - Account data to validate
   * @returns {Object} Validation result {valid, errors}
   */
  function _validateAccount(data) {
    const errors = [];

    if (!data) {
      errors.push('Account data required');
      return { valid: false, errors };
    }

    if (!data.id) {
      errors.push('Account ID required');
    }

    if (!data.role || !['enterprise', 'operator', 'client'].includes(data.role)) {
      errors.push('Role must be one of: enterprise, operator, client');
    }

    if (!data.login) {
      errors.push('Login required');
    } else if (data.login.length < 3) {
      errors.push('Login must be at least 3 characters');
    }

    if (!data.email || !data.email.includes('@')) {
      errors.push('Valid email required');
    }

    if (data.role !== 'enterprise' && !data.linkedEntityId) {
      errors.push('linkedEntityId required for non-enterprise accounts');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create new account
   *
   * Crée un nouveau compte utilisateur.
   *
   * @param {Object} data - Account creation data
   *   {
   *     id?,                  // Generated if not provided
   *     linkedEntityId,       // clientId or operatorId (optional for enterprise)
   *     role,                 // 'enterprise' | 'operator' | 'client'
   *     login,                // Username
   *     email,                // Email address
   *     tempPassword,         // Boolean: has temporary password
   *   }
   * @returns {Object} Creation result
   */
  function createAccount(data) {
    try {
      if (!data) {
        throw new Error('Account data required');
      }

      const { linkedEntityId, role, login, email, tempPassword } = data;

      // ===== STEP 1: Validate input =====
      if (!role || !['enterprise', 'operator', 'client'].includes(role)) {
        return {
          success: false,
          error: 'INVALID_ROLE',
          message: 'Role must be one of: enterprise, operator, client'
        };
      }

      if (!login) {
        return {
          success: false,
          error: 'MISSING_LOGIN',
          message: 'Login required'
        };
      }

      if (!email || !email.includes('@')) {
        return {
          success: false,
          error: 'INVALID_EMAIL',
          message: 'Valid email required'
        };
      }

      // ===== STEP 2: Load existing accounts =====
      const allAccounts = _getAllAccounts();

      // ===== STEP 3: Check login uniqueness =====
      const loginExists = allAccounts.some(acc => acc.login === login);
      if (loginExists) {
        return {
          success: false,
          error: 'LOGIN_ALREADY_EXISTS',
          message: `Login '${login}' already in use`,
          login
        };
      }

      // ===== STEP 4: Check email uniqueness =====
      const emailExists = allAccounts.some(acc => acc.email === email);
      if (emailExists) {
        return {
          success: false,
          error: 'EMAIL_ALREADY_EXISTS',
          message: `Email '${email}' already registered`,
          email
        };
      }

      // ===== STEP 5: Create account object =====
      const accountId = data.id || `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newAccount = {
        id: accountId,
        linkedEntityId: linkedEntityId || null,
        role,
        login,
        email,
        tempPassword: tempPassword === true,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: null
      };

      // ===== STEP 6: Validate complete account =====
      const validation = _validateAccount(newAccount);
      if (!validation.valid) {
        return {
          success: false,
          error: 'VALIDATION_FAILED',
          message: 'Account validation failed',
          errors: validation.errors
        };
      }

      // ===== STEP 7: Add to accounts =====
      allAccounts.push(newAccount);

      // ===== STEP 8: Save =====
      const saved = _saveAllAccounts(allAccounts);

      if (!saved) {
        throw new Error('Failed to save accounts');
      }

      return {
        success: true,
        accountId,
        account: newAccount,
        message: `Account ${accountId} created for ${login}`
      };
    } catch (error) {
      console.error('[AccountRepository] Error in createAccount:', error);
      return {
        success: false,
        error: 'CREATION_FAILED',
        message: error.message
      };
    }
  }

  /**
   * Get account by ID
   * @param {string} accountId - Account identifier
   * @returns {Object|null} Account or null
   */
  function getById(accountId) {
    try {
      if (!accountId) return null;

      const accounts = _getAllAccounts();
      return accounts.find(acc => acc.id === accountId) || null;
    } catch (error) {
      console.error('[AccountRepository] Error in getById:', error);
      return null;
    }
  }

  /**
   * Get account by login
   * @param {string} login - Username
   * @returns {Object|null} Account or null
   */
  function getByLogin(login) {
    try {
      if (!login) return null;

      const accounts = _getAllAccounts();
      return accounts.find(acc => acc.login === login) || null;
    } catch (error) {
      console.error('[AccountRepository] Error in getByLogin:', error);
      return null;
    }
  }

  /**
   * Get account by linked entity
   * @param {string} linkedEntityId - Entity ID (clientId or operatorId)
   * @returns {Object|null} Account or null
   */
  function getByLinkedEntity(linkedEntityId) {
    try {
      if (!linkedEntityId) return null;

      const accounts = _getAllAccounts();
      return accounts.find(acc => acc.linkedEntityId === linkedEntityId) || null;
    } catch (error) {
      console.error('[AccountRepository] Error in getByLinkedEntity:', error);
      return null;
    }
  }

  /**
   * Update account
   * @param {string} accountId - Account identifier
   * @param {Object} patch - Partial account update
   * @returns {Object} Updated account or error
   */
  function update(accountId, patch) {
    try {
      if (!accountId) {
        return {
          success: false,
          error: 'ACCOUNT_ID_REQUIRED',
          message: 'Account ID required'
        };
      }

      if (!patch || Object.keys(patch).length === 0) {
        return {
          success: false,
          error: 'NO_CHANGES',
          message: 'No changes provided'
        };
      }

      // ===== STEP 1: Load accounts =====
      const accounts = _getAllAccounts();

      // ===== STEP 2: Find account =====
      const index = accounts.findIndex(acc => acc.id === accountId);

      if (index === -1) {
        return {
          success: false,
          error: 'ACCOUNT_NOT_FOUND',
          message: `Account ${accountId} not found`,
          accountId
        };
      }

      // ===== STEP 3: Update account =====
      const updated = {
        ...accounts[index],
        ...patch,
        id: accounts[index].id,
        createdAt: accounts[index].createdAt
      };

      // ===== STEP 4: Validate updated account =====
      const validation = _validateAccount(updated);
      if (!validation.valid) {
        return {
          success: false,
          error: 'VALIDATION_FAILED',
          message: 'Updated account validation failed',
          errors: validation.errors
        };
      }

      // ===== STEP 5: Update array =====
      accounts[index] = updated;

      // ===== STEP 6: Save =====
      const saved = _saveAllAccounts(accounts);

      if (!saved) {
        throw new Error('Failed to save accounts');
      }

      return {
        success: true,
        accountId,
        account: updated,
        message: `Account ${accountId} updated`
      };
    } catch (error) {
      console.error('[AccountRepository] Error in update:', error);
      return {
        success: false,
        error: 'UPDATE_FAILED',
        message: error.message,
        accountId
      };
    }
  }

  /**
   * Deactivate account
   * @param {string} accountId - Account identifier
   * @returns {Object} Deactivation result
   */
  function deactivate(accountId) {
    try {
      if (!accountId) {
        return {
          success: false,
          error: 'ACCOUNT_ID_REQUIRED',
          message: 'Account ID required'
        };
      }

      return update(accountId, {
        isActive: false,
        deactivatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('[AccountRepository] Error in deactivate:', error);
      return {
        success: false,
        error: 'DEACTIVATION_FAILED',
        message: error.message,
        accountId
      };
    }
  }

  /**
   * Get all accounts
   * @returns {Array} All accounts
   */
  function getAll() {
    try {
      return _getAllAccounts();
    } catch (error) {
      console.error('[AccountRepository] Error in getAll:', error);
      return [];
    }
  }

  /**
   * Get accounts by role
   * @param {string} role - Role to filter by
   * @returns {Array} Accounts with given role
   */
  function getByRole(role) {
    try {
      if (!role) return [];

      const accounts = _getAllAccounts();
      return accounts.filter(acc => acc.role === role);
    } catch (error) {
      console.error('[AccountRepository] Error in getByRole:', error);
      return [];
    }
  }

  /**
   * Get active accounts only
   * @returns {Array} Active accounts
   */
  function getActive() {
    try {
      const accounts = _getAllAccounts();
      return accounts.filter(acc => acc.isActive !== false);
    } catch (error) {
      console.error('[AccountRepository] Error in getActive:', error);
      return [];
    }
  }

  /**
   * Count accounts by role
   * @returns {Object} Count by role
   */
  function countByRole() {
    try {
      const accounts = _getAllAccounts();
      return {
        enterprise: accounts.filter(acc => acc.role === 'enterprise').length,
        operator: accounts.filter(acc => acc.role === 'operator').length,
        client: accounts.filter(acc => acc.role === 'client').length,
        total: accounts.length
      };
    } catch (error) {
      console.error('[AccountRepository] Error in countByRole:', error);
      return { enterprise: 0, operator: 0, client: 0, total: 0 };
    }
  }

  // Public API
  return {
    createAccount,
    getById,
    getByLogin,
    getByLinkedEntity,
    update,
    deactivate,
    getAll,
    getByRole,
    getActive,
    countByRole
  };
})();
