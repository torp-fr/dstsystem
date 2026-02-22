/* ============================================================
   DST-SYSTEM — Role Guard Service

   COUCHE CONTRÔLE D'ACCÈS sans authentification.

   Responsabilités:
   - Vérifier les permissions basées sur le rôle
   - Filtrer la visibilité des sessions
   - Contrôler les actions disponibles

   Règles métier:
   enterprise:
     - Accès complet à tous les éléments
     - Peut confirmer sessions
     - Peut gérer comptes
     - Peut voir tous les opérateurs

   operator:
     - Voit sessions confirmées visibles au marketplace
     - Voit sessions où assigné
     - Peut se positionner sur marketplace
     - Ne peut pas confirmer
     - Ne peut pas gérer comptes

   client:
     - Voit UNIQUEMENT ses sessions (clientId match)
     - Ne peut pas accéder marketplace
     - Ne peut pas se positionner
     - Ne peut pas confirmer
     - Ne peut pas gérer comptes

   NOTE:
   - Pas de logique d'authentification ici
   - Pas de chiffrement/hachage ici
   - Juste vérification d'accès basée sur rôle

   Préparation pour: Supabase Row-Level-Security

   ============================================================ */

function RoleGuardService() {
  'use strict';

  /**
   * Check if account is valid and has role
   * @param {Object} account - Account object
   * @returns {boolean} Account is valid
   */
  const _isValidAccount = (account) => {
    return account && account.role && account.isActive !== false;
  };

  /**
   * Check if session is valid
   * @param {Object} session - Session object
   * @returns {boolean} Session is valid
   */
  const _isValidSession = (session) => {
    return session && session.id;
  };

  /**
   * Check if account is enterprise
   * @param {Object} account - Account object
   * @returns {boolean} Is enterprise
   */
  const _isEnterprise = (account) => {
    return account && account.role === 'enterprise';
  };

  /**
   * Check if account is operator
   * @param {Object} account - Account object
   * @returns {boolean} Is operator
   */
  const _isOperator = (account) => {
    return account && account.role === 'operator';
  };

  /**
   * Check if account is client
   * @param {Object} account - Account object
   * @returns {boolean} Is client
   */
  const _isClient = (account) => {
    return account && account.role === 'client';
  };

  /**
   * Check if operator is assigned to session
   * @param {Object} account - Operator account
   * @param {Object} session - Session object
   * @returns {boolean} Is assigned
   */
  const _isOperatorAssigned = (account, session) => {
    if (!account || !account.linkedEntityId || !session) return false;

    const operatorIds = session.operatorIds || [];
    return operatorIds.includes(account.linkedEntityId);
  };

  /**
   * Check if client owns session
   * @param {Object} account - Client account
   * @param {Object} session - Session object
   * @returns {boolean} Client owns session
   */
  const _isClientOwner = (account, session) => {
    if (!account || !account.linkedEntityId || !session) return false;

    return session.clientId === account.linkedEntityId;
  };

  /**
   * Check if session is visible on marketplace
   * @param {Object} session - Session object
   * @returns {boolean} Is marketplace visible
   */
  const _isMarketplaceVisible = (session) => {
    if (!session) return false;

    // Session must be confirmed
    if (session.status !== 'confirmed') return false;

    // marketplaceVisible must be true (defaults to true)
    if (session.marketplaceVisible === false) return false;

    // Must have setups assigned
    const setupIds = session.setupIds || [];
    if (setupIds.length === 0) return false;

    return true;
  };

  /**
   * Can account view this session
   *
   * Vérifies si le compte peut voir la session.
   *
   * Rules:
   * enterprise → YES (toujours)
   * operator:
   *   - YES si assigné à session
   *   - YES si session visible marketplace
   *   - NON sinon
   * client:
   *   - YES si session.clientId === account.linkedEntityId
   *   - NON sinon
   *
   * @param {Object} account - Account object
   * @param {Object} session - Session object
   * @returns {Object} Result
   *   {
   *     success,
   *     allowed,
   *     reason?: string
   *   }
   */
  this.canViewSession = (account, session) => {
    try {
      if (!_isValidAccount(account)) {
        return {
          success: false,
          allowed: false,
          reason: 'Invalid account'
        };
      }

      if (!_isValidSession(session)) {
        return {
          success: false,
          allowed: false,
          reason: 'Invalid session'
        };
      }

      // ===== ENTERPRISE: Full access =====
      if (_isEnterprise(account)) {
        return {
          success: true,
          allowed: true,
          reason: 'Enterprise has full access'
        };
      }

      // ===== OPERATOR: View if assigned or marketplace visible =====
      if (_isOperator(account)) {
        const isAssigned = _isOperatorAssigned(account, session);
        const isMarketplace = _isMarketplaceVisible(session);

        if (isAssigned) {
          return {
            success: true,
            allowed: true,
            reason: 'Operator is assigned to session'
          };
        }

        if (isMarketplace) {
          return {
            success: true,
            allowed: true,
            reason: 'Session is visible on marketplace'
          };
        }

        return {
          success: true,
          allowed: false,
          reason: 'Operator not assigned and session not on marketplace'
        };
      }

      // ===== CLIENT: View only own sessions =====
      if (_isClient(account)) {
        const isOwner = _isClientOwner(account, session);

        if (isOwner) {
          return {
            success: true,
            allowed: true,
            reason: 'Client owns this session'
          };
        }

        return {
          success: true,
          allowed: false,
          reason: 'Client can only view their own sessions'
        };
      }

      return {
        success: true,
        allowed: false,
        reason: 'Unknown role'
      };
    } catch (error) {
      console.error('[RoleGuardService] Error in canViewSession:', error);
      return {
        success: false,
        allowed: false,
        reason: error.message
      };
    }
  };

  /**
   * Can account edit this session
   *
   * Vérifies si le compte peut modifier la session.
   * ONLY enterprise can edit sessions.
   *
   * @param {Object} account - Account object
   * @param {Object} session - Session object
   * @returns {Object} Result
   *   {
   *     success,
   *     allowed,
   *     reason?: string
   *   }
   */
  this.canEditSession = (account, session) => {
    try {
      if (!_isValidAccount(account)) {
        return {
          success: false,
          allowed: false,
          reason: 'Invalid account'
        };
      }

      if (!_isValidSession(session)) {
        return {
          success: false,
          allowed: false,
          reason: 'Invalid session'
        };
      }

      // ===== ONLY ENTERPRISE can edit =====
      if (_isEnterprise(account)) {
        return {
          success: true,
          allowed: true,
          reason: 'Enterprise can edit sessions'
        };
      }

      return {
        success: true,
        allowed: false,
        reason: 'Only enterprise can edit sessions'
      };
    } catch (error) {
      console.error('[RoleGuardService] Error in canEditSession:', error);
      return {
        success: false,
        allowed: false,
        reason: error.message
      };
    }
  };

  /**
   * Can account access marketplace
   *
   * Vérifies si le compte peut accéder au marketplace.
   * ONLY operator can access marketplace.
   *
   * @param {Object} account - Account object
   * @returns {Object} Result
   *   {
   *     success,
   *     allowed,
   *     reason?: string
   *   }
   */
  this.canAccessMarketplace = (account) => {
    try {
      if (!_isValidAccount(account)) {
        return {
          success: false,
          allowed: false,
          reason: 'Invalid account'
        };
      }

      // ===== ONLY OPERATOR can access marketplace =====
      if (_isOperator(account)) {
        return {
          success: true,
          allowed: true,
          reason: 'Operator can access marketplace'
        };
      }

      return {
        success: true,
        allowed: false,
        reason: 'Only operators can access marketplace'
      };
    } catch (error) {
      console.error('[RoleGuardService] Error in canAccessMarketplace:', error);
      return {
        success: false,
        allowed: false,
        reason: error.message
      };
    }
  };

  /**
   * Can account apply to marketplace session
   *
   * Vérifies si le compte peut se positionner sur une session.
   * ONLY operator can apply.
   * Session must be marketplace visible.
   *
   * @param {Object} account - Account object
   * @param {Object} session - Session object (optional, for marketplace check)
   * @returns {Object} Result
   *   {
   *     success,
   *     allowed,
   *     reason?: string
   *   }
   */
  this.canApplyMarketplace = (account, session) => {
    try {
      if (!_isValidAccount(account)) {
        return {
          success: false,
          allowed: false,
          reason: 'Invalid account'
        };
      }

      // ===== ONLY OPERATOR can apply =====
      if (!_isOperator(account)) {
        return {
          success: true,
          allowed: false,
          reason: 'Only operators can apply to marketplace'
        };
      }

      // ===== If session provided, check marketplace visibility =====
      if (session && !_isMarketplaceVisible(session)) {
        return {
          success: true,
          allowed: false,
          reason: 'Session is not visible on marketplace'
        };
      }

      return {
        success: true,
        allowed: true,
        reason: 'Operator can apply to marketplace'
      };
    } catch (error) {
      console.error('[RoleGuardService] Error in canApplyMarketplace:', error);
      return {
        success: false,
        allowed: false,
        reason: error.message
      };
    }
  };

  /**
   * Can account manage accounts
   *
   * Vérifies si le compte peut gérer d'autres comptes.
   * ONLY enterprise can manage accounts.
   *
   * @param {Object} account - Account object
   * @returns {Object} Result
   *   {
   *     success,
   *     allowed,
   *     reason?: string
   *   }
   */
  this.canManageAccounts = (account) => {
    try {
      if (!_isValidAccount(account)) {
        return {
          success: false,
          allowed: false,
          reason: 'Invalid account'
        };
      }

      // ===== ONLY ENTERPRISE can manage accounts =====
      if (_isEnterprise(account)) {
        return {
          success: true,
          allowed: true,
          reason: 'Enterprise can manage accounts'
        };
      }

      return {
        success: true,
        allowed: false,
        reason: 'Only enterprise can manage accounts'
      };
    } catch (error) {
      console.error('[RoleGuardService] Error in canManageAccounts:', error);
      return {
        success: false,
        allowed: false,
        reason: error.message
      };
    }
  };

  /**
   * Can account confirm session
   *
   * Vérifies si le compte peut confirmer une session.
   * ONLY enterprise can confirm sessions.
   *
   * @param {Object} account - Account object
   * @returns {Object} Result
   *   {
   *     success,
   *     allowed,
   *     reason?: string
   *   }
   */
  this.canConfirmSession = (account) => {
    try {
      if (!_isValidAccount(account)) {
        return {
          success: false,
          allowed: false,
          reason: 'Invalid account'
        };
      }

      // ===== ONLY ENTERPRISE can confirm =====
      if (_isEnterprise(account)) {
        return {
          success: true,
          allowed: true,
          reason: 'Enterprise can confirm sessions'
        };
      }

      return {
        success: true,
        allowed: false,
        reason: 'Only enterprise can confirm sessions'
      };
    } catch (error) {
      console.error('[RoleGuardService] Error in canConfirmSession:', error);
      return {
        success: false,
        allowed: false,
        reason: error.message
      };
    }
  };

  /**
   * Get sessions visible to account
   *
   * Retourne les sessions visibles selon le rôle du compte.
   *
   * enterprise → toutes les sessions
   * operator → sessions marketplace visibles + sessions assignées
   * client → sessions de leur clientId
   *
   * @param {Object} account - Account object
   * @param {Array} allSessions - All sessions (or fetches from DB)
   * @returns {Object} Result
   *   {
   *     success,
   *     sessions: Array,
   *     count: number,
   *     role: string
   *   }
   */
  this.getVisibleSessions = (account, allSessions) => {
    try {
      if (!_isValidAccount(account)) {
        return {
          success: false,
          error: 'Invalid account',
          sessions: [],
          count: 0
        };
      }

      // ===== LOAD SESSIONS =====
      let sessions = allSessions;

      if (!sessions) {
        try {
          if (typeof DB !== 'undefined' && DB.sessions && DB.sessions.getAll) {
            sessions = DB.sessions.getAll() || [];
          } else {
            const stored = localStorage.getItem('dst_sessions');
            sessions = stored ? JSON.parse(stored) : [];
          }
        } catch (error) {
          console.error('[RoleGuardService] Error loading sessions:', error);
          sessions = [];
        }
      }

      if (!Array.isArray(sessions)) {
        sessions = [];
      }

      // ===== ENTERPRISE: All sessions =====
      if (_isEnterprise(account)) {
        return {
          success: true,
          sessions,
          count: sessions.length,
          role: 'enterprise',
          message: 'Enterprise can see all sessions'
        };
      }

      // ===== OPERATOR: Marketplace + assigned =====
      if (_isOperator(account)) {
        const operatorId = account.linkedEntityId;
        const visibleSessions = sessions.filter(session => {
          // Marketplace visible
          if (_isMarketplaceVisible(session)) {
            return true;
          }

          // Assigned to operator
          const operatorIds = session.operatorIds || [];
          if (operatorIds.includes(operatorId)) {
            return true;
          }

          return false;
        });

        return {
          success: true,
          sessions: visibleSessions,
          count: visibleSessions.length,
          role: 'operator',
          message: `Operator can see ${visibleSessions.length} sessions`
        };
      }

      // ===== CLIENT: Own sessions only =====
      if (_isClient(account)) {
        const clientId = account.linkedEntityId;
        const visibleSessions = sessions.filter(session => {
          return session.clientId === clientId;
        });

        return {
          success: true,
          sessions: visibleSessions,
          count: visibleSessions.length,
          role: 'client',
          message: `Client can see ${visibleSessions.length} sessions`
        };
      }

      return {
        success: true,
        sessions: [],
        count: 0,
        role: account.role,
        message: 'Unknown role, no sessions visible'
      };
    } catch (error) {
      console.error('[RoleGuardService] Error in getVisibleSessions:', error);
      return {
        success: false,
        error: error.message,
        sessions: [],
        count: 0
      };
    }
  };

  /**
   * Get all permissions for account
   *
   * Retourne toutes les permissions du compte.
   *
   * @param {Object} account - Account object
   * @returns {Object} Permissions summary
   */
  this.getAccountPermissions = (account) => {
    try {
      if (!_isValidAccount(account)) {
        return {
          success: false,
          error: 'Invalid account'
        };
      }

      const canView = this.canViewSession(account, { id: 'dummy' });
      const canEdit = this.canEditSession(account, { id: 'dummy' });
      const canAccess = this.canAccessMarketplace(account);
      const canApply = this.canApplyMarketplace(account);
      const canManage = this.canManageAccounts(account);
      const canConfirm = this.canConfirmSession(account);

      return {
        success: true,
        accountId: account.id,
        role: account.role,
        permissions: {
          viewSessions: canEdit.allowed,        // Can view if can edit (or broader)
          editSessions: canEdit.allowed,
          accessMarketplace: canAccess.allowed,
          applyMarketplace: canApply.allowed,
          manageAccounts: canManage.allowed,
          confirmSessions: canConfirm.allowed
        },
        summary: {
          isEnterprise: _isEnterprise(account),
          isOperator: _isOperator(account),
          isClient: _isClient(account)
        }
      };
    } catch (error) {
      console.error('[RoleGuardService] Error in getAccountPermissions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
}

// Instantiate and expose globally for Domain runtime
const roleGuardService = new RoleGuardService();
if (typeof window !== 'undefined') {
  window.RoleGuardService = roleGuardService;
}

// Backward compatibility layer for PlanningStateService
if (typeof window !== 'undefined' && window.RoleGuardService) {
  const svc = window.RoleGuardService;

  // Add legacy can() method if not present
  if (typeof svc.can !== 'function') {
    svc.can = function(permission, context) {
      // Map legacy permission names to modern methods
      switch (permission) {
        case 'view_planning_sessions':
        case 'view_session':
          if (typeof svc.canViewSession === 'function') {
            const result = svc.canViewSession(context?.account, context?.session);
            return result?.allowed !== false;
          }
          return true;

        case 'edit_session':
          if (typeof svc.canEditSession === 'function') {
            const result = svc.canEditSession(context?.account, context?.session);
            return result?.allowed !== false;
          }
          return true;

        case 'view_session_details':
        case 'view_operator_planning':
        case 'view_client_planning':
          // These are view operations, default to true if no context
          if (context?.account && typeof svc.canViewSession === 'function') {
            const result = svc.canViewSession(context.account, context.session);
            return result?.allowed !== false;
          }
          return true;

        default:
          // Safe fallback - log warning but don't break
          console.warn('[RoleGuardService.can] Unknown permission:', permission);
          return true;
      }
    };
  }

  // Add getCurrentUser() stub if not present
  if (typeof svc.getCurrentUser !== 'function') {
    svc.getCurrentUser = function() {
      // Return empty user object - will be populated by application layer
      return {};
    };
  }
}
