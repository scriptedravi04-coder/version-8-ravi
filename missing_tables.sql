-- Run this in your Supabase SQL Editor to create the missing tables

-- CHAT SECION
CREATE TABLE IF NOT EXISTS public.chat_threads (
    id VARCHAR(100) PRIMARY KEY,
    type VARCHAR(50) DEFAULT 'campaign', -- 'campaign', 'ugc'
    reference_id VARCHAR(100), -- campaign_id or ugc_order_id
    brand_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    creator_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id VARCHAR(100) PRIMARY KEY,
    thread_id VARCHAR(100) REFERENCES public.chat_threads(id) ON DELETE CASCADE,
    sender_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    content TEXT,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'asset', 'deal_offer'
    metadata JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- UGC BRIEFS & ORDERS (For 24h fast turn-around requests)
CREATE TABLE IF NOT EXISTS public.ugc_briefs (
    id VARCHAR(100) PRIMARY KEY,
    brand_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    budget INT NOT NULL,
    max_creators INT DEFAULT 1,
    claimed_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'COMPLETED'
    detailed_requirements TEXT,
    sample_content_url TEXT,
    dos TEXT[],
    donts TEXT[],
    deliverable_type VARCHAR(100) DEFAULT 'UGC_VIDEO',
    video_duration VARCHAR(50) DEFAULT '30s',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ugc_orders (
    id VARCHAR(100) PRIMARY KEY,
    brief_id VARCHAR(100) REFERENCES public.ugc_briefs(id) ON DELETE CASCADE,
    brand_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    creator_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'ACCEPTED', -- 'ACCEPTED', 'CONTENT_UPLOADED', 'APPROVED', 'REVISION_REQUESTED', 'PAYMENT_RELEASED'
    creator_payout INT NOT NULL,
    video_url TEXT,
    thumbnail_url TEXT,
    creator_notes TEXT,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRANSACTIONS & DEALS
CREATE TABLE IF NOT EXISTS public.deals (
    id VARCHAR(100) PRIMARY KEY,
    thread_id VARCHAR(100) REFERENCES public.chat_threads(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    deliverables TEXT[],
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES public.users(user_id) ON DELETE CASCADE,
    order_id VARCHAR(100),
    type VARCHAR(50), -- 'earnings', 'spent'
    amount INT NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
