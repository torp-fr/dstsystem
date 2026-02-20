/* ============================================================
   DST-SYSTEM — Account Workflow

   COUCHE MÉTIER pour la gestion des comptes utilisateurs.

   Responsabilités:
   - Créer comptes clients/opérateurs automatiquement
   - Générer credentials temporaires
   - Gérer profils
   - Changement de mot de passe

   Règles métier:
   - Comptes enterprise créés manuellement uniquement
   - Comptes client/operator créés auto avec entité
   - Login format: operator_XXXX ou client_XXXX
   - Credentials temporaires requis

   Dépendances:
   - AccountRepository pour CRUD
   - Pas de logique d'authentification ici
   - Pas de hachage de mot de passe

   ============================================================ */

const AccountWorkflow = (function() {
  'use strict';

  /**
   * Generate unique login from role and entity
   * @param {string} role - Role (enterprise, operator, client)
   * @param {string} entityId - Optional entity ID
   * @returns {string} Generated login
   */
  function _generateLogin(role, entityId) {
    const suffix = entityId
      ? entityId.split('_').pop().substring(0, 8)
      : Math.random().toString(36).substr(2, 8);

    switch (role) {
      case 'operator':
        return `operator_${suffix}`;
      case 'client':
        return `client_${suffix}`;
      case 'enterprise':
        return `enterprise_${suffix}`;
      default:
        return `user_${suffix}`;
    }
  }

  /**
   * Generate temporary password
   * Format: [word]-[number]-[word]
   * Example: azure-7234-tiger
   *
   * @returns {string} Temporary password
   */
  function _generateTempPassword() {
    const words = [
      'azure', 'blaze', 'cedar', 'delta', 'eagle', 'flame', 'gamma', 'helix',
      'ivory', 'javelin', 'karma', 'lemon', 'matrix', 'nexus', 'omega', 'prism',
      'quartz', 'radar', 'sigma', 'titan', 'ultra', 'vortex', 'whisper', 'xenon'
    ];

    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(Math.random() * 10000);

    return `${word1}-${num}-${word2}`;
  }

  /**
   * Create client account automatically
   *
   * Crée un compte client quand une collectivité est créée.
   *
   * @param {string} clientId - Client entity identifier
   * @param {Object} options - Optional creation options
   *   {
   *     email?: string,
   *     login?: string
   *   }
   * @returns {Object} Account creation result
   *   {
   *     success,
   *     accountId,
   *     login,
   *     tempPassword
   *   }
   */
  function createClientAccount(clientId, options) {
    try {
      if (!clientId) {
        throw new Error('clientId required');
      }

      // ===== STEP 1: Check if account already exists =====
      const existing = AccountRepository.getByLinkedEntity(clientId);

      if (existing) {
        return {
          success: false,
          error: 'ACCOUNT_EXISTS',
          message: `Account already exists for client ${clientId}`,
          accountId: existing.id,
          login: existing.login
        };
      }

      // ===== STEP 2: Generate credentials =====
      const login = options?.login || _generateLogin('client', clientId);
      const tempPassword = _generateTempPassword();

      // ===== STEP 3: Generate email =====
      let email = options?.email;

      if (!email) {
        // Generate default email format: client_XXXX@dst-system.local
        const loginSuffix = login.split('_').pop();
        email = `${login}@dst-system.local`;
      }

      // ===== STEP 4: Create account =====
      if (typeof AccountRepository === 'undefined') {
        throw new Error('AccountRepository not available');
      }

      const created = AccountRepository.createAccount({
        linkedEntityId: clientId,
        role: 'client',
        login,
        email,
        tempPassword: true
      });

      if (!created.success) {
        return {
          success: false,
          error: created.error,
          message: created.message,
          clientId
        };
      }

      return {
        success: true,
        accountId: created.accountId,
        clientId,
        login,
        tempPassword,
        email,
        message: `Account created for client ${clientId}`
      };
    } catch (error) {
      console.error('[AccountWorkflow] Error in createClientAccount:', error);
      return {
        success: false,
        error: 'ACCOUNT_CREATION_FAILED',
        message: error.message,
        clientId
      };
    }
  }

  /**
   * Create operator account automatically
   *
   * Crée un compte opérateur quand un opérateur est créé.
   *
   * @param {string} operatorId - Operator entity identifier
   * @param {Object} options - Optional creation options
   *   {
   *     email?: string,
   *     login?: string
   *   }
   * @returns {Object} Account creation result
   *   {
   *     success,
   *     accountId,
   *     login,
   *     tempPassword
   *   }
   */
  function createOperatorAccount(operatorId, options) {
    try {
      if (!operatorId) {
        throw new Error('operatorId required');
      }

      // ===== STEP 1: Check if account already exists =====
      const existing = AccountRepository.getByLinkedEntity(operatorId);

      if (existing) {
        return {
          success: false,
          error: 'ACCOUNT_EXISTS',
          message: `Account already exists for operator ${operatorId}`,
          accountId: existing.id,
          login: existing.login
        };
      }

      // ===== STEP 2: Generate credentials =====
      const login = options?.login || _generateLogin('operator', operatorId);
      const tempPassword = _generateTempPassword();

      // ===== STEP 3: Generate email =====
      let email = options?.email;

      if (!email) {
        // Generate default email format: operator_XXXX@dst-system.local
        email = `${login}@dst-system.local`;
      }

      // ===== STEP 4: Create account =====
      if (typeof AccountRepository === 'undefined') {
        throw new Error('AccountRepository not available');
      }

      const created = AccountRepository.createAccount({
        linkedEntityId: operatorId,
        role: 'operator',
        login,
        email,
        tempPassword: true
      });

      if (!created.success) {
        return {
          success: false,
          error: created.error,
          message: created.message,
          operatorId
        };
      }

      return {
        success: true,
        accountId: created.accountId,
        operatorId,
        login,
        tempPassword,
        email,
        message: `Account created for operator ${operatorId}`
      };
    } catch (error) {
      console.error('[AccountWorkflow] Error in createOperatorAccount:', error);
      return {
        success: false,
        error: 'ACCOUNT_CREATION_FAILED',
        message: error.message,
        operatorId
      };
    }
  }

  /**
   * Generate temporary credentials for account
   *
   * Retourne les credentials temporaires pour un compte.
   * Peut être appelé pour réinitialiser credentials.
   *
   * @param {string} role - Role (enterprise, operator, client)
   * @returns {Object} Temporary credentials
   *   {
   *     login,
   *     tempPassword
   *   }
   */
  function generateTemporaryCredentials(role) {
    try {
      if (!role) {
        throw new Error('Role required');
      }

      const login = _generateLogin(role);
      const tempPassword = _generateTempPassword();

      return {
        success: true,
        login,
        tempPassword,
        message: `Credentials generated for ${role}`
      };
    } catch (error) {
      console.error('[AccountWorkflow] Error in generateTemporaryCredentials:', error);
      return {
        success: false,
        error: 'GENERATION_FAILED',
        message: error.message
      };
    }
  }

  /**
   * Update account profile
   *
   * Met à jour le profil d'un compte.
   * Peut modifier: email, tempPassword flag
   *
   * @param {string} accountId - Account identifier
   * @param {Object} patch - Profile updates
   *   {
   *     email?,
   *     tempPassword?
   *   }
   * @returns {Object} Update result
   */
  function updateAccountProfile(accountId, patch) {
    try {
      if (!accountId) {
        throw new Error('accountId required');
      }

      if (!patch || Object.keys(patch).length === 0) {
        return {
          success: false,
          error: 'NO_CHANGES',
          message: 'No profile changes provided',
          accountId
        };
      }

      // ===== STEP 1: Load account =====
      if (typeof AccountRepository === 'undefined') {
        throw new Error('AccountRepository not available');
      }

      const account = AccountRepository.getById(accountId);

      if (!account) {
        return {
          success: false,
          error: 'ACCOUNT_NOT_FOUND',
          message: `Account ${accountId} not found`,
          accountId
        };
      }

      // ===== STEP 2: Build update payload =====
      const updateData = {};

      // Only allow certain fields to be updated
      if (patch.email !== undefined) {
        updateData.email = patch.email;
      }

      if (patch.tempPassword !== undefined) {
        updateData.tempPassword = patch.tempPassword === true;
      }

      // ===== STEP 3: Update via repository =====
      const updated = AccountRepository.update(accountId, updateData);

      if (!updated.success) {
        return updated;
      }

      return {
        success: true,
        accountId,
        account: updated.account,
        message: `Account ${accountId} profile updated`
      };
    } catch (error) {
      console.error('[AccountWorkflow] Error in updateAccountProfile:', error);
      return {
        success: false,
        error: 'PROFILE_UPDATE_FAILED',
        message: error.message,
        accountId
      };
    }
  }

  /**
   * Change account password
   *
   * Marque le compte comme ayant un mot de passe permanent.
   * NOTE: Hashing réel se fait à l'authentification.
   *
   * @param {string} accountId - Account identifier
   * @param {string} newPassword - New password (NOT hashed here)
   * @returns {Object} Change result
   */
  function changePassword(accountId, newPassword) {
    try {
      if (!accountId) {
        throw new Error('accountId required');
      }

      if (!newPassword) {
        return {
          success: false,
          error: 'PASSWORD_REQUIRED',
          message: 'New password required',
          accountId
        };
      }

      if (newPassword.length < 8) {
        return {
          success: false,
          error: 'PASSWORD_TOO_SHORT',
          message: 'Password must be at least 8 characters',
          accountId
        };
      }

      // ===== STEP 1: Load account =====
      if (typeof AccountRepository === 'undefined') {
        throw new Error('AccountRepository not available');
      }

      const account = AccountRepository.getById(accountId);

      if (!account) {
        return {
          success: false,
          error: 'ACCOUNT_NOT_FOUND',
          message: `Account ${accountId} not found`,
          accountId
        };
      }

      // ===== STEP 2: Update account =====
      // Mark tempPassword as false (user set permanent password)
      const updated = AccountRepository.update(accountId, {
        tempPassword: false,
        passwordChangedAt: new Date().toISOString()
      });

      if (!updated.success) {
        return updated;
      }

      return {
        success: true,
        accountId,
        message: `Password changed for account ${accountId}`,
        tempPassword: false
      };
    } catch (error) {
      console.error('[AccountWorkflow] Error in changePassword:', error);
      return {
        success: false,
        error: 'PASSWORD_CHANGE_FAILED',
        message: error.message,
        accountId
      };
    }
  }

  /**
   * Record login timestamp
   *
   * Met à jour lastLoginAt quand l'utilisateur se connecte.
   *
   * @param {string} accountId - Account identifier
   * @returns {Object} Update result
   */
  function recordLogin(accountId) {
    try {
      if (!accountId) {
        throw new Error('accountId required');
      }

      if (typeof AccountRepository === 'undefined') {
        throw new Error('AccountRepository not available');
      }

      const updated = AccountRepository.update(accountId, {
        lastLoginAt: new Date().toISOString()
      });

      return {
        success: updated.success,
        accountId,
        message: 'Login recorded'
      };
    } catch (error) {
      console.error('[AccountWorkflow] Error in recordLogin:', error);
      return {
        success: false,
        error: 'LOGIN_RECORD_FAILED',
        message: error.message,
        accountId
      };
    }
  }

  /**
   * Get account info by login
   *
   * Récupère les infos du compte par login.
   *
   * @param {string} login - Account login
   * @returns {Object} Account info or error
   */
  function getAccountByLogin(login) {
    try {
      if (!login) {
        throw new Error('login required');
      }

      if (typeof AccountRepository === 'undefined') {
        throw new Error('AccountRepository not available');
      }

      const account = AccountRepository.getByLogin(login);

      if (!account) {
        return {
          success: false,
          error: 'ACCOUNT_NOT_FOUND',
          message: `Account with login '${login}' not found`,
          login
        };
      }

      return {
        success: true,
        account,
        message: `Account found for login '${login}'`
      };
    } catch (error) {
      console.error('[AccountWorkflow] Error in getAccountByLogin:', error);
      return {
        success: false,
        error: 'LOOKUP_FAILED',
        message: error.message,
        login
      };
    }
  }

  // Public API
  return {
    createClientAccount,
    createOperatorAccount,
    generateTemporaryCredentials,
    updateAccountProfile,
    changePassword,
    recordLogin,
    getAccountByLogin
  };
})();
