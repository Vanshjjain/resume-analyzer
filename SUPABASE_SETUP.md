# 🚀 Supabase Setup Guide for Resume AI Analyzer

This guide details how to configure **Supabase** (PostgreSQL Database & Storage Buckets) for the **AI Resume Analyzer & Career Assistant** project.

---

## 📋 Overview of Integration

The application is engineered to operate seamlessly in two modes:

1. **Local Mode (Default)**: Uses SQLite database (`resume_analyzer.db`) and `./uploads` local directory.
2. **Supabase Production Mode**: Connects to **Supabase PostgreSQL** database and **Supabase Storage** bucket (`resumes`) automatically whenever Supabase environment variables are present.

---

## 🛠️ Step-by-Step Setup

### Step 1: Create a Supabase Project

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project** and select your organization.
3. Name your project (e.g. `resume-ai-analyzer`), set a secure **Database Password**, and select a region close to your users.
4. Wait for database provisioning to finish (~1-2 minutes).

---

### Step 2: Initialize Database Schema

1. Open your Supabase Dashboard.
2. Navigate to **SQL Editor** -> **New Query**.
3. Copy the entire content of [`backend/supabase_schema.sql`](file:///c:/Users/DELL/OneDrive/Desktop/resumeai/resume-analyzer-main/backend/supabase_schema.sql).
4. Paste it into the editor and click **Run**.
5. This creates:
   - All 8 database tables (`users`, `resumes`, `resume_versions`, `resume_analyses`, `job_recommendations`, `skill_gap_reports`, `interview_questions`, `activity_logs`).
   - Foreign key cascading rules & indexes.
   - Row Level Security (RLS) policies.
   - The `resumes` storage bucket and security policies.

---

### Step 3: Get API & Database Credentials

From your Supabase Dashboard:

1. Go to **Project Settings** -> **Database**:
   - Locate your Connection String under **URI**.
   - Example: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

2. Go to **Project Settings** -> **API**:
   - **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
   - **anon / public key**: `eyJhbGciOi...`
   - **service_role key**: `eyJhbGciOi...` (keep secret!)

---

### Step 4: Configure Backend Environment Variables

In your `backend/.env` file (copy from [`backend/.env.example`](file:///c:/Users/DELL/OneDrive/Desktop/resumeai/resume-analyzer-main/backend/.env.example)):

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SECRET_KEY=457efc464b0f027818e38d73b069d678e0db9668fa64188bcf36a0fb4905bb65
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENAI_API_KEY=your-openai-api-key

# Supabase Credentials
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=your-supabase-service-role-or-anon-key
SUPABASE_STORAGE_BUCKET=resumes
```

---

### Step 5: Configure Frontend Environment Variables

In your `frontend/.env` file (copy from [`frontend/.env.example`](file:///c:/Users/DELL/OneDrive/Desktop/resumeai/resume-analyzer-main/frontend/.env.example)):

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

### Step 6: Seed Initial Data (Optional)

To seed your Supabase PostgreSQL database with initial test users, sample resumes, ATS scores, and career recommendations:

```bash
cd backend
python seed.py
```

---

## 🔍 Verification & Health Check

Start your backend server:

```bash
cd backend
uvicorn app.main:app --reload
```

Visiting `http://127.0.0.1:8000/` will confirm database status:

```json
{
  "status": "online",
  "service": "AI Resume Analyzer Backend",
  "database": "postgresql"
}
```

Upload a resume via the web app or API: verify that uploaded files appear directly in the **Storage** section (`resumes` bucket) in your Supabase Dashboard!
