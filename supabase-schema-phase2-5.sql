-- Phase 2.5: Add missing fields for enhanced client and quote management

-- 1. Add new columns to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS learner_count INTEGER DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS structure_type VARCHAR(50) DEFAULT 'other';
-- Valid structure_types: police, gendarme, mairie, pompiers, militaire, particulier, entreprise, association, autre

-- 2. Add TVA tracking to quotes and invoices
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS tva_rate DECIMAL(5,2) DEFAULT 20;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tva_rate DECIMAL(5,2) DEFAULT 20;

-- 3. Add better cost tracking for operators
ALTER TABLE public.operator_rates ADD COLUMN IF NOT EXISTS gross_daily_cost DECIMAL(10,2);
ALTER TABLE public.operator_rates ADD COLUMN IF NOT EXISTS company_total_cost DECIMAL(10,2);
ALTER TABLE public.operator_rates ADD COLUMN IF NOT EXISTS employee_charges_percent DECIMAL(5,2) DEFAULT 42;
ALTER TABLE public.operator_rates ADD COLUMN IF NOT EXISTS employer_charges_percent DECIMAL(5,2) DEFAULT 45;

-- 4. Add session capacity tracking
ALTER TABLE public.shooting_sessions ADD COLUMN IF NOT EXISTS max_shooters INTEGER DEFAULT 20;
ALTER TABLE public.shooting_sessions ADD COLUMN IF NOT EXISTS required_days INTEGER DEFAULT 1;

-- Create function to calculate French employee costs
CREATE OR REPLACE FUNCTION calculate_french_employee_cost(
  hourly_net DECIMAL,
  daily_hours INTEGER DEFAULT 8,
  employee_charges DECIMAL DEFAULT 42,
  employer_charges DECIMAL DEFAULT 45
) RETURNS TABLE (
  daily_net DECIMAL,
  daily_gross DECIMAL,
  daily_employee_cost DECIMAL,
  daily_employer_cost DECIMAL,
  daily_total_company_cost DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (hourly_net * daily_hours)::DECIMAL,
    ((hourly_net * daily_hours) / (1 - (employee_charges::DECIMAL / 100)))::DECIMAL,
    (((hourly_net * daily_hours) / (1 - (employee_charges::DECIMAL / 100))) * (employee_charges::DECIMAL / 100))::DECIMAL,
    ((hourly_net * daily_hours * (employer_charges::DECIMAL / 100)) / (1 - (employee_charges::DECIMAL / 100)))::DECIMAL,
    ((hourly_net * daily_hours) / (1 - ((employee_charges::DECIMAL + employer_charges::DECIMAL) / 100)))::DECIMAL;
END;
$$ LANGUAGE plpgsql;

-- Create structure types enum reference table
CREATE TABLE IF NOT EXISTS public.structure_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert standard structure types
INSERT INTO public.structure_types (name, code) VALUES
  ('Police Nationale', 'police'),
  ('Gendarmerie', 'gendarme'),
  ('Mairie', 'mairie'),
  ('Pompiers', 'pompiers'),
  ('Militaire', 'militaire'),
  ('Particulier', 'particulier'),
  ('Entreprise', 'entreprise'),
  ('Association', 'association'),
  ('Autre', 'autre')
ON CONFLICT (code) DO NOTHING;

-- Add RLS policies for structure_types
ALTER TABLE public.structure_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on structure_types" ON public.structure_types
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated create structure_types" ON public.structure_types
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
