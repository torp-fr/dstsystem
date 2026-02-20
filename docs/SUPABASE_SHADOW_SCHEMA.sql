/* ============================================================
   DST-SYSTEM — Supabase Shadow Schema

   SHADOW SCHEMA DEFINITION for future Supabase migration.

   Purpose:
   - Mirror current Domain layer structure
   - Prepare for Supabase Row-Level-Security
   - NO breaking changes to existing application
   - NO data migration yet
   - NO code changes required

   Migration Strategy:
   1. Define schema (this file)
   2. Create tables in Supabase (future)
   3. Migrate data (future)
   4. Update Domain layer to use Supabase (future)
   5. Deprecate localStorage persistence (future)

   Current State:
   - Data in localStorage or DB object (in-memory)
   - Domain layer handles persistence

   Target State (Future):
   - Data in Supabase PostgreSQL
   - RLS policies enforce access control
   - Domain layer calls Supabase via REST/GraphQL

   ============================================================ */

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE account_role AS ENUM ('enterprise', 'operator', 'client');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE session_status AS ENUM (
  'pending_confirmation',
  'confirmed',
  'completed',
  'cancelled'
);

-- ============================================================
-- ACCOUNTS TABLE
-- ============================================================

/*
  Domain Owner: Domain.AccountRepository, Workflows.Account

  Purpose: Store user accounts with role-based access control.

  Relationships:
  - linkedEntityId references operators table (if role='operator')
  - linkedEntityId references clients table (if role='client')
  - authUserId references auth.users (Supabase Auth, future)

  RLS Policies (Future):
  - Account can read/update own record
  - Enterprise can read all accounts
  - Others cannot read other accounts
*/

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Role-based authorization
  role account_role NOT NULL,

  -- Link to entity (operator or client)
  linkedEntityId TEXT NULL,

  -- Credentials
  login TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,

  -- Password state
  tempPassword BOOLEAN DEFAULT true,

  -- Account lifecycle
  isActive BOOLEAN DEFAULT true,

  -- Auth integration (future)
  authUserId UUID NULL,  -- references auth.users(id) in Supabase

  -- Timeline
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  lastLoginAt TIMESTAMPTZ NULL,
  passwordChangedAt TIMESTAMPTZ NULL,
  deactivatedAt TIMESTAMPTZ NULL,

  -- Constraints
  CONSTRAINT account_role_required CHECK (role IN ('enterprise', 'operator', 'client')),
  CONSTRAINT non_enterprise_must_have_entity CHECK (
    role = 'enterprise' OR linkedEntityId IS NOT NULL
  )
);

CREATE INDEX idx_accounts_login ON accounts(login);
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_linkedEntityId ON accounts(linkedEntityId);
CREATE INDEX idx_accounts_role ON accounts(role);
CREATE INDEX idx_accounts_isActive ON accounts(isActive);

-- ============================================================
-- SETUPS TABLE
-- ============================================================

/*
  Domain Owner: Domain.SetupRepository

  Purpose: Store training setup locations and their regions.

  Relationships:
  - Used by sessions.setupIds (array of UUIDs)

  RLS Policies (Future):
  - Enterprise can read/write all
  - Operators can read active setups in their region
  - Clients can read setups for their sessions
*/

CREATE TABLE setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Setup identification
  name TEXT NOT NULL,

  -- Geographic coverage
  regionIds TEXT[] NOT NULL,

  -- Status
  active BOOLEAN DEFAULT true,

  -- Timeline
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT setup_name_required CHECK (name != ''),
  CONSTRAINT setup_regions_required CHECK (array_length(regionIds, 1) > 0)
);

CREATE INDEX idx_setups_active ON setups(active);
CREATE INDEX idx_setups_regionIds ON setups USING GIN(regionIds);

-- ============================================================
-- OPERATORS TABLE
-- ============================================================

/*
  Domain Owner: Domain.OperatorAvailabilityRepository, Workflows.Capacity

  Purpose: Store operator/instructor information.

  Relationships:
  - Each operator has one account (via accounts.linkedEntityId)
  - Operators appear in sessions.operatorIds (as operator account IDs)
  - Operators have availability entries

  Notes:
  - externalId stores original domain ID (op_XXXX)
  - availability stores blocked dates/periods as JSONB

  RLS Policies (Future):
  - Enterprise can read all
  - Operator can read/update own record
  - Clients cannot read operators
*/

CREATE TABLE operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Domain reference
  externalId TEXT UNIQUE NOT NULL,  -- op_123, op_456, etc.

  -- Identity
  name TEXT NOT NULL,
  email TEXT NOT NULL,

  -- Location
  region TEXT NOT NULL,

  -- Availability
  -- Structure: {unavailableDates: ['2025-03-10', ...], blocks: [{date, reason}]}
  availability JSONB DEFAULT '{"unavailableDates": [], "blocks": []}'::jsonb,

  -- Status
  isActive BOOLEAN DEFAULT true,

  -- Timeline
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT operator_name_required CHECK (name != ''),
  CONSTRAINT operator_email_required CHECK (email != '')
);

CREATE INDEX idx_operators_externalId ON operators(externalId);
CREATE INDEX idx_operators_region ON operators(region);
CREATE INDEX idx_operators_isActive ON operators(isActive);
CREATE INDEX idx_operators_email ON operators(email);

-- ============================================================
-- CLIENTS TABLE
-- ============================================================

/*
  Domain Owner: Workflows.Capacity

  Purpose: Store client/collectivity information.

  Relationships:
  - Each client has one account (via accounts.linkedEntityId)
  - Clients create sessions (sessions.clientId references this)

  Notes:
  - externalId stores original domain ID (client_XXXX)

  RLS Policies (Future):
  - Enterprise can read all
  - Client can read own record
  - Operators cannot read clients
*/

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Domain reference
  externalId TEXT UNIQUE NOT NULL,  -- client_123, client_456, etc.

  -- Identity
  organizationName TEXT NOT NULL,
  contactEmail TEXT NOT NULL,

  -- Location
  region TEXT NOT NULL,

  -- Status
  isActive BOOLEAN DEFAULT true,

  -- Timeline
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT client_name_required CHECK (organizationName != ''),
  CONSTRAINT client_email_required CHECK (contactEmail != '')
);

CREATE INDEX idx_clients_externalId ON clients(externalId);
CREATE INDEX idx_clients_region ON clients(region);
CREATE INDEX idx_clients_isActive ON clients(isActive);
CREATE INDEX idx_clients_contactEmail ON clients(contactEmail);

-- ============================================================
-- SESSIONS TABLE
-- ============================================================

/*
  Domain Owner: Workflows.Booking, Workflows.OperatorMarketplace, Workflows.Staffing

  Purpose: Store training session bookings and their state.

  Relationships:
  - clientId references clients(externalId) or external system
  - setupIds: Array of setup UUIDs (references setups.id)
  - operatorIds: Array of operator account IDs (references accounts.id where role='operator')
  - operatorApplications: JSONB array of applications (one per operator applying)

  Notes:
  - setupIds stored as UUID array (Supabase native array type)
  - operatorIds stored as UUID array for efficient queries
  - operatorApplications stored as JSONB for flexibility
  - marketplaceVisible controls marketplace visibility
  - operatorRequirement stores {minOperators: number}

  RLS Policies (Future):
  - Enterprise can read/write all
  - Operators can read if: assigned OR marketplaceVisible=true
  - Clients can read/write own sessions (clientId match)
*/

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session identification
  clientId TEXT NOT NULL,
  regionId TEXT NOT NULL,

  -- Session details
  date DATE NOT NULL,
  moduleIds TEXT[] NOT NULL,
  requestedParticipants INTEGER NOT NULL,
  capacityMax INTEGER NOT NULL,

  -- Session state
  status session_status NOT NULL DEFAULT 'pending_confirmation',
  bookingSource TEXT DEFAULT 'client_portal',

  -- Resource allocation
  setupIds UUID[] DEFAULT ARRAY[]::UUID[],  -- Array of setup UUIDs
  operatorIds UUID[] DEFAULT ARRAY[]::UUID[],  -- Array of operator account IDs

  -- Marketplace configuration
  marketplaceVisible BOOLEAN DEFAULT true,
  operatorRequirement JSONB DEFAULT '{"minOperators": 1}'::jsonb,

  -- Operator applications tracking
  -- Structure: [{id, operatorId, operatorName, status, appliedAt, respondedAt?, rejectionReason?}]
  operatorApplications JSONB DEFAULT '[]'::jsonb,

  -- Timeline
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmedAt TIMESTAMPTZ NULL,

  -- Constraints
  CONSTRAINT session_date_required CHECK (date IS NOT NULL),
  CONSTRAINT session_capacity_positive CHECK (capacityMax > 0),
  CONSTRAINT session_modules_required CHECK (array_length(moduleIds, 1) > 0),
  CONSTRAINT session_status_valid CHECK (status IN ('pending_confirmation', 'confirmed', 'completed', 'cancelled'))
);

CREATE INDEX idx_sessions_clientId ON sessions(clientId);
CREATE INDEX idx_sessions_regionId ON sessions(regionId);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_marketplaceVisible ON sessions(marketplaceVisible) WHERE marketplaceVisible = true;
CREATE INDEX idx_sessions_setupIds ON sessions USING GIN(setupIds);
CREATE INDEX idx_sessions_operatorIds ON sessions USING GIN(operatorIds);
CREATE INDEX idx_sessions_createdAt ON sessions(createdAt);

-- ============================================================
-- OPERATOR APPLICATIONS TABLE
-- ============================================================

/*
  Domain Owner: Workflows.OperatorMarketplace

  Purpose: Track operator applications to marketplace sessions.

  Relationships:
  - sessionId references sessions.id
  - operatorId references accounts.id (where role='operator')

  Notes:
  - Denormalized: operator name stored for quick access
  - Status tracks application lifecycle
  - Rejection reason stored for feedback

  RLS Policies (Future):
  - Enterprise can read/write all
  - Operator can read own applications
  - Operator can create own applications
  - Enterprise can accept/reject applications
  - Clients cannot access
*/

CREATE TABLE operator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to session
  sessionId UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

  -- Operator information
  operatorId UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  operatorName TEXT NOT NULL,

  -- Application state
  status application_status NOT NULL DEFAULT 'pending',

  -- Timeline
  appliedAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  respondedAt TIMESTAMPTZ NULL,

  -- Response details
  rejectionReason TEXT NULL,

  -- Constraints
  CONSTRAINT operator_name_required CHECK (operatorName != ''),
  CONSTRAINT unique_operator_application_per_session UNIQUE (sessionId, operatorId)
);

CREATE INDEX idx_applications_sessionId ON operator_applications(sessionId);
CREATE INDEX idx_applications_operatorId ON operator_applications(operatorId);
CREATE INDEX idx_applications_status ON operator_applications(status);
CREATE INDEX idx_applications_appliedAt ON operator_applications(appliedAt);
CREATE INDEX idx_applications_session_status ON operator_applications(sessionId, status) WHERE status = 'pending';

-- ============================================================
-- AUDIT & TIMESTAMPS
-- ============================================================

/*
  Future enhancement: Add audit log table for RLS compliance monitoring

  CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    record_id UUID NOT NULL,
    actor_id UUID NOT NULL,
    details JSONB,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
  );
*/

-- ============================================================
-- MIGRATION NOTES
-- ============================================================

/*
  IMPORTANT: When migrating from localStorage to Supabase:

  1. DATA MAPPING:
     - localStorage['dst_accounts'] → accounts table
     - localStorage['dst_sessions'] → sessions table
     - Domains generated UUIDs if not present

  2. IDS TRANSFORMATION:
     - Domain: 'acc_timestamp_random' → Supabase: UUID
     - Domain: 'sess_timestamp_random' → Supabase: UUID
     - Domain: 'op_XXXX' → Supabase: UUID (externalId stores original)

  3. ARRAYS TRANSFORMATION:
     - Domain: operatorIds as array in JSON
     - Supabase: operatorIds as UUID[] (native array)
     - Domain: setupIds as array in JSON
     - Supabase: setupIds as UUID[] (native array)

  4. JSONB FIELDS:
     - operatorApplications stays as JSONB (array of objects)
     - operatorRequirement stays as JSONB (single object)
     - availability stays as JSONB (operator unavailable dates)

  5. NAMING CONFLICTS:
     - 'accounts' table renamed from 'users' (avoid conflict with auth.users)
     - All other names map directly

  6. FOREIGN KEYS:
     - Sessions don't directly reference clients/operators table
     - Only via externalId text field
     - Allows domain to maintain independence

  7. RLS POLICIES:
     - Row-Level-Security policies will enforce Domain access rules
     - RoleGuardService logic translates to RLS policies
     - Session visibility rules → RLS filters

  8. ROLLBACK PLAN:
     - Keep localStorage as fallback
     - Domain layer checks Supabase first, then localStorage
     - Gradual rollout with feature flags
*/

-- ============================================================
-- USEFUL QUERIES FOR TESTING
-- ============================================================

/*
  -- Get all marketplace visible sessions with operator counts:
  SELECT
    id,
    date,
    regionId,
    (array_length(setupIds, 1) NULLS FIRST) as setup_count,
    (array_length(operatorIds, 1) NULLS FIRST) as operator_count,
    (capacityMax - array_length(operatorIds, 1)) as open_positions,
    jsonb_array_length(operatorApplications) as applications_count
  FROM sessions
  WHERE status = 'confirmed' AND marketplaceVisible = true;

  -- Get operator's applications:
  SELECT
    oa.id,
    oa.sessionId,
    s.date,
    s.regionId,
    oa.status,
    oa.appliedAt
  FROM operator_applications oa
  JOIN sessions s ON oa.sessionId = s.id
  WHERE oa.operatorId = $1
  ORDER BY oa.appliedAt DESC;

  -- Get session details with applications:
  SELECT
    id,
    date,
    regionId,
    (array_length(operatorIds, 1) NULLS FIRST) as accepted_operators,
    (SELECT count(*) FROM jsonb_array_elements(operatorApplications)
     WHERE elem->>'status' = 'pending') as pending_applications
  FROM sessions
  WHERE id = $1;

  -- Check operator availability on date:
  SELECT
    o.id,
    o.name,
    o.availability->'unavailableDates' as blocked_dates
  FROM operators o
  WHERE o.region = $1
  AND NOT (o.availability->'unavailableDates' @> $2::jsonb)
  AND o.isActive = true;
*/
