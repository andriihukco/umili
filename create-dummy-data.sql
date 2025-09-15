-- Umili Freelance Marketplace - Comprehensive Dummy Data
-- This script creates realistic test data for all user flows
-- Run this in your Supabase SQL Editor

-- ==============================================
-- PHASE 1: CREATE AUTH USERS (Supabase auth.users)
-- ==============================================

-- Note: In Supabase, auth.users are created through the auth system
-- These are the UUIDs that will be referenced in the public.users table
-- You'll need to create these users through your app's registration flow
-- or manually in Supabase Auth dashboard

-- For testing purposes, we'll temporarily disable the foreign key constraint
-- and create the users directly in public.users table
-- IMPORTANT: You still need to create corresponding auth.users manually

-- Temporarily disable the foreign key constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- ==============================================
-- PHASE 2: INSERT SUBSCRIPTION TIERS (if not exists)
-- ==============================================

-- Check if subscription_tiers table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_tiers' AND table_schema = 'public') THEN
        -- Create subscription tiers table
        CREATE TABLE public.subscription_tiers (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('freelancer', 'client')),
            price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
            price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
            applications_limit INTEGER NOT NULL DEFAULT 10,
            job_posts_limit INTEGER NOT NULL DEFAULT 10,
            features JSONB NOT NULL DEFAULT '{}',
            liqpay_product_id TEXT,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create user subscriptions table
        CREATE TABLE public.user_subscriptions (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            tier_id UUID REFERENCES public.subscription_tiers(id) ON DELETE CASCADE NOT NULL,
            liqpay_order_id TEXT UNIQUE,
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
            billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
            current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
            current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create usage tracking table
        CREATE TABLE public.usage_tracking (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            usage_type TEXT NOT NULL CHECK (usage_type IN ('application', 'job_post')),
            period_start TIMESTAMP WITH TIME ZONE NOT NULL,
            period_end TIMESTAMP WITH TIME ZONE NOT NULL,
            count INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, usage_type, period_start)
        );
    END IF;
END $$;

INSERT INTO public.subscription_tiers (name, role, price_monthly, price_yearly, applications_limit, job_posts_limit, features) VALUES
('Free', 'freelancer', 0, 0, 10, 0, '{"priority_support": false, "analytics": false, "custom_profile": false}'),
('Pro', 'freelancer', 29.99, 299.99, -1, 0, '{"priority_support": true, "analytics": true, "custom_profile": true}'),
('Free', 'client', 0, 0, 0, 10, '{"priority_support": false, "analytics": false, "custom_branding": false}'),
('Pro', 'client', 49.99, 499.99, 0, -1, '{"priority_support": true, "analytics": true, "custom_branding": true}')
ON CONFLICT DO NOTHING;

-- ==============================================
-- PHASE 3: CREATE MISSING TABLES (if needed)
-- ==============================================

-- Check and create missing tables that might not exist
DO $$
BEGIN
    -- Create portfolio table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolio' AND table_schema = 'public') THEN
        CREATE TABLE public.portfolio (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT,
            project_url TEXT,
            skills_used TEXT[],
            category TEXT,
            budget_range TEXT,
            duration TEXT,
            client_feedback TEXT,
            rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
            is_featured BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Create skills table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skills' AND table_schema = 'public') THEN
        CREATE TABLE public.skills (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            category TEXT NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Create user_skills table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_skills' AND table_schema = 'public') THEN
        CREATE TABLE public.user_skills (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
            proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
            years_experience INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, skill_id)
        );
    END IF;
    
    -- Create categories table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories' AND table_schema = 'public') THEN
        CREATE TABLE public.categories (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            parent_id UUID REFERENCES public.categories(id),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Create ratings table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ratings' AND table_schema = 'public') THEN
        CREATE TABLE public.ratings (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
            rater_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            rated_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5) NOT NULL,
            review TEXT,
            communication_rating DECIMAL(2,1) CHECK (communication_rating >= 0 AND communication_rating <= 5),
            quality_rating DECIMAL(2,1) CHECK (quality_rating >= 0 AND quality_rating <= 5),
            timeliness_rating DECIMAL(2,1) CHECK (timeliness_rating >= 0 AND timeliness_rating <= 5),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(task_id, rater_id, rated_id)
        );
    END IF;
    
    -- Create notifications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        CREATE TABLE public.notifications (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
            is_read BOOLEAN DEFAULT false,
            related_id UUID, -- Can reference task_id, application_id, etc.
            related_type TEXT, -- 'task', 'application', 'message', etc.
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- ==============================================
-- PHASE 4: CREATE SKILLS AND CATEGORIES
-- ==============================================

-- Insert skills
INSERT INTO public.skills (name, category, description, is_active) VALUES
-- Web Development
('React', 'Web Development', 'JavaScript library for building user interfaces', true),
('Vue.js', 'Web Development', 'Progressive JavaScript framework', true),
('Angular', 'Web Development', 'Platform for building mobile and desktop web applications', true),
('Node.js', 'Web Development', 'JavaScript runtime for server-side development', true),
('Express.js', 'Web Development', 'Web framework for Node.js', true),
('Next.js', 'Web Development', 'React framework for production', true),
('TypeScript', 'Web Development', 'Typed superset of JavaScript', true),
('HTML5', 'Web Development', 'Markup language for web pages', true),
('CSS3', 'Web Development', 'Styling language for web pages', true),
('JavaScript', 'Web Development', 'Programming language for web development', true),

-- Mobile Development
('React Native', 'Mobile Development', 'Framework for building mobile apps', true),
('Flutter', 'Mobile Development', 'UI toolkit for building mobile apps', true),
('Swift', 'Mobile Development', 'Programming language for iOS', true),
('Kotlin', 'Mobile Development', 'Programming language for Android', true),
('iOS Development', 'Mobile Development', 'Development for Apple iOS platform', true),
('Android Development', 'Mobile Development', 'Development for Android platform', true),

-- Design
('UI/UX Design', 'Design', 'User interface and user experience design', true),
('Figma', 'Design', 'Collaborative interface design tool', true),
('Adobe Photoshop', 'Design', 'Image editing software', true),
('Adobe Illustrator', 'Design', 'Vector graphics editor', true),
('Sketch', 'Design', 'Digital design toolkit', true),
('Adobe XD', 'Design', 'User experience design software', true),

-- Backend Development
('Python', 'Backend Development', 'High-level programming language', true),
('Django', 'Backend Development', 'Python web framework', true),
('Flask', 'Backend Development', 'Lightweight Python web framework', true),
('PHP', 'Backend Development', 'Server-side scripting language', true),
('Laravel', 'Backend Development', 'PHP web framework', true),
('Ruby on Rails', 'Backend Development', 'Ruby web framework', true),
('Java', 'Backend Development', 'Object-oriented programming language', true),
('Spring Boot', 'Backend Development', 'Java framework for microservices', true),

-- Database
('PostgreSQL', 'Database', 'Open source relational database', true),
('MySQL', 'Database', 'Open source relational database', true),
('MongoDB', 'Database', 'NoSQL document database', true),
('Redis', 'Database', 'In-memory data structure store', true),
('SQLite', 'Database', 'Lightweight SQL database', true),

-- DevOps & Cloud
('Docker', 'DevOps', 'Containerization platform', true),
('Kubernetes', 'DevOps', 'Container orchestration', true),
('AWS', 'Cloud', 'Amazon Web Services', true),
('Google Cloud', 'Cloud', 'Google Cloud Platform', true),
('Azure', 'Cloud', 'Microsoft Azure', true),
('CI/CD', 'DevOps', 'Continuous integration and deployment', true),

-- Marketing & Content
('SEO', 'Marketing', 'Search engine optimization', true),
('Content Writing', 'Content', 'Creating written content', true),
('Social Media Marketing', 'Marketing', 'Marketing on social platforms', true),
('Google Analytics', 'Marketing', 'Web analytics service', true),
('Email Marketing', 'Marketing', 'Marketing via email campaigns', true),

-- Other
('Project Management', 'Management', 'Planning and executing projects', true),
('Agile', 'Management', 'Project management methodology', true),
('Scrum', 'Management', 'Agile framework', true),
('Git', 'Development', 'Version control system', true),
('Linux', 'System Administration', 'Open source operating system', true)
ON CONFLICT (name) DO NOTHING;

-- Insert categories
INSERT INTO public.categories (name, description, parent_id, is_active) VALUES
('Web Development', 'Building websites and web applications', NULL, true),
('Mobile Development', 'Creating mobile applications', NULL, true),
('Design', 'UI/UX and graphic design services', NULL, true),
('Backend Development', 'Server-side development and APIs', NULL, true),
('Database', 'Database design and management', NULL, true),
('DevOps & Cloud', 'Infrastructure and deployment services', NULL, true),
('Marketing & Content', 'Digital marketing and content creation', NULL, true),
('Management', 'Project and business management', NULL, true),
('Other', 'Miscellaneous services', NULL, true)
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- PHASE 5: CREATE DUMMY USERS
-- ==============================================

-- Get subscription tier IDs
DO $$
DECLARE
    freelancer_free_tier_id UUID;
    freelancer_pro_tier_id UUID;
    client_free_tier_id UUID;
    client_pro_tier_id UUID;
BEGIN
    -- Get tier IDs
    SELECT id INTO freelancer_free_tier_id FROM public.subscription_tiers WHERE name = 'Free' AND role = 'freelancer';
    SELECT id INTO freelancer_pro_tier_id FROM public.subscription_tiers WHERE name = 'Pro' AND role = 'freelancer';
    SELECT id INTO client_free_tier_id FROM public.subscription_tiers WHERE name = 'Free' AND role = 'client';
    SELECT id INTO client_pro_tier_id FROM public.subscription_tiers WHERE name = 'Pro' AND role = 'client';

    -- Insert dummy users (these UUIDs should match auth.users created in Supabase Auth)
    -- For testing, you can create these users through your app's registration or manually in Supabase Auth
    
    -- Sample freelancers
    INSERT INTO public.users (id, name, email, role, avatar, bio, skills, hourly_rate, current_tier_id) VALUES
    -- Freelancer 1 - Web Developer (Pro)
    ('11111111-1111-1111-1111-111111111111', 'Олексій Петренко', 'alex.petrenko@example.com', 'freelancer', 
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 
     'Досвідчений веб-розробник з 5+ роками досвіду. Спеціалізуюся на React, Node.js та TypeScript. Створив понад 50 успішних проектів для клієнтів з різних галузей.',
     ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'], 45.00, freelancer_pro_tier_id),
    
    -- Freelancer 2 - UI/UX Designer (Free)
    ('22222222-2222-2222-2222-222222222222', 'Марія Коваленко', 'maria.kovalenko@example.com', 'freelancer',
     'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
     'Креативний UI/UX дизайнер з фокусом на користувацький досвід. Працюю з Figma, Adobe Creative Suite. Створюю інтуїтивні та красиві інтерфейси.',
     ARRAY['UI/UX Design', 'Figma', 'Adobe Photoshop', 'Adobe Illustrator'], 35.00, freelancer_free_tier_id),
    
    -- Freelancer 3 - Mobile Developer (Pro)
    ('33333333-3333-3333-3333-333333333333', 'Дмитро Іваненко', 'dmitro.ivanenko@example.com', 'freelancer',
     'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
     'Мобільний розробник з експертизою в React Native та Flutter. Розробив понад 30 мобільних додатків для iOS та Android.',
     ARRAY['React Native', 'Flutter', 'iOS Development', 'Android Development', 'JavaScript'], 50.00, freelancer_pro_tier_id),
    
    -- Freelancer 4 - Backend Developer (Free)
    ('44444444-4444-4444-4444-444444444444', 'Анна Сидоренко', 'anna.sidorenko@example.com', 'freelancer',
     'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
     'Backend розробник з досвідом роботи з Python, Django та PostgreSQL. Спеціалізуюся на створенні масштабованих API та мікросервісів.',
     ARRAY['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS'], 40.00, freelancer_free_tier_id),
    
    -- Freelancer 5 - Full Stack Developer (Pro)
    ('55555555-5555-5555-5555-555555555555', 'Володимир Мельник', 'volodymyr.melnyk@example.com', 'freelancer',
     'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
     'Full-stack розробник з широким спектром навичок. Працюю з React, Node.js, Python, PostgreSQL. Можу взятися за будь-який проект від ідеї до запуску.',
     ARRAY['React', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker'], 55.00, freelancer_pro_tier_id),
    
    -- Freelancer 6 - Marketing Specialist (Free)
    ('66666666-6666-6666-6666-666666666666', 'Оксана Шевченко', 'oksana.shevchenko@example.com', 'freelancer',
     'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
     'Спеціаліст з цифрового маркетингу та контент-маркетингу. Допоможу з SEO, соціальними мережами та email-маркетингом.',
     ARRAY['SEO', 'Content Writing', 'Social Media Marketing', 'Google Analytics'], 25.00, freelancer_free_tier_id),

    -- Clients
    -- Client 1 - Startup Founder (Pro)
    ('77777777-7777-7777-7777-777777777777', 'Ігор Бондаренко', 'igor.bondarenko@example.com', 'client',
     'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
     'Засновник стартапу в сфері фінтех. Шукаю талановитих розробників для створення інноваційних продуктів.',
     ARRAY['Project Management', 'Business Strategy'], NULL, client_pro_tier_id),
    
    -- Client 2 - E-commerce Owner (Free)
    ('88888888-8888-8888-8888-888888888888', 'Наталія Романенко', 'natalia.romanenko@example.com', 'client',
     'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
     'Власниця інтернет-магазину одягу. Потрібна допомога з розробкою сайту та маркетингом.',
     ARRAY['E-commerce', 'Marketing'], NULL, client_free_tier_id),
    
    -- Client 3 - Agency Owner (Pro)
    ('99999999-9999-9999-9999-999999999999', 'Сергій Левченко', 'sergey.levchenko@example.com', 'client',
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
     'Керівник дизайн-агенції. Працюємо з великими клієнтами та потребуємо підтримки розробників.',
     ARRAY['Design', 'Project Management'], NULL, client_pro_tier_id),
    
    -- Client 4 - Small Business Owner (Free)
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Тетяна Кравченко', 'tetyana.kravchenko@example.com', 'client',
     'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
     'Власниця кафе. Потрібен сайт для замовлення їжі онлайн та система лояльності.',
     ARRAY['Restaurant', 'Small Business'], NULL, client_free_tier_id),

    -- Admin
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Адміністратор', 'admin@umili.com', 'admin',
     'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
     'Системний адміністратор платформи Umili.',
     ARRAY['System Administration', 'Project Management'], NULL, NULL)
    ON CONFLICT (id) DO NOTHING;

END $$;

-- ==============================================
-- PHASE 6: CREATE USER SKILLS
-- ==============================================

-- Insert user skills with proficiency levels
INSERT INTO public.user_skills (user_id, skill_id, proficiency_level, years_experience) VALUES
-- Олексій Петренко skills
('11111111-1111-1111-1111-111111111111', (SELECT id FROM public.skills WHERE name = 'React'), 'expert', 5),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM public.skills WHERE name = 'Node.js'), 'expert', 4),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM public.skills WHERE name = 'TypeScript'), 'advanced', 3),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM public.skills WHERE name = 'PostgreSQL'), 'advanced', 4),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM public.skills WHERE name = 'AWS'), 'intermediate', 2),

-- Марія Коваленко skills
('22222222-2222-2222-2222-222222222222', (SELECT id FROM public.skills WHERE name = 'UI/UX Design'), 'expert', 4),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM public.skills WHERE name = 'Figma'), 'expert', 3),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM public.skills WHERE name = 'Adobe Photoshop'), 'advanced', 5),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM public.skills WHERE name = 'Adobe Illustrator'), 'advanced', 4),

-- Дмитро Іваненко skills
('33333333-3333-3333-3333-333333333333', (SELECT id FROM public.skills WHERE name = 'React Native'), 'expert', 4),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM public.skills WHERE name = 'Flutter'), 'advanced', 3),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM public.skills WHERE name = 'iOS Development'), 'advanced', 3),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM public.skills WHERE name = 'Android Development'), 'advanced', 3),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM public.skills WHERE name = 'JavaScript'), 'expert', 5),

-- Анна Сидоренко skills
('44444444-4444-4444-4444-444444444444', (SELECT id FROM public.skills WHERE name = 'Python'), 'expert', 4),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM public.skills WHERE name = 'Django'), 'expert', 3),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM public.skills WHERE name = 'PostgreSQL'), 'advanced', 3),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM public.skills WHERE name = 'Docker'), 'intermediate', 2),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM public.skills WHERE name = 'AWS'), 'intermediate', 2),

-- Володимир Мельник skills
('55555555-5555-5555-5555-555555555555', (SELECT id FROM public.skills WHERE name = 'React'), 'expert', 5),
('55555555-5555-5555-5555-555555555555', (SELECT id FROM public.skills WHERE name = 'Node.js'), 'expert', 4),
('55555555-5555-5555-5555-555555555555', (SELECT id FROM public.skills WHERE name = 'Python'), 'advanced', 3),
('55555555-5555-5555-5555-555555555555', (SELECT id FROM public.skills WHERE name = 'PostgreSQL'), 'advanced', 4),
('55555555-5555-5555-5555-555555555555', (SELECT id FROM public.skills WHERE name = 'AWS'), 'advanced', 3),
('55555555-5555-5555-5555-555555555555', (SELECT id FROM public.skills WHERE name = 'Docker'), 'advanced', 3),

-- Оксана Шевченко skills
('66666666-6666-6666-6666-666666666666', (SELECT id FROM public.skills WHERE name = 'SEO'), 'advanced', 3),
('66666666-6666-6666-6666-666666666666', (SELECT id FROM public.skills WHERE name = 'Content Writing'), 'expert', 4),
('66666666-6666-6666-6666-666666666666', (SELECT id FROM public.skills WHERE name = 'Social Media Marketing'), 'advanced', 3),
('66666666-6666-6666-6666-666666666666', (SELECT id FROM public.skills WHERE name = 'Google Analytics'), 'intermediate', 2)
ON CONFLICT (user_id, skill_id) DO NOTHING;

-- ==============================================
-- IMPORTANT: NEXT STEPS
-- ==============================================

-- 1. Create corresponding auth.users in Supabase Auth dashboard with these exact UUIDs:
--    - 11111111-1111-1111-1111-111111111111 (alex.petrenko@example.com)
--    - 22222222-2222-2222-2222-222222222222 (maria.kovalenko@example.com)
--    - 33333333-3333-3333-3333-333333333333 (dmitro.ivanenko@example.com)
--    - 44444444-4444-4444-4444-444444444444 (anna.sidorenko@example.com)
--    - 55555555-5555-5555-5555-555555555555 (volodymyr.melnyk@example.com)
--    - 66666666-6666-6666-6666-666666666666 (oksana.shevchenko@example.com)
--    - 77777777-7777-7777-7777-777777777777 (igor.bondarenko@example.com)
--    - 88888888-8888-8888-8888-888888888888 (natalia.romanenko@example.com)
--    - 99999999-9999-9999-9999-999999999999 (sergey.levchenko@example.com)
--    - aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa (tetyana.kravchenko@example.com)
--    - bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb (admin@umili.com)

-- 2. After creating auth.users, re-enable the foreign key constraint:
--    ALTER TABLE public.users ADD CONSTRAINT users_id_fkey 
--    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Set passwords for all users (e.g., "password123")

-- 4. Continue with create-dummy-data-part2.sql and create-dummy-data-part3.sql
