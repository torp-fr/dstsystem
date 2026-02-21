-- =====================================================
-- SUPABASE PRE-MIGRATION AUDIT
-- =====================================================
-- This script audits the existing schema to identify
-- current columns before applying migrations.
--
-- Run this FIRST to verify what columns already exist.
-- =====================================================

-- =====================================================
-- AUDIT: List all columns in core tables
-- =====================================================
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name IN ('shooting_sessions', 'session_operators', 'user_profiles', 'operators', 'clients')
ORDER BY table_name, ordinal_position;

-- =====================================================
-- AUDIT: Check for existing constraints and indices
-- =====================================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('shooting_sessions', 'session_operators', 'user_profiles', 'operators', 'clients')
ORDER BY tablename, indexname;

-- =====================================================
-- AUDIT: Check for existing RLS policies
-- =====================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('shooting_sessions', 'session_operators', 'user_profiles', 'operators', 'clients')
ORDER BY tablename, policyname;

-- =====================================================
-- AUDIT: Check RLS status on tables
-- =====================================================
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_namespace.nspname = 'public'
  AND pg_class.relname IN ('shooting_sessions', 'session_operators', 'user_profiles', 'operators', 'clients')
ORDER BY tablename;

-- =====================================================
-- AUDIT: Check for foreign key relationships
-- =====================================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('shooting_sessions', 'session_operators', 'user_profiles', 'operators', 'clients')
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- AUDIT: Summary of data in each table
-- =====================================================
SELECT
  'shooting_sessions' as table_name,
  COUNT(*) as row_count
FROM shooting_sessions
UNION ALL
SELECT
  'session_operators' as table_name,
  COUNT(*) as row_count
FROM session_operators
UNION ALL
SELECT
  'user_profiles' as table_name,
  COUNT(*) as row_count
FROM user_profiles
UNION ALL
SELECT
  'operators' as table_name,
  COUNT(*) as row_count
FROM operators
UNION ALL
SELECT
  'clients' as table_name,
  COUNT(*) as row_count
FROM clients;

-- =====================================================
-- EXPECTED OUTPUT STRUCTURE:
-- =====================================================
-- shooting_sessions columns should include:
--   id, client_id, session_date, session_time, duration_minutes,
--   theme, max_participants, status, location, notes, created_by,
--   created_at, updated_at
--   (MISSING: marketplace_visible, operator_requirement)
--
-- session_operators columns should include:
--   id, session_id, operator_id, role, cost_override, created_at
--   (MISSING: status, applied_at, responded_at, rejection_reason)
--
-- user_profiles columns should include:
--   id, first_name, last_name, phone, role, status, created_at, updated_at
--   (MISSING: temp_password, is_active, client_id, operator_id)
--
-- operators columns should include:
--   id, first_name, last_name, email, phone, employment_type,
--   status, notes, created_by, created_at, updated_at
--
-- clients columns should include:
--   id, first_name, last_name, email, phone, company_name, industry,
--   status, category, address, city, country, postal_code, website,
--   notes, created_by, created_at, updated_at
-- =====================================================
