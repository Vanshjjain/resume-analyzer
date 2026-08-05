-- =====================================================================
-- AI Resume Analyzer & Career Assistant - Supabase Database Schema
-- =====================================================================
-- Copy and paste this script directly into your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- =====================================================================

-- Drop existing tables to avoid column type conflicts (UUID vs INT)
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.interview_questions CASCADE;
DROP TABLE IF EXISTS public.skill_gap_reports CASCADE;
DROP TABLE IF EXISTS public.job_recommendations CASCADE;
DROP TABLE IF EXISTS public.resume_analyses CASCADE;
DROP TABLE IF EXISTS public.resume_versions CASCADE;
DROP TABLE IF EXISTS public.resumes CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. USERS TABLE
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON public.users(email);

-- 2. RESUMES TABLE
CREATE TABLE public.resumes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);

-- 3. RESUME VERSIONS TABLE
CREATE TABLE public.resume_versions (
    id SERIAL PRIMARY KEY,
    resume_id INT NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    version_name VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    raw_text TEXT,
    parsed_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resume_versions_resume_id ON public.resume_versions(resume_id);

-- 4. RESUME ANALYSES TABLE
CREATE TABLE public.resume_analyses (
    id SERIAL PRIMARY KEY,
    resume_version_id INT NOT NULL REFERENCES public.resume_versions(id) ON DELETE CASCADE,
    ats_score INT NOT NULL,
    category_scores JSONB NOT NULL,
    feedback JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resume_analyses_version_id ON public.resume_analyses(resume_version_id);

-- 5. JOB RECOMMENDATIONS TABLE
CREATE TABLE public.job_recommendations (
    id SERIAL PRIMARY KEY,
    resume_version_id INT NOT NULL REFERENCES public.resume_versions(id) ON DELETE CASCADE,
    role_name VARCHAR(255) NOT NULL,
    match_percentage INT NOT NULL,
    fit_reason TEXT NOT NULL,
    missing_skills JSONB NOT NULL,
    learning_roadmap JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_recommendations_version_id ON public.job_recommendations(resume_version_id);

-- 6. SKILL GAP REPORTS TABLE
CREATE TABLE public.skill_gap_reports (
    id SERIAL PRIMARY KEY,
    resume_version_id INT NOT NULL REFERENCES public.resume_versions(id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    current_skills JSONB NOT NULL,
    missing_skills JSONB NOT NULL,
    learning_priority JSONB NOT NULL,
    learning_resources JSONB NOT NULL,
    estimated_time VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skill_gap_reports_version_id ON public.skill_gap_reports(resume_version_id);

-- 7. INTERVIEW QUESTIONS TABLE
CREATE TABLE public.interview_questions (
    id SERIAL PRIMARY KEY,
    resume_version_id INT NOT NULL REFERENCES public.resume_versions(id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    sample_answer TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    evaluation_tips TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interview_questions_version_id ON public.interview_questions(resume_version_id);

-- 8. ACTIVITY LOGS TABLE
CREATE TABLE public.activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gap_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service Role full access on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Service Role full access on resumes" ON public.resumes FOR ALL USING (true);
CREATE POLICY "Service Role full access on resume_versions" ON public.resume_versions FOR ALL USING (true);
CREATE POLICY "Service Role full access on resume_analyses" ON public.resume_analyses FOR ALL USING (true);
CREATE POLICY "Service Role full access on job_recommendations" ON public.job_recommendations FOR ALL USING (true);
CREATE POLICY "Service Role full access on skill_gap_reports" ON public.skill_gap_reports FOR ALL USING (true);
CREATE POLICY "Service Role full access on interview_questions" ON public.interview_questions FOR ALL USING (true);
CREATE POLICY "Service Role full access on activity_logs" ON public.activity_logs FOR ALL USING (true);

-- SUPABASE STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Access for Resumes Bucket" 
ON storage.objects FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY "Authenticated Upload Access for Resumes Bucket" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Authenticated Delete Access for Resumes Bucket" 
ON storage.objects FOR DELETE USING (bucket_id = 'resumes');
