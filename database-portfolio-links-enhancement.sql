-- Add YouTube and TikTok to portfolio_links structure
-- This script updates existing users to include the new social media fields

-- Update the portfolio_links column to include YouTube and TikTok
UPDATE public.users 
SET portfolio_links = portfolio_links || '{
  "youtube": "",
  "tiktok": ""
}'::jsonb
WHERE portfolio_links IS NOT NULL;

-- For users with null portfolio_links, set the complete structure
UPDATE public.users 
SET portfolio_links = '{
  "website": "",
  "github": "",
  "linkedin": "",
  "dribbble": "",
  "behance": "",
  "figma": "",
  "instagram": "",
  "twitter": "",
  "youtube": "",
  "tiktok": ""
}'::jsonb
WHERE portfolio_links IS NULL;

-- Update the function that handles new user creation to include all portfolio links
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
          "twitter": "",
          "youtube": "",
          "tiktok": ""
        }'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
