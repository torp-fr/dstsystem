# SUPABASE MIGRATION EXECUTION GUIDE

## Quick Reference

This document is a **quick reference** for executing the Supabase migration in the exact correct order.

For detailed checklists and testing procedures, see: **SUPABASE_PRODUCTION_CHECKLIST.md**

---

## EXACT EXECUTION ORDER

### 🔍 STEP 1: PRE-MIGRATION AUDIT (5 min)

**File**: `supabase_pre_migration_audit.sql`

**What it does**:
- Lists all columns in each table
- Shows existing constraints and indices
- Checks for existing RLS policies
- Counts rows in each table

**How to run**:
1. Open Supabase Dashboard → SQL Editor
2. Copy entire content of `supabase_pre_migration_audit.sql`
3. Paste into SQL Editor
4. Click "Run" (or CMD+Enter)

**Success criteria**:
- ✅ No errors in console
- ✅ Query returns 5 result sets
- ✅ Row counts match your expectations

**⚠️ CRITICAL**: Save the results! You'll compare after migration to verify data integrity.

```bash
# Example output to save:
Date: 2025-02-21
Columns: {full list of columns}
Rows: shooting_sessions=125, session_operators=342, ...
Policies: 0 (expected before migration)
```

---

### 🔄 STEP 2: SCHEMA MIGRATION (10 min)

**File**: `supabase_migration_v1.sql`

**What it does**:
- Adds `marketplace_visible` and `operator_requirement` to `shooting_sessions`
- Adds status tracking fields to `session_operators`
- Adds user account management to `user_profiles`
- Adds skills and regions to `operators` and `clients`
- Creates indices and triggers
- **ZERO data loss** (all changes are ADD COLUMN IF NOT EXISTS)

**How to run**:
1. Open Supabase Dashboard → SQL Editor
2. Copy entire content of `supabase_migration_v1.sql`
3. Paste into SQL Editor
4. Click "Run" (or CMD+Enter)

**Success criteria**:
- ✅ No errors in console
- ✅ Execution time < 15 seconds
- ✅ All columns added successfully

**Data integrity verification**:
```sql
-- After migration, verify row counts are IDENTICAL:
SELECT COUNT(*) FROM shooting_sessions;
SELECT COUNT(*) FROM session_operators;
SELECT COUNT(*) FROM user_profiles;
SELECT COUNT(*) FROM operators;
SELECT COUNT(*) FROM clients;
```

Expected: **Counts must match STEP 1 results exactly**

**Rollback (if needed)**:
```sql
-- Drop all new columns:
ALTER TABLE public.shooting_sessions DROP COLUMN IF EXISTS marketplace_visible;
ALTER TABLE public.shooting_sessions DROP COLUMN IF EXISTS operator_requirement;
-- ... repeat for all tables (see ROLLBACK SECTION below)
```

---

### 🔐 STEP 3: RLS POLICIES (5 min)

**File**: `supabase_rls_policies.sql`

**What it does**:
- Enables Row-Level Security (RLS) on 5 tables
- Creates 20 security policies:
  - Enterprise (admin): Access to everything
  - Client: Only own sessions + operator assignments
  - Operator: Marketplace sessions + own assignments
- Implements table-level access control

**How to run**:
1. Open Supabase Dashboard → SQL Editor
2. Copy entire content of `supabase_rls_policies.sql`
3. Paste into SQL Editor
4. Click "Run" (or CMD+Enter)

**⚠️ CRITICAL WARNING**:
After this step, **unauthenticated access is blocked**. The application must be using authenticated requests. If you disable this step incorrectly, you may lock yourself out.

**Success criteria**:
- ✅ No errors in console
- ✅ Execution time < 10 seconds
- ✅ RLS status = ON for all 5 tables

**Verify RLS is enabled**:
```sql
SELECT tablename, rowsecurity FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_namespace.nspname = 'public'
AND pg_class.relname IN ('shooting_sessions', 'session_operators', 'operators', 'clients', 'user_profiles');
```

Expected: All tables show `rowsecurity = true`

**Rollback (if needed - EMERGENCY ONLY)**:
```sql
-- Disable RLS on all tables:
ALTER TABLE public.shooting_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
```

---

### 📊 STEP 4: SEED TEST DATA (5 min total)

#### STEP 4A: Create Auth Users (3 min)

**Where**: Supabase Dashboard → Authentication → Users

**Create 4 test users**:
1. Click "Invite"
2. Create each user:

| Email | Password | Purpose |
|-------|----------|---------|
| admin@dstsystem.local | password123 | Enterprise admin |
| operator1@dstsystem.local | password123 | Operator 1 |
| operator2@dstsystem.local | password123 | Operator 2 |
| client@dstsystem.local | password123 | Client |

3. **IMPORTANT**: Copy the UUID of each user (visible in user details)

```
admin@dstsystem.local → 00000000-0000-0000-0000-000000000001
operator1@dstsystem.local → 00000000-0000-0000-0000-000000000002
operator2@dstsystem.local → 00000000-0000-0000-0000-000000000003
client@dstsystem.local → 00000000-0000-0000-0000-000000000004
```

#### STEP 4B: Update Seed Script (1 min)

**File**: `supabase_seed_dev.sql`

**Replace UUIDs in the script**:

Find these lines:
```sql
INSERT INTO public.user_profiles (
  id,
  ...
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,  -- ← REPLACE WITH admin UUID
  ...
), (
  '00000000-0000-0000-0000-000000000002'::uuid,  -- ← REPLACE WITH operator1 UUID
  ...
), (
  '00000000-0000-0000-0000-000000000003'::uuid,  -- ← REPLACE WITH operator2 UUID
  ...
), (
  '00000000-0000-0000-0000-000000000004'::uuid,  -- ← REPLACE WITH client UUID
```

Replace with actual UUIDs from STEP 4A.

#### STEP 4C: Run Seed Script (1 min)

**File**: `supabase_seed_dev.sql` (updated with real UUIDs)

**How to run**:
1. Open Supabase Dashboard → SQL Editor
2. Copy entire updated `supabase_seed_dev.sql`
3. Paste into SQL Editor
4. Click "Run" (or CMD+Enter)

**Success criteria**:
- ✅ No errors in console
- ✅ Execution time < 5 seconds
- ✅ Data inserted successfully

**Verify test data**:
```sql
-- Count inserted records:
SELECT COUNT(*) as count FROM public.shooting_sessions;  -- Expected: 3
SELECT COUNT(*) as count FROM public.session_operators;  -- Expected: 4
SELECT COUNT(*) as count FROM public.operators;          -- Expected: 2
SELECT COUNT(*) as count FROM public.clients;            -- Expected: 1
```

**Rollback (if needed)**:
```sql
DELETE FROM public.session_operators;
DELETE FROM public.shooting_sessions;
DELETE FROM public.user_profiles WHERE role IN ('operator', 'client');
DELETE FROM public.operators;
DELETE FROM public.clients;
-- Then re-run STEP 4 with corrected data
```

---

### 🚀 STEP 5: ENABLE SUPABASE ADAPTER (2 min)

**File**: `src/js/adapters/supabase.adapter.js`

**What it does**:
- Switches application from localStorage to Supabase
- Activates all API calls to Supabase
- Makes Supabase the source of truth

**How to enable**:

Find this line (near top of file):
```javascript
const USE_SUPABASE = false;  // Currently disabled
```

Change to:
```javascript
const USE_SUPABASE = true;  // NOW ENABLED
```

**Success criteria**:
- ✅ Feature flag set to `true`
- ✅ No `localStorage` writes for sessions/operators
- ✅ All data reads from Supabase

**How to verify**:
1. Open browser DevTools (F12) → Network tab
2. Login with test credentials
3. Watch network requests:
   - ✅ Should see `POST /auth/v1/token` (authentication)
   - ✅ Should see `/rest/v1/user_profiles?` (data fetch)
   - ✅ Should NOT see localStorage writes

---

### ✅ STEP 6: TESTING & VALIDATION (10 min)

**Test Case 1: Enterprise Access**
```javascript
// Login as: admin@dstsystem.local
// Expected: Can see all 3 sessions, all 2 operators
```

**Test Case 2: Client Access**
```javascript
// Login as: client@dstsystem.local
// Expected: Can see only own sessions (3)
```

**Test Case 3: Operator Access**
```javascript
// Login as: operator1@dstsystem.local
// Expected:
//   - Can see 1 marketplace session
//   - Can see own assignments
//   - Can apply to sessions
```

**Test Case 4: RLS Enforcement**
```javascript
// In browser DevTools console:
// Attempting unauthorized access should fail:
const sessions = await supabase
  .from('shooting_sessions')
  .select('*')
  .eq('id', 'other-users-session-id');
// Expected: Empty result or error (RLS blocks it)
```

---

## CRITICAL DEPENDENCIES

```
STEP 1 (Audit)
    ↓
STEP 2 (Migration) ← Must NOT be skipped
    ↓
STEP 3 (RLS) ← Only after migration succeeds
    ↓
STEP 4A (Auth Users) ← Create before seeding
    ↓
STEP 4B (Update Seed) ← Replace UUIDs
    ↓
STEP 4C (Run Seed) ← Final data load
    ↓
STEP 5 (Enable Adapter) ← Only after testing
    ↓
STEP 6 (Validate) ← Comprehensive testing
    ↓
🎉 PRODUCTION READY
```

**⚠️ DO NOT SKIP ANY STEPS OR CHANGE ORDER**

---

## RISK ASSESSMENT

| Step | Risk Level | Impact | Mitigation |
|------|-----------|--------|-----------|
| 1 (Audit) | **NONE** | Informational only | N/A |
| 2 (Migration) | **VERY LOW** | Data corruption if constraints fail | Have backup ready |
| 3 (RLS) | **CRITICAL** | May lock out all access | Know rollback procedure |
| 4 (Seed) | **LOW** | Duplicate data if run twice | Delete and re-run |
| 5 (Adapter) | **MEDIUM** | Breaks if policies wrong | App will error immediately |
| 6 (Validate) | **NONE** | Testing only | Rollback if issues found |

**Overall Risk**: 🟢 **LOW**
- All migrations are add-only (no drops)
- Data integrity preserved
- Easy rollback at each step
- No production data affected until STEP 5

---

## ESTIMATED TIMELINE

```
Step 1: 5 min   (Audit)
Step 2: 10 min  (Migration)
Step 3: 5 min   (RLS)
Step 4: 5 min   (Seed)
Step 5: 2 min   (Adapter)
Step 6: 10 min  (Validate)
───────────────────
TOTAL: ~40 minutes
```

**Can be done in one sitting** by one developer.

---

## EMERGENCY ROLLBACK

If something goes wrong at any step:

### Option 1: Rollback Specific Step
```sql
-- See ROLLBACK sections in each step above
-- Execute the appropriate rollback SQL
-- Re-run the failed step
```

### Option 2: Restore Full Backup
```
Supabase Dashboard
→ Settings
→ Database
→ Backups
→ Click "Restore" on pre-migration backup
```

**Rollback time**: < 2 minutes
**Data loss**: ZERO

---

## POST-MIGRATION CHECKLIST

After all 6 steps complete:

- [ ] All row counts match pre-migration
- [ ] RLS enabled on all 5 tables
- [ ] 20 policies deployed
- [ ] Test users created and logged in successfully
- [ ] Test data visible (3 sessions, 2 operators, etc.)
- [ ] Feature flag set to `true`
- [ ] Frontend showing Supabase data
- [ ] All access control tests passed
- [ ] No errors in browser console
- [ ] No slow queries detected
- [ ] Backup verified

---

## SUPPORT CHANNELS

**If you get stuck**:

1. Check **SUPABASE_PRODUCTION_CHECKLIST.md** for detailed testing
2. Review **ROLLBACK PROCEDURES** section
3. Check browser DevTools console for errors
4. Compare against expected output in each step
5. Run debug SQL queries provided

---

## SUCCESS CONFIRMATION

✅ **Migration is successful when**:

```sql
-- All migrations applied:
SELECT COUNT(*) FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name IN ('marketplace_visible', 'status', 'temp_password', 'client_id', 'operator_id');
-- Expected: > 0

-- RLS enabled:
SELECT COUNT(*) FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_namespace.nspname = 'public'
AND rowsecurity = true;
-- Expected: 5

-- Policies in place:
SELECT COUNT(*) FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('shooting_sessions', 'session_operators', 'operators', 'clients', 'user_profiles');
-- Expected: 20

-- Test data seeded:
SELECT COUNT(*) FROM shooting_sessions;
-- Expected: 3

-- Frontend working:
-- Login as admin@dstsystem.local
-- Dashboard loads without errors
-- Data shows 3 sessions, 2 operators, 1 client
```

When ALL of the above are true → **YOU'RE DONE! 🎉**

---

**Document Version**: 1.0
**Status**: READY FOR EXECUTION
**Last Updated**: 2025-02-21

Execute with confidence. Roll back instantly if needed. You've got this! 💪
