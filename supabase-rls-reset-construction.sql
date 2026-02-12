-- NUCLEAR OPTION: Reset RLS for construction phase
-- This completely disables RLS, drops all policies, then re-enables with permissive policies

-- Step 1: Disable RLS on all tables
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE shooting_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE cost_structures DISABLE ROW LEVEL SECURITY;

-- Step 2: Re-enable RLS (this clears all policies)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shooting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_structures ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new permissive policies
-- clients table
CREATE POLICY "Development: Allow all reads" ON clients
  FOR SELECT USING (true);
CREATE POLICY "Development: Allow all inserts" ON clients
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Development: Allow all updates" ON clients
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Development: Allow all deletes" ON clients
  FOR DELETE USING (true);

-- shooting_sessions table
CREATE POLICY "Development: Allow all reads" ON shooting_sessions
  FOR SELECT USING (true);
CREATE POLICY "Development: Allow all inserts" ON shooting_sessions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Development: Allow all updates" ON shooting_sessions
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Development: Allow all deletes" ON shooting_sessions
  FOR DELETE USING (true);

-- client_subscriptions table
CREATE POLICY "Development: Allow all reads" ON client_subscriptions
  FOR SELECT USING (true);
CREATE POLICY "Development: Allow all inserts" ON client_subscriptions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Development: Allow all updates" ON client_subscriptions
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Development: Allow all deletes" ON client_subscriptions
  FOR DELETE USING (true);

-- offers table
CREATE POLICY "Development: Allow all reads" ON offers
  FOR SELECT USING (true);
CREATE POLICY "Development: Allow all inserts" ON offers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Development: Allow all updates" ON offers
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Development: Allow all deletes" ON offers
  FOR DELETE USING (true);

-- operators table
CREATE POLICY "Development: Allow all reads" ON operators
  FOR SELECT USING (true);
CREATE POLICY "Development: Allow all inserts" ON operators
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Development: Allow all updates" ON operators
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Development: Allow all deletes" ON operators
  FOR DELETE USING (true);

-- cost_structures table
CREATE POLICY "Development: Allow all reads" ON cost_structures
  FOR SELECT USING (true);
CREATE POLICY "Development: Allow all inserts" ON cost_structures
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Development: Allow all updates" ON cost_structures
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Development: Allow all deletes" ON cost_structures
  FOR DELETE USING (true);

-- Done! All tables now have permissive policies for development
-- WARNING: This is ONLY for construction phase - restore secure policies before launch!
