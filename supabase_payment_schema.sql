-- 1. Platform fee config (admin controlled)
create table platform_fee_config (
  id uuid primary key default gen_random_uuid(),
  threshold_amount numeric not null default 20000,
  below_threshold_rate numeric not null default 5,
  above_threshold_rate numeric not null default 2,
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now()
);
-- Seed default values
insert into platform_fee_config (threshold_amount, below_threshold_rate, above_threshold_rate)
values (20000, 5, 2);

-- 2. Creator payment methods (requires admin approval)
create table creator_payment_methods (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) not null,
  method_type text check (method_type in ('UPI', 'BANK', 'WALLET')) not null,
  account_details jsonb not null,
  -- For UPI: { "upi_id": "name@upi" }
  -- For BANK: { "account_no": "", "ifsc": "", "holder_name": "", "bank_name": "" }
  is_verified boolean default false,
  verification_status text default 'PENDING' check (verification_status in ('PENDING','APPROVED','REJECTED')),
  rejection_reason text,
  admin_approved_by uuid references auth.users(id),
  admin_approved_at timestamptz,
  created_at timestamptz default now()
);

-- 3. Transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null,
  creator_id uuid references auth.users(id) not null,
  brand_id uuid references auth.users(id) not null,
  gross_amount numeric not null,
  platform_fee_percent numeric not null,
  platform_fee_amount numeric not null,
  creator_net_amount numeric not null,
  gst_amount numeric not null,
  zaakpay_order_id text unique,
  zaakpay_txn_id text,
  zaakpay_payment_mode text,
  payment_method_id uuid references creator_payment_methods(id),
  status text default 'INITIATED' check (status in ('INITIATED','SUCCESS','FAILED','REFUNDED')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. GST Invoices
create table gst_invoices (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id),
  invoice_number text unique not null,
  invoice_date date default current_date,
  creator_id uuid references auth.users(id),
  creator_name text,
  creator_gstin text,
  brand_name text,
  brand_gstin text,
  campaign_name text,
  hsn_code text default '998361',
  base_amount numeric,
  platform_fee numeric,
  cgst numeric,
  sgst numeric,
  igst numeric,
  total_amount numeric,
  pdf_url text,
  created_at timestamptz default now()
);
