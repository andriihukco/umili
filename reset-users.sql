-- Reset Users Script for Umili Platform
-- This script removes all existing users and creates test users for each role

-- Step 1: Remove all existing data (in correct order due to foreign keys)
DELETE FROM public.messages;
DELETE FROM public.conversations;
DELETE FROM public.applications;
DELETE FROM public.tasks;
DELETE FROM public.user_subscriptions;
DELETE FROM public.usage_tracking;
DELETE FROM public.users;

-- Step 2: Remove all auth users
DELETE FROM auth.users;

-- Step 3: Create test users in auth.users table
-- Admin Users
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
-- Admin 1
(
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin1@umili.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin One", "role": "admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
-- Admin 2
(
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin2@umili.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin Two", "role": "admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
-- Admin 3
(
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin3@umili.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin Three", "role": "admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
-- Client 1
(
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'client1@umili.com',
    crypt('client123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Client One", "role": "client"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
-- Client 2
(
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'client2@umili.com',
    crypt('client123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Client Two", "role": "client"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
-- Client 3
(
    '66666666-6666-6666-6666-666666666666',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'client3@umili.com',
    crypt('client123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Client Three", "role": "client"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
-- Freelancer 1
(
    '77777777-7777-7777-7777-777777777777',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'freelancer1@umili.com',
    crypt('freelancer123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Freelancer One", "role": "freelancer"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
-- Freelancer 2
(
    '88888888-8888-8888-8888-888888888888',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'freelancer2@umili.com',
    crypt('freelancer123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Freelancer Two", "role": "freelancer"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
-- Freelancer 3
(
    '99999999-9999-9999-9999-999999999999',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'freelancer3@umili.com',
    crypt('freelancer123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Freelancer Three", "role": "freelancer"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Step 4: Create corresponding users in public.users table
INSERT INTO public.users (
    id,
    name,
    email,
    role,
    bio,
    skills,
    hourly_rate,
    created_at,
    updated_at
) VALUES 
-- Admin Users
(
    '11111111-1111-1111-1111-111111111111',
    'Admin One',
    'admin1@umili.com',
    'admin',
    'Platform administrator with full access to all features and user management.',
    ARRAY['Administration', 'User Management', 'System Monitoring'],
    0.00,
    NOW(),
    NOW()
),
(
    '22222222-2222-2222-2222-222222222222',
    'Admin Two',
    'admin2@umili.com',
    'admin',
    'Senior administrator responsible for platform oversight and analytics.',
    ARRAY['Analytics', 'Platform Management', 'Support'],
    0.00,
    NOW(),
    NOW()
),
(
    '33333333-3333-3333-3333-333333333333',
    'Admin Three',
    'admin3@umili.com',
    'admin',
    'Technical administrator focused on system maintenance and user support.',
    ARRAY['Technical Support', 'System Maintenance', 'Security'],
    0.00,
    NOW(),
    NOW()
),
-- Client Users
(
    '44444444-4444-4444-4444-444444444444',
    'Client One',
    'client1@umili.com',
    'client',
    'Business owner looking for talented freelancers to help grow my company.',
    ARRAY['Project Management', 'Business Strategy'],
    0.00,
    NOW(),
    NOW()
),
(
    '55555555-5555-5555-5555-555555555555',
    'Client Two',
    'client2@umili.com',
    'client',
    'Startup founder seeking skilled developers and designers for various projects.',
    ARRAY['Startup Management', 'Product Development'],
    0.00,
    NOW(),
    NOW()
),
(
    '66666666-6666-6666-6666-666666666666',
    'Client Three',
    'client3@umili.com',
    'client',
    'Marketing agency owner looking for creative professionals and content creators.',
    ARRAY['Marketing', 'Brand Management', 'Content Strategy'],
    0.00,
    NOW(),
    NOW()
),
-- Freelancer Users
(
    '77777777-7777-7777-7777-777777777777',
    'Freelancer One',
    'freelancer1@umili.com',
    'freelancer',
    'Full-stack developer with 5+ years of experience in React, Node.js, and Python.',
    ARRAY['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'PostgreSQL'],
    45.00,
    NOW(),
    NOW()
),
(
    '88888888-8888-8888-8888-888888888888',
    'Freelancer Two',
    'freelancer2@umili.com',
    'freelancer',
    'UI/UX designer specializing in modern web and mobile applications.',
    ARRAY['UI Design', 'UX Research', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
    35.00,
    NOW(),
    NOW()
),
(
    '99999999-9999-9999-9999-999999999999',
    'Freelancer Three',
    'freelancer3@umili.com',
    'freelancer',
    'Digital marketing specialist with expertise in SEO, social media, and content creation.',
    ARRAY['SEO', 'Social Media Marketing', 'Content Writing', 'Google Analytics', 'PPC'],
    25.00,
    NOW(),
    NOW()
);

-- Step 5: Create some sample tasks for testing
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
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'E-commerce Website Development',
    'Need a full-stack developer to build a modern e-commerce website with React frontend and Node.js backend. Should include user authentication, payment integration, and admin dashboard.',
    2500.00,
    'open',
    '44444444-4444-4444-4444-444444444444',
    NOW(),
    NOW()
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Mobile App UI/UX Design',
    'Looking for a talented UI/UX designer to create wireframes and designs for a food delivery mobile app. Should be modern, user-friendly, and follow current design trends.',
    1200.00,
    'open',
    '55555555-5555-5555-5555-555555555555',
    NOW(),
    NOW()
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'SEO Optimization Campaign',
    'Need an SEO specialist to optimize our website and improve search rankings. Should include keyword research, on-page optimization, and content strategy.',
    800.00,
    'open',
    '66666666-6666-6666-6666-666666666666',
    NOW(),
    NOW()
);

-- Step 6: Create some sample applications
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
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '77777777-7777-7777-7777-777777777777',
    'I have extensive experience with React and Node.js. I can deliver a high-quality e-commerce platform with all the features you need. My proposed timeline is 4-6 weeks.',
    2500.00,
    'pending',
    NOW(),
    NOW()
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '88888888-8888-8888-8888-888888888888',
    'I specialize in mobile app design and have worked on several food delivery apps. I can create modern, intuitive designs that will enhance user experience.',
    1200.00,
    'pending',
    NOW(),
    NOW()
),
(
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '99999999-9999-9999-9999-999999999999',
    'I have a proven track record of improving website rankings. I can provide comprehensive SEO services including technical optimization and content strategy.',
    800.00,
    'pending',
    NOW(),
    NOW()
);

-- Success message
SELECT 'Database reset completed successfully! Test users created.' as status;
