-- ==========================================
-- YBEX DATABASE MIGRATION SCHEMA (SUPABASE)
-- India's Most Transparent Influencer Marketplace
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    user_id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50), -- 'creator', 'brand', 'admin', 'talent_manager'
    picture TEXT,
    auth_method VARCHAR(50) DEFAULT 'email', -- 'email' or 'google'
    onboarded BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    parent_brand_id VARCHAR(100), -- For subteam members
    team_role VARCHAR(50), -- 'admin', 'manager', 'viewer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.creator_profiles (
    user_id VARCHAR(100) PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    picture TEXT,
    photo TEXT,
    bio TEXT,
    category VARCHAR(100),
    sub_categories TEXT[], -- Array of subcategories
    city VARCHAR(100),
    state VARCHAR(100),
    languages TEXT[], -- Array of languages
    gender VARCHAR(50),
    instagram VARCHAR(255),
    youtube VARCHAR(255),
    twitter VARCHAR(255),
    linkedin VARCHAR(255),
    followers_instagram INT DEFAULT 0,
    followers_youtube INT DEFAULT 0,
    rate_card JSONB, -- JSON representation: { reel: X, story: Y, yt_video: Z }
    barter VARCHAR(50) DEFAULT 'barter_ok', -- 'cash_only', 'barter_ok', 'partial_barter'
    payment_terms VARCHAR(100) DEFAULT 'within_30_days',
    portfolio TEXT[], -- Array of portfolio image URLs
    past_brands TEXT[], -- Array of brands
    creator_type VARCHAR(50) DEFAULT 'influencer', -- 'influencer', 'publisher', 'celebrity', 'meme'
    work_mode VARCHAR(50) DEFAULT 'active', -- 'active' or 'away'
    engagement_rate NUMERIC(5,2) DEFAULT 0.0,
    fake_follower_pct NUMERIC(5,2) DEFAULT 0.0,
    avg_views_30d INT DEFAULT 0,
    performance_score INT DEFAULT 0,
    profile_views INT DEFAULT 0,
    managed_by_agency_id VARCHAR(100), -- For central talent agencies managing creators
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BRAND PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.brand_profiles (
    user_id VARCHAR(100) PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    team_size VARCHAR(100),
    website TEXT,
    description TEXT,
    logo TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.campaigns (
    campaign_id VARCHAR(100) PRIMARY KEY,
    brand_user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    brand_name VARCHAR(255),
    brand_logo TEXT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    budget_min INT,
    budget_max INT,
    deliverables TEXT[],
    categories TEXT[],
    platforms TEXT[],
    deadline VARCHAR(100),
    language VARCHAR(100) DEFAULT 'Hindi',
    status VARCHAR(50) DEFAULT 'live', -- 'live', 'closed'
    applicants TEXT[], -- Array of user_ids who applied
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. WAVES TABLE
CREATE TABLE IF NOT EXISTS public.waves (
    wave_id VARCHAR(100) PRIMARY KEY,
    from_user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    from_name VARCHAR(255),
    to_user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. COLLABS TABLE
CREATE TABLE IF NOT EXISTS public.collabs (
    collab_id VARCHAR(100) PRIMARY KEY,
    from_user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    from_name VARCHAR(255),
    to_user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    deliverable TEXT,
    proposed_amount INT,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TEAM ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.team_activity_logs (
    log_id VARCHAR(100) PRIMARY KEY,
    brand_user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    team_role VARCHAR(50),
    action VARCHAR(100),
    detail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.verifications (
    verification_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    name VARCHAR(255),
    email VARCHAR(255),
    photo TEXT,
    kind VARCHAR(50), -- 'creator', 'brand'
    category VARCHAR(100),
    handle TEXT,
    followers INT DEFAULT 0,
    documents TEXT[],
    note TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    report_id VARCHAR(100) PRIMARY KEY,
    reporter_user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    reporter_name VARCHAR(255),
    target_user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    target_name VARCHAR(255),
    reason TEXT,
    severity VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    notif_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    type VARCHAR(100),
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    message_id VARCHAR(100) PRIMARY KEY,
    sender_user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    receiver_user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. CAMPAIGN PERFORMANCE (LEADERBOARD SYSTEM) TABLE
CREATE TABLE IF NOT EXISTS public.campaign_performance (
    performance_id VARCHAR(100) PRIMARY KEY,
    campaign_id VARCHAR(100) REFERENCES public.campaigns(campaign_id) ON DELETE CASCADE,
    creator_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    creator_name VARCHAR(255),
    followers INT,
    promised_views INT,
    actual_views INT,
    score INT,
    badge VARCHAR(50), -- 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'NEEDS WORK'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- SEED INITIAL MOCK DATA (Optional but helpful for testing)
-- ==========================================

-- Seed Admin
INSERT INTO public.users (user_id, email, name, password_hash, role, onboarded, verified, created_at)
VALUES 
('user_admin_demo', 'admin@ybex.demo', 'Ybex General Admin', 'mock_hash_admin123', 'admin', true, true, NOW())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.users (user_id, email, name, password_hash, role, onboarded, verified, created_at)
VALUES 
('user_admin_ybexmedia', 'info@ybexmedia.com', 'YbexMedia Admin', 'mock_hash_ybex123', 'admin', true, true, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Enable Row Level Security (RLS) optionally
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Dynamic bypass policy for testing
CREATE POLICY "Allow all public access for testing purposes" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all public access for testing purposes" ON public.creator_profiles FOR ALL USING (true);
CREATE POLICY "Allow all public access for testing purposes" ON public.brand_profiles FOR ALL USING (true);
CREATE POLICY "Allow all public access for testing purposes" ON public.campaigns FOR ALL USING (true);
CREATE POLICY "Allow all public access for testing purposes" ON public.waves FOR ALL USING (true);
CREATE POLICY "Allow all public access for testing purposes" ON public.collabs FOR ALL USING (true);
CREATE POLICY "Allow all public access for testing purposes" ON public.team_activity_logs FOR ALL USING (true);
CREATE POLICY "Allow all public access for testing purposes" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow all public access for testing purposes" ON public.chat_messages FOR ALL USING (true);

-- 14. YBEX BACKUP SYNC TABLE
CREATE TABLE IF NOT EXISTS public.ybex_sync (
    id INT PRIMARY KEY,
    state JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ybex_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all public access for testing purposes" ON public.ybex_sync FOR ALL USING (true);


-- 15. APPLICATIONS TABLE (Creator joining requests / Explore Profiles)
CREATE TABLE IF NOT EXISTS public.applications (
    id VARCHAR(100) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    instagram_handle VARCHAR(255),
    instagram_link TEXT,
    followers_count VARCHAR(100),
    avg_reach_per_reel VARCHAR(100),
    content_niches TEXT,
    profile_photo_url TEXT,
    city VARCHAR(100),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all public access for testing purposes" ON public.applications FOR ALL USING (true);


-- 16. CAMPAIGN APPLICATIONS TABLE (For creators applying to brand campaigns)
CREATE TABLE IF NOT EXISTS public.campaign_applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    campaign_id VARCHAR(100) REFERENCES public.campaigns(campaign_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    proposed_amount INT DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all public access for testing purposes" ON public.campaign_applications FOR ALL USING (true);


-- 17. EARNINGS TABLE (For tracking creator monthly earnings)
CREATE TABLE IF NOT EXISTS public.earnings (
    earning_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    amount INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all public access for testing purposes" ON public.earnings FOR ALL USING (true);


