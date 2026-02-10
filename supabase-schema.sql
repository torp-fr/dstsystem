-- =====================================================
-- DST-System Database Schema
-- Copy and paste this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES (extends auth.users)
-- =====================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'admin',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =====================================================
-- CLIENTS (CRM)
-- =====================================================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  company_name VARCHAR(255),
  industry VARCHAR(255),
  status VARCHAR(50) DEFAULT 'prospect',
  category VARCHAR(100),
  address VARCHAR(500),
  city VARCHAR(255),
  country VARCHAR(255),
  postal_code VARCHAR(20),
  website VARCHAR(500),
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_category ON public.clients(category);
CREATE INDEX idx_clients_created_by ON public.clients(created_by);

-- =====================================================
-- CONTACT HISTORY
-- =====================================================
CREATE TABLE public.contact_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  contact_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  contact_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_contact_history_client_id ON public.contact_history(client_id);
CREATE INDEX idx_contact_history_contact_date ON public.contact_history(contact_date);

-- =====================================================
-- OFFERS/FORMULAS
-- =====================================================
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_hours INTEGER,
  duration_minutes INTEGER,
  max_participants INTEGER,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_offers_is_active ON public.offers(is_active);
CREATE INDEX idx_offers_category ON public.offers(category);

-- =====================================================
-- CLIENT SUBSCRIPTIONS
-- =====================================================
CREATE TABLE public.client_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  subscription_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active',
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_client_subscriptions_client_id ON public.client_subscriptions(client_id);
CREATE INDEX idx_client_subscriptions_status ON public.client_subscriptions(status);

-- =====================================================
-- INVOICES
-- =====================================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.client_subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_issue_date ON public.invoices(issue_date);

-- =====================================================
-- EXPENSES/COSTS
-- =====================================================
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  amount DECIMAL(10, 2) NOT NULL,
  expense_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date);

-- =====================================================
-- PAGE VISITS (Analytics)
-- =====================================================
CREATE TABLE public.page_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_url VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  session_id VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  referrer VARCHAR(500),
  visit_duration_seconds INTEGER,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_page_visits_page_url ON public.page_visits(page_url);
CREATE INDEX idx_page_visits_session_id ON public.page_visits(session_id);
CREATE INDEX idx_page_visits_visited_at ON public.page_visits(visited_at);
CREATE INDEX idx_page_visits_country ON public.page_visits(country);

-- =====================================================
-- SESSIONS (for tracking)
-- =====================================================
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_sessions_session_id ON public.sessions(session_id);
CREATE INDEX idx_sessions_ip_address ON public.sessions(ip_address);
CREATE INDEX idx_sessions_started_at ON public.sessions(started_at);

-- =====================================================
-- RLS (Row Level Security) - Optional
-- =====================================================

-- Allow read/write only for authenticated users (you)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Allow public reads for page_visits (for analytics tracking)
CREATE POLICY "Allow public insert on page_visits" ON public.page_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on sessions" ON public.sessions
  FOR INSERT WITH CHECK (true);

-- Allow authenticated user to read/write their data
CREATE POLICY "Enable read for authenticated users" ON public.clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.clients
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.clients
  FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- PHASE 2: OPERATORS/STAFF MANAGEMENT
-- =====================================================
CREATE TABLE public.operators (
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

CREATE INDEX idx_operators_status ON public.operators(status);
CREATE INDEX idx_operators_employment_type ON public.operators(employment_type);

-- =====================================================
-- OPERATOR RATES (salary/freelance costs)
-- =====================================================
CREATE TABLE public.operator_rates (
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

CREATE INDEX idx_operator_rates_operator_id ON public.operator_rates(operator_id);
CREATE INDEX idx_operator_rates_effective_from ON public.operator_rates(effective_from);

-- =====================================================
-- COST STRUCTURES (fixed costs, amortizations, operating expenses)
-- =====================================================
CREATE TABLE public.cost_structures (
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

CREATE INDEX idx_cost_structures_category ON public.cost_structures(category);
CREATE INDEX idx_cost_structures_is_active ON public.cost_structures(is_active);

-- =====================================================
-- SHOOTING SESSIONS (annual planning calendar)
-- =====================================================
CREATE TABLE public.shooting_sessions (
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

CREATE INDEX idx_shooting_sessions_client_id ON public.shooting_sessions(client_id);
CREATE INDEX idx_shooting_sessions_session_date ON public.shooting_sessions(session_date);
CREATE INDEX idx_shooting_sessions_status ON public.shooting_sessions(status);

-- =====================================================
-- SESSION OPERATORS (many-to-many: sessions & operators)
-- =====================================================
CREATE TABLE public.session_operators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.shooting_sessions(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  role VARCHAR(100) DEFAULT 'instructor',
  cost_override DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_session_operators_session_id ON public.session_operators(session_id);
CREATE INDEX idx_session_operators_operator_id ON public.session_operators(operator_id);

-- =====================================================
-- QUOTES (quote documents)
-- =====================================================
CREATE TABLE public.quotes (
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

CREATE INDEX idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_valid_until ON public.quotes(valid_until);

-- =====================================================
-- AMENDMENTS (avenants - amendments to quotes/invoices)
-- =====================================================
CREATE TABLE public.amendments (
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

CREATE INDEX idx_amendments_client_id ON public.amendments(client_id);
CREATE INDEX idx_amendments_quote_id ON public.amendments(quote_id);
CREATE INDEX idx_amendments_invoice_id ON public.amendments(invoice_id);
CREATE INDEX idx_amendments_status ON public.amendments(status);

-- =====================================================
-- DEPOSITS (acomptes - partial payments/deposits)
-- =====================================================
CREATE TABLE public.deposits (
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

CREATE INDEX idx_deposits_client_id ON public.deposits(client_id);
CREATE INDEX idx_deposits_quote_id ON public.deposits(quote_id);
CREATE INDEX idx_deposits_invoice_id ON public.deposits(invoice_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);

-- =====================================================
-- ENHANCED OFFERS TABLE (add columns for flexible pricing)
-- =====================================================
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS offer_type VARCHAR(50) DEFAULT 'single_session';
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT false;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS subscription_duration_months INTEGER;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS price_per_session DECIMAL(10, 2);
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS sessions_included INTEGER;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS min_participants INTEGER;

-- =====================================================
-- ENHANCED CLIENT_SUBSCRIPTIONS TABLE
-- =====================================================
ALTER TABLE public.client_subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(50) DEFAULT 'monthly';
ALTER TABLE public.client_subscriptions ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT true;
ALTER TABLE public.client_subscriptions ADD COLUMN IF NOT EXISTS sessions_used INTEGER DEFAULT 0;
ALTER TABLE public.client_subscriptions ADD COLUMN IF NOT EXISTS sessions_remaining INTEGER;

-- =====================================================
-- ENHANCED INVOICES TABLE
-- =====================================================
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
CREATE POLICY "Enable read for authenticated users" ON public.operators
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.operators
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.operators
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.operators
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON public.cost_structures
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.cost_structures
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.cost_structures
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.cost_structures
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON public.shooting_sessions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.shooting_sessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.shooting_sessions
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.shooting_sessions
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON public.quotes
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.quotes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.quotes
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.quotes
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON public.amendments
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.amendments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.amendments
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.amendments
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON public.deposits
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.deposits
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.deposits
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.deposits
  FOR DELETE USING (auth.role() = 'authenticated');

-- Shared policies for junction tables
CREATE POLICY "Enable all for authenticated users" ON public.operator_rates
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON public.session_operators
  FOR ALL USING (auth.role() = 'authenticated');

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

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_subscriptions_updated_at BEFORE UPDATE ON public.client_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON public.operators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operator_rates_updated_at BEFORE UPDATE ON public.operator_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_structures_updated_at BEFORE UPDATE ON public.cost_structures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shooting_sessions_updated_at BEFORE UPDATE ON public.shooting_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amendments_updated_at BEFORE UPDATE ON public.amendments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
