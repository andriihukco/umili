-- Safe User Creation Script for Umili Platform
-- This script checks existing users and creates only if they don't exist

-- Check what users already exist
SELECT 'Existing users:' as info;
SELECT id, email, role FROM public.users WHERE email IN ('admin@umili.com', 'client@umili.com', 'talent@umili.com');

-- Check what auth users exist
SELECT 'Existing auth users:' as info;
SELECT id, email FROM auth.users WHERE email IN ('admin@umili.com', 'client@umili.com', 'talent@umili.com');

-- Only create users if they don't exist
-- Admin User
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
) 
SELECT 
    '11111111-1111-1111-1111-111111111111',
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
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@umili.com');

-- Client User
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
) 
SELECT 
    '22222222-2222-2222-2222-222222222222',
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
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'client@umili.com');

-- Talent User
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
) 
SELECT 
    '33333333-3333-3333-3333-333333333333',
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
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'talent@umili.com');

-- Create corresponding users in public.users table (only if they don't exist)
INSERT INTO public.users (
    id,
    name,
    email,
    role,
    created_at,
    updated_at
) 
SELECT 
    '11111111-1111-1111-1111-111111111111',
    'Admin User',
    'admin@umili.com',
    'admin',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@umili.com');

INSERT INTO public.users (
    id,
    name,
    email,
    role,
    created_at,
    updated_at
) 
SELECT 
    '22222222-2222-2222-2222-222222222222',
    'Client User',
    'client@umili.com',
    'client',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'client@umili.com');

INSERT INTO public.users (
    id,
    name,
    email,
    role,
    created_at,
    updated_at
) 
SELECT 
    '33333333-3333-3333-3333-333333333333',
    'Talent User',
    'talent@umili.com',
    'freelancer',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'talent@umili.com');

-- Show final result
SELECT 'Final users created:' as info;
SELECT id, email, role FROM public.users WHERE email IN ('admin@umili.com', 'client@umili.com', 'talent@umili.com');

-- Show credentials
SELECT 'Test User Credentials:' as info,
       'admin@umili.com / admin123' as admin_credentials,
       'client@umili.com / client123' as client_credentials,
       'talent@umili.com / talent123' as talent_credentials;
