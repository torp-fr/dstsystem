-- =====================================================
-- SUPABASE MIGRATION v1.0 — PRODUCTION READINESS
-- =====================================================
-- Minimal, safe migration to align DST-System with
-- Supabase production schema.
--
-- PRINCIPLE: ADD COLUMN IF NOT EXISTS (no destructive changes)
-- IMPACT: Zero data loss, backward compatible
-- ROLLBACK: DROP COLUMN added columns manually
-- =====================================================

-- =====================================================
-- PART 1: shooting_sessions enhancements
-- =====================================================

-- Add marketplace visibility flag
ALTER TABLE public.shooting_sessions
ADD COLUMN IF NOT EXISTS marketplace_visible BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.shooting_sessions.marketplace_visible IS
'If true, session is visible in the marketplace for operators to apply.';

-- Add operator requirements as JSON
ALTER TABLE public.shooting_sessions
ADD COLUMN IF NOT EXISTS operator_requirement JSONB DEFAULT '{
  "minOperators": 1,
  "maxOperators": 5,
  "requiredSkills": [],
  "preferredSkills": []
}'::jsonb;

COMMENT ON COLUMN public.shooting_sessions.operator_requirement IS
'JSON object containing operator requirements: minOperators, maxOperators, requiredSkills[], preferredSkills[]';

-- Index for marketplace queries
CREATE INDEX IF NOT EXISTS idx_shooting_sessions_marketplace_visible
ON public.shooting_sessions(marketplace_visible)
WHERE marketplace_visible = true;

-- =====================================================
-- PART 2: session_operators enhancements
-- =====================================================

-- Add application status
ALTER TABLE public.session_operators
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'accepted'
CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn'));

COMMENT ON COLUMN public.session_operators.status IS
'Application status: pending (awaiting response), accepted, rejected, or withdrawn.';

-- Add application timestamp
ALTER TABLE public.session_operators
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

COMMENT ON COLUMN public.session_operators.applied_at IS
'Timestamp when operator applied for or was assigned to this session.';

-- Add response timestamp
ALTER TABLE public.session_operators
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

COMMENT ON COLUMN public.session_operators.responded_at IS
'Timestamp when operator responded (accepted/rejected) to the application.';

-- Add rejection reason
ALTER TABLE public.session_operators
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

COMMENT ON COLUMN public.session_operators.rejection_reason IS
'Reason for rejection (if status = rejected).';

-- Add updated_at for tracking changes
ALTER TABLE public.session_operators
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

COMMENT ON COLUMN public.session_operators.updated_at IS
'Timestamp of last update to this record.';

-- Indices for session_operators queries
CREATE INDEX IF NOT EXISTS idx_session_operators_status
ON public.session_operators(status);

CREATE INDEX IF NOT EXISTS idx_session_operators_applied_at
ON public.session_operators(applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_operators_operator_status
ON public.session_operators(operator_id, status);

-- =====================================================
-- PART 3: user_profiles enhancements
-- =====================================================

-- Add temp password flag (for initial password setup)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS temp_password BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.user_profiles.temp_password IS
'If true, user should change password on first login.';

-- Add active flag (soft delete)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.user_profiles.is_active IS
'If false, user account is deactivated (soft delete).';

-- Add client reference (for client users)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.user_profiles.client_id IS
'If user is a client, reference to the clients table.';

-- Add operator reference (for operator users)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES public.operators(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.user_profiles.operator_id IS
'If user is an operator, reference to the operators table.';

-- Indices for user lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active
ON public.user_profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_user_profiles_client_id
ON public.user_profiles(client_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_operator_id
ON public.user_profiles(operator_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role
ON public.user_profiles(role);

-- =====================================================
-- PART 4: operators enhancements
-- =====================================================

-- Add regions (for staffing board filtering)
ALTER TABLE public.operators
ADD COLUMN IF NOT EXISTS regions TEXT[]
DEFAULT '{}'::text[];

COMMENT ON COLUMN public.operators.regions IS
'Array of region codes where operator is available (e.g., {ile-de-france, paris, lyon})';

-- Add skills
ALTER TABLE public.operators
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '{
  "technical": [],
  "soft": [],
  "certifications": []
}'::jsonb;

COMMENT ON COLUMN public.operators.skills IS
'JSON object containing skills: technical[], soft[], certifications[]';

-- Index for availability queries
CREATE INDEX IF NOT EXISTS idx_operators_regions_status
ON public.operators USING GIN (regions)
WHERE status = 'active';

-- =====================================================
-- PART 5: clients enhancements
-- =====================================================

-- Add regions where client operates
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS regions TEXT[]
DEFAULT '{}'::text[];

COMMENT ON COLUMN public.clients.regions IS
'Array of region codes where client operates sessions';

-- Add contact preferences
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{
  "email": true,
  "phone": true,
  "sms": false,
  "notifications": true
}'::jsonb;

COMMENT ON COLUMN public.clients.contact_preferences IS
'JSON object containing client communication preferences';

-- =====================================================
-- PART 6: Create audit trigger for session_operators
-- =====================================================

-- Update timestamp trigger (if not exists)
CREATE OR REPLACE FUNCTION update_session_operators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_session_operators_updated_at ON public.session_operators;
CREATE TRIGGER trigger_update_session_operators_updated_at
BEFORE UPDATE ON public.session_operators
FOR EACH ROW
EXECUTE FUNCTION update_session_operators_updated_at();

-- =====================================================
-- SUMMARY OF CHANGES
-- =====================================================
-- shooting_sessions:
--   ✓ marketplace_visible (BOOLEAN, default false)
--   ✓ operator_requirement (JSONB with defaults)
--
-- session_operators:
--   ✓ status (TEXT with CHECK constraint, default 'accepted')
--   ✓ applied_at (TIMESTAMPTZ, default NOW())
--   ✓ responded_at (TIMESTAMPTZ, nullable)
--   ✓ rejection_reason (TEXT, nullable)
--   ✓ updated_at (TIMESTAMPTZ with auto-update trigger)
--
-- user_profiles:
--   ✓ temp_password (BOOLEAN, default true)
--   ✓ is_active (BOOLEAN, default true)
--   ✓ client_id (UUID FK, nullable)
--   ✓ operator_id (UUID FK, nullable)
--
-- operators:
--   ✓ regions (TEXT[], default empty)
--   ✓ skills (JSONB)
--
-- clients:
--   ✓ regions (TEXT[], default empty)
--   ✓ contact_preferences (JSONB)
--
-- All changes are backwards compatible.
-- No data loss. Easy rollback.
-- =====================================================
