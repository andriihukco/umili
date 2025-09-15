-- Database migration to add user blocking functionality
-- Run this SQL in your Supabase SQL Editor

-- Add blocking columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS block_reason TEXT,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;

-- Add constraint to ensure block_reason is provided when user is blocked
ALTER TABLE public.users 
ADD CONSTRAINT check_block_reason 
CHECK (
  (is_blocked = FALSE) OR 
  (is_blocked = TRUE AND block_reason IS NOT NULL AND LENGTH(TRIM(block_reason)) > 0)
);

-- Create index for blocked users queries
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON public.users(is_blocked);

-- Update the updated_at timestamp when blocking/unblocking
CREATE OR REPLACE FUNCTION public.update_user_block_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the updated_at timestamp when blocking status changes
    IF OLD.is_blocked IS DISTINCT FROM NEW.is_blocked THEN
        NEW.updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamp
DROP TRIGGER IF EXISTS trigger_update_user_block_status ON public.users;
CREATE TRIGGER trigger_update_user_block_status
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_block_status();

-- Add comment to document the new columns
COMMENT ON COLUMN public.users.is_blocked IS 'Indicates if the user account is blocked';
COMMENT ON COLUMN public.users.block_reason IS 'Reason for blocking the user account';
COMMENT ON COLUMN public.users.blocked_at IS 'Timestamp when the user was blocked';
