-- Row Level Security (RLS) Policies for Umili
-- Run this in your Supabase SQL Editor to fix the profile creation issue

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view public profiles" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;

-- Users table policies
-- Allow users to insert their own profile (for registration)
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to view public profiles (for freelancer/client discovery)
CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT
  USING (
    -- Users can see their own profile
    auth.uid() = id
    OR
    -- Users can see other users' profiles if they're not blocked
    (is_blocked = false AND role IN ('freelancer', 'client'))
  );

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tasks table policies
DROP POLICY IF EXISTS "Clients can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks" ON tasks;
DROP POLICY IF EXISTS "Task owners can update tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can manage all tasks" ON tasks;

CREATE POLICY "Clients can create tasks" ON tasks
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'client'
    )
  );

CREATE POLICY "Users can view tasks" ON tasks
  FOR SELECT
  USING (
    -- Users can see their own tasks
    auth.uid() = created_by
    OR
    -- Users can see open tasks
    status = 'open'
    OR
    -- Users can see tasks they're assigned to
    auth.uid() = freelancer_id
    OR
    -- Admins can see all tasks
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Task owners can update tasks" ON tasks
  FOR UPDATE
  USING (
    auth.uid() = created_by
    OR
    auth.uid() = freelancer_id
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = created_by
    OR
    auth.uid() = freelancer_id
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all tasks" ON tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Applications table policies
DROP POLICY IF EXISTS "Freelancers can create applications" ON applications;
DROP POLICY IF EXISTS "Users can view applications" ON applications;
DROP POLICY IF EXISTS "Application owners can update applications" ON applications;

CREATE POLICY "Freelancers can create applications" ON applications
  FOR INSERT
  WITH CHECK (
    auth.uid() = freelancer_id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'freelancer'
    )
  );

CREATE POLICY "Users can view applications" ON applications
  FOR SELECT
  USING (
    -- Users can see their own applications
    auth.uid() = freelancer_id
    OR
    -- Task owners can see applications for their tasks
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = applications.task_id AND tasks.created_by = auth.uid()
    )
    OR
    -- Admins can see all applications
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Application owners can update applications" ON applications
  FOR UPDATE
  USING (
    auth.uid() = freelancer_id
    OR
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = applications.task_id AND tasks.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = freelancer_id
    OR
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = applications.task_id AND tasks.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Conversations table policies
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Conversation participants can view conversations" ON conversations;

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() = client_id OR auth.uid() = freelancer_id
  );

CREATE POLICY "Conversation participants can view conversations" ON conversations
  FOR SELECT
  USING (
    auth.uid() = client_id OR auth.uid() = freelancer_id
  );

-- Messages table policies
DROP POLICY IF EXISTS "Conversation participants can send messages" ON messages;
DROP POLICY IF EXISTS "Conversation participants can view messages" ON messages;

CREATE POLICY "Conversation participants can send messages" ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.freelancer_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can view messages" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.freelancer_id = auth.uid())
    )
  );

-- Ratings table policies
DROP POLICY IF EXISTS "Users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Users can view ratings" ON ratings;

CREATE POLICY "Users can create ratings" ON ratings
  FOR INSERT
  WITH CHECK (
    auth.uid() = rater_id
  );

CREATE POLICY "Users can view ratings" ON ratings
  FOR SELECT
  USING (
    auth.uid() = rater_id OR auth.uid() = rated_id
  );

-- Portfolio table policies
DROP POLICY IF EXISTS "Users can manage their own portfolio" ON portfolio;

CREATE POLICY "Users can manage their own portfolio" ON portfolio
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Work experience table policies
DROP POLICY IF EXISTS "Users can manage their own work experience" ON work_experience;

CREATE POLICY "Users can manage their own work experience" ON work_experience
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Education table policies
DROP POLICY IF EXISTS "Users can manage their own education" ON education;

CREATE POLICY "Users can manage their own education" ON education
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Certifications table policies
DROP POLICY IF EXISTS "Users can manage their own certifications" ON certifications;

CREATE POLICY "Users can manage their own certifications" ON certifications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User skills table policies
DROP POLICY IF EXISTS "Users can manage their own skills" ON user_skills;

CREATE POLICY "Users can manage their own skills" ON user_skills
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- File attachments table policies
DROP POLICY IF EXISTS "Users can manage their own file attachments" ON file_attachments;

CREATE POLICY "Users can manage their own file attachments" ON file_attachments
  FOR ALL
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

-- Public tables (no RLS needed for these)
-- Skills, categories, subscription_tiers are public data

-- User subscriptions table policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON user_subscriptions;

CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON user_subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usage tracking table policies
DROP POLICY IF EXISTS "Users can view their own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Admins can manage all usage" ON usage_tracking;

CREATE POLICY "Users can view their own usage" ON usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all usage" ON usage_tracking
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
