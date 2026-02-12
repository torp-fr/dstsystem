-- Temporary RLS policies for construction phase
-- This allows all operations on tables without authentication requirement
-- TO BE RESTORED after launch!

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Enable read for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON clients;
DROP POLICY IF EXISTS "Development: Allow all reads" ON clients;
DROP POLICY IF EXISTS "Development: Allow all inserts" ON clients;
DROP POLICY IF EXISTS "Development: Allow all updates" ON clients;
DROP POLICY IF EXISTS "Development: Allow all deletes" ON clients;

-- Create permissive policies for development
-- These allow all operations - ONLY for construction phase!
CREATE POLICY "Development: Allow all reads" ON clients
  FOR SELECT
  USING (true);

CREATE POLICY "Development: Allow all inserts" ON clients
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Development: Allow all updates" ON clients
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Development: Allow all deletes" ON clients
  FOR DELETE
  USING (true);

-- Apply same to other tables
DROP POLICY IF EXISTS "Enable read for authenticated users" ON shooting_sessions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON shooting_sessions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON shooting_sessions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON shooting_sessions;
DROP POLICY IF EXISTS "Development: Allow all reads" ON shooting_sessions;
DROP POLICY IF EXISTS "Development: Allow all inserts" ON shooting_sessions;
DROP POLICY IF EXISTS "Development: Allow all updates" ON shooting_sessions;
DROP POLICY IF EXISTS "Development: Allow all deletes" ON shooting_sessions;

CREATE POLICY "Development: Allow all reads" ON shooting_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Development: Allow all inserts" ON shooting_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Development: Allow all updates" ON shooting_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Development: Allow all deletes" ON shooting_sessions
  FOR DELETE
  USING (true);

-- Apply to other key tables
DROP POLICY IF EXISTS "Enable read for authenticated users" ON client_subscriptions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON client_subscriptions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON client_subscriptions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON client_subscriptions;
DROP POLICY IF EXISTS "Development: Allow all reads" ON client_subscriptions;
DROP POLICY IF EXISTS "Development: Allow all inserts" ON client_subscriptions;
DROP POLICY IF EXISTS "Development: Allow all updates" ON client_subscriptions;
DROP POLICY IF EXISTS "Development: Allow all deletes" ON client_subscriptions;

CREATE POLICY "Development: Allow all reads" ON client_subscriptions
  FOR SELECT
  USING (true);

CREATE POLICY "Development: Allow all inserts" ON client_subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Development: Allow all updates" ON client_subscriptions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Development: Allow all deletes" ON client_subscriptions
  FOR DELETE
  USING (true);

-- WARNING: These policies are ONLY for construction phase
-- After launch, restore original authentication-based policies!
-- Policies restore the secure rules:
-- - Authenticated users can only access their own data
-- - Anonymous access is completely blocked

-- Apply to offers table
DROP POLICY IF EXISTS "Enable read for authenticated users" ON offers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON offers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON offers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON offers;
DROP POLICY IF EXISTS "Development: Allow all reads" ON offers;
DROP POLICY IF EXISTS "Development: Allow all inserts" ON offers;
DROP POLICY IF EXISTS "Development: Allow all updates" ON offers;
DROP POLICY IF EXISTS "Development: Allow all deletes" ON offers;

CREATE POLICY "Development: Allow all reads" ON offers
  FOR SELECT
  USING (true);

CREATE POLICY "Development: Allow all inserts" ON offers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Development: Allow all updates" ON offers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Development: Allow all deletes" ON offers
  FOR DELETE
  USING (true);

-- Apply to operators table
DROP POLICY IF EXISTS "Enable read for authenticated users" ON operators;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON operators;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON operators;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON operators;
DROP POLICY IF EXISTS "Development: Allow all reads" ON operators;
DROP POLICY IF EXISTS "Development: Allow all inserts" ON operators;
DROP POLICY IF EXISTS "Development: Allow all updates" ON operators;
DROP POLICY IF EXISTS "Development: Allow all deletes" ON operators;

CREATE POLICY "Development: Allow all reads" ON operators
  FOR SELECT
  USING (true);

CREATE POLICY "Development: Allow all inserts" ON operators
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Development: Allow all updates" ON operators
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Development: Allow all deletes" ON operators
  FOR DELETE
  USING (true);

-- Apply to cost_structures table
DROP POLICY IF EXISTS "Enable read for authenticated users" ON cost_structures;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON cost_structures;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON cost_structures;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON cost_structures;
DROP POLICY IF EXISTS "Development: Allow all reads" ON cost_structures;
DROP POLICY IF EXISTS "Development: Allow all inserts" ON cost_structures;
DROP POLICY IF EXISTS "Development: Allow all updates" ON cost_structures;
DROP POLICY IF EXISTS "Development: Allow all deletes" ON cost_structures;

CREATE POLICY "Development: Allow all reads" ON cost_structures
  FOR SELECT
  USING (true);

CREATE POLICY "Development: Allow all inserts" ON cost_structures
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Development: Allow all updates" ON cost_structures
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Development: Allow all deletes" ON cost_structures
  FOR DELETE
  USING (true);
