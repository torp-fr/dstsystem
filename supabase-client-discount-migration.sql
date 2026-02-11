-- Add discount_percentage column to client_subscriptions table
ALTER TABLE client_subscriptions
ADD COLUMN discount_percentage DECIMAL(5, 2) DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN client_subscriptions.discount_percentage IS 'Discount percentage applied to the subscription price (0-100)';

-- Create index for queries
CREATE INDEX idx_client_subscriptions_discount ON client_subscriptions(discount_percentage);
