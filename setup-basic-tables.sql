-- Umili Freelance Marketplace - Basic Tables Setup
-- Run this FIRST before running the dummy data scripts
-- This ensures all required tables exist

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.portfolio CASCADE;
DROP TABLE IF EXISTS public.user_skills CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.usage_tracking CASCADE;
DROP TABLE IF EXISTS public.subscription_tiers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('freelancer', 'client', 'admin')),
    avatar TEXT,
    bio TEXT,
    skills TEXT[],
    hourly_rate DECIMAL(10,2),
    current_tier_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL CHECK (budget > 0),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')),
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table for freelancer applications
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    proposed_budget DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, freelancer_id)
);

-- Create conversations table for chat
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, client_id, freelancer_id)
);

-- Create messages table for chat
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'application', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create portfolio table
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

-- Create skills table
CREATE TABLE public.skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_skills table (many-to-many relationship)
CREATE TABLE public.user_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
    years_experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ratings table
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

-- Create notifications table
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

-- Add foreign key constraint for current_tier_id (after subscription_tiers table is created)
-- This will be done after the subscription_tiers table is created

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_freelancer_id ON public.tasks(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_applications_task_id ON public.applications(task_id);
CREATE INDEX IF NOT EXISTS idx_applications_freelancer_id ON public.applications(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_conversations_task_id ON public.conversations(task_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_freelancer_id ON public.conversations(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_current_tier_id ON public.users(current_tier_id);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_role ON public.subscription_tiers(role);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON public.usage_tracking(period_start, period_end);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_tiers_updated_at ON public.subscription_tiers;
CREATE TRIGGER update_subscription_tiers_updated_at BEFORE UPDATE ON public.subscription_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON public.usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON public.usage_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (simplified for testing)
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users" ON public.users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view tasks" ON public.tasks;
CREATE POLICY "Anyone can view tasks" ON public.tasks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Clients can create tasks" ON public.tasks;
CREATE POLICY "Clients can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (
        auth.uid() = client_id AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'client'
        )
    );

DROP POLICY IF EXISTS "Task owners can update their tasks" ON public.tasks;
CREATE POLICY "Task owners can update their tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Assigned freelancers can update task status" ON public.tasks;
CREATE POLICY "Assigned freelancers can update task status" ON public.tasks
    FOR UPDATE USING (auth.uid() = freelancer_id);

-- Applications policies
DROP POLICY IF EXISTS "Users can view applications for their tasks" ON public.applications;
CREATE POLICY "Users can view applications for their tasks" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE tasks.id = applications.task_id 
            AND (tasks.client_id = auth.uid() OR applications.freelancer_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Freelancers can create applications" ON public.applications;
CREATE POLICY "Freelancers can create applications" ON public.applications
    FOR INSERT WITH CHECK (
        auth.uid() = freelancer_id AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'freelancer'
        )
    );

DROP POLICY IF EXISTS "Task clients can update application status" ON public.applications;
CREATE POLICY "Task clients can update application status" ON public.applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE tasks.id = applications.task_id 
            AND tasks.client_id = auth.uid()
        )
    );

-- Conversations policies
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        client_id = auth.uid() OR freelancer_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can create conversations for their tasks" ON public.conversations;
CREATE POLICY "Users can create conversations for their tasks" ON public.conversations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE tasks.id = conversations.task_id 
            AND (tasks.client_id = auth.uid() OR tasks.freelancer_id = auth.uid())
        )
    );

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (conversations.client_id = auth.uid() OR conversations.freelancer_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (conversations.client_id = auth.uid() OR conversations.freelancer_id = auth.uid())
        )
    );

-- Subscription tiers policies
DROP POLICY IF EXISTS "Anyone can view subscription tiers" ON public.subscription_tiers;
CREATE POLICY "Anyone can view subscription tiers" ON public.subscription_tiers
    FOR SELECT USING (true);

-- User subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (user_id = auth.uid());

-- Usage tracking policies
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;
CREATE POLICY "Users can view their own usage" ON public.usage_tracking
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can track usage" ON public.usage_tracking;
CREATE POLICY "System can track usage" ON public.usage_tracking
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update usage" ON public.usage_tracking;
CREATE POLICY "System can update usage" ON public.usage_tracking
    FOR UPDATE USING (true);

-- Portfolio policies
DROP POLICY IF EXISTS "Anyone can view portfolio" ON public.portfolio;
CREATE POLICY "Anyone can view portfolio" ON public.portfolio
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own portfolio" ON public.portfolio;
CREATE POLICY "Users can manage their own portfolio" ON public.portfolio
    FOR ALL USING (user_id = auth.uid());

-- Skills policies
DROP POLICY IF EXISTS "Anyone can view skills" ON public.skills;
CREATE POLICY "Anyone can view skills" ON public.skills
    FOR SELECT USING (true);

-- User skills policies
DROP POLICY IF EXISTS "Anyone can view user skills" ON public.user_skills;
CREATE POLICY "Anyone can view user skills" ON public.user_skills
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own skills" ON public.user_skills;
CREATE POLICY "Users can manage their own skills" ON public.user_skills
    FOR ALL USING (user_id = auth.uid());

-- Categories policies
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

-- Ratings policies
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.ratings;
CREATE POLICY "Anyone can view ratings" ON public.ratings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create ratings" ON public.ratings;
CREATE POLICY "Users can create ratings" ON public.ratings
    FOR INSERT WITH CHECK (rater_id = auth.uid());

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Enable realtime for messages and applications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;

-- Create a function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', COALESCE(NEW.email, 'Користувач')),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'freelancer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to automatically create conversation when application is accepted
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for conversation creation
DROP TRIGGER IF EXISTS create_conversation_on_application_accept ON public.applications;
CREATE TRIGGER create_conversation_on_application_accept
    AFTER UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.create_conversation_on_accept();

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, role, price_monthly, price_yearly, applications_limit, job_posts_limit, features) VALUES
('Free', 'freelancer', 0, 0, 10, 0, '{"priority_support": false, "analytics": false, "custom_profile": false}'),
('Pro', 'freelancer', 29.99, 299.99, -1, 0, '{"priority_support": true, "analytics": true, "custom_profile": true}'),
('Free', 'client', 0, 0, 0, 10, '{"priority_support": false, "analytics": false, "custom_branding": false}'),
('Pro', 'client', 49.99, 499.99, 0, -1, '{"priority_support": true, "analytics": true, "custom_branding": true}')
ON CONFLICT DO NOTHING;

-- Now add the foreign key constraint for current_tier_id
ALTER TABLE public.users ADD CONSTRAINT fk_users_current_tier 
    FOREIGN KEY (current_tier_id) REFERENCES public.subscription_tiers(id);

-- Function to check usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(
    p_user_id UUID,
    p_usage_type TEXT,
    p_limit INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    period_start TIMESTAMP WITH TIME ZONE;
    period_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate current period (monthly for freelancers, monthly for clients)
    period_start := date_trunc('month', NOW());
    period_end := period_start + INTERVAL '1 month' - INTERVAL '1 second';
    
    -- Get current usage count
    SELECT COALESCE(count, 0) INTO current_count
    FROM public.usage_tracking
    WHERE user_id = p_user_id 
    AND usage_type = p_usage_type
    AND period_start = date_trunc('month', NOW());
    
    -- Return true if under limit (-1 means unlimited)
    RETURN p_limit = -1 OR current_count < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(
    p_user_id UUID,
    p_usage_type TEXT
)
RETURNS VOID AS $$
DECLARE
    period_start TIMESTAMP WITH TIME ZONE;
    period_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate current period
    period_start := date_trunc('month', NOW());
    period_end := period_start + INTERVAL '1 month' - INTERVAL '1 second';
    
    -- Insert or update usage count
    INSERT INTO public.usage_tracking (user_id, usage_type, period_start, period_end, count)
    VALUES (p_user_id, p_usage_type, period_start, period_end, 1)
    ON CONFLICT (user_id, usage_type, period_start)
    DO UPDATE SET 
        count = usage_tracking.count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current tier limits
CREATE OR REPLACE FUNCTION public.get_user_limits(p_user_id UUID)
RETURNS TABLE(
    applications_limit INTEGER,
    job_posts_limit INTEGER,
    tier_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(st.applications_limit, 10) as applications_limit,
        COALESCE(st.job_posts_limit, 10) as job_posts_limit,
        COALESCE(st.name, 'Free') as tier_name
    FROM public.users u
    LEFT JOIN public.subscription_tiers st ON u.current_tier_id = st.id
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
