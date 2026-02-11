-- =====================================================
-- DST-System: Complete Clients Table Migration
-- Adds missing columns: customer_number, learner_count, structure_type
-- =====================================================

-- Add missing columns to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS customer_number VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS learner_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS structure_type VARCHAR(50);

-- Generate customer numbers for existing clients (if not already set)
UPDATE public.clients
SET customer_number = SUBSTRING(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  (RANDOM() * 36)::INT + 1, 1
) || SUBSTRING(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  (RANDOM() * 36)::INT + 1, 1
) || SUBSTRING(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  (RANDOM() * 36)::INT + 1, 1
) || SUBSTRING(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  (RANDOM() * 36)::INT + 1, 1
) || SUBSTRING(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  (RANDOM() * 36)::INT + 1, 1
) || SUBSTRING(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  (RANDOM() * 36)::INT + 1, 1
) || SUBSTRING(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  (RANDOM() * 36)::INT + 1, 1
) || SUBSTRING(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  (RANDOM() * 36)::INT + 1, 1
) || SUBSTRING(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  (RANDOM() * 36)::INT + 1, 1
) || SUBSTRING(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  (RANDOM() * 36)::INT + 1, 1
)
WHERE customer_number IS NULL;

-- Create index on customer_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_clients_customer_number ON public.clients(customer_number);
