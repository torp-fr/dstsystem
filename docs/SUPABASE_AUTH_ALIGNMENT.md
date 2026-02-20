# DST-SYSTEM — Supabase Auth & RLS Alignment

**Status:** Authentication Strategy
**Approach:** Map Domain RoleGuardService to Supabase Row-Level-Security (RLS)
**Goal:** Enforce permissions at database level, not just application level

---

## Part 1: Auth Identity Flow

### System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Supabase Auth                           │
├──────────────────────────────────────────────────────────────┤
│  auth.users                                                  │
│  ├─ id (UUID) ← auth.uid() in JWT                           │
│  ├─ email (user's login)                                    │
│  ├─ created_at                                              │
│  └─ last_sign_in_at                                         │
└────────────────────────┬─────────────────────────────────────┘
                         │ user_id FK
                         ↓
┌──────────────────────────────────────────────────────────────┐
│                   User Profile Bridge                        │
├──────────────────────────────────────────────────────────────┤
│  user_profiles                                               │
│  ├─ id (UUID, primary key)                                  │
│  ├─ user_id FK → auth.users(id)                             │
│  ├─ role TEXT (enterprise, operator, client)                │
│  ├─ operator_id FK → operators(id) [nullable]               │
│  ├─ client_id FK → clients(id) [nullable]                   │
│  └─ created_at                                              │
└────────────────────┬──────────────────┬──────────────────────┘
                     │                  │
                     ↓                  ↓
        ┌───────────────────┐  ┌───────────────────┐
        │    operators      │  │     clients       │
        ├───────────────────┤  ├───────────────────┤
        │ id (UUID)         │  │ id (UUID)         │
        │ name              │  │ organization_name │
        │ email             │  │ contact_email     │
        │ region            │  │ region            │
        └───────────────────┘  └───────────────────┘
                     │                  │
                     ↓                  ↓
        ┌───────────────────────────────────────┐
        │      shooting_sessions                │
        │  (access controlled by RLS)           │
        └───────────────────────────────────────┘
```

### Authentication Journey

#### Step 1: User Signs In
```
POST /auth/v1/token
{
  email: 'operator_a9m2@email.com',
  password: 'password123'
}

Response:
{
  access_token: 'eyJhbGc...', // Contains: auth.uid() = 'uuid-123'
  user: {
    id: 'uuid-123', // ← This is auth.uid()
    email: 'operator_a9m2@email.com'
  }
}
```

#### Step 2: Identify User Type
```sql
-- Query user_profiles to determine role
SELECT role, operator_id, client_id
FROM user_profiles
WHERE user_id = 'uuid-123'; -- auth.uid()

Result:
{
  role: 'operator',
  operator_id: 'op-uuid-456',  -- Links to operators table
  client_id: null
}
```

#### Step 3: Authorize Database Access
```
JWT Token now contains auth.uid() = 'uuid-123'

In RLS policies:
- Use auth.uid() to get user's UUID from auth.users
- Join with user_profiles to get role and entity links
- Check permissions based on role
- Return filtered results
```

---

## Part 2: Role-Based Identity Mapping

### Enterprise Account

```
┌─────────────────────────────────────────────────────────┐
│              Enterprise User (Admin)                    │
└─────────────────────────────────────────────────────────┘

auth.users
├─ id: 'enterprise-uuid-1' ← auth.uid()
├─ email: 'admin@company.fr'
└─ last_sign_in_at: timestamp

↓ (user_id FK)

user_profiles
├─ id: 'profile-uuid-1'
├─ user_id: 'enterprise-uuid-1' ← Links to auth.users
├─ role: 'enterprise'
├─ operator_id: null
├─ client_id: null
└─ created_at: timestamp

IDENTITY RESOLUTION:
auth.uid() = 'enterprise-uuid-1'
↓
user_profiles.role = 'enterprise'
↓
PERMISSIONS:
✅ View ALL sessions
✅ Edit ALL sessions
✅ Confirm sessions
✅ Accept/reject operators
✅ Manage all accounts
```

### Operator Account

```
┌─────────────────────────────────────────────────────────┐
│              Operator User (Marketplace)                │
└─────────────────────────────────────────────────────────┘

auth.users
├─ id: 'operator-uuid-2' ← auth.uid()
├─ email: 'operator_a9m2@email.com'
└─ last_sign_in_at: timestamp

↓ (user_id FK)

user_profiles
├─ id: 'profile-uuid-2'
├─ user_id: 'operator-uuid-2' ← Links to auth.users
├─ role: 'operator'
├─ operator_id: 'op-uuid-456' ← Links to operators table
├─ client_id: null
└─ created_at: timestamp

↓ (operator_id FK)

operators
├─ id: 'op-uuid-456'
├─ name: 'Jean Dupont'
├─ email: 'jean@email.com'
├─ region: 'occitanie'
└─ created_at: timestamp

IDENTITY RESOLUTION:
auth.uid() = 'operator-uuid-2'
↓
user_profiles.role = 'operator'
user_profiles.operator_id = 'op-uuid-456'
↓
PERMISSIONS:
✅ View marketplace sessions (marketplace_visible = true)
✅ View sessions where assigned (session_operators.operator_id = 'op-uuid-456')
✅ Apply to sessions
✅ View own applications
❌ Edit sessions
❌ Confirm sessions
❌ Manage accounts
```

### Client Account

```
┌─────────────────────────────────────────────────────────┐
│         Client User (Organization/Collectivity)         │
└─────────────────────────────────────────────────────────┘

auth.users
├─ id: 'client-uuid-3' ← auth.uid()
├─ email: 'contact@gendarmerie.fr'
└─ last_sign_in_at: timestamp

↓ (user_id FK)

user_profiles
├─ id: 'profile-uuid-3'
├─ user_id: 'client-uuid-3' ← Links to auth.users
├─ role: 'client'
├─ operator_id: null
├─ client_id: 'client-uuid-789' ← Links to clients table
└─ created_at: timestamp

↓ (client_id FK)

clients
├─ id: 'client-uuid-789'
├─ organization_name: 'Gendarmerie Occitanie'
├─ contact_email: 'contact@gendarmerie.fr'
├─ region: 'occitanie'
└─ created_at: timestamp

IDENTITY RESOLUTION:
auth.uid() = 'client-uuid-3'
↓
user_profiles.role = 'client'
user_profiles.client_id = 'client-uuid-789'
↓
PERMISSIONS:
✅ View own sessions (shooting_sessions.client_id = 'client-uuid-789')
✅ Create bookings
✅ View own applications status
❌ View other clients' sessions
❌ Access marketplace
❌ Apply to marketplace
❌ Edit sessions
❌ Confirm sessions
❌ Manage accounts
```

---

## Part 3: RLS Policy Strategy

### Core Principle

**RLS policies enforce at database level what RoleGuardService checks at application level.**

```
Application Layer:        Database Layer:
RoleGuardService    →     Supabase RLS Policies
(JavaScript)               (SQL)

canViewSession()     →     SELECT policy ON shooting_sessions
canEditSession()     →     UPDATE policy ON shooting_sessions
canApplyMarketplace() →    INSERT policy ON session_operators
acceptOperator()     →     UPDATE policy ON session_operators
```

### RLS Policy Examples

#### Policy 1: Enterprise Can View All Sessions

```sql
CREATE POLICY "enterprise_view_all_sessions"
ON shooting_sessions
FOR SELECT
USING (
  -- Check if user is enterprise role
  EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'enterprise'
  )
);
```

**RoleGuardService equivalent:**
```javascript
function canViewSession(account, session) {
  if (account.role === 'enterprise') {
    return { allowed: true, reason: 'Enterprise has full access' };
  }
}
```

---

#### Policy 2: Operator Can View Marketplace Sessions

```sql
CREATE POLICY "operator_view_marketplace_sessions"
ON shooting_sessions
FOR SELECT
USING (
  -- Check if user is operator AND session is on marketplace
  EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'operator'
      AND (
        -- Marketplace visible
        (shooting_sessions.marketplace_visible = true
         AND shooting_sessions.status = 'confirmed'
         AND array_length(shooting_sessions.setup_ids, 1) > 0)
        OR
        -- OR operator is assigned
        EXISTS (
          SELECT 1
          FROM session_operators
          WHERE session_operators.session_id = shooting_sessions.id
            AND session_operators.operator_id = user_profiles.operator_id
        )
      )
  )
);
```

**RoleGuardService equivalent:**
```javascript
function canViewSession(account, session) {
  if (account.role === 'operator') {
    const isAssigned = session.operatorIds.includes(account.linkedEntityId);
    const isMarketplace = session.marketplaceVisible &&
                          session.status === 'confirmed' &&
                          session.setupIds.length > 0;

    if (isAssigned || isMarketplace) {
      return { allowed: true };
    }
  }
}
```

---

#### Policy 3: Client Can View Own Sessions

```sql
CREATE POLICY "client_view_own_sessions"
ON shooting_sessions
FOR SELECT
USING (
  -- Check if user is client AND owns the session
  EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'client'
      AND shooting_sessions.client_id = user_profiles.client_id
  )
);
```

**RoleGuardService equivalent:**
```javascript
function canViewSession(account, session) {
  if (account.role === 'client') {
    if (session.clientId === account.linkedEntityId) {
      return { allowed: true, reason: 'Client owns this session' };
    }
  }
}
```

---

#### Policy 4: Operator Can Apply to Marketplace Sessions

```sql
CREATE POLICY "operator_apply_to_session"
ON session_operators
FOR INSERT
WITH CHECK (
  -- Check if user is operator
  EXISTS (
    SELECT 1
    FROM user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.role = 'operator'
      AND up.operator_id = session_operators.operator_id
  )
  AND
  -- Check if session is on marketplace
  EXISTS (
    SELECT 1
    FROM shooting_sessions
    WHERE shooting_sessions.id = session_operators.session_id
      AND shooting_sessions.marketplace_visible = true
      AND shooting_sessions.status = 'confirmed'
  )
);
```

**RoleGuardService equivalent:**
```javascript
function canApplyMarketplace(account, session) {
  if (account.role === 'operator' && session) {
    if (session.marketplaceVisible && session.status === 'confirmed') {
      return { allowed: true };
    }
  }
}
```

---

#### Policy 5: Enterprise Can Accept/Reject Operators

```sql
CREATE POLICY "enterprise_manage_applications"
ON session_operators
FOR UPDATE
USING (
  -- Check if user is enterprise
  EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'enterprise'
  )
)
WITH CHECK (
  -- Can only update status field
  -- (other columns immutable)
  status IN ('pending', 'accepted', 'rejected')
);
```

**RoleGuardService equivalent:**
```javascript
function canConfirmSession(account) {
  if (account.role === 'enterprise') {
    return { allowed: true };
  }
}
```

---

## Part 4: Complete RLS Policy Implementation

### Setup RLS

```sql
-- Enable RLS on critical tables
ALTER TABLE shooting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### Policy Set: shooting_sessions

```sql
-- 1. Enterprise: View all
CREATE POLICY "enterprise_view_all"
ON shooting_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'enterprise'
  )
);

-- 2. Operator: View marketplace + assigned
CREATE POLICY "operator_view_marketplace"
ON shooting_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.role = 'operator'
      AND (
        (shooting_sessions.marketplace_visible = true AND shooting_sessions.status = 'confirmed')
        OR EXISTS (
          SELECT 1 FROM session_operators
          WHERE session_operators.session_id = shooting_sessions.id
            AND session_operators.operator_id = up.operator_id
        )
      )
  )
);

-- 3. Client: View own only
CREATE POLICY "client_view_own"
ON shooting_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'client'
      AND shooting_sessions.client_id = user_profiles.client_id
  )
);

-- 4. Enterprise: Edit all
CREATE POLICY "enterprise_edit_all"
ON shooting_sessions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'enterprise'
  )
);

-- 5. Client: Create own
CREATE POLICY "client_create_sessions"
ON shooting_sessions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'client'
      AND shooting_sessions.client_id = user_profiles.client_id
  )
);
```

### Policy Set: session_operators

```sql
-- 1. Operator: Apply to sessions
CREATE POLICY "operator_apply"
ON session_operators FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.role = 'operator'
      AND up.operator_id = session_operators.operator_id
  )
  AND EXISTS (
    SELECT 1 FROM shooting_sessions
    WHERE id = session_operators.session_id
      AND marketplace_visible = true
      AND status = 'confirmed'
  )
);

-- 2. Enterprise: Accept/reject applications
CREATE POLICY "enterprise_manage_applications"
ON session_operators FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'enterprise'
  )
)
WITH CHECK (
  -- Ensure status is valid
  status IN ('pending', 'accepted', 'rejected')
);

-- 3. Operator: View own applications
CREATE POLICY "operator_view_own_applications"
ON session_operators FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.role = 'operator'
      AND up.operator_id = session_operators.operator_id
  )
);

-- 4. Enterprise: View all applications
CREATE POLICY "enterprise_view_all_applications"
ON session_operators FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'enterprise'
  )
);
```

### Policy Set: operators

```sql
-- 1. Operators: View self
CREATE POLICY "operator_view_self"
ON operators FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'operator'
      AND operators.id = user_profiles.operator_id
  )
);

-- 2. Enterprise: View all
CREATE POLICY "enterprise_view_all_operators"
ON operators FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'enterprise'
  )
);

-- 3. Operators: Update self
CREATE POLICY "operator_update_self"
ON operators FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'operator'
      AND operators.id = user_profiles.operator_id
  )
)
WITH CHECK (
  -- Same as above
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'operator'
      AND operators.id = user_profiles.operator_id
  )
);
```

### Policy Set: clients

```sql
-- 1. Clients: View self
CREATE POLICY "client_view_self"
ON clients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'client'
      AND clients.id = user_profiles.client_id
  )
);

-- 2. Enterprise: View all
CREATE POLICY "enterprise_view_all_clients"
ON clients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'enterprise'
  )
);

-- 3. Clients: Update self
CREATE POLICY "client_update_self"
ON clients FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'client'
      AND clients.id = user_profiles.client_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'client'
      AND clients.id = user_profiles.client_id
  )
);
```

---

## Part 5: Adapter Integration with RLS

### How Adapters Use Auth

```javascript
// In Supabase Adapter
async function getSession(sessionId) {
  // Supabase client automatically enforces RLS policies
  // using the JWT token's auth.uid()

  const { data, error } = await supabase
    .from('shooting_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  // If user doesn't have permission (based on RLS policy),
  // this will return: error.code === 'PGRST116' (no rows)

  if (error || !data) {
    // User doesn't have permission to view this session
    return null;
  }

  return data;
}
```

### Double-Layer Security

```
Request Flow:

1. Client sends JWT with auth.uid()
   ↓
2. Application layer checks RoleGuardService
   ├─ canViewSession(account, session)
   ├─ (Application-level authorization)
   ↓
3. Query Supabase with authenticated client
   ├─ Supabase sees auth.uid() in JWT
   ├─ Applies RLS policies
   ├─ (Database-level authorization)
   ↓
4. Database enforces final filter
   ├─ If RLS policy blocks row → no data returned
   ├─ If RLS policy allows → row returned
   ↓
5. Result safely returned to client
```

**Benefits:**
- ✅ Application bugs can't bypass database security
- ✅ Direct API calls (mobile, web) still protected
- ✅ Database-level audit trail
- ✅ Enterprise-grade security

---

## Part 6: Testing Auth Alignment

### Test Scenario 1: Operator Marketplace Access

```javascript
// Test as operator
const operatorToken = await supabase.auth.signInWithPassword({
  email: 'operator_a9m2@email.com',
  password: 'password'
});

// auth.uid() is now operator-uuid-2

const sessions = await supabase
  .from('shooting_sessions')
  .select('*')
  .eq('marketplace_visible', true);

// Expected: Only returns sessions where:
// - marketplace_visible = true AND status = 'confirmed'
// OR operator is assigned (session_operators.operator_id = op-uuid-456)

// RLS Policy enforces this at database level
```

### Test Scenario 2: Client Own Sessions Only

```javascript
// Test as client
const clientToken = await supabase.auth.signInWithPassword({
  email: 'contact@gendarmerie.fr',
  password: 'password'
});

// auth.uid() is now client-uuid-3

const sessions = await supabase
  .from('shooting_sessions')
  .select('*');

// Expected: Only returns sessions where:
// shooting_sessions.client_id = client-uuid-789 (from user_profiles)

// RLS Policy enforces this at database level
```

### Test Scenario 3: Enterprise Full Access

```javascript
// Test as enterprise
const enterpriseToken = await supabase.auth.signInWithPassword({
  email: 'admin@company.fr',
  password: 'password'
});

// auth.uid() is now enterprise-uuid-1

const sessions = await supabase
  .from('shooting_sessions')
  .select('*');

// Expected: Returns ALL sessions

// RLS Policy enforces this at database level
```

---

## Part 7: Auth Flow Sequence Diagrams

### Login & Session Access

```
User Login
   ↓
Supabase Auth (auth.users)
   │
   ├─ Validate email/password
   ├─ Generate JWT with auth.uid()
   └─ Return token
   ↓
Application stores JWT
   ↓
Application makes API request
   │
   ├─ Include JWT in Authorization header
   └─ Supabase sees auth.uid()
   ↓
Supabase Auth Middleware
   │
   ├─ Verify JWT signature
   ├─ Extract auth.uid()
   └─ Set current session
   ↓
Query Database (e.g., shooting_sessions)
   │
   ├─ Supabase RLS examines user_profiles
   ├─ Finds role and entity links
   ├─ Applies RLS policy based on role
   └─ Filters rows accordingly
   ↓
Result Set
   │
   ├─ Enterprise: All rows
   ├─ Operator: Marketplace + assigned
   └─ Client: Own sessions only
   ↓
Return to Client
```

### Session Confirmation Flow

```
Enterprise Admin Opens Session
   ↓
Calls: confirmSessionBooking(sessionId)
   ↓
Application RoleGuardService checks:
   ├─ canConfirmSession(account)
   ├─ account.role === 'enterprise'? YES
   └─ Allowed: true
   ↓
Calls Adapter to confirm via Supabase
   ↓
Adapter updates shooting_sessions:
   ├─ UPDATE shooting_sessions SET status='confirmed'
   └─ WHERE id = sessionId
   ↓
Supabase RLS Policy checks:
   ├─ user_id = auth.uid()
   ├─ Lookup user_profiles.role
   ├─ role = 'enterprise'? YES
   └─ RLS allows UPDATE
   ↓
Database updates row
   ↓
Confirmation successful
```

### Operator Apply Flow

```
Operator Opens Marketplace
   ↓
Calls: listOpenMarketplaceSessions(regionId)
   ↓
Application RoleGuardService checks:
   ├─ canAccessMarketplace(account)
   ├─ account.role === 'operator'? YES
   └─ Allowed: true
   ↓
Queries Supabase shooting_sessions
   ↓
Supabase RLS Policy checks:
   ├─ user_id = auth.uid()
   ├─ Lookup user_profiles.role
   ├─ role = 'operator'? YES
   ├─ marketplace_visible = true? YES
   └─ RLS allows SELECT
   ↓
Returns marketplace sessions
   ↓
Operator clicks "Apply"
   ↓
Calls: applyToSession(operatorId, sessionId)
   ↓
Application RoleGuardService checks:
   ├─ canApplyMarketplace(account, session)
   └─ Allowed: true
   ↓
Inserts into session_operators:
   ├─ INSERT session_operators (session_id, operator_id, status='pending')
   └─ WHERE operator_id = operator linked to auth.uid()
   ↓
Supabase RLS Policy checks:
   ├─ user_id = auth.uid()
   ├─ Lookup user_profiles.operator_id
   ├─ Inserting operator_id = user_profiles.operator_id? YES
   ├─ Session marketplace_visible = true? YES
   └─ RLS allows INSERT
   ↓
Application stored
   ↓
Application successful
```

---

## Part 8: Security Considerations

### Defense in Depth

```
Layer 1: JWT Verification
├─ Only valid tokens processed
└─ Invalid tokens rejected immediately

Layer 2: User Identification
├─ auth.uid() extracted from JWT
├─ Linked to user_profiles
└─ Role and entity determined

Layer 3: Application Authorization
├─ RoleGuardService checks permissions
├─ Prevents invalid operations
└─ Provides UX feedback

Layer 4: Database RLS
├─ RLS policies filter rows
├─ Prevents data leakage
├─ Protects against adapter bugs
└─ Enforces business rules

Layer 5: SQL Constraints
├─ Foreign keys prevent orphaned data
├─ Check constraints validate data
├─ Unique constraints prevent duplicates
└─ Not null constraints ensure required fields
```

### Common Attacks & Mitigations

| Attack | Layer Blocked | How |
|---|---|---|
| **Forged JWT** | Layer 1 | JWT signature verification |
| **Tampering auth.uid()** | Layer 1 | JWT signed with secret key |
| **Direct API call** | Layer 4 | RLS policy rejects |
| **Application bug** | Layer 4 | RLS blocks unauthorized access |
| **SQL injection** | Layer 4 | Parameterized queries (Supabase client) |
| **Privilege escalation** | Layer 3+4 | Role check in RLS |
| **Data leakage** | Layer 4 | RLS filters all rows |

---

## Part 9: Implementation Checklist

### Authentication Setup

- [ ] Verify Supabase Auth is enabled
- [ ] Confirm auth.users table exists
- [ ] Confirm user_profiles table exists
- [ ] Verify foreign key: user_profiles.user_id → auth.users.id

### User Profile Linking

- [ ] Ensure user_profiles.operator_id → operators.id (FK)
- [ ] Ensure user_profiles.client_id → clients.id (FK)
- [ ] Ensure user_profiles.role has check constraint (enterprise, operator, client)
- [ ] Test: operator user has operator_id set
- [ ] Test: client user has client_id set
- [ ] Test: enterprise user has both null

### RLS Policy Implementation

- [ ] Enable RLS on shooting_sessions
- [ ] Enable RLS on session_operators
- [ ] Enable RLS on operators
- [ ] Enable RLS on clients
- [ ] Enable RLS on user_profiles (restrict to self)
- [ ] Create all 5 shooting_sessions policies
- [ ] Create all 4 session_operators policies
- [ ] Create all 2 operators policies
- [ ] Create all 2 clients policies

### Testing

- [ ] Test enterprise login → can view all sessions
- [ ] Test operator login → can view marketplace
- [ ] Test operator login → can view own assignments
- [ ] Test operator login → cannot view other clients' sessions
- [ ] Test client login → can view only own sessions
- [ ] Test client login → cannot view marketplace
- [ ] Test operator apply → creates session_operators row
- [ ] Test enterprise confirm → can update session status
- [ ] Test invalid role → denied access

### Adapter Integration

- [ ] Adapter uses Supabase client with JWT
- [ ] Supabase client automatically uses auth.uid()
- [ ] RLS policies automatically filter results
- [ ] Error handling for RLS permission denied (PGRST116)
- [ ] Application still uses RoleGuardService (for UX)
- [ ] Database uses RLS policies (for security)

---

## Conclusion

**RLS policies provide database-level enforcement of the same rules that RoleGuardService implements at the application level.**

### Key Alignment Points

✅ **Enterprise** (RoleGuardService) ↔ (RLS Policy)
- Application check: `account.role === 'enterprise'`
- Database check: `user_profiles.role = 'enterprise'` (RLS condition)
- Result: Full access to all rows

✅ **Operator** (RoleGuardService) ↔ (RLS Policy)
- Application check: `isMarketplace || isAssigned`
- Database check: `(marketplace_visible AND confirmed) OR (operator_id in session_operators)`
- Result: Filtered to marketplace + assigned sessions

✅ **Client** (RoleGuardService) ↔ (RLS Policy)
- Application check: `shooting_sessions.client_id === account.linkedEntityId`
- Database check: `shooting_sessions.client_id = user_profiles.client_id`
- Result: Filtered to own sessions only

### Security Model

```
RoleGuardService (App Layer)     Supabase RLS (DB Layer)
  ↓                              ↓
  Provides UX                    Enforces Security
  Prevents invalid operations    Prevents data leakage
  Gives feedback                 Hard stop on unauthorized access
  ↓                              ↓
  ┌──────────────────────────────────────┐
  │        Complete Defense             │
  └──────────────────────────────────────┘
```

This two-layer approach ensures:
- **Performance:** Application layer prevents unnecessary queries
- **Security:** Database layer prevents any bypass
- **Correctness:** Both layers enforce same business rules
- **Auditability:** Database logs all access attempts
