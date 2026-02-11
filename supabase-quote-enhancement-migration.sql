-- Add enhanced fields to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS context TEXT,
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_reason TEXT;

-- Add customer_number to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS customer_number VARCHAR(10) UNIQUE;

-- Create index for customer_number
CREATE INDEX IF NOT EXISTS idx_clients_customer_number ON clients(customer_number);
