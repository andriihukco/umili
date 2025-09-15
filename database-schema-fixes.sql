-- Umili Database Schema Fixes - Complete Implementation
-- Run this SQL in your Supabase SQL Editor to fix all schema issues

-- ==============================================
-- PHASE 1: FIX EXISTING TABLE INCONSISTENCIES
-- ==============================================

-- Fix tasks table - standardize field names and add missing columns
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS skills_required TEXT[],
ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'expert')),
ADD COLUMN IF NOT EXISTS project_type TEXT CHECK (project_type IN ('one_time', 'ongoing', 'consultation')),
ADD COLUMN IF NOT EXISTS estimated_duration TEXT,
ADD COLUMN IF NOT EXISTS deadline DATE,
ADD COLUMN IF NOT EXISTS additional_requirements TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Update existing tasks to have created_by = client_id
UPDATE public.tasks SET created_by = client_id WHERE created_by IS NULL;

-- Make created_by NOT NULL after update
ALTER TABLE public.tasks ALTER COLUMN created_by SET NOT NULL;

-- Add index for created_by
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);

-- ==============================================
-- PHASE 2: CREATE MISSING TABLES
-- ==============================================

-- Create portfolio table
CREATE TABLE IF NOT EXISTS public.portfolio (
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

-- Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_skills table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
    years_experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
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

-- Create file_attachments table
CREATE TABLE IF NOT EXISTS public.file_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES public.portfolio(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
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

-- ==============================================
-- PHASE 3: ADD INDEXES FOR PERFORMANCE
-- ==============================================

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON public.portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON public.portfolio(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_is_featured ON public.portfolio(is_featured);

-- Skills indexes
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_name ON public.skills(name);

-- User skills indexes
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- Ratings indexes
CREATE INDEX IF NOT EXISTS idx_ratings_task_id ON public.ratings(task_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater_id ON public.ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_id ON public.ratings(rated_id);

-- File attachments indexes
CREATE INDEX IF NOT EXISTS idx_file_attachments_task_id ON public.file_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_application_id ON public.file_attachments(application_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_portfolio_id ON public.file_attachments(portfolio_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- ==============================================
-- PHASE 4: ENABLE ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on new tables
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- PHASE 5: CREATE RLS POLICIES
-- ==============================================

-- Portfolio policies
CREATE POLICY "Users can view all portfolios" ON public.portfolio
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own portfolio" ON public.portfolio
    FOR ALL USING (auth.uid() = user_id);

-- Skills policies
CREATE POLICY "Anyone can view skills" ON public.skills
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage skills" ON public.skills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- User skills policies
CREATE POLICY "Users can view all user skills" ON public.user_skills
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own skills" ON public.user_skills
    FOR ALL USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Ratings policies
CREATE POLICY "Users can view ratings" ON public.ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for their tasks" ON public.ratings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE tasks.id = ratings.task_id 
            AND (tasks.client_id = auth.uid() OR tasks.freelancer_id = auth.uid())
        )
    );

-- File attachments policies
CREATE POLICY "Users can view attachments for their tasks/applications" ON public.file_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE tasks.id = file_attachments.task_id 
            AND (tasks.client_id = auth.uid() OR tasks.freelancer_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = file_attachments.application_id 
            AND (applications.freelancer_id = auth.uid() OR 
                 EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = applications.task_id AND tasks.client_id = auth.uid()))
        ) OR
        EXISTS (
            SELECT 1 FROM public.portfolio 
            WHERE portfolio.id = file_attachments.portfolio_id 
            AND portfolio.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload attachments" ON public.file_attachments
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- ==============================================
-- PHASE 6: CREATE TRIGGERS FOR UPDATED_AT
-- ==============================================

-- Portfolio trigger
CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON public.portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- PHASE 7: INSERT DEFAULT DATA
-- ==============================================

-- Insert default skills
INSERT INTO public.skills (name, category, description) VALUES
-- Web Development
('HTML', 'Web Development', 'HyperText Markup Language'),
('CSS', 'Web Development', 'Cascading Style Sheets'),
('JavaScript', 'Web Development', 'Programming language for web development'),
('TypeScript', 'Web Development', 'Typed superset of JavaScript'),
('React', 'Web Development', 'JavaScript library for building user interfaces'),
('Vue.js', 'Web Development', 'Progressive JavaScript framework'),
('Angular', 'Web Development', 'Platform for building mobile and desktop web applications'),
('Node.js', 'Web Development', 'JavaScript runtime for server-side development'),
('Next.js', 'Web Development', 'React framework for production'),
('Express.js', 'Web Development', 'Web framework for Node.js'),
('PHP', 'Web Development', 'Server-side scripting language'),
('Laravel', 'Web Development', 'PHP web application framework'),
('Python', 'Web Development', 'High-level programming language'),
('Django', 'Web Development', 'Python web framework'),
('Flask', 'Web Development', 'Lightweight Python web framework'),

-- Design
('Figma', 'Design', 'Collaborative interface design tool'),
('Adobe Photoshop', 'Design', 'Image editing and graphic design software'),
('Adobe Illustrator', 'Design', 'Vector graphics editor'),
('Adobe XD', 'Design', 'User experience design tool'),
('Sketch', 'Design', 'Digital design toolkit'),
('InDesign', 'Design', 'Desktop publishing and page layout software'),

-- Marketing
('SEO', 'Marketing', 'Search Engine Optimization'),
('Google Analytics', 'Marketing', 'Web analytics service'),
('Facebook Ads', 'Marketing', 'Social media advertising platform'),
('Google Ads', 'Marketing', 'Online advertising platform'),
('Instagram Marketing', 'Marketing', 'Social media marketing on Instagram'),
('Content Writing', 'Marketing', 'Creating written content for marketing'),
('Copywriting', 'Marketing', 'Writing persuasive marketing content'),

-- Mobile Development
('iOS Development', 'Mobile Development', 'Apple mobile platform development'),
('Android Development', 'Mobile Development', 'Google mobile platform development'),
('React Native', 'Mobile Development', 'Cross-platform mobile development'),
('Flutter', 'Mobile Development', 'Google UI toolkit for mobile apps'),

-- Other
('Translation', 'Other', 'Converting text from one language to another'),
('Video Editing', 'Other', 'Post-production video editing'),
('Photography', 'Other', 'Art and practice of creating images'),
('Data Analysis', 'Other', 'Process of inspecting and modeling data'),
('Project Management', 'Other', 'Planning and organizing project resources')
ON CONFLICT (name) DO NOTHING;

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
('Web Development', 'Building websites and web applications'),
('Mobile Development', 'Creating mobile applications'),
('Design', 'UI/UX design and graphic design'),
('Marketing', 'Digital marketing and advertising'),
('Writing', 'Content creation and copywriting'),
('Translation', 'Language translation services'),
('Photography', 'Photography and image editing'),
('Video Production', 'Video creation and editing'),
('Consulting', 'Professional consulting services'),
('Other', 'Other services and projects')
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- PHASE 8: UPDATE EXISTING FUNCTIONS
-- ==============================================

-- Update the conversation creation function to handle new schema
CREATE OR REPLACE FUNCTION public.create_conversation_on_accept()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create conversation when application status changes to 'accepted'
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        -- Create conversation
        INSERT INTO public.conversations (task_id, client_id, freelancer_id)
        SELECT 
            NEW.task_id,
            t.client_id,
            NEW.freelancer_id
        FROM public.tasks t
        WHERE t.id = NEW.task_id
        ON CONFLICT (task_id, client_id, freelancer_id) DO NOTHING;
        
        -- Assign freelancer to task
        UPDATE public.tasks 
        SET freelancer_id = NEW.freelancer_id, status = 'in_progress'
        WHERE id = NEW.task_id;
        
        -- Insert system message about application acceptance
        INSERT INTO public.messages (conversation_id, sender_id, content, message_type)
        SELECT 
            c.id,
            t.client_id,
            'Заявку прийнято! Тепер ви можете обговорювати деталі проекту.',
            'system'
        FROM public.conversations c
        JOIN public.tasks t ON t.id = c.task_id
        WHERE c.task_id = NEW.task_id AND c.freelancer_id = NEW.freelancer_id;
        
        -- Create notification for freelancer
        INSERT INTO public.notifications (user_id, title, message, type, related_id, related_type)
        VALUES (
            NEW.freelancer_id,
            'Заявку прийнято!',
            'Вашу заявку на завдання прийнято. Можете починати роботу.',
            'success',
            NEW.task_id,
            'task'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PHASE 9: CREATE HELPER FUNCTIONS
-- ==============================================

-- Function to get user's skills
CREATE OR REPLACE FUNCTION public.get_user_skills(p_user_id UUID)
RETURNS TABLE(
    skill_id UUID,
    skill_name TEXT,
    category TEXT,
    proficiency_level TEXT,
    years_experience INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as skill_id,
        s.name as skill_name,
        s.category,
        us.proficiency_level,
        us.years_experience
    FROM public.user_skills us
    JOIN public.skills s ON us.skill_id = s.id
    WHERE us.user_id = p_user_id
    ORDER BY s.category, s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's average rating
CREATE OR REPLACE FUNCTION public.get_user_rating(p_user_id UUID)
RETURNS DECIMAL(2,1) AS $$
DECLARE
    avg_rating DECIMAL(2,1);
BEGIN
    SELECT COALESCE(AVG(rating), 0) INTO avg_rating
    FROM public.ratings
    WHERE rated_id = p_user_id;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's portfolio count
CREATE OR REPLACE FUNCTION public.get_user_portfolio_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    portfolio_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO portfolio_count
    FROM public.portfolio
    WHERE user_id = p_user_id;
    
    RETURN portfolio_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PHASE 10: ENABLE REALTIME FOR NEW TABLES
-- ==============================================

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_skills;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- This completes the database schema fixes
-- All tables are now properly structured with:
-- - Consistent field naming
-- - Proper relationships
-- - RLS policies
-- - Indexes for performance
-- - Default data
-- - Helper functions
