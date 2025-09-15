-- Check Existing Users Script
-- This script shows you what users already exist and their credentials

-- Show all existing users
SELECT 'EXISTING USERS:' as info;
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    'Password: Check auth.users table' as password_info
FROM public.users u
ORDER BY u.role, u.email;

-- Show auth users
SELECT 'AUTH USERS:' as info;
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email IN (
    SELECT email FROM public.users
)
ORDER BY email;

-- Show test credentials if they exist
SELECT 'TEST CREDENTIALS:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@umili.com') 
        THEN 'admin@umili.com / admin123'
        ELSE 'Admin user not found'
    END as admin_credentials,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'client@umili.com') 
        THEN 'client@umili.com / client123'
        ELSE 'Client user not found'
    END as client_credentials,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE email = 'talent@umili.com') 
        THEN 'talent@umili.com / talent123'
        ELSE 'Talent user not found'
    END as talent_credentials;
