-- UGC Briefs
CREATE TABLE IF NOT EXISTS ugc_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id TEXT NOT NULL,
  title TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_description TEXT NOT NULL,
  product_url TEXT,
  product_image_url TEXT,
  deliverable_type TEXT NOT NULL CHECK (deliverable_type IN (
    'instagram_reel','instagram_story','instagram_post',
    'youtube_short','youtube_video','ugc_raw_video'
  )),
  video_duration TEXT,
  dos TEXT[],
  donts TEXT[],
  example_url TEXT,
  budget NUMERIC NOT NULL,
  max_creators INTEGER DEFAULT 1,
  claimed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'OPEN' CHECK (status IN (
    'OPEN','IN_PROGRESS','COMPLETED','CANCELLED','PAUSED'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- UGC Orders — JUGAAD FIELDS INCLUDED
CREATE TABLE IF NOT EXISTS ugc_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID REFERENCES ugc_briefs(id) NOT NULL,
  creator_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,

  -- JUGAAD TIME FIELDS
  claimed_at TIMESTAMPTZ DEFAULT now(),
  internal_deadline TIMESTAMPTZ,   -- claimed_at + 22hrs → creator ko dikhao
  -- brand_deadline is CALCULATED: claimed_at + 24hrs → never stored

  -- JUGAAD STATUS FIELDS
  -- creator_status = actual real status
  -- brand_status   = what brand sees (managed separately)
  creator_status TEXT DEFAULT 'CLAIMED' CHECK (creator_status IN (
    'CLAIMED','DELIVERED','REVISION_REQUESTED','CANCELLED'
  )),
  brand_status TEXT DEFAULT 'MATCHING_CREATOR' CHECK (brand_status IN (
    'MATCHING_CREATOR',   -- 0-30 min: "Finding best creator..."
    'CREATOR_BRIEFED',    -- jab claim ho: "Creator Found & Briefed"
    'CONTENT_CREATION',   -- claimed: "Content Being Created"
    'QUALITY_REVIEW',     -- creator delivered: "Under Quality Review" (2hr buffer)
    'DELIVERED',          -- 2hr baad: brand approve kar sakta hai
    'APPROVED',
    'PAYMENT_RELEASED',
    'COMPLETED',
    'CANCELLED'
  )),

  -- Payment + delivery fields
  delivered_at TIMESTAMPTZ,         -- jab creator ne deliver kiya
  quality_review_ends_at TIMESTAMPTZ, -- delivered_at + 2 hours
  approved_at TIMESTAMPTZ,
  revision_count INTEGER DEFAULT 0,
  max_revisions INTEGER DEFAULT 1,
  revision_note TEXT,
  agreed_amount NUMERIC NOT NULL,
  platform_fee_percent NUMERIC,
  platform_fee_amount NUMERIC,
  creator_payout NUMERIC,
  zaakpay_order_id TEXT,
  zaakpay_txn_id TEXT,
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN (
    'PENDING','HELD','RELEASED','FAILED','REFUNDED'
  )),

  -- Alert flags
  alert_22hr_sent BOOLEAN DEFAULT false,  -- email alert bheja ya nahi
  team_intervened BOOLEAN DEFAULT false,  -- team ne manually handle kiya

  created_at TIMESTAMPTZ DEFAULT now()
);

-- UGC Deliveries
CREATE TABLE IF NOT EXISTS ugc_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES ugc_orders(id) NOT NULL,
  creator_id TEXT NOT NULL,
  video_url TEXT,
  video_file_name TEXT,
  thumbnail_url TEXT,
  creator_notes TEXT,
  revision_number INTEGER DEFAULT 1,
  submitted_by TEXT DEFAULT 'creator' CHECK (submitted_by IN ('creator','team')),
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- UGC Showcase (public page)
CREATE TABLE IF NOT EXISTS ugc_showcase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES ugc_orders(id),
  creator_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  deliverable_type TEXT,
  is_featured BOOLEAN DEFAULT false,
  added_at TIMESTAMPTZ DEFAULT now()
);

-- UGC Reviews
CREATE TABLE IF NOT EXISTS ugc_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES ugc_orders(id) UNIQUE,
  creator_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
