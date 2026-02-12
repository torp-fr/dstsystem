-- Add offer_id column to quotes table for flexible pricing model
-- This allows quotes to reference offers instead of just sessions
-- Maintains backward compatibility with existing session_id references

-- Step 1: Add offer_id column
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL;

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_offer_id ON public.quotes(offer_id);

-- Step 3: Add notes about this change
COMMENT ON COLUMN public.quotes.offer_id IS 'References the offer used for this quote - allows flexible pricing model';

-- Migration complete
-- Note: session_id remains for backward compatibility with session-based quotes
-- Future quotes should use offer_id instead of session_id
