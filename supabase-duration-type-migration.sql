-- Add duration_type column to shooting_sessions table
ALTER TABLE shooting_sessions
ADD COLUMN duration_type TEXT CHECK (duration_type IN ('full_day', 'half_day')) DEFAULT NULL;

-- Create index for performance
CREATE INDEX idx_shooting_sessions_duration_type ON shooting_sessions(duration_type);

-- Add comment for documentation
COMMENT ON COLUMN shooting_sessions.duration_type IS 'Session duration type: full_day (8h) or half_day (4h)';
