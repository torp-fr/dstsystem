-- Add avatar_url column to operators table
-- This migration adds support for operator profile photos and avatars

ALTER TABLE operators ADD COLUMN avatar_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN operators.avatar_url IS 'URL to operator avatar or profile photo (can be from avatar collection or custom upload)';

-- Create index for faster queries if needed
CREATE INDEX idx_operators_avatar_url ON operators(avatar_url);
