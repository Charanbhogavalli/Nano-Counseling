-- ==================================================
-- PostgreSQL Supabase Database Schema
-- Admissions Counseling Prediction Engine
-- ==================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.exams (
    code TEXT PRIMARY KEY, -- 'JEE Main', 'COMEDK', 'KCET', 'AP-EAMCET', 'TS-EAMCET'
    name TEXT NOT NULL,
    description TEXT
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    code TEXT PRIMARY KEY, -- 'General', 'OBC-NCL', 'SC', 'ST', 'GM', '2A'
    name TEXT NOT NULL,
    description TEXT
);

-- 4. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    UNIQUE (city, state)
);

-- 5. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE, -- RVCE, MSRIT, PESU
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('Government', 'Private', 'Aided', 'Autonomous')),
    rating NUMERIC(3, 2) DEFAULT 4.0,
    ranking INT, -- NIRF ranking
    placements_info JSONB, -- {"median_ctc_lpa": 12.5, "highest_ctc_lpa": 48.0, "placement_percentage": 94}
    website TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS public.branches (
    code TEXT PRIMARY KEY, -- CSE, ECE, ISE, ME, CE
    name TEXT NOT NULL UNIQUE
);

-- 7. FEE STRUCTURE TABLE
CREATE TABLE IF NOT EXISTS public.fee_structure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    branch_code TEXT REFERENCES public.branches(code) ON DELETE CASCADE,
    quota TEXT NOT NULL DEFAULT 'Counseling' CHECK (quota IN ('All India', 'Home State', 'Management', 'Counseling')),
    tuition_fee INT NOT NULL,
    development_fee INT DEFAULT 0,
    other_charges INT DEFAULT 0,
    UNIQUE(college_id, branch_code, quota)
);

-- 8. CUTOFF_HISTORY TABLE (Normalized Cutoffs)
CREATE TABLE IF NOT EXISTS public.cutoff_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    exam_code TEXT REFERENCES public.exams(code) ON DELETE CASCADE,
    year INT NOT NULL,
    branch_code TEXT REFERENCES public.branches(code) ON DELETE CASCADE,
    category_code TEXT REFERENCES public.categories(code) ON DELETE CASCADE,
    gender TEXT DEFAULT 'Co-Ed' CHECK (gender IN ('Co-Ed', 'Female Only', 'Male Only')),
    quota TEXT NOT NULL DEFAULT 'Counseling' CHECK (quota IN ('All India', 'Home State', 'Management', 'Counseling')),
    round INT NOT NULL DEFAULT 1,
    opening_rank INT,
    closing_rank INT NOT NULL,
    trend_score NUMERIC(5,2) DEFAULT 0.00,
    cutoff_volatility NUMERIC(5,3) DEFAULT 0.050,
    seat_growth_rate NUMERIC(5,3) DEFAULT 0.000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SEAT MATRIX TABLE
CREATE TABLE IF NOT EXISTS public.seat_matrix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    branch_code TEXT REFERENCES public.branches(code) ON DELETE CASCADE,
    category_code TEXT REFERENCES public.categories(code) ON DELETE CASCADE,
    seats_allocated INT NOT NULL,
    seats_vacant INT,
    UNIQUE(college_id, branch_code, category_code)
);

-- 10. PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    exam TEXT NOT NULL,
    rank INT NOT NULL,
    category TEXT NOT NULL,
    branch TEXT,
    state TEXT,
    budget INT,
    results JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PREDICTION CACHE TABLE
CREATE TABLE IF NOT EXISTS public.prediction_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT UNIQUE NOT NULL, -- "exam:rank:category:gender:branch"
    results JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================
-- INDEXES FOR HIGH-SPEED PREDICTIVE LOGIC
-- ==================================================

-- Optimized lookup composite index
CREATE INDEX IF NOT EXISTS idx_cutoffs_query 
ON public.cutoff_history (exam_code, branch_code, category_code, gender, closing_rank);

-- Filter speed indexes
CREATE INDEX IF NOT EXISTS idx_cutoffs_closing_rank ON public.cutoff_history (closing_rank);
CREATE INDEX IF NOT EXISTS idx_colleges_ranking ON public.colleges (ranking ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_fees_college_branch ON public.fee_structure (college_id, branch_code);

-- ==================================================
-- MATERIALIZED VIEWS FOR LOW LATENCY QUERY SPEEDS
-- ==================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_college_cutoff_summary AS
SELECT 
    ch.college_id,
    ch.exam_code,
    ch.branch_code,
    ch.category_code,
    ch.gender,
    ch.quota,
    MAX(ch.closing_rank) as max_closing_rank,
    MIN(ch.opening_rank) as min_opening_rank,
    AVG(ch.closing_rank)::int as avg_closing_rank,
    COUNT(ch.id) as data_points_count
FROM 
    public.cutoff_history ch
GROUP BY 
    ch.college_id, ch.exam_code, ch.branch_code, ch.category_code, ch.gender, ch.quota;

-- Index on Materialized View for high speed queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_cutoff_summary 
ON public.mv_college_cutoff_summary (college_id, exam_code, branch_code, category_code, gender, quota);

-- ==================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own profiles"
    ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profiles"
    ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to view their own predictions"
    ON public.predictions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to save predictions"
    ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
