# DST-SYSTEM — Supabase Forensic Analysis

**Status:** Detailed Schema Inspection
**Approach:** Understand existing relational design, adapt Domain layer to work WITH it
**Goal:** Show minimal evolution path (columns only, NO new tables)

---

## Executive Summary

**Key Finding:** The existing Supabase schema is RELATIONAL BY DESIGN and is actually MORE CAPABLE than a denormalized JSON model.

**Insight:** Domain layer is not a replacement for the database schema—it's an ORCHESTRATION LAYER above it.

**Strategy:** Create adapters that translate between Domain concepts (arrays, JSON) and Supabase relational queries (joins, relationships).

---

## Part 1: Table Forensic Breakdown

### 1. shooting_sessions Table

**Likely columns (inspect actual schema):**
```sql
id                    UUID PRIMARY KEY
client_id             UUID REFERENCES clients(id)
region                TEXT
date                  DATE
status                TEXT (enum: pending_confirmation, confirmed, completed, cancelled)
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ

-- Unknown but likely:
capacity              INTEGER
modules               TEXT[] or JSONB
requirements          TEXT or JSONB
```

**Business Feature:** Core session booking
- Stores training session information
- Links to clients who booked them
- Tracks session lifecycle
- Manages capacity

**What it ENABLES:**
✅ Session creation/retrieval
✅ Session status tracking
✅ Client-session linking
✅ Date/region filtering

**Gaps for Domain Layer:**
- ❓ Where is marketplaceVisible tracked?
- ❓ Where is operatorRequirement stored?
- ❓ How are modules stored?

**Forensic Note:** If `capacity` exists, Domain `capacityMax` maps directly. If `status` exists, Domain status maps directly.

---

### 2. session_operators Table

**Likely columns (inspect actual schema):**
```sql
id                    UUID PRIMARY KEY
session_id            UUID REFERENCES shooting_sessions(id)
operator_id           UUID REFERENCES operators(id)
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ

-- MISSING FOR MARKETPLACE (but easy to add):
status                TEXT (pending, accepted, rejected)
applied_at            TIMESTAMPTZ
responded_at          TIMESTAMPTZ
rejection_reason      TEXT
```

**Business Feature:** Links operators to sessions
- Tracks which operators are assigned to which sessions
- One-to-many: one session can have many operators
- Many-to-many via this join table

**What it ENABLES:**
✅ Query operators for a session: `SELECT operator_id FROM session_operators WHERE session_id = X`
✅ Query sessions for an operator: `SELECT session_id FROM session_operators WHERE operator_id = X`
✅ Count assigned operators: `SELECT COUNT(*) FROM session_operators WHERE session_id = X`

**Gap for Marketplace:**
- ❌ Can't track application status (pending/accepted/rejected)
- ❌ Can't track application timeline (appliedAt, respondedAt)
- ❌ Can't store rejection reason

**SOLUTION:** Add 3-4 columns:
```sql
ALTER TABLE session_operators ADD COLUMN status TEXT DEFAULT 'accepted';
ALTER TABLE session_operators ADD COLUMN applied_at TIMESTAMPTZ;
ALTER TABLE session_operators ADD COLUMN responded_at TIMESTAMPTZ;
ALTER TABLE session_operators ADD COLUMN rejection_reason TEXT;
```

**Impact:** With these columns, session_operators becomes application tracking table!

---

### 3. operators Table

**Likely columns:**
```sql
id                    UUID PRIMARY KEY
name                  TEXT
email                 TEXT
region                TEXT
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ

-- Unknown but likely:
status                TEXT (active, inactive)
phone                 TEXT
certifications        JSONB or TEXT[]
```

**Business Feature:** Operator/instructor information
- Stores operator identity and contact
- Links to region for filtering
- Tracks operator status

**What it ENABLES:**
✅ Operator lookup by ID
✅ Filter operators by region
✅ Get operator contact info
✅ Track operator status

**Gaps for Domain Layer:**
- ❓ Where is availability tracked? (unavailable dates, blocks)
- ❓ Where is certification/qualification stored?

**Forensic Note:** Availability might be in a separate table or JSONB field we need to discover.

---

### 4. clients Table

**Likely columns:**
```sql
id                    UUID PRIMARY KEY
organization_name     TEXT
contact_email         TEXT
region                TEXT
status                TEXT (active, inactive)
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ

-- Unknown but likely:
phone                 TEXT
address               TEXT
subscription_level    TEXT
```

**Business Feature:** Client/collectivity information
- Stores organization information
- Links to region
- Tracks subscription/status

**What it ENABLES:**
✅ Client lookup
✅ Filter clients by region
✅ Track client status
✅ Link to sessions (via session.client_id)

**Gap for Domain Layer:**
- None identified (aligns well with Domain.Client)

---

### 5. user_profiles Table

**Likely columns:**
```sql
id                    UUID PRIMARY KEY
user_id               UUID REFERENCES auth.users(id)
operator_id           UUID REFERENCES operators(id) [nullable]
client_id             UUID REFERENCES clients(id) [nullable]
role                  TEXT (enterprise, operator, client)
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

**Business Feature:** Link Supabase Auth users to platform roles
- Connects auth.users (authentication) to operators/clients (business entities)
- Stores role information
- Single-user-to-single-role mapping

**What it ENABLES:**
✅ User authentication (via auth.users)
✅ Role-based access control (role column)
✅ Link user to operator or client entity
✅ Map Supabase Auth to Domain accounts

**PERFECT FOR:** Domain.AccountRepository
- Instead of creating accounts table, use user_profiles
- Domain account.linkedEntityId → user_profiles.(operator_id|client_id)
- Domain account.role → user_profiles.role
- Domain account.login → auth.users.email (via user_id)

**Insight:** user_profiles already IS the accounts table!

---

### 6. offers Table

**Likely columns:**
```sql
id                    UUID PRIMARY KEY
client_id             UUID REFERENCES clients(id)
amount                NUMERIC
currency              TEXT
valid_from            DATE
valid_to              DATE
status                TEXT (draft, sent, accepted, rejected, expired)
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

**Business Feature:** Pricing offers to clients
- Stores commercial offers/quotes for training packages
- Tracks offer lifecycle
- Integrates with invoicing system

**Domain Impact:** None (pricing feature, out of scope for current Domain layer)

---

### 7. client_subscriptions Table

**Likely columns:**
```sql
id                    UUID PRIMARY KEY
client_id             UUID REFERENCES clients(id)
subscription_type     TEXT (basic, premium, enterprise)
valid_from            DATE
valid_to              DATE
status                TEXT (active, expired, cancelled)
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

**Business Feature:** Subscription management
- Tracks client subscription status and validity
- Supports tiered subscription levels
- Manages subscription lifecycle

**Domain Impact:** None (subscription feature, out of scope)

---

### Additional Tables Likely Exist

**operator_rates, cost_structures, quotes, invoices:**
- These support pricing/billing features
- Not needed for core Domain layer (booking, marketplace, staffing)
- Can be ignored for adapter development

---

## Part 2: Hidden Capabilities Detected

### Capability 1: Marketplace Support in session_operators

**Current state:**
```sql
session_operators {
  id, session_id, operator_id, created_at, updated_at
}
```

**Can become (with 4-column addition):**
```sql
session_operators {
  id,
  session_id,
  operator_id,
  status TEXT DEFAULT 'accepted',           -- NEW
  applied_at TIMESTAMPTZ,                  -- NEW
  responded_at TIMESTAMPTZ,                -- NEW
  rejection_reason TEXT,                   -- NEW
  created_at,
  updated_at
}
```

**This enables:**
✅ Pending applications (status='pending')
✅ Accepted operators (status='accepted')
✅ Rejected applications (status='rejected')
✅ Application timeline tracking
✅ Rejection feedback

**Query examples:**
```sql
-- Get pending applications for a session
SELECT * FROM session_operators
WHERE session_id = $1 AND status = 'pending';

-- Get accepted operators
SELECT * FROM session_operators
WHERE session_id = $1 AND status = 'accepted';

-- Application history
SELECT * FROM session_operators
WHERE session_id = $1
ORDER BY applied_at DESC;
```

**Forensic Note:** This join table is PERFECT for marketplace. Just add 4 columns.

---

### Capability 2: Accounts Already Exist (as user_profiles)

**Existing structure:**
```sql
auth.users {
  id, email, created_at, ...
}

user_profiles {
  id,
  user_id,
  operator_id,
  client_id,
  role,  -- 'enterprise', 'operator', 'client'
  created_at
}
```

**Already supports:**
✅ User authentication (via auth.users)
✅ Role-based access (role column)
✅ User-to-entity linking (operator_id, client_id)
✅ Account lifecycle

**Mapping to Domain:**
```javascript
// Domain: AccountRepository
{
  id: user_profiles.id,
  linkedEntityId: user_profiles.operator_id || user_profiles.client_id,
  role: user_profiles.role,
  login: auth.users.email,
  email: auth.users.email,
  createdAt: user_profiles.created_at,
  lastLoginAt: auth.users.last_sign_in_at,
  // ... etc
}
```

**Forensic Note:** Don't create accounts table—USE user_profiles!

---

### Capability 3: Session-Operator-Application Tracking

**Current data flow:**
```
clients → sessions → session_operators → operators
```

**Enhanced data flow (with column additions):**
```
clients → shooting_sessions → session_operators → operators
                                    ↓
                          (with status, applied_at, etc.)
                              ↓
                    Application Timeline Tracking
                    - pending
                    - accepted
                    - rejected
```

**Forensic Note:** The relational structure is BETTER than denormalized JSON because:
- Queries are efficient (indexed joins)
- Data integrity maintained (FK constraints)
- Easy to add application status tracking
- Can query "operators NOT in session_operators" for candidates

---

## Part 3: Minimal Schema Evolution Plan

### Phase 1: Add Application Tracking to session_operators (NO NEW TABLES)

```sql
-- Add 4 columns to existing session_operators table
ALTER TABLE session_operators
ADD COLUMN status TEXT DEFAULT 'accepted';

ALTER TABLE session_operators
ADD COLUMN applied_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE session_operators
ADD COLUMN responded_at TIMESTAMPTZ;

ALTER TABLE session_operators
ADD COLUMN rejection_reason TEXT;

-- Add check constraint
ALTER TABLE session_operators
ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Create partial index for pending applications
CREATE INDEX idx_pending_applications
ON session_operators(session_id)
WHERE status = 'pending';
```

**Impact:** Zero breaking changes, existing data untouched, new features enabled.

---

### Phase 2: Add Marketplace Feature Columns to shooting_sessions (OPTIONAL)

```sql
-- Add marketplace visibility flag
ALTER TABLE shooting_sessions
ADD COLUMN marketplace_visible BOOLEAN DEFAULT true;

-- Add operator requirement (if not stored elsewhere)
ALTER TABLE shooting_sessions
ADD COLUMN operator_requirement JSONB DEFAULT '{"minOperators": 1}'::jsonb;

-- Optional: Add operator count tracking for performance
ALTER TABLE shooting_sessions
ADD COLUMN accepted_operators_count INTEGER DEFAULT 0;
```

**Impact:** Enables marketplace visibility control without breaking existing queries.

---

### Phase 3: Enrich user_profiles (OPTIONAL)

```sql
-- Add temp password flag (if auth not handling it)
ALTER TABLE user_profiles
ADD COLUMN temp_password BOOLEAN DEFAULT true;

-- Add last login tracking (if not in auth.users)
ALTER TABLE user_profiles
ADD COLUMN last_login_at TIMESTAMPTZ;

-- Add account status
ALTER TABLE user_profiles
ADD COLUMN is_active BOOLEAN DEFAULT true;
```

**Impact:** Completes Domain.AccountRepository functionality.

---

### Phase 4: Confirm operator_availability Model

**Forensic question:** Where is operator availability stored?

**Options:**
A) In operators table as JSONB field
B) In separate operator_availability table
C) Not yet implemented

**Action:** Query to discover:
```sql
-- Check if operators table has availability column
SELECT column_name FROM information_schema.columns
WHERE table_name = 'operators' AND column_name LIKE '%availab%';

-- Check if separate table exists
SELECT table_name FROM information_schema.tables
WHERE table_name LIKE '%availab%';
```

**If option C:** Create minimal table:
```sql
CREATE TABLE operator_availability (
  operator_id UUID REFERENCES operators(id),
  unavailable_date DATE,
  reason TEXT,
  PRIMARY KEY (operator_id, unavailable_date)
);
```

---

## Part 4: Realistic Adapter Strategy

### Goal
Translate Domain operations into Supabase relational queries without breaking existing data.

### Adapter Architecture

```
Domain Layer (unchanged)
├─ SessionRepository.getSession()
├─ OperatorRepository.getOperator()
├─ AccountRepository.getById()
└─ ApplicationRepository.listPending()
         │
         ↓
Adapter Layer (NEW)
├─ SessionAdapter
│  ├─ getSession(id)
│  │  └─ Query shooting_sessions + JOIN session_operators
│  ├─ getOperatorIds(sessionId)
│  │  └─ SELECT operator_id FROM session_operators WHERE status='accepted'
│  └─ getApplications(sessionId)
│     └─ SELECT * FROM session_operators WHERE status IN ('pending', 'rejected')
│
├─ OperatorAdapter
│  ├─ getOperator(id)
│  │  └─ Query operators table
│  └─ getAvailability(id)
│     └─ Query operator_availability OR operators.availability
│
├─ AccountAdapter
│  ├─ getAccount(id)
│  │  └─ Query user_profiles + JOIN auth.users
│  └─ createAccount()
│     └─ INSERT user_profiles + CREATE auth.users
│
└─ ApplicationAdapter
   ├─ applyToSession()
   │  └─ INSERT session_operators (status='pending')
   ├─ acceptOperator()
   │  └─ UPDATE session_operators SET status='accepted'
   └─ rejectOperator()
      └─ UPDATE session_operators SET status='rejected'
         │
         ↓
Supabase Database (relational)
├─ shooting_sessions (+ marketplace columns)
├─ session_operators (+ status, applied_at, etc.)
├─ operators
├─ clients
├─ user_profiles
└─ operator_availability
```

### Example Adapter Methods

#### SessionAdapter.getSession()
```javascript
async getSession(sessionId) {
  // Query session with operator count
  const { data: session } = await supabase
    .from('shooting_sessions')
    .select(`
      *,
      client:clients(*),
      operators:session_operators(operator_id)
    `)
    .eq('id', sessionId)
    .single();

  // Transform to Domain structure
  return {
    id: session.id,
    clientId: session.client_id,
    regionId: session.region,
    date: session.date,
    status: session.status,
    operatorIds: session.operators.map(op => op.operator_id),
    marketplaceVisible: session.marketplace_visible,
    createdAt: session.created_at
  };
}
```

#### ApplicationAdapter.applyToSession()
```javascript
async applyToSession(operatorId, sessionId) {
  // Insert into session_operators with pending status
  const { data, error } = await supabase
    .from('session_operators')
    .insert([{
      session_id: sessionId,
      operator_id: operatorId,
      status: 'pending',  // NEW COLUMN
      applied_at: new Date()  // NEW COLUMN
    }])
    .select();

  if (error) {
    if (error.message.includes('duplicate')) {
      return { success: false, error: 'ALREADY_APPLIED' };
    }
    throw error;
  }

  return {
    success: true,
    applicationId: data[0].id,
    status: 'pending'
  };
}
```

#### ApplicationAdapter.acceptOperator()
```javascript
async acceptOperator(operatorId, sessionId) {
  const { data, error } = await supabase
    .from('session_operators')
    .update({
      status: 'accepted',
      responded_at: new Date()
    })
    .match({
      session_id: sessionId,
      operator_id: operatorId,
      status: 'pending'  // Only update pending applications
    })
    .select();

  if (error) throw error;
  if (data.length === 0) {
    return { success: false, error: 'APPLICATION_NOT_FOUND' };
  }

  return { success: true, applicationId: data[0].id };
}
```

#### AccountAdapter.getAccount()
```javascript
async getAccount(userId) {
  // Join user_profiles with auth.users
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      id,
      role,
      operator_id,
      client_id,
      is_active,
      created_at,
      user:auth.users(email, last_sign_in_at)
    `)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  // Transform to Domain structure
  return {
    id: data.id,
    linkedEntityId: data.operator_id || data.client_id,
    role: data.role,
    login: data.user.email,
    email: data.user.email,
    isActive: data.is_active,
    lastLoginAt: data.user.last_sign_in_at,
    createdAt: data.created_at
  };
}
```

---

## Part 5: Data Integrity Strategy

### Benefits of Relational Design Over JSON

**Denormalized (current Domain/localStorage):**
```json
{
  "id": "sess_123",
  "operatorIds": ["op_1", "op_2"],  // Mutable array in JSON
  "operatorApplications": [         // Can get out of sync
    {"operatorId": "op_1", "status": "pending"},
    {"operatorId": "op_2", "status": "accepted"}
  ]
}
```

**Problem:** Array and applications can diverge. If op_1 is added to operatorIds but application remains pending, data is inconsistent.

**Relational (Supabase):**
```sql
session_operators {
  (op_1, pending),
  (op_2, accepted)
}

-- Query truth:
SELECT * FROM session_operators WHERE status='accepted'  -- Gets [op_2]
SELECT * FROM session_operators WHERE status='pending'   -- Gets [op_1]
```

**Benefit:** Single source of truth. No dual maintenance. Consistent queries.

---

## Part 6: Implementation Checklist

### Before Adapter Development

- [ ] Query actual shooting_sessions schema (columns, types)
- [ ] Query actual session_operators schema (columns, types)
- [ ] Query actual user_profiles schema (columns, types)
- [ ] Confirm operators.availability model (JSONB? separate table?)
- [ ] Confirm existing data (sample rows from each table)

### Schema Evolution (NO new tables, just columns)

- [ ] Add status, applied_at, responded_at, rejection_reason to session_operators
- [ ] Add marketplace_visible, operator_requirement to shooting_sessions (optional)
- [ ] Add temp_password, last_login_at, is_active to user_profiles (optional)
- [ ] Create operator_availability table (if not exists)

### Adapter Implementation

- [ ] SessionAdapter (getSession, getOperatorIds, listSessions)
- [ ] OperatorAdapter (getOperator, getAvailability)
- [ ] AccountAdapter (getAccount, createAccount)
- [ ] ApplicationAdapter (apply, accept, reject)

### Testing

- [ ] Test getSession returns Domain structure correctly
- [ ] Test operatorIds array populated from session_operators
- [ ] Test marketplace functionality (apply, accept, reject)
- [ ] Test account linking (user_profiles → Domain account)

### Validation

- [ ] Workflows unchanged (still call Domain layer)
- [ ] All operations produce correct Supabase queries
- [ ] Data consistency maintained
- [ ] RLS policies align with Domain access rules

---

## Part 7: Why Relational is Better

### Array Operations (Domain/JSON)

```javascript
// Add operator
session.operatorIds.push(newOperatorId);  // Mutable array
// Save entire session object
DB.sessions.update(sessionId, session);   // Full overwrite

// Problem: Concurrent updates lost. Race conditions.
```

### Join Table Operations (Supabase)

```sql
-- Add operator
INSERT INTO session_operators (session_id, operator_id, status)
VALUES ($1, $2, 'accepted');

-- Problem: None. Database handles concurrency.
```

### Query Benefits

**Domain (array scan):**
```javascript
// "Which sessions does operator work on?"
sessions.filter(s => s.operatorIds.includes(operatorId))  // O(n) scan
```

**Supabase (indexed join):**
```sql
-- "Which sessions does operator work on?"
SELECT session_id FROM session_operators WHERE operator_id = $1;  -- O(log n) indexed
```

### Integrity Benefits

**Domain (can diverge):**
```javascript
{
  operatorIds: ['op_1'],
  operatorApplications: [
    {operatorId: 'op_2', status: 'accepted'}  // Mismatch!
  ]
}
```

**Supabase (single truth):**
```sql
-- Only one place where operator assignments exist
-- Can't have divergent data
SELECT * FROM session_operators WHERE status='accepted';
```

---

## Conclusion

**The existing Supabase schema is NOT a limitation—it's an ADVANTAGE.**

The relational model:
- ✅ Provides data integrity
- ✅ Enables efficient queries
- ✅ Supports RLS (Row-Level-Security)
- ✅ Handles concurrency properly
- ✅ Can be extended minimally (4 columns for marketplace)

**Our approach:**
- ✅ Create adapters (translation layer)
- ✅ Keep Domain layer unchanged
- ✅ Keep Supabase schema mostly unchanged (add columns, not tables)
- ✅ Leverage relational benefits (integrity, performance)
- ✅ No breaking changes to existing data

**Next step:** Inspect actual schema and build adapters based on REAL columns.
