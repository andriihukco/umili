-- Add Test Users Script for Umili Platform
-- This script adds new test users without removing existing ones

-- First, check if users already exist and delete them if they do
DELETE FROM public.users WHERE email IN ('admin@umili.com', 'client@umili.com', 'talent@umili.com');
DELETE FROM auth.users WHERE email IN ('admin@umili.com', 'client@umili.com', 'talent@umili.com');

-- Create new test users in auth.users table
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
) VALUES 
-- Admin User
(
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
),
-- Client User
(
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
),
-- Talent (Freelancer) User
(
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
)
;

-- Create corresponding users in public.users table
INSERT INTO public.users (
    id,
    name,
    email,
    role,
    created_at,
    updated_at
) VALUES 
-- Admin User
(
    '11111111-1111-1111-1111-111111111111',
    'Admin User',
    'admin@umili.com',
    'admin',
    NOW(),
    NOW()
),
-- Client User
(
    '22222222-2222-2222-2222-222222222222',
    'Client User',
    'client@umili.com',
    'client',
    NOW(),
    NOW()
),
-- Talent (Freelancer) User
(
    '33333333-3333-3333-3333-333333333333',
    'Talent User',
    'talent@umili.com',
    'freelancer',
    NOW(),
    NOW()
)
;

-- Create sample task for the client
INSERT INTO public.tasks (
    id,
    title,
    description,
    budget,
    status,
    client_id,
    created_at,
    updated_at
) VALUES 
(
    '44444444-4444-4444-4444-444444444444',
    'Website Development Project',
    'Looking for a skilled developer to create a modern business website with responsive design, contact forms, and SEO optimization.',
    1500.00,
    'open',
    '22222222-2222-2222-2222-222222222222',
    NOW(),
    NOW()
)
;

-- Create sample application from talent
INSERT INTO public.applications (
    id,
    task_id,
    freelancer_id,
    message,
    proposed_budget,
    status,
    created_at,
    updated_at
) VALUES 
(
    '55555555-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    'I am interested in this project and can deliver a high-quality website within your budget. I have experience with modern web technologies and can ensure the site is fully responsive and SEO-optimized.',
    1500.00,
    'pending',
    NOW(),
    NOW()
)
;

-- Success message
SELECT 'Test users created successfully!' as status,
       'admin@umili.com / admin123' as admin_credentials,
       'client@umili.com / client123' as client_credentials,
       'talent@umili.com / talent123' as talent_credentials;
