-- Database migration to add enhanced profile fields
-- Run this SQL in your Supabase SQL Editor

-- Add new columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS availability TEXT;

-- Update the portfolio_links column to have proper structure
UPDATE public.users 
SET portfolio_links = '{
  "website": "",
  "github": "",
  "linkedin": "",
  "dribbble": "",
  "behance": "",
  "figma": "",
  "instagram": "",
  "twitter": ""
}'::jsonb
WHERE portfolio_links IS NULL OR portfolio_links = '{}'::jsonb;

-- Add constraints for availability
ALTER TABLE public.users 
ADD CONSTRAINT check_availability 
CHECK (availability IS NULL OR availability IN ('available', 'busy', 'part-time', 'unavailable'));

-- Add constraints for experience_years
ALTER TABLE public.users 
ADD CONSTRAINT check_experience_years 
CHECK (experience_years IS NULL OR experience_years >= 0);

-- Create index for location searches
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users(location);

-- Create index for availability searches
CREATE INDEX IF NOT EXISTS idx_users_availability ON public.users(availability);

-- Create index for experience searches
CREATE INDEX IF NOT EXISTS idx_users_experience_years ON public.users(experience_years);

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role, portfolio_links)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', COALESCE(NEW.email, 'Користувач')),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'freelancer'),
        '{
          "website": "",
          "github": "",
          "linkedin": "",
          "dribbble": "",
          "behance": "",
          "figma": "",
          "instagram": "",
          "twitter": ""
        }'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
