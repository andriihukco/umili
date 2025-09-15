-- Simple User Creation Script
-- Creates users with random UUIDs to avoid conflicts

-- Create Admin User
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@umili.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin User", "role": "admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Create Client User
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'client@umili.com',
    crypt('client123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Client User", "role": "client"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Create Talent User
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'talent@umili.com',
    crypt('talent123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Talent User", "role": "freelancer"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- The trigger should automatically create the public.users entries
-- Let's verify they were created
SELECT 'Users created successfully!' as status;
SELECT id, name, email, role FROM public.users WHERE email IN ('admin@umili.com', 'client@umili.com', 'talent@umili.com');

SELECT 'Test Credentials:' as info,
       'admin@umili.com / admin123' as admin_credentials,
       'client@umili.com / client123' as client_credentials,
       'talent@umili.com / talent123' as talent_credentials;
