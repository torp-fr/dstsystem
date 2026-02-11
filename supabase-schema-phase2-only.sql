-- =====================================================
-- DST-System Phase 2 Database Extensions
-- Copy and paste this in Supabase SQL Editor
-- (Safe to run - only adds NEW tables and columns)
-- =====================================================

-- =====================================================
-- PHASE 2: OPERATORS/STAFF MANAGEMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.operators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  employment_type VARCHAR(50) NOT NULL DEFAULT 'freelance',
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_operators_status ON public.operators(status);
CREATE INDEX IF NOT EXISTS idx_operators_employment_type ON public.operators(employment_type);

-- =====================================================
-- OPERATOR RATES (salary/freelance costs)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.operator_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  rate_type VARCHAR(50) NOT NULL,
  rate_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_operator_rates_operator_id ON public.operator_rates(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_rates_effective_from ON public.operator_rates(effective_from);

-- =====================================================
-- COST STRUCTURES (fixed costs, amortizations, operating expenses)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cost_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  monthly_amount DECIMAL(10, 2) DEFAULT 0,
  annual_amount DECIMAL(10, 2) DEFAULT 0,
  expense_account VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_cost_structures_category ON public.cost_structures(category);
CREATE INDEX IF NOT EXISTS idx_cost_structures_is_active ON public.cost_structures(is_active);

-- =====================================================
-- SHOOTING SESSIONS (annual planning calendar)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shooting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  session_time TIME,
  duration_minutes INTEGER DEFAULT 60,
  theme VARCHAR(255),
  max_participants INTEGER,
  status VARCHAR(50) DEFAULT 'scheduled',
  location VARCHAR(255),
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_shooting_sessions_client_id ON public.shooting_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_shooting_sessions_session_date ON public.shooting_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_shooting_sessions_status ON public.shooting_sessions(status);

-- =====================================================
-- SESSION OPERATORS (many-to-many: sessions & operators)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.session_operators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.shooting_sessions(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  role VARCHAR(100) DEFAULT 'instructor',
  cost_override DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_session_operators_session_id ON public.session_operators(session_id);
CREATE INDEX IF NOT EXISTS idx_session_operators_operator_id ON public.session_operators(operator_id);

-- =====================================================
-- QUOTES (quote documents)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.shooting_sessions(id) ON DELETE SET NULL,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON public.quotes(valid_until);

-- =====================================================
-- AMENDMENTS (avenants - amendments to quotes/invoices)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.amendments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amendment_number VARCHAR(50) UNIQUE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  changes_description TEXT NOT NULL,
  amount_change DECIMAL(10, 2) NOT NULL,
  new_total DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'draft',
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_amendments_client_id ON public.amendments(client_id);
CREATE INDEX IF NOT EXISTS idx_amendments_quote_id ON public.amendments(quote_id);
CREATE INDEX IF NOT EXISTS idx_amendments_invoice_id ON public.amendments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_amendments_status ON public.amendments(status);

-- =====================================================
-- DEPOSITS (acomptes - partial payments/deposits)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deposit_number VARCHAR(50) UNIQUE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  percentage_of_total INTEGER,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_deposits_client_id ON public.deposits(client_id);
CREATE INDEX IF NOT EXISTS idx_deposits_quote_id ON public.deposits(quote_id);
CREATE INDEX IF NOT EXISTS idx_deposits_invoice_id ON public.deposits(invoice_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);

-- =====================================================
-- ENHANCED EXISTING TABLES
-- =====================================================

-- Add Phase 2 columns to offers table (if not exists)
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS offer_type VARCHAR(50) DEFAULT 'single_session';
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT false;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS subscription_duration_months INTEGER;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS price_per_session DECIMAL(10, 2);
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS sessions_included INTEGER;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS min_participants INTEGER;

-- Add Phase 2 columns to client_subscriptions table (if not exists)
ALTER TABLE public.client_subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(50) DEFAULT 'monthly';
ALTER TABLE public.client_subscriptions ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT true;
ALTER TABLE public.client_subscriptions ADD COLUMN IF NOT EXISTS sessions_used INTEGER DEFAULT 0;
ALTER TABLE public.client_subscriptions ADD COLUMN IF NOT EXISTS sessions_remaining INTEGER;

-- Add Phase 2 columns to invoices table (if not exists)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.shooting_sessions(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS deposit_payment DECIMAL(10, 2);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS outstanding_balance DECIMAL(10, 2);

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shooting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage all new tables
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'operators' AND policyname = 'Enable read for authenticated users'
  ) THEN
    CREATE POLICY "Enable read for authenticated users" ON public.operators
      FOR SELECT USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable insert for authenticated users" ON public.operators
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Enable update for authenticated users" ON public.operators
      FOR UPDATE USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable delete for authenticated users" ON public.operators
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cost_structures' AND policyname = 'Enable read for authenticated users'
  ) THEN
    CREATE POLICY "Enable read for authenticated users" ON public.cost_structures
      FOR SELECT USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable insert for authenticated users" ON public.cost_structures
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Enable update for authenticated users" ON public.cost_structures
      FOR UPDATE USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable delete for authenticated users" ON public.cost_structures
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shooting_sessions' AND policyname = 'Enable read for authenticated users'
  ) THEN
    CREATE POLICY "Enable read for authenticated users" ON public.shooting_sessions
      FOR SELECT USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable insert for authenticated users" ON public.shooting_sessions
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Enable update for authenticated users" ON public.shooting_sessions
      FOR UPDATE USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable delete for authenticated users" ON public.shooting_sessions
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Enable read for authenticated users'
  ) THEN
    CREATE POLICY "Enable read for authenticated users" ON public.quotes
      FOR SELECT USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable insert for authenticated users" ON public.quotes
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Enable update for authenticated users" ON public.quotes
      FOR UPDATE USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable delete for authenticated users" ON public.quotes
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'amendments' AND policyname = 'Enable read for authenticated users'
  ) THEN
    CREATE POLICY "Enable read for authenticated users" ON public.amendments
      FOR SELECT USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable insert for authenticated users" ON public.amendments
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Enable update for authenticated users" ON public.amendments
      FOR UPDATE USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable delete for authenticated users" ON public.amendments
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'deposits' AND policyname = 'Enable read for authenticated users'
  ) THEN
    CREATE POLICY "Enable read for authenticated users" ON public.deposits
      FOR SELECT USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable insert for authenticated users" ON public.deposits
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Enable update for authenticated users" ON public.deposits
      FOR UPDATE USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable delete for authenticated users" ON public.deposits
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Shared policies for junction tables
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'operator_rates' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.operator_rates
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'session_operators' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.session_operators
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_operators_updated_at ON public.operators;
CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON public.operators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_operator_rates_updated_at ON public.operator_rates;
CREATE TRIGGER update_operator_rates_updated_at BEFORE UPDATE ON public.operator_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cost_structures_updated_at ON public.cost_structures;
CREATE TRIGGER update_cost_structures_updated_at BEFORE UPDATE ON public.cost_structures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shooting_sessions_updated_at ON public.shooting_sessions;
CREATE TRIGGER update_shooting_sessions_updated_at BEFORE UPDATE ON public.shooting_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_amendments_updated_at ON public.amendments;
CREATE TRIGGER update_amendments_updated_at BEFORE UPDATE ON public.amendments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deposits_updated_at ON public.deposits;
CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE! All Phase 2 tables and extensions are ready
-- =====================================================
