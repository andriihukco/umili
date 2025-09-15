-- Make hukdrew@gmail.com an admin
-- Run this ONE script in Supabase SQL editor

-- Check if user already exists and get their ID
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Get existing user ID or create new one
    SELECT id INTO user_id FROM auth.users WHERE email = 'hukdrew@gmail.com';
    
    IF user_id IS NULL THEN
        -- Create new user
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'hukdrew@gmail.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Huk Drew", "role": "admin"}',
            NOW(),
            NOW()
        );
        
        -- Get the new user ID
        SELECT id INTO user_id FROM auth.users WHERE email = 'hukdrew@gmail.com';
    ELSE
        -- Update existing user
        UPDATE auth.users 
        SET raw_user_meta_data = '{"name": "Huk Drew", "role": "admin"}',
            updated_at = NOW()
        WHERE id = user_id;
    END IF;
    
    -- Create or update public.users record
    INSERT INTO public.users (id, name, email, role)
    VALUES (user_id, 'Huk Drew', 'hukdrew@gmail.com', 'admin')
    ON CONFLICT (id) DO UPDATE SET 
        role = 'admin',
        name = 'Huk Drew',
        email = 'hukdrew@gmail.com';
END $$;

-- Login with: hukdrew@gmail.com / admin123
