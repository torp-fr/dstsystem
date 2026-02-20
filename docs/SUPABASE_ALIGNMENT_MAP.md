# DST-SYSTEM — Supabase Alignment Map

**Status:** Planning Phase
**Date:** February 2025
**Approach:** Adapter Pattern (NO workflow changes, NO table refactoring)

---

## Executive Summary

Supabase database contains existing relational schema that **differs fundamentally** from our Domain layer's JSON-based model.

**Key Finding:** Domain layer uses denormalized structures (arrays in JSON), while Supabase uses normalized relational tables with join tables.

**Strategy:** Create an adapter layer that translates between Domain structures and Supabase relational queries without modifying existing workflows or Supabase tables.

---

## Part 1: Domain Layer → Supabase Mapping

### High-Level Alignment

| Domain Concept | Current Storage | Supabase Table | Relationship | Status |
|---|---|---|---|---|
| **Sessions** | In-memory / localStorage | `shooting_sessions` | 1:1 | ⚠️ NAME MISMATCH |
| **Session Operators** | Array in session.operatorIds | `session_operators` | 1:N | ⚠️ DENORMALIZATION MISMATCH |
| **Operators** | In-memory / localStorage | `operators` | 1:1 | ✅ ALIGNED |
| **Clients** | In-memory / localStorage | `clients` | 1:1 | ✅ ALIGNED |
| **Operator Applications** | JSONB in session | NO TABLE | N/A | ❌ MISSING |
| **Accounts** | Domain.AccountRepository | NO TABLE | N/A | ❌ MISSING |
| **Setups** | Domain.SetupRepository | ??? | N/A | ❓ UNCLEAR |

---

## Part 2: Detailed Table Mapping

### 1. SESSIONS / SHOOTING_SESSIONS

#### Domain Model (localStorage/in-memory)
```javascript
{
  id: 'sess_123',                      // String ID
  clientId: 'client_456',              // External ID
  regionId: 'occitanie',
  date: '2025-03-10',
  moduleIds: ['module_1', 'module_2'],
  requestedParticipants: 12,
  capacityMax: 15,
  status: 'confirmed',
  setupIds: ['setup_1'],               // Array of setup IDs
  operatorIds: ['op_789', 'op_890'],   // Array in JSON
  marketplaceVisible: true,
  operatorApplications: [              // JSONB array
    {
      id: 'app_1',
      operatorId: 'op_999',
      status: 'pending',
      appliedAt: '2025-02-20T14:30:00Z'
    }
  ],
  operatorRequirement: {
    minOperators: 1
  },
  createdAt: '2025-02-20T10:00:00Z',
  confirmedAt: '2025-02-20T11:00:00Z'
}
```

#### Supabase Table: shooting_sessions
```sql
CREATE TABLE shooting_sessions (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  region TEXT,
  date DATE,
  -- modules? capacity? status? -- UNCLEAR SCHEMA
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
  -- Missing: marketplaceVisible, operatorRequirement, etc.
);
```

#### Mapping Strategy
| Domain Field | Supabase Column | Adapter Logic |
|---|---|---|
| id | id | 1:1 mapping (string → UUID) |
| clientId | client_id | Join with clients table |
| regionId | region | Direct mapping |
| date | date | Direct mapping |
| moduleIds | ??? | **UNCLEAR** |
| requestedParticipants | ??? | **UNCLEAR** |
| capacityMax | ??? | **UNCLEAR** |
| status | ??? | **UNCLEAR** |
| setupIds | ??? | **UNCLEAR** (no setups table?) |
| operatorIds | → session_operators | Query join table |
| marketplaceVisible | ??? | **NOT IN SUPABASE** |
| operatorApplications | ??? | **NOT IN SUPABASE** |
| operatorRequirement | ??? | **NOT IN SUPABASE** |

**CRITICAL MISMATCHES:**
- ⚠️ Table named `shooting_sessions`, Domain expects `sessions`
- ⚠️ `operatorIds` stored as array in Domain, but `session_operators` join table in Supabase
- ❌ Multiple Domain fields have no corresponding Supabase column
- ❌ No storage for marketplace features, operator applications

---

### 2. SESSION_OPERATORS (Join Table)

#### Supabase Table: session_operators
```sql
CREATE TABLE session_operators (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES shooting_sessions(id),
  operator_id UUID REFERENCES operators(id),
  -- Unknown columns: status? appliedAt? rejectionReason?
  created_at TIMESTAMPTZ
);
```

#### Domain Expectation
- `session.operatorIds = [op_1, op_2, ...]` (array in JSON)
- Operators assigned to session (confirmed)
- **BUT:** Domain also tracks `operatorApplications` (pending/accepted/rejected)

#### Mismatch
- Domain: `operatorIds` = accepted operators only
- Domain: `operatorApplications` = all applications (pending/accepted/rejected)
- Supabase: `session_operators` = ??? (unclear if pending or confirmed)

**CRITICAL QUESTION:** Does `session_operators` contain pending applications or only confirmed assignments?

---

### 3. OPERATORS

#### Domain Model
```javascript
{
  id: 'op_789',                    // String ID
  name: 'Jean Dupont',
  email: 'jean@email.com',
  region: 'occitanie',
  availability: {
    unavailableDates: ['2025-03-10'],
    blocks: [{date: '2025-03-11', reason: 'Training'}]
  },
  isActive: true,
  createdAt: '2025-02-20T10:00:00Z'
}
```

#### Supabase Table: operators
```sql
CREATE TABLE operators (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  region TEXT,
  -- availability? rates? status? -- UNCLEAR
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### Mapping Strategy
| Domain Field | Supabase Column | Notes |
|---|---|---|
| id | id | UUID |
| name | name | Direct |
| email | email | Direct |
| region | region | Direct |
| availability | ??? | **NOT IN SUPABASE** |
| isActive | ??? | **UNCLEAR** |

**STATUS:** ✅ Mostly aligned, missing `availability` tracking

---

### 4. CLIENTS

#### Domain Model
```javascript
{
  id: 'client_456',                    // String ID
  organizationName: 'Gendarmerie',
  contactEmail: 'contact@gend.fr',
  region: 'occitanie',
  isActive: true,
  createdAt: '2025-02-20T10:00:00Z'
}
```

#### Supabase Table: clients
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  organization_name TEXT,
  contact_email TEXT,
  region TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### Mapping Strategy
| Domain Field | Supabase Column | Notes |
|---|---|---|
| id | id | UUID |
| organizationName | organization_name | Direct |
| contactEmail | contact_email | Direct |
| region | region | Direct |
| isActive | ??? | **UNCLEAR** |

**STATUS:** ✅ Mostly aligned

---

### 5. ACCOUNTS (Domain only, NOT in Supabase)

#### Domain: AccountRepository
```javascript
{
  id: 'acc_1708500000000_a7k9m3',
  linkedEntityId: 'op_789',           // Links to operator or client
  role: 'operator',                   // enterprise, operator, client
  login: 'operator_a9m2',
  email: 'operator_a9m2@email.com',
  tempPassword: true,
  isActive: true,
  createdAt: '2025-02-20T10:00:00Z',
  lastLoginAt: null
}
```

#### Supabase: NO ACCOUNTS TABLE
- No authentication/account layer in current Supabase
- Would need to create new table
- OR align with Supabase Auth (auth.users)

**CRITICAL ISSUE:** Domain assumes accounts table, Supabase doesn't have it.

**OPTIONS:**
1. Create `accounts` table in Supabase (breaking change to schema)
2. Use Supabase Auth (auth.users) instead
3. Keep accounts in separate storage (not ideal)

---

### 6. OPERATOR_APPLICATIONS (Domain feature, NOT in Supabase)

#### Domain: Stored in session.operatorApplications JSONB
```javascript
operatorApplications: [
  {
    id: 'app_op_999_sess_123_timestamp',
    operatorId: 'op_999',
    operatorName: 'Marc Leblanc',
    status: 'pending',                // pending, accepted, rejected
    appliedAt: '2025-02-20T14:30:00Z',
    respondedAt: '2025-02-20T15:00:00Z',
    rejectionReason: null
  }
]
```

#### Supabase: NO TABLE
- Marketplace feature doesn't exist in Supabase
- Would need to create `operator_applications` table
- OR extend `session_operators` with application status

**CRITICAL ISSUE:** Supabase has no marketplace/application tracking.

**OPTIONS:**
1. Create `operator_applications` table
2. Extend `session_operators` with `status` and `applied_at` columns
3. Keep applications in Domain layer (not persistent)

---

### 7. SETUPS (Domain concept)

#### Domain: SetupRepository
```javascript
{
  id: 'setup_1',
  name: 'Setup Occitanie 1',
  regionIds: ['occitanie', 'nouvelle-aquitaine'],
  active: true,
  createdAt: '2025-02-20T10:00:00Z'
}
```

#### Supabase: ???
- No clear `setups` table
- Might be implicit in operators
- Might be missing entirely

**CRITICAL ISSUE:** Unclear if setups are tracked in Supabase.

**QUESTIONS:**
- Is there a setups/locations table?
- Are setups linked to operators or regions?
- How is setup availability determined?

---

## Part 3: Mismatches Identified

### Category A: Structural Mismatches (High Risk)

| # | Issue | Domain | Supabase | Impact | Priority |
|---|---|---|---|---|---|
| **A1** | Session table name | `sessions` | `shooting_sessions` | Query mapping needed | 🔴 HIGH |
| **A2** | Operator assignments | Array in JSON | Join table | Denormalization issue | 🔴 HIGH |
| **A3** | Accounts system | Domain layer | NO TABLE | Auth strategy needed | 🔴 HIGH |
| **A4** | Operator applications | JSONB in session | NO TABLE | Marketplace feature missing | 🔴 HIGH |
| **A5** | ID format | String IDs (sess_123) | UUID | Adapter mapping | 🟠 MEDIUM |

### Category B: Missing Fields (Medium Risk)

| # | Field | Domain | Supabase | Solution |
|---|---|---|---|---|
| **B1** | modules | moduleIds array | ??? | Check schema |
| **B2** | capacity | capacityMax | ??? | Check schema |
| **B3** | status | session.status | ??? | Check schema |
| **B4** | setups | setupIds array | ??? | Check schema |
| **B5** | marketplace | marketplaceVisible | ??? | Add column or feature |
| **B6** | operator availability | availability JSONB | ??? | Add column or feature |

### Category C: Alignment Issues (Low Risk)

| # | Issue | Domain | Supabase | Impact |
|---|---|---|---|---|
| **C1** | Snake_case vs camelCase | camelCase | snake_case | REST API mapping |
| **C2** | Timestamps | ISO string | TIMESTAMPTZ | Adapter conversion |
| **C3** | Nullable fields | explicit null | nullable columns | Adapter handling |

---

## Part 4: Adapter Architecture Proposal

### Goal
Create a translation layer between Domain (JSON-based) and Supabase (relational) without modifying workflows.

### Design Pattern: Repository Adapter

```
┌─────────────────────────────────────────────────┐
│         Workflows Layer (Unchanged)             │
│  - Booking                                      │
│  - OperatorMarketplace                          │
│  - Staffing                                      │
│  - Account                                      │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│         Domain Layer (Interface)                │
│  - Domain.SessionRepository                     │
│  - Domain.AccountRepository                     │
│  - Domain.OperatorRepository                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│         Adapter Layer (NEW)                     │
│  js/adapters/supabase.adapter.js                │
│                                                 │
│  - SessionRepository → shooting_sessions        │
│  - OperatorRepository → operators               │
│  - ClientRepository → clients                   │
│  - ApplicationRepository → ??? (new table)      │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│         Supabase (Database)                     │
│  - shooting_sessions                            │
│  - session_operators (join table)               │
│  - operators                                    │
│  - clients                                      │
│  - ??? (need clarification)                     │
└─────────────────────────────────────────────────┘
```

### Adapter Responsibilities

#### 1. **Session Repository Adapter**

**Translation:**
- Domain.getSession(sessionId) → Query shooting_sessions
- Domain.listSessions() → Query shooting_sessions + joins
- Domain.updateSession() → Update shooting_sessions
- Domain.operatorIds (array) → Query session_operators join

**Pseudo-code:**
```javascript
// Domain: session.operatorIds = ['op_1', 'op_2']
// Supabase: SELECT operator_id FROM session_operators WHERE session_id = $1

async function getDomainSession(sessionId) {
  // 1. Query shooting_sessions
  const session = await supabase
    .from('shooting_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  // 2. Query session_operators (populate operatorIds)
  const { data: operatorAssignments } = await supabase
    .from('session_operators')
    .select('operator_id')
    .eq('session_id', sessionId);

  // 3. Transform to Domain structure
  return {
    ...session,
    operatorIds: operatorAssignments.map(a => a.operator_id)
  };
}
```

#### 2. **Operator Repository Adapter**

**Translation:**
- Domain.getOperator(operatorId) → Query operators
- Domain.updateOperatorAvailability() → Update operators (availability JSONB?)
- ID mapping: 'op_XXX' → UUID

#### 3. **Account Repository Adapter**

**Decision Point:** Where to store accounts?

**Option A: Create accounts table**
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  linked_entity_id UUID,  -- operator or client ID
  role TEXT CHECK (role IN ('enterprise', 'operator', 'client')),
  login TEXT UNIQUE,
  email TEXT UNIQUE,
  ...
);
```

**Option B: Use Supabase Auth (auth.users)**
- Leverage Supabase Auth for authentication
- Link auth.users to operators/clients via metadata

**Option C: Separate storage**
- Keep accounts in localStorage or separate DB
- Not ideal for Supabase migration

**Recommendation:** Option B (Supabase Auth)
- Native integration
- Better security
- RLS support

#### 4. **Application Repository Adapter**

**Decision Point:** Where to track operator applications?

**Option A: Create operator_applications table**
```sql
CREATE TABLE operator_applications (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES shooting_sessions(id),
  operator_id UUID REFERENCES operators(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
  applied_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  rejection_reason TEXT
);
```

**Option B: Extend session_operators**
```sql
ALTER TABLE session_operators ADD COLUMN status TEXT DEFAULT 'accepted';
ALTER TABLE session_operators ADD COLUMN applied_at TIMESTAMPTZ;
```

**Recommendation:** Option A (separate table)
- Cleaner schema
- Better for RLS policies
- Easier to track application history

---

## Part 5: Implementation Roadmap

### Phase 1: Analysis (Current)
- ✅ Map Domain ↔ Supabase
- ✅ Identify mismatches
- ⏳ Clarify unclear Supabase schema
- ⏳ Decide on missing tables

### Phase 2: Schema Clarification (BLOCKING)
**MUST RESOLVE:**
- What columns exist in shooting_sessions?
- What columns exist in session_operators?
- Does setups table exist?
- Does accounts/auth exist?

### Phase 3: Extended Schema (if needed)
- Create `operator_applications` table (if Option A)
- Create `accounts` table (if Option A for auth, but recommend Option B)
- Clarify operators.availability storage

### Phase 4: Adapter Implementation
- Create `js/adapters/supabase.adapter.js`
- Implement Repository Adapters:
  - SessionRepositoryAdapter
  - OperatorRepositoryAdapter
  - ClientRepositoryAdapter
  - AccountRepositoryAdapter
  - ApplicationRepositoryAdapter

### Phase 5: Integration
- Update Domain layer to use adapters
- Update workflows to call adapters
- Test all workflows

### Phase 6: Migration
- Export from localStorage
- Import to Supabase
- Verify data integrity
- Switch to Supabase

---

## Part 6: Critical Questions Requiring Answers

### Schema Questions
1. **What columns exist in `shooting_sessions`?**
   - moduleIds? capacity? status? marketplaceVisible?

2. **What columns exist in `session_operators`?**
   - Is this only for confirmed assignments?
   - Or does it include pending applications?

3. **Is there a `setups` table?**
   - How are training locations tracked?
   - How do they relate to operators/regions?

4. **How is authentication handled?**
   - Does Supabase Auth (auth.users) exist?
   - Or custom accounts table needed?

5. **What do these tables do?**
   - offers
   - invoices
   - quotes
   - client_subscriptions
   - operator_rates
   - cost_structures

### Data Model Questions
1. **Are operators linked to setups/locations?**

2. **How is operator availability tracked?**
   - Stored in operators table?
   - Separate availability table?

3. **How is the marketplace feature intended?**
   - Does Supabase support it?
   - Or is it a Domain-layer-only feature?

4. **What is the source of truth?**
   - Supabase = primary
   - Domain/localStorage = secondary
   - Or vice versa?

---

## Part 7: Risk Assessment

| Risk | Level | Impact | Mitigation |
|---|---|---|---|
| **Supabase schema unclear** | 🔴 CRITICAL | Blocks adapter design | Query Supabase; document schema |
| **Missing accounts system** | 🔴 CRITICAL | Can't authenticate users | Decide: Create table vs use Auth |
| **Missing operator applications** | 🔴 CRITICAL | Marketplace feature broken | Create operator_applications table |
| **ID format mismatch** | 🟠 MEDIUM | Query mapping complexity | Adapter handles translation |
| **Array denormalization** | 🟠 MEDIUM | Performance issues | Create join tables |
| **Unknown setups model** | 🟠 MEDIUM | Session creation broken | Clarify setup tracking |

---

## Part 8: Next Steps

### Immediate Actions (Before Adapter Development)

1. **Clarify Supabase Schema**
   ```sql
   -- Run these queries
   SELECT * FROM information_schema.tables WHERE table_schema = 'public';
   SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'shooting_sessions';
   SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'session_operators';
   SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operators';
   SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients';
   ```

2. **Inspect Existing Data**
   ```sql
   -- See what data exists and its structure
   SELECT * FROM shooting_sessions LIMIT 1;
   SELECT * FROM session_operators LIMIT 5;
   SELECT * FROM operators LIMIT 1;
   SELECT * FROM clients LIMIT 1;
   ```

3. **Document Decisions**
   - Accounts: Auth (Supabase Auth) vs Table (new table)
   - Applications: New table vs extend session_operators
   - Setups: Discover existing model or create new

4. **Create Extended Schema (if needed)**
   ```sql
   -- operator_applications table (if needed)
   CREATE TABLE operator_applications (...)

   -- accounts table (if not using Supabase Auth)
   CREATE TABLE accounts (...)

   -- Any missing columns on existing tables
   ALTER TABLE shooting_sessions ADD COLUMN ...
   ```

5. **Start Adapter Development**
   - Once schema is clarified, build adapters
   - Test against real Supabase data
   - Implement incrementally

---

## Conclusion

**The Domain layer we built is architecturally sound, but it assumes a different data model than the existing Supabase database.**

**Solution: Adapter Pattern**
- Keep Domain layer unchanged
- Keep Supabase schema mostly unchanged
- Create adapters to translate between them
- Workflows remain unaffected

**This approach:**
- ✅ Minimizes disruption
- ✅ Allows gradual migration
- ✅ Preserves existing Supabase data
- ✅ Maintains Domain purity
- ⚠️ Requires careful adapter design

**But first:** We need to understand the existing Supabase schema fully before building adapters.
