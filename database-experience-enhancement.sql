-- Umili Database Enhancement - Work Experience Management
-- Run this SQL in your Supabase SQL Editor to add work experience functionality

-- Create work_experience table
CREATE TABLE IF NOT EXISTS public.work_experience (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    position TEXT NOT NULL,
    location TEXT,
    employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')) DEFAULT 'full-time',
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    achievements TEXT[],
    skills_used TEXT[],
    company_website TEXT,
    company_logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create education table
CREATE TABLE IF NOT EXISTS public.education (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    institution_name TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    gpa DECIMAL(3,2),
    description TEXT,
    achievements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    credential_id TEXT,
    credential_url TEXT,
    skills_verified TEXT[],
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_experience_user_id ON public.work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experience_start_date ON public.work_experience(start_date);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON public.education(user_id);
CREATE INDEX IF NOT EXISTS idx_education_start_date ON public.education(start_date);
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON public.certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_issue_date ON public.certifications(issue_date);

-- Create triggers for updated_at
CREATE TRIGGER update_work_experience_updated_at BEFORE UPDATE ON public.work_experience
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON public.education
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON public.certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Work Experience policies
CREATE POLICY "Users can view all work experience" ON public.work_experience
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own work experience" ON public.work_experience
    FOR ALL USING (user_id = auth.uid());

-- Education policies
CREATE POLICY "Users can view all education" ON public.education
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own education" ON public.education
    FOR ALL USING (user_id = auth.uid());

-- Certifications policies
CREATE POLICY "Users can view all certifications" ON public.certifications
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own certifications" ON public.certifications
    FOR ALL USING (user_id = auth.uid());

-- Add additional fields to users table for enhanced profile
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS availability TEXT CHECK (availability IN ('available', 'busy', 'part-time', 'unavailable'));

-- Update portfolio_links structure to include more social platforms
-- This will be handled in the application layer to maintain backward compatibility
