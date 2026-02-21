# SUPABASE PRODUCTION CHECKLIST

## Overview

This checklist ensures DST-System is fully migrated to Supabase and production-ready. Follow the steps in exact order.

**Status**: 🚀 Ready for execution
**Target**: Production deployment
**Timeline**: ~30 minutes
**Risk Level**: LOW (non-destructive, add-only migrations)

---

## PHASE 1: PRE-MIGRATION AUDIT ✓

### Step 1.1: Run Pre-Migration Audit
**File**: `supabase_pre_migration_audit.sql`

```bash
# In Supabase SQL Editor:
1. Copy all content from supabase_pre_migration_audit.sql
2. Paste into SQL Editor
3. Click "Run" (CMD+Enter)
```

**Expected Output**:
- ✓ Column list for all 5 core tables
- ✓ Current constraints and indices
- ✓ Existing RLS policies (likely none yet)
- ✓ Row counts for each table

**Verification Checklist**:
- [ ] `shooting_sessions` has ~X rows
- [ ] `session_operators` has ~Y rows
- [ ] `user_profiles` has ~Z rows
- [ ] `operators` exists and accessible
- [ ] `clients` exists and accessible
- [ ] No RLS policies yet (expected)

**⚠️ Important Notes**:
- Takes 2-3 seconds to complete
- Safe query (SELECT only)
- Save the output for comparison after migration
- Note any unexpected missing columns

---

## PHASE 2: SCHEMA MIGRATION ✓

### Step 2.1: Run Migration v1
**File**: `supabase_migration_v1.sql`

```bash
# In Supabase SQL Editor:
1. Copy all content from supabase_migration_v1.sql
2. Paste into SQL Editor
3. Click "Run" (CMD+Enter)
```

**Expected Duration**: 10-15 seconds
**Expected Output**: No errors, successful migrations

**Verification Checklist**:
- [ ] No SQL errors in console
- [ ] `shooting_sessions` has new columns:
  - [ ] `marketplace_visible` (BOOLEAN)
  - [ ] `operator_requirement` (JSONB)
- [ ] `session_operators` has new columns:
  - [ ] `status` (TEXT)
  - [ ] `applied_at` (TIMESTAMPTZ)
  - [ ] `responded_at` (TIMESTAMPTZ)
  - [ ] `rejection_reason` (TEXT)
  - [ ] `updated_at` (TIMESTAMPTZ)
- [ ] `user_profiles` has new columns:
  - [ ] `temp_password` (BOOLEAN)
  - [ ] `is_active` (BOOLEAN)
  - [ ] `client_id` (UUID FK)
  - [ ] `operator_id` (UUID FK)
- [ ] `operators` has new columns:
  - [ ] `regions` (TEXT[])
  - [ ] `skills` (JSONB)
- [ ] `clients` has new columns:
  - [ ] `regions` (TEXT[])
  - [ ] `contact_preferences` (JSONB)
- [ ] All new indices created successfully

**Data Integrity Check**:
```sql
-- Run after migration:
SELECT COUNT(*) as total FROM shooting_sessions;
SELECT COUNT(*) as total FROM session_operators;
SELECT COUNT(*) as total FROM user_profiles;
SELECT COUNT(*) as total FROM operators;
SELECT COUNT(*) as total FROM clients;
```

**Expected**: Row counts should be IDENTICAL to Step 1.1

---

## PHASE 3: RLS CONFIGURATION ✓

### Step 3.1: Enable RLS and Create Policies
**File**: `supabase_rls_policies.sql`

```bash
# In Supabase SQL Editor:
1. Copy all content from supabase_rls_policies.sql
2. Paste into SQL Editor
3. Click "Run" (CMD+Enter)
```

**Expected Duration**: 5-10 seconds
**Expected Output**: No errors, all policies created

**Verification Checklist**:
- [ ] No SQL errors
- [ ] RLS enabled on:
  - [ ] `shooting_sessions`
  - [ ] `session_operators`
  - [ ] `operators`
  - [ ] `clients`
  - [ ] `user_profiles`
- [ ] Policies created for each table:
  - [ ] `shooting_sessions`: 5 policies
  - [ ] `session_operators`: 5 policies
  - [ ] `operators`: 3 policies
  - [ ] `clients`: 3 policies
  - [ ] `user_profiles`: 4 policies

**RLS Status Check**:
```sql
-- Verify RLS is enabled:
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_namespace.nspname = 'public'
  AND pg_class.relname IN ('shooting_sessions', 'session_operators', 'operators', 'clients', 'user_profiles');
```

**Expected**: All should show `rowsecurity = TRUE`

**Policy Count Check**:
```sql
-- Verify policy count:
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('shooting_sessions', 'session_operators', 'operators', 'clients', 'user_profiles')
GROUP BY tablename
ORDER BY tablename;
```

**Expected Results**:
- `shooting_sessions`: 5 policies
- `session_operators`: 5 policies
- `operators`: 3 policies
- `clients`: 3 policies
- `user_profiles`: 4 policies

---

## PHASE 4: SEED TEST DATA ✓

### Step 4.1: Set Up Authentication Users First

⚠️ **IMPORTANT**: Auth users must be created BEFORE running seed script.

**In Supabase Dashboard**:
1. Go to `Authentication` → `Users`
2. Click "Invite"
3. Create 4 test users:

| Email | Password | Role |
|-------|----------|------|
| admin@dstsystem.local | password123 | Enterprise |
| operator1@dstsystem.local | password123 | Operator |
| operator2@dstsystem.local | password123 | Operator |
| client@dstsystem.local | password123 | Client |

4. Copy each user's **UUID** (click user to see details)
5. Keep UUIDs handy for next step

### Step 4.2: Update Seed Script with Real UUIDs

Before running the seed script:

1. Open `supabase_seed_dev.sql`
2. Find these lines:
   ```sql
   '00000000-0000-0000-0000-000000000001'::uuid, -- REPLACE WITH ACTUAL ID
   '00000000-0000-0000-0000-000000000002'::uuid, -- REPLACE WITH ACTUAL ID
   '00000000-0000-0000-0000-000000000003'::uuid, -- REPLACE WITH ACTUAL ID
   '00000000-0000-0000-0000-000000000004'::uuid, -- REPLACE WITH ACTUAL ID
   ```
3. Replace with the UUIDs of your 4 test users
4. Save the file

### Step 4.3: Run Seed Script
**File**: `supabase_seed_dev.sql` (updated with real UUIDs)

```bash
# In Supabase SQL Editor:
1. Copy updated supabase_seed_dev.sql
2. Paste into SQL Editor
3. Click "Run" (CMD+Enter)
```

**Expected Duration**: 5 seconds
**Expected Output**: No errors, data inserted

**Verification Checklist**:
- [ ] No SQL errors
- [ ] 1 enterprise user profile created
- [ ] 2 operator profiles created
- [ ] 1 client profile created
- [ ] 2 operators in `operators` table
- [ ] 1 client in `clients` table
- [ ] 3 sessions in `shooting_sessions` table
- [ ] 4 session-operator relationships created

**Data Verification**:
```sql
-- Count records:
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM public.user_profiles
UNION ALL
SELECT 'operators', COUNT(*) FROM public.operators
UNION ALL
SELECT 'clients', COUNT(*) FROM public.clients
UNION ALL
SELECT 'shooting_sessions', COUNT(*) FROM public.shooting_sessions
UNION ALL
SELECT 'session_operators', COUNT(*) FROM public.session_operators;
```

**Expected Counts**:
- `user_profiles`: 4 (1 admin + 2 operators + 1 client)
- `operators`: 2
- `clients`: 1
- `shooting_sessions`: 3 (2 confirmed + 1 pending)
- `session_operators`: 4 (applications + assignments)

---

## PHASE 5: APPLICATION INTEGRATION ✓

### Step 5.1: Enable Supabase Adapter Feature Flag

**File**: `src/js/adapters/supabase.adapter.js`

```javascript
// Add at the top of the file:
const USE_SUPABASE = true;  // Switch from localStorage to Supabase
```

**Verification Checklist**:
- [ ] Feature flag set to `true`
- [ ] No `localStorage` writes for:
  - [ ] Sessions
  - [ ] Operators
  - [ ] Assignments
  - [ ] Clients
- [ ] All reads use `SupabaseAdapter`

### Step 5.2: Verify Frontend Integration

**Test Cases**:

1. **Login Test**
   - [ ] User can login with test credentials
   - [ ] User profile loads from Supabase
   - [ ] Temp password flag respected (prompt for reset)

2. **Enterprise Dashboard**
   - [ ] Can see all sessions (2 confirmed + 1 pending)
   - [ ] Can see all operators (2)
   - [ ] Can see all clients (1)
   - [ ] Can view applications (4 records)

3. **Operator Dashboard**
   - [ ] Can see marketplace sessions (only 1: confirmed)
   - [ ] Can see own assignments
   - [ ] Can view application status
   - [ ] Can apply to new marketplace sessions

4. **Client Dashboard**
   - [ ] Can see only own sessions (3)
   - [ ] Can view operator assignments for own sessions
   - [ ] Can update session info

---

## PHASE 6: VALIDATION & TESTING ✓

### Step 6.1: RLS Policy Testing

**Test 1: Enterprise Access (Full)**
```javascript
// Client-side (logged in as enterprise):
const sessions = await supabase
  .from('shooting_sessions')
  .select('*')
  .limit(10);
// Expected: 3 sessions returned ✓
```

**Test 2: Client Access (Restricted)**
```javascript
// Client-side (logged in as client):
const sessions = await supabase
  .from('shooting_sessions')
  .select('*')
  .limit(10);
// Expected: Only own sessions (3) ✓
```

**Test 3: Operator Access (Marketplace + Assigned)**
```javascript
// Client-side (logged in as operator):
const marketplaceSessions = await supabase
  .from('shooting_sessions')
  .select('*')
  .eq('marketplace_visible', true);
// Expected: 1 session (first one) ✓

const assignedSessions = await supabase
  .from('session_operators')
  .select('session_id, session:shooting_sessions(*)')
  .eq('operator_id', operatorId);
// Expected: Their assignments ✓
```

### Step 6.2: Data Integrity Check

```sql
-- Verify NO orphaned records:
SELECT COUNT(*) FROM session_operators
WHERE operator_id NOT IN (SELECT id FROM operators);
-- Expected: 0 ✓

SELECT COUNT(*) FROM shooting_sessions
WHERE client_id NOT IN (SELECT id FROM clients) AND client_id IS NOT NULL;
-- Expected: 0 ✓

-- Verify status values are valid:
SELECT DISTINCT status FROM session_operators;
-- Expected: pending, accepted, rejected ✓

-- Verify timestamps are reasonable:
SELECT MIN(created_at), MAX(created_at) FROM session_operators;
-- Expected: Recent timestamps ✓
```

---

## PHASE 7: PRODUCTION READINESS ✓

### Step 7.1: Backup Verification

```bash
# Before going to production:
1. Supabase automatically backs up data
2. Check backup retention: Settings → Database → Backups
3. Ensure backups are enabled and recent
```

**Checklist**:
- [ ] Auto-backups enabled
- [ ] At least one backup exists
- [ ] Retention period set appropriately

### Step 7.2: Performance Check

```sql
-- Check for slow queries:
SELECT
  calls,
  total_time,
  mean_time,
  max_time,
  query
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**Expected**: No queries taking > 100ms on test data

### Step 7.3: Final Verification

**Production Readiness Checklist**:
- [ ] All migrations applied successfully
- [ ] RLS enabled on all 5 tables
- [ ] 20 policies in place
- [ ] Test data seeded and verified
- [ ] Frontend adapter enabled
- [ ] All access control tests passed
- [ ] Backup system verified
- [ ] No performance issues detected
- [ ] localStorage abandoned
- [ ] Supabase is source of truth

---

## ROLLBACK PROCEDURES

### If Migration Fails

**Option 1: Rollback to Pre-Migration State**

```sql
-- Drop new columns from shooting_sessions:
ALTER TABLE public.shooting_sessions
DROP COLUMN IF EXISTS marketplace_visible;
ALTER TABLE public.shooting_sessions
DROP COLUMN IF EXISTS operator_requirement;

-- Drop new columns from session_operators:
ALTER TABLE public.session_operators
DROP COLUMN IF EXISTS status;
ALTER TABLE public.session_operators
DROP COLUMN IF EXISTS applied_at;
ALTER TABLE public.session_operators
DROP COLUMN IF EXISTS responded_at;
ALTER TABLE public.session_operators
DROP COLUMN IF EXISTS rejection_reason;
ALTER TABLE public.session_operators
DROP COLUMN IF EXISTS updated_at;

-- Drop new columns from user_profiles:
ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS temp_password;
ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS is_active;
ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS client_id;
ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS operator_id;

-- Drop new columns from operators:
ALTER TABLE public.operators
DROP COLUMN IF EXISTS regions;
ALTER TABLE public.operators
DROP COLUMN IF EXISTS skills;

-- Drop new columns from clients:
ALTER TABLE public.clients
DROP COLUMN IF EXISTS regions;
ALTER TABLE public.clients
DROP COLUMN IF EXISTS contact_preferences;

-- Disable RLS:
ALTER TABLE public.shooting_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all policies:
DROP POLICY IF EXISTS "enterprise_read_all_sessions" ON public.shooting_sessions;
-- ... repeat for all policies ...
```

**Option 2: Restore from Backup**

1. Go to Supabase Dashboard
2. Settings → Database → Backups
3. Click "Restore" on pre-migration backup
4. Confirm restoration

### If RLS Causes Issues

```sql
-- Temporarily disable RLS:
ALTER TABLE public.shooting_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_operators DISABLE ROW LEVEL SECURITY;

-- Debug policy (replace with actual user role):
SELECT
  auth.uid() as current_user,
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) as user_role;

-- Re-enable and refine policies as needed
```

### If Test Data Needs Cleaning

```sql
-- Delete test data:
DELETE FROM public.session_operators;
DELETE FROM public.shooting_sessions;
DELETE FROM public.user_profiles WHERE role IN ('operator', 'client');
DELETE FROM public.operators;
DELETE FROM public.clients;

-- Then re-run seed with corrected UUIDs
```

---

## MONITORING & ALERTS

### Post-Migration Monitoring

**Database Health**:
- [ ] CPU usage < 50%
- [ ] Memory usage < 70%
- [ ] No slow queries (> 500ms)
- [ ] Connection count stable

**Application Metrics**:
- [ ] Page load time < 2s
- [ ] API response time < 500ms
- [ ] Error rate < 0.1%
- [ ] RLS policy enforcement working

**Daily Checks**:
- [ ] Backup completed successfully
- [ ] No authentication failures
- [ ] Session data consistency
- [ ] Operator availability updates

---

## SUCCESS CRITERIA

DST-System is production-ready when:

✅ **Schema Phase**
- All 5 tables enhanced with required columns
- All indices created
- 0 data loss (row counts match pre/post)
- All defaults and constraints in place

✅ **Security Phase**
- RLS enabled on all 5 tables
- 20 policies deployed and tested
- Access control verified for all roles
- No unauthorized data access possible

✅ **Data Phase**
- Test data fully seeded
- All foreign keys valid
- Referential integrity confirmed
- Status/enum values validated

✅ **Integration Phase**
- Frontend adapter enabled
- Supabase is source of truth
- localStorage abandoned for primary data
- Feature flag set to true

✅ **Testing Phase**
- All RLS policies verified
- All access levels tested
- Performance acceptable
- No regression in existing functionality

✅ **Production Phase**
- Backup verified and recent
- Rollback procedure documented
- Team trained on system
- Go-live approved

---

## TIMELINE ESTIMATE

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Pre-migration audit | 3 min |
| 2 | Schema migration | 10 min |
| 3 | RLS configuration | 5 min |
| 4a | Auth user creation | 5 min |
| 4b | Seed data | 3 min |
| 5 | Frontend integration | 5 min |
| 6 | Testing & validation | 10 min |
| 7 | Production readiness | 5 min |
| **TOTAL** | | **~45 min** |

---

## SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue**: "RLS policy error on insert"
- **Cause**: User role not matching policy conditions
- **Fix**: Verify user profile has correct role, client_id, operator_id

**Issue**: "Session not visible to operator"
- **Cause**: `marketplace_visible = false` or not assigned
- **Fix**: Check session marketing flag, verify assignment exists

**Issue**: "Column does not exist"
- **Cause**: Migration failed silently
- **Fix**: Run migration again, check SQL error in editor

**Issue**: "Authentication fails after migration"
- **Cause**: RLS policy blocks all access
- **Fix**: Check user profile exists and has valid role

### Debug Commands

```sql
-- Check current user:
SELECT auth.uid();

-- Check current user's profile:
SELECT * FROM public.user_profiles WHERE id = auth.uid();

-- Check which policies apply:
SELECT policyname FROM pg_policies
WHERE tablename = 'shooting_sessions'
AND schemaname = 'public';

-- Simulate policy (as admin):
SELECT * FROM public.shooting_sessions
WHERE (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'enterprise';
```

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Developer | | | ☐ |
| QA | | | ☐ |
| DevOps | | | ☐ |
| Product | | | ☐ |

---

**Document Version**: 1.0
**Last Updated**: 2025-02-21
**Status**: READY FOR EXECUTION
