-- =====================================================
-- SUPABASE RLS POLICIES — PRODUCTION SECURITY
-- =====================================================
-- Row-Level Security configuration for DST-System.
--
-- Roles:
--   - enterprise: Admin (access to all sessions and operators)
--   - client: Can only see/manage own sessions
--   - operator: Can see marketplace sessions or own assignments
--
-- Security model: Explicit allow, implicit deny
-- =====================================================

-- =====================================================
-- ENABLE RLS ON CORE TABLES
-- =====================================================

ALTER TABLE public.shooting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SHOOTING_SESSIONS POLICIES
-- =====================================================

-- Policy: ENTERPRISE can see all sessions
DROP POLICY IF EXISTS "enterprise_read_all_sessions" ON public.shooting_sessions;
CREATE POLICY "enterprise_read_all_sessions" ON public.shooting_sessions
  FOR SELECT
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- Policy: CLIENT can see only their sessions
DROP POLICY IF EXISTS "client_read_own_sessions" ON public.shooting_sessions;
CREATE POLICY "client_read_own_sessions" ON public.shooting_sessions
  FOR SELECT
  USING (
    (SELECT client_id FROM public.user_profiles WHERE id = auth.uid()) = client_id
    OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- Policy: OPERATOR can see marketplace sessions
DROP POLICY IF EXISTS "operator_read_marketplace_sessions" ON public.shooting_sessions;
CREATE POLICY "operator_read_marketplace_sessions" ON public.shooting_sessions
  FOR SELECT
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'operator'
    AND marketplace_visible = true
  );

-- Policy: OPERATOR can see sessions where assigned
DROP POLICY IF EXISTS "operator_read_assigned_sessions" ON public.shooting_sessions;
CREATE POLICY "operator_read_assigned_sessions" ON public.shooting_sessions
  FOR SELECT
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'operator'
    AND EXISTS (
      SELECT 1 FROM public.session_operators
      WHERE session_operators.session_id = shooting_sessions.id
      AND session_operators.operator_id = (SELECT operator_id FROM public.user_profiles WHERE id = auth.uid())
    )
  );

-- Policy: ENTERPRISE can insert sessions
DROP POLICY IF EXISTS "enterprise_insert_sessions" ON public.shooting_sessions;
CREATE POLICY "enterprise_insert_sessions" ON public.shooting_sessions
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- Policy: ENTERPRISE can update sessions
DROP POLICY IF EXISTS "enterprise_update_sessions" ON public.shooting_sessions;
CREATE POLICY "enterprise_update_sessions" ON public.shooting_sessions
  FOR UPDATE
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- Policy: ENTERPRISE can delete sessions
DROP POLICY IF EXISTS "enterprise_delete_sessions" ON public.shooting_sessions;
CREATE POLICY "enterprise_delete_sessions" ON public.shooting_sessions
  FOR DELETE
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- =====================================================
-- SESSION_OPERATORS POLICIES
-- =====================================================

-- Policy: ENTERPRISE can read all assignments
DROP POLICY IF EXISTS "enterprise_read_all_assignments" ON public.session_operators;
CREATE POLICY "enterprise_read_all_assignments" ON public.session_operators
  FOR SELECT
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- Policy: OPERATOR can read own assignments
DROP POLICY IF EXISTS "operator_read_own_assignments" ON public.session_operators;
CREATE POLICY "operator_read_own_assignments" ON public.session_operators
  FOR SELECT
  USING (
    operator_id = (SELECT operator_id FROM public.user_profiles WHERE id = auth.uid())
    OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- Policy: CLIENT can see who is assigned to their sessions
DROP POLICY IF EXISTS "client_read_session_assignments" ON public.session_operators;
CREATE POLICY "client_read_session_assignments" ON public.session_operators
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.shooting_sessions
      WHERE client_id = (SELECT client_id FROM public.user_profiles WHERE id = auth.uid())
    )
    OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- Policy: OPERATOR can apply for sessions (insert)
DROP POLICY IF EXISTS "operator_apply_for_sessions" ON public.session_operators;
CREATE POLICY "operator_apply_for_sessions" ON public.session_operators
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'operator'
    AND operator_id = (SELECT operator_id FROM public.user_profiles WHERE id = auth.uid())
    AND status = 'pending'
  );

-- Policy: ENTERPRISE can manage assignments (insert/update)
DROP POLICY IF EXISTS "enterprise_manage_assignments" ON public.session_operators;
CREATE POLICY "enterprise_manage_assignments" ON public.session_operators
  FOR ALL
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  )
  WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- Policy: OPERATOR can update own assignment status
DROP POLICY IF EXISTS "operator_respond_assignment" ON public.session_operators;
CREATE POLICY "operator_respond_assignment" ON public.session_operators
  FOR UPDATE
  USING (
    operator_id = (SELECT operator_id FROM public.user_profiles WHERE id = auth.uid())
    AND status = 'pending'
  )
  WITH CHECK (
    operator_id = (SELECT operator_id FROM public.user_profiles WHERE id = auth.uid())
    AND status IN ('accepted', 'rejected')
  );

-- =====================================================
-- OPERATORS POLICIES
-- =====================================================

-- Policy: ENTERPRISE can read all operators
DROP POLICY IF EXISTS "enterprise_read_all_operators" ON public.operators;
CREATE POLICY "enterprise_read_all_operators" ON public.operators
  FOR SELECT
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- Policy: OPERATOR can read own profile
DROP POLICY IF EXISTS "operator_read_own_profile" ON public.operators;
CREATE POLICY "operator_read_own_profile" ON public.operators
  FOR SELECT
  USING (
    id = (SELECT operator_id FROM public.user_profiles WHERE id = auth.uid())
  );

-- Policy: ENTERPRISE can manage operators
DROP POLICY IF EXISTS "enterprise_manage_operators" ON public.operators;
CREATE POLICY "enterprise_manage_operators" ON public.operators
  FOR ALL
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  )
  WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- =====================================================
-- CLIENTS POLICIES
-- =====================================================

-- Policy: ENTERPRISE can read all clients
DROP POLICY IF EXISTS "enterprise_read_all_clients" ON public.clients;
CREATE POLICY "enterprise_read_all_clients" ON public.clients
  FOR SELECT
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- Policy: CLIENT can read own profile
DROP POLICY IF EXISTS "client_read_own_profile" ON public.clients;
CREATE POLICY "client_read_own_profile" ON public.clients
  FOR SELECT
  USING (
    id = (SELECT client_id FROM public.user_profiles WHERE id = auth.uid())
  );

-- Policy: ENTERPRISE can manage clients
DROP POLICY IF EXISTS "enterprise_manage_clients" ON public.clients;
CREATE POLICY "enterprise_manage_clients" ON public.clients
  FOR ALL
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  )
  WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- =====================================================
-- USER_PROFILES POLICIES
-- =====================================================

-- Policy: ENTERPRISE can read all profiles
DROP POLICY IF EXISTS "enterprise_read_all_profiles" ON public.user_profiles;
CREATE POLICY "enterprise_read_all_profiles" ON public.user_profiles
  FOR SELECT
  USING (
    (SELECT role FROM id) = 'enterprise'
  );

-- Policy: User can read own profile
DROP POLICY IF EXISTS "user_read_own_profile" ON public.user_profiles;
CREATE POLICY "user_read_own_profile" ON public.user_profiles
  FOR SELECT
  USING (
    id = auth.uid()
  );

-- Policy: User can update own profile
DROP POLICY IF EXISTS "user_update_own_profile" ON public.user_profiles;
CREATE POLICY "user_update_own_profile" ON public.user_profiles
  FOR UPDATE
  USING (
    id = auth.uid()
  )
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid()) -- Cannot change own role
  );

-- Policy: ENTERPRISE can manage all profiles
DROP POLICY IF EXISTS "enterprise_manage_profiles" ON public.user_profiles;
CREATE POLICY "enterprise_manage_profiles" ON public.user_profiles
  FOR ALL
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  )
  WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise'
  );

-- =====================================================
-- SUMMARY OF RLS POLICIES
-- =====================================================
-- shooting_sessions (5 policies):
--   ✓ ENTERPRISE: can read/write/delete all
--   ✓ CLIENT: can read only own sessions
--   ✓ OPERATOR: can read marketplace + assigned
--
-- session_operators (5 policies):
--   ✓ ENTERPRISE: can manage all assignments
--   ✓ OPERATOR: can apply (insert pending), update own
--   ✓ CLIENT: can see assignments for own sessions
--
-- operators (3 policies):
--   ✓ ENTERPRISE: can read/manage all
--   ✓ OPERATOR: can read own profile
--
-- clients (3 policies):
--   ✓ ENTERPRISE: can read/manage all
--   ✓ CLIENT: can read own profile
--
-- user_profiles (4 policies):
--   ✓ ENTERPRISE: can read/manage all
--   ✓ ALL: can read own profile
--   ✓ ALL: can update own profile (with role lock)
--
-- IMPORTANT:
-- - All tables have RLS enabled
-- - Policies are explicit-allow only
-- - Default behavior: deny all
-- - No policy = no access
-- =====================================================
