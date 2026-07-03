-- Creator portfolio items
CREATE TABLE IF NOT EXISTS creator_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  brand_name TEXT,
  views INTEGER DEFAULT 0,
  platform TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Brand saved creators
CREATE TABLE IF NOT EXISTS creator_saved_by_brand (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, creator_id)
);

-- Collab cost requests (brand creator se quote maangta hai)
CREATE TABLE IF NOT EXISTS collab_cost_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  deliverable_type TEXT NOT NULL,
  brand_message TEXT,
  quoted_amount NUMERIC,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','QUOTED','ACCEPTED','REJECTED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Brief requests (brand sends campaign brief to creator directly)
CREATE TABLE IF NOT EXISTS brief_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  campaign_id TEXT,
  message TEXT NOT NULL,
  budget_range TEXT,
  status TEXT DEFAULT 'SENT' CHECK (status IN ('SENT','SEEN','REPLIED','IGNORED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Collab proof submissions (Influish style — with Instagram auto-fetch)
CREATE TABLE IF NOT EXISTS collab_proof_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  instagram_post_url TEXT,
  instagram_post_id TEXT,
  auto_fetched_views INTEGER,
  auto_fetched_likes INTEGER,
  auto_fetched_reach INTEGER,
  auto_fetched_impressions INTEGER,
  manual_screenshot_url TEXT,
  fetch_status TEXT DEFAULT 'PENDING' CHECK (fetch_status IN ('PENDING','FETCHED','FAILED','MANUAL')),
  verified_by_brand BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Invoice clients (creator ke saved clients)
CREATE TABLE IF NOT EXISTS invoice_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_gstin TEXT,
  client_email TEXT,
  client_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoice billing profile (creator ka bank + signature — one time setup)
CREATE TABLE IF NOT EXISTS invoice_billing_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL UNIQUE,
  bank_account_no TEXT,
  bank_ifsc TEXT,
  pan_number TEXT,
  gstin TEXT,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Creator reviews (brand reviews creator after deal)
CREATE TABLE IF NOT EXISTS creator_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT NOT NULL UNIQUE,
  creator_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  brand_name TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- API Keys (Optional, mostly we will use env vars but just in case)
CREATE TABLE IF NOT EXISTS ybex_api_keys (
  key TEXT PRIMARY KEY,
  description TEXT
);
