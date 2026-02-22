/* ============================================================
   DST-SYSTEM — Supabase Adapter Layer

   PURE DATA ACCESS LAYER (NO business logic)

   Translates Domain layer operations into Supabase relational queries.

   Responsibilities:
   - Query Supabase tables
   - Project results into Domain shapes
   - Handle array/join table translations
   - Enforce RLS (automatic via Supabase client)

   DO NOT implement:
   - Business logic (that's Workflows)
   - Access control (that's RoleGuardService + RLS)
   - Data validation (that's Domain)

   All queries automatically use auth.uid() from JWT token,
   which triggers Supabase RLS policies automatically.

   ============================================================ */

const SupabaseAdapter = (function() {
  'use strict';

  // Initialize Supabase client
  // Assumes window.supabase is set from Supabase CDN or SDK
  const supabase = window.supabase;

  if (!supabase) {
    console.warn('[SupabaseAdapter] Waiting for window.supabase...');
    setTimeout(() => window.location.reload(), 200);
    throw new Error('[SupabaseAdapter] Supabase not ready yet');
  }

  // ============================================================
  // SESSION REPOSITORY ADAPTER
  // ============================================================

  /**
   * Session Repository Adapter
   *
   * Translates Domain session operations to Supabase queries.
   * Maps relational schema to Domain JSON structure.
   */
  const SessionRepository = {
    /**
     * Get single session with operators populated
     *
     * Domain expects: { id, clientId, operatorIds[], marketplaceVisible, ... }
     * Supabase has: shooting_sessions + session_operators join table
     *
     * Translation logic:
     * 1. Query shooting_sessions
     * 2. LEFT JOIN session_operators
     * 3. Filter operatorIds to only status='accepted'
     * 4. Project to Domain shape
     *
     * @param {string} sessionId - Session ID (UUID)
     * @returns {Object|null} Domain session object or null
     */
    async getSession(sessionId) {
      try {
        // STEP 1: Query session with all operators (both pending and accepted)
        const { data: session, error: sessionError } = await supabase
          .from('shooting_sessions')
          .select(`
            id,
            client_id,
            region,
            date,
            status,
            setup_ids,
            marketplace_visible,
            operator_requirement,
            created_at,
            updated_at,
            confirmed_at,
            session_operators (
              operator_id,
              status,
              applied_at,
              responded_at,
              rejection_reason
            )
          `)
          .eq('id', sessionId)
          .single();

        if (sessionError) {
          // PGRST116 = no rows (RLS denied or not found)
          if (sessionError.code === 'PGRST116') {
            return null;
          }
          throw sessionError;
        }

        // STEP 2: Project to Domain shape
        // Extract only accepted operators (for operatorIds)
        const acceptedOperators = (session.session_operators || [])
          .filter(app => app.status === 'accepted')
          .map(app => app.operator_id);

        // STEP 3: Transform Supabase shape to Domain shape
        const domainSession = {
          id: session.id,
          clientId: session.client_id,
          regionId: session.region,
          date: session.date,
          status: session.status,
          setupIds: session.setup_ids || [],
          operatorIds: acceptedOperators,
          marketplaceVisible: session.marketplace_visible !== false,
          operatorRequirement: session.operator_requirement || { minOperators: 1 },
          operatorApplications: (session.session_operators || []).map(app => ({
            id: app.operator_id,  // Simplified: would be full app ID in real system
            operatorId: app.operator_id,
            status: app.status,
            appliedAt: app.applied_at,
            respondedAt: app.responded_at,
            rejectionReason: app.rejection_reason
          })),
          createdAt: session.created_at,
          confirmedAt: session.confirmed_at,
          updatedAt: session.updated_at
        };

        return domainSession;
      } catch (error) {
        console.error('[SupabaseAdapter.SessionRepository.getSession]', error);
        throw error;
      }
    },

    /**
     * Get all sessions visible to current user
     *
     * RLS policies automatically filter based on auth.uid() + role
     * (Enterprise: all, Operator: marketplace + assigned, Client: own only)
     *
     * @param {Object} filters - Optional filters
     * @returns {Array} Array of Domain session objects
     */
    async listSessions(filters = {}) {
      try {
        let query = supabase
          .from('shooting_sessions')
          .select(`
            id,
            client_id,
            region,
            date,
            status,
            setup_ids,
            marketplace_visible,
            created_at,
            session_operators (
              operator_id,
              status
            )
          `);

        // Apply optional filters (RLS still applies)
        if (filters.regionId) {
          query = query.eq('region', filters.regionId);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.marketplaceVisible) {
          query = query.eq('marketplace_visible', true);
        }

        const { data: sessions, error } = await query.order('date', { ascending: true });

        if (error) throw error;

        // Project each session to Domain shape
        return (sessions || []).map(session => ({
          id: session.id,
          clientId: session.client_id,
          regionId: session.region,
          date: session.date,
          status: session.status,
          setupIds: session.setup_ids || [],
          operatorIds: (session.session_operators || [])
            .filter(app => app.status === 'accepted')
            .map(app => app.operator_id),
          marketplaceVisible: session.marketplace_visible !== false,
          createdAt: session.created_at
        }));
      } catch (error) {
        console.error('[SupabaseAdapter.SessionRepository.listSessions]', error);
        throw error;
      }
    },

    /**
     * Update session (status, etc.)
     *
     * RLS policy: Only enterprise can UPDATE
     *
     * @param {string} sessionId - Session ID
     * @param {Object} patch - Fields to update
     * @returns {Object} Updated session
     */
    async updateSession(sessionId, patch) {
      try {
        const { data, error } = await supabase
          .from('shooting_sessions')
          .update(patch)
          .eq('id', sessionId)
          .select()
          .single();

        if (error) throw error;

        return data;
      } catch (error) {
        console.error('[SupabaseAdapter.SessionRepository.updateSession]', error);
        throw error;
      }
    },

    /**
     * Get operator IDs for session (accepted only)
     *
     * @param {string} sessionId - Session ID
     * @returns {Array<string>} Operator IDs
     */
    async getOperatorIds(sessionId) {
      try {
        const { data, error } = await supabase
          .from('session_operators')
          .select('operator_id')
          .eq('session_id', sessionId)
          .eq('status', 'accepted');

        if (error) throw error;

        return (data || []).map(row => row.operator_id);
      } catch (error) {
        console.error('[SupabaseAdapter.SessionRepository.getOperatorIds]', error);
        throw error;
      }
    }
  };

  // ============================================================
  // OPERATOR REPOSITORY ADAPTER
  // ============================================================

  const OperatorRepository = {
    /**
     * Get operator by ID
     *
     * @param {string} operatorId - Operator ID (UUID)
     * @returns {Object|null} Domain operator object
     */
    async getOperator(operatorId) {
      try {
        const { data, error } = await supabase
          .from('operators')
          .select('*')
          .eq('id', operatorId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        // Project to Domain shape
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          region: data.region,
          availability: data.availability || { unavailableDates: [] },
          isActive: data.is_active !== false,
          createdAt: data.created_at
        };
      } catch (error) {
        console.error('[SupabaseAdapter.OperatorRepository.getOperator]', error);
        throw error;
      }
    },

    /**
     * Get operators by region
     *
     * @param {string} regionId - Region identifier
     * @returns {Array} Array of operators
     */
    async getByRegion(regionId) {
      try {
        const { data, error } = await supabase
          .from('operators')
          .select('*')
          .eq('region', regionId)
          .eq('is_active', true);

        if (error) throw error;

        return (data || []).map(op => ({
          id: op.id,
          name: op.name,
          email: op.email,
          region: op.region,
          isActive: op.is_active
        }));
      } catch (error) {
        console.error('[SupabaseAdapter.OperatorRepository.getByRegion]', error);
        throw error;
      }
    },

    /**
     * Update operator
     *
     * RLS policy: Operator can update self, Enterprise can update any
     *
     * @param {string} operatorId - Operator ID
     * @param {Object} patch - Fields to update
     * @returns {Object} Updated operator
     */
    async updateOperator(operatorId, patch) {
      try {
        const { data, error } = await supabase
          .from('operators')
          .update(patch)
          .eq('id', operatorId)
          .select()
          .single();

        if (error) throw error;

        return data;
      } catch (error) {
        console.error('[SupabaseAdapter.OperatorRepository.updateOperator]', error);
        throw error;
      }
    }
  };

  // ============================================================
  // CLIENT REPOSITORY ADAPTER
  // ============================================================

  const ClientRepository = {
    /**
     * Get client by ID
     *
     * @param {string} clientId - Client ID (UUID)
     * @returns {Object|null} Domain client object
     */
    async getClient(clientId) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        return {
          id: data.id,
          organizationName: data.organization_name,
          contactEmail: data.contact_email,
          region: data.region,
          isActive: data.is_active !== false,
          createdAt: data.created_at
        };
      } catch (error) {
        console.error('[SupabaseAdapter.ClientRepository.getClient]', error);
        throw error;
      }
    },

    /**
     * Get clients by region
     *
     * @param {string} regionId - Region identifier
     * @returns {Array} Array of clients
     */
    async getByRegion(regionId) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('region', regionId)
          .eq('is_active', true);

        if (error) throw error;

        return (data || []).map(client => ({
          id: client.id,
          organizationName: client.organization_name,
          contactEmail: client.contact_email,
          region: client.region,
          isActive: client.is_active
        }));
      } catch (error) {
        console.error('[SupabaseAdapter.ClientRepository.getByRegion]', error);
        throw error;
      }
    },

    /**
     * Update client
     *
     * RLS policy: Client can update self, Enterprise can update any
     *
     * @param {string} clientId - Client ID
     * @param {Object} patch - Fields to update
     * @returns {Object} Updated client
     */
    async updateClient(clientId, patch) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .update(patch)
          .eq('id', clientId)
          .select()
          .single();

        if (error) throw error;

        return data;
      } catch (error) {
        console.error('[SupabaseAdapter.ClientRepository.updateClient]', error);
        throw error;
      }
    }
  };

  // ============================================================
  // ACCOUNT REPOSITORY ADAPTER
  // ============================================================

  const AccountRepository = {
    /**
     * Get account by user ID
     *
     * Translation:
     * Domain: accounts table
     * Supabase: user_profiles + auth.users join
     *
     * @param {string} userId - User ID (auth.uid())
     * @returns {Object|null} Domain account object
     */
    async getAccountByAuthUser(userId) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select(`
            id,
            user_id,
            role,
            operator_id,
            client_id,
            temp_password,
            is_active,
            created_at,
            last_login_at,
            user:auth.users(email, last_sign_in_at)
          `)
          .eq('user_id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        // Project to Domain shape
        return {
          id: data.id,
          linkedEntityId: data.operator_id || data.client_id,
          role: data.role,
          login: data.user.email,
          email: data.user.email,
          tempPassword: data.temp_password !== false,
          isActive: data.is_active !== false,
          createdAt: data.created_at,
          lastLoginAt: data.last_login_at || data.user.last_sign_in_at
        };
      } catch (error) {
        console.error('[SupabaseAdapter.AccountRepository.getAccountByAuthUser]', error);
        throw error;
      }
    },

    /**
     * Get account by ID
     *
     * @param {string} accountId - Account ID
     * @returns {Object|null} Domain account object
     */
    async getAccountById(accountId) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select(`
            id,
            user_id,
            role,
            operator_id,
            client_id,
            temp_password,
            is_active,
            created_at,
            last_login_at,
            user:auth.users(email, last_sign_in_at)
          `)
          .eq('id', accountId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        return {
          id: data.id,
          linkedEntityId: data.operator_id || data.client_id,
          role: data.role,
          login: data.user.email,
          email: data.user.email,
          tempPassword: data.temp_password !== false,
          isActive: data.is_active !== false,
          createdAt: data.created_at,
          lastLoginAt: data.last_login_at || data.user.last_sign_in_at
        };
      } catch (error) {
        console.error('[SupabaseAdapter.AccountRepository.getAccountById]', error);
        throw error;
      }
    },

    /**
     * Create account (link auth user to operator/client)
     *
     * RLS policy: Enterprise only
     *
     * @param {Object} data - Account creation data
     * @returns {Object} Created account
     */
    async createAccount(data) {
      try {
        const { data: result, error } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: data.user_id,
            role: data.role,
            operator_id: data.operator_id || null,
            client_id: data.client_id || null,
            temp_password: data.temp_password !== false,
            is_active: true
          }])
          .select()
          .single();

        if (error) throw error;

        return result;
      } catch (error) {
        console.error('[SupabaseAdapter.AccountRepository.createAccount]', error);
        throw error;
      }
    },

    /**
     * Update account
     *
     * RLS policy: User can update self, Enterprise can update any
     *
     * @param {string} accountId - Account ID
     * @param {Object} patch - Fields to update
     * @returns {Object} Updated account
     */
    async updateAccount(accountId, patch) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .update(patch)
          .eq('id', accountId)
          .select()
          .single();

        if (error) throw error;

        return data;
      } catch (error) {
        console.error('[SupabaseAdapter.AccountRepository.updateAccount]', error);
        throw error;
      }
    }
  };

  // ============================================================
  // OPERATOR APPLICATIONS ADAPTER (Marketplace)
  // ============================================================

  const ApplicationRepository = {
    /**
     * Apply operator to session
     *
     * Translation:
     * Domain: Insert into operatorApplications JSONB array
     * Supabase: INSERT into session_operators (relational)
     *
     * RLS policy: Operator can INSERT, session must be marketplace visible
     *
     * @param {string} operatorId - Operator ID
     * @param {string} sessionId - Session ID
     * @returns {Object} Created application record
     */
    async applyToSession(operatorId, sessionId) {
      try {
        const { data, error } = await supabase
          .from('session_operators')
          .insert([{
            session_id: sessionId,
            operator_id: operatorId,
            status: 'pending',
            applied_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          // Handle duplicate key (already applied)
          if (error.code === '23505') {
            return {
              success: false,
              error: 'ALREADY_APPLIED',
              message: 'Operator already applied to this session'
            };
          }
          throw error;
        }

        return {
          success: true,
          applicationId: data.id || `${operatorId}_${sessionId}`,
          status: 'pending',
          appliedAt: data.applied_at
        };
      } catch (error) {
        console.error('[SupabaseAdapter.ApplicationRepository.applyToSession]', error);
        throw error;
      }
    },

    /**
     * Accept operator application
     *
     * Translation:
     * Domain: Update operatorApplications.status to 'accepted'
     * Supabase: UPDATE session_operators SET status='accepted'
     *
     * RLS policy: Enterprise only
     *
     * @param {string} operatorId - Operator ID
     * @param {string} sessionId - Session ID
     * @returns {Object} Updated application
     */
    async acceptOperator(operatorId, sessionId) {
      try {
        const { data, error } = await supabase
          .from('session_operators')
          .update({
            status: 'accepted',
            responded_at: new Date().toISOString()
          })
          .match({
            session_id: sessionId,
            operator_id: operatorId
          })
          .select()
          .single();

        if (error) throw error;

        if (!data) {
          return {
            success: false,
            error: 'APPLICATION_NOT_FOUND'
          };
        }

        return {
          success: true,
          applicationId: data.id || `${operatorId}_${sessionId}`,
          status: 'accepted',
          respondedAt: data.responded_at
        };
      } catch (error) {
        console.error('[SupabaseAdapter.ApplicationRepository.acceptOperator]', error);
        throw error;
      }
    },

    /**
     * Reject operator application
     *
     * Translation:
     * Domain: Update operatorApplications.status to 'rejected'
     * Supabase: UPDATE session_operators SET status='rejected'
     *
     * RLS policy: Enterprise only
     *
     * @param {string} operatorId - Operator ID
     * @param {string} sessionId - Session ID
     * @param {string} reason - Optional rejection reason
     * @returns {Object} Updated application
     */
    async rejectOperator(operatorId, sessionId, reason) {
      try {
        const { data, error } = await supabase
          .from('session_operators')
          .update({
            status: 'rejected',
            responded_at: new Date().toISOString(),
            rejection_reason: reason || null
          })
          .match({
            session_id: sessionId,
            operator_id: operatorId
          })
          .select()
          .single();

        if (error) throw error;

        if (!data) {
          return {
            success: false,
            error: 'APPLICATION_NOT_FOUND'
          };
        }

        return {
          success: true,
          applicationId: data.id || `${operatorId}_${sessionId}`,
          status: 'rejected',
          respondedAt: data.responded_at,
          rejectionReason: reason
        };
      } catch (error) {
        console.error('[SupabaseAdapter.ApplicationRepository.rejectOperator]', error);
        throw error;
      }
    },

    /**
     * Get pending applications for session
     *
     * @param {string} sessionId - Session ID
     * @returns {Array} Array of pending applications
     */
    async getPendingApplications(sessionId) {
      try {
        const { data, error } = await supabase
          .from('session_operators')
          .select('*')
          .eq('session_id', sessionId)
          .eq('status', 'pending')
          .order('applied_at', { ascending: true });

        if (error) throw error;

        return (data || []).map(app => ({
          applicationId: app.id || `${app.operator_id}_${sessionId}`,
          operatorId: app.operator_id,
          status: app.status,
          appliedAt: app.applied_at,
          respondedAt: app.responded_at
        }));
      } catch (error) {
        console.error('[SupabaseAdapter.ApplicationRepository.getPendingApplications]', error);
        throw error;
      }
    },

    /**
     * Get operator applications (all statuses)
     *
     * @param {string} operatorId - Operator ID
     * @returns {Array} Array of applications
     */
    async getOperatorApplications(operatorId) {
      try {
        const { data, error } = await supabase
          .from('session_operators')
          .select(`
            id,
            session_id,
            status,
            applied_at,
            responded_at,
            rejection_reason,
            session:shooting_sessions(id, date, region, status)
          `)
          .eq('operator_id', operatorId)
          .order('applied_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(app => ({
          applicationId: app.id || `${operatorId}_${app.session_id}`,
          sessionId: app.session_id,
          sessionDate: app.session?.date,
          sessionRegion: app.session?.region,
          status: app.status,
          appliedAt: app.applied_at,
          respondedAt: app.responded_at,
          rejectionReason: app.rejection_reason
        }));
      } catch (error) {
        console.error('[SupabaseAdapter.ApplicationRepository.getOperatorApplications]', error);
        throw error;
      }
    }
  };

  // ============================================================
  // EXPORT PUBLIC API
  // ============================================================

  return {
    SessionRepository,
    OperatorRepository,
    ClientRepository,
    AccountRepository,
    ApplicationRepository,

    // Helper: Get all repositories at once
    getRepositories() {
      return {
        sessions: SessionRepository,
        operators: OperatorRepository,
        clients: ClientRepository,
        accounts: AccountRepository,
        applications: ApplicationRepository
      };
    }
  };
})();

// Make adapter globally available
if (typeof window !== 'undefined') {
  window.SupabaseAdapter = SupabaseAdapter;
}

// Backward compatibility layer for PlanningStateService
if (typeof SupabaseAdapter !== 'undefined') {
  // Add legacy query() method if not present
  if (typeof SupabaseAdapter.query !== 'function') {
    SupabaseAdapter.query = async function(config) {
      try {
        // Check if Supabase is initialized
        if (!window.supabase) {
          console.warn('[SupabaseAdapter.query] window.supabase not ready');
          return [];
        }

        // Extract query configuration
        const { table, select = '*', filters = [] } = config || {};

        // Validate table name
        if (!table) {
          console.warn('[SupabaseAdapter.query] table name required');
          return [];
        }

        // Build Supabase query
        let query = window.supabase.from(table).select(select);

        // Apply filters
        if (Array.isArray(filters)) {
          filters.forEach(filter => {
            if (filter && filter.field && filter.operator && filter.value !== undefined) {
              switch (filter.operator) {
                case 'eq':
                  query = query.eq(filter.field, filter.value);
                  break;
                case 'neq':
                  query = query.neq(filter.field, filter.value);
                  break;
                case 'gt':
                  query = query.gt(filter.field, filter.value);
                  break;
                case 'lt':
                  query = query.lt(filter.field, filter.value);
                  break;
                case 'gte':
                  query = query.gte(filter.field, filter.value);
                  break;
                case 'lte':
                  query = query.lte(filter.field, filter.value);
                  break;
                case 'in':
                  query = query.in(filter.field, filter.value);
                  break;
              }
            }
          });
        }

        // Execute query
        const { data, error } = await query;

        // Handle errors gracefully
        if (error) {
          console.warn('[SupabaseAdapter.query] Supabase error:', error.message);
          return [];
        }

        // Return data or empty array
        return data || [];
      } catch (err) {
        console.warn('[SupabaseAdapter.query] Exception:', err.message);
        return [];
      }
    };
  }
}
