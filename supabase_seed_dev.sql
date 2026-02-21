-- =====================================================
-- SUPABASE SEED DATA — DEVELOPMENT
-- =====================================================
-- Sample test data for DST-System development.
--
-- Creates:
--   1 Enterprise user (admin)
--   2 Operator users
--   1 Client user
--   2 Confirmed sessions
--   1 Pending session
--   Applications (pending, accepted, rejected)
--
-- WARNING: This is test data only. Do NOT use in production.
-- =====================================================

-- =====================================================
-- PART 1: Authentication setup (using auth.users)
-- =====================================================
-- NOTE: In Supabase, auth.users are created via:
-- 1. API (via signUp)
-- 2. Dashboard (Authentication > Users)
-- 3. SQL cannot directly insert into auth.users
--
-- For development, create users in Supabase Dashboard with:
--   - Enterprise: admin@dstsystem.local / password
--   - Operator 1: operator1@dstsystem.local / password
--   - Operator 2: operator2@dstsystem.local / password
--   - Client: client@dstsystem.local / password
--
-- Then run this script to populate profiles and linked tables.
-- =====================================================

-- =====================================================
-- PART 2: Enterprise User Profile
-- =====================================================

-- IMPORTANT: Replace UUID values below with actual auth.users IDs
-- You can find these in Supabase Dashboard > Authentication > Users
-- or run: SELECT id, email FROM auth.users;

-- Example: Enterprise admin
INSERT INTO public.user_profiles (
  id,
  first_name,
  last_name,
  phone,
  role,
  status,
  temp_password,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, -- REPLACE WITH ACTUAL ID
  'Admin',
  'DST',
  '+33612345678',
  'enterprise',
  'active',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PART 3: Operators
-- =====================================================

INSERT INTO public.operators (
  id,
  first_name,
  last_name,
  email,
  phone,
  employment_type,
  status,
  regions,
  skills,
  notes,
  created_at,
  updated_at
) VALUES
-- Operator 1: Photography
(
  '10000000-0000-0000-0000-000000000001'::uuid,
  'Marc',
  'Dupont',
  'marc.dupont@example.com',
  '+33698765432',
  'freelance',
  'active',
  '{"paris", "ile-de-france"}'::text[],
  '{
    "technical": ["photography", "lighting", "camera-operation"],
    "soft": ["team-coordination", "communication"],
    "certifications": ["iso-studio-certification"]
  }'::jsonb,
  'Experienced photographer with studio setup',
  NOW(),
  NOW()
),
-- Operator 2: Video
(
  '10000000-0000-0000-0000-000000000002'::uuid,
  'Sophie',
  'Martin',
  'sophie.martin@example.com',
  '+33612987654',
  'freelance',
  'active',
  '{"lyon", "rhone-alpes"}'::text[],
  '{
    "technical": ["video-production", "editing", "motion-graphics"],
    "soft": ["creativity", "client-management"],
    "certifications": ["premiere-pro", "after-effects"]
  }'::jsonb,
  'Video production specialist',
  NOW(),
  NOW()
);

-- =====================================================
-- PART 4: Operator User Profiles
-- =====================================================

-- Operator 1 user profile
INSERT INTO public.user_profiles (
  id,
  first_name,
  last_name,
  phone,
  role,
  status,
  temp_password,
  is_active,
  operator_id,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid, -- REPLACE WITH ACTUAL ID
  'Marc',
  'Dupont',
  '+33698765432',
  'operator',
  'active',
  false,
  true,
  '10000000-0000-0000-0000-000000000001'::uuid,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Operator 2 user profile
INSERT INTO public.user_profiles (
  id,
  first_name,
  last_name,
  phone,
  role,
  status,
  temp_password,
  is_active,
  operator_id,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003'::uuid, -- REPLACE WITH ACTUAL ID
  'Sophie',
  'Martin',
  '+33612987654',
  'operator',
  'active',
  false,
  true,
  '10000000-0000-0000-0000-000000000002'::uuid,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PART 5: Clients
-- =====================================================

INSERT INTO public.clients (
  id,
  first_name,
  last_name,
  email,
  phone,
  company_name,
  industry,
  status,
  category,
  address,
  city,
  country,
  postal_code,
  website,
  regions,
  contact_preferences,
  notes,
  created_at,
  updated_at
) VALUES (
  '20000000-0000-0000-0000-000000000001'::uuid,
  'Jean',
  'Durand',
  'jean.durand@fashionbrand.com',
  '+33712345678',
  'Fashion Brand Paris',
  'Fashion & Apparel',
  'prospect',
  'Premium',
  '123 Rue de Rivoli',
  'Paris',
  'France',
  '75001',
  'https://fashionbrand.com',
  '{"paris", "ile-de-france"}'::text[],
  '{
    "email": true,
    "phone": true,
    "sms": false,
    "notifications": true
  }'::jsonb,
  'High-priority fashion client, interested in product shoots',
  NOW(),
  NOW()
);

-- =====================================================
-- PART 6: Client User Profile
-- =====================================================

INSERT INTO public.user_profiles (
  id,
  first_name,
  last_name,
  phone,
  role,
  status,
  temp_password,
  is_active,
  client_id,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000004'::uuid, -- REPLACE WITH ACTUAL ID
  'Jean',
  'Durand',
  '+33712345678',
  'client',
  'active',
  false,
  true,
  '20000000-0000-0000-0000-000000000001'::uuid,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PART 7: Shooting Sessions
-- =====================================================

INSERT INTO public.shooting_sessions (
  id,
  client_id,
  session_date,
  session_time,
  duration_minutes,
  theme,
  max_participants,
  status,
  marketplace_visible,
  operator_requirement,
  location,
  notes,
  created_by,
  created_at,
  updated_at
) VALUES
-- Confirmed session (marketplace visible)
(
  '30000000-0000-0000-0000-000000000001'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  CURRENT_DATE + INTERVAL '5 days',
  '10:00:00',
  120,
  'Summer Collection Product Shoot',
  8,
  'confirmed',
  true,
  '{
    "minOperators": 2,
    "maxOperators": 3,
    "requiredSkills": ["photography", "lighting"],
    "preferredSkills": []
  }'::jsonb,
  'Studio Paris 15e',
  'Professional product shoot for summer collection',
  '00000000-0000-0000-0000-000000000001'::uuid,
  NOW(),
  NOW()
),
-- Confirmed session (not marketplace)
(
  '30000000-0000-0000-0000-000000000002'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  CURRENT_DATE + INTERVAL '12 days',
  '14:00:00',
  90,
  'Campaign Photography',
  6,
  'confirmed',
  false,
  '{
    "minOperators": 1,
    "maxOperators": 2,
    "requiredSkills": ["photography"],
    "preferredSkills": ["retouching"]
  }'::jsonb,
  'Location TBD',
  'Campaign shoot - location to be confirmed',
  '00000000-0000-0000-0000-000000000001'::uuid,
  NOW(),
  NOW()
),
-- Pending confirmation session
(
  '30000000-0000-0000-0000-000000000003'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  CURRENT_DATE + INTERVAL '20 days',
  '09:00:00',
  180,
  'Brand Photoshoot (Pending)',
  10,
  'pending_confirmation',
  false,
  '{
    "minOperators": 3,
    "maxOperators": 4,
    "requiredSkills": ["photography", "styling"],
    "preferredSkills": ["video"]
  }'::jsonb,
  'TBD',
  'Awaiting client confirmation',
  '00000000-0000-0000-0000-000000000001'::uuid,
  NOW(),
  NOW()
);

-- =====================================================
-- PART 8: Session-Operator Applications
-- =====================================================

-- Session 1 assignments and applications
-- Operator 1: Accepted
INSERT INTO public.session_operators (
  id,
  session_id,
  operator_id,
  role,
  status,
  applied_at,
  responded_at,
  created_at,
  updated_at
) VALUES (
  '40000000-0000-0000-0000-000000000001'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  'photographer',
  'accepted',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day',
  NOW(),
  NOW()
);

-- Operator 2: Pending application
INSERT INTO public.session_operators (
  id,
  session_id,
  operator_id,
  role,
  status,
  applied_at,
  created_at,
  updated_at
) VALUES (
  '40000000-0000-0000-0000-000000000002'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000002'::uuid,
  'videographer',
  'pending',
  NOW() - INTERVAL '6 hours',
  NOW(),
  NOW()
);

-- Session 2: Operator 1 accepted
INSERT INTO public.session_operators (
  id,
  session_id,
  operator_id,
  role,
  status,
  applied_at,
  responded_at,
  created_at,
  updated_at
) VALUES (
  '40000000-0000-0000-0000-000000000003'::uuid,
  '30000000-0000-0000-0000-000000000002'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  'photographer',
  'accepted',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '3 days',
  NOW(),
  NOW()
);

-- Session 2: Operator 2 rejected
INSERT INTO public.session_operators (
  id,
  session_id,
  operator_id,
  role,
  status,
  applied_at,
  responded_at,
  rejection_reason,
  created_at,
  updated_at
) VALUES (
  '40000000-0000-0000-0000-000000000004'::uuid,
  '30000000-0000-0000-0000-000000000002'::uuid,
  '10000000-0000-0000-0000-000000000002'::uuid,
  'videographer',
  'rejected',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days',
  'Unavailable due to another project',
  NOW(),
  NOW()
);

-- =====================================================
-- VERIFICATION QUERIES (run after seeding)
-- =====================================================
-- Verify user profiles created:
-- SELECT id, first_name, role, is_active FROM public.user_profiles ORDER BY created_at DESC LIMIT 4;
--
-- Verify operators:
-- SELECT id, first_name, status, regions, skills FROM public.operators;
--
-- Verify sessions:
-- SELECT id, session_date, status, marketplace_visible FROM public.shooting_sessions ORDER BY session_date;
--
-- Verify applications:
-- SELECT
--   so.id,
--   (SELECT first_name FROM operators WHERE id = so.operator_id) as operator,
--   (SELECT theme FROM shooting_sessions WHERE id = so.session_id) as session,
--   so.status,
--   so.applied_at,
--   so.responded_at
-- FROM public.session_operators so
-- ORDER BY so.created_at DESC;
--
-- Count of records:
-- SELECT 'user_profiles' as table_name, COUNT(*) as count FROM public.user_profiles
-- UNION ALL
-- SELECT 'operators', COUNT(*) FROM public.operators
-- UNION ALL
-- SELECT 'clients', COUNT(*) FROM public.clients
-- UNION ALL
-- SELECT 'shooting_sessions', COUNT(*) FROM public.shooting_sessions
-- UNION ALL
-- SELECT 'session_operators', COUNT(*) FROM public.session_operators;

-- =====================================================
-- CLEANUP (if needed)
-- =====================================================
-- To reset and clear all test data:
--   DELETE FROM public.session_operators;
--   DELETE FROM public.shooting_sessions;
--   DELETE FROM public.user_profiles WHERE role IN ('operator', 'client');
--   DELETE FROM public.operators;
--   DELETE FROM public.clients;
-- =====================================================
