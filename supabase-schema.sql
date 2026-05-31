-- =============================================================
--  AUCTION SCANNER — Supabase Schema
--  Run this in: https://supabase.com/dashboard/project/vkzeastiznjjqoovmkrs/sql
-- =============================================================

-- Enable pg_trgm for fast text search
create extension if not exists pg_trgm;

-- ----------------------------------------------------------------
-- LISTINGS table
-- ----------------------------------------------------------------
create table if not exists listings (
  id               uuid primary key default gen_random_uuid(),
  source           text not null check (source in ('copart', 'iaai')),
  lot_number       text not null,
  vin              text,
  year             int,
  make             text,
  model            text,
  trim             text,
  body_style       text,
  color            text,
  odometer         int,
  odometer_unit    text default 'mi',
  primary_damage   text,
  secondary_damage text,
  title_type       text,
  drive            text,
  transmission     text,
  engine           text,
  fuel_type        text,
  run_drive        boolean,
  has_keys         boolean,
  current_bid      numeric(12,2),
  buy_now_price    numeric(12,2),
  estimated_retail numeric(12,2),
  currency         text default 'USD',
  sale_date        timestamptz,
  location_city    text,
  location_state   text,
  location_zip     text,
  thumbnail_url    text,
  image_urls       text[] default '{}',
  source_url       text not null,
  scraped_at       timestamptz default now(),
  is_active        boolean default true,

  -- uniqueness: same lot from same source = one row
  unique (source, lot_number)
);

-- ----------------------------------------------------------------
-- INDEXES for fast filtering
-- ----------------------------------------------------------------
create index if not exists idx_listings_source       on listings(source);
create index if not exists idx_listings_make         on listings(make);
create index if not exists idx_listings_year         on listings(year);
create index if not exists idx_listings_state        on listings(location_state);
create index if not exists idx_listings_damage       on listings(primary_damage);
create index if not exists idx_listings_title        on listings(title_type);
create index if not exists idx_listings_sale_date    on listings(sale_date);
create index if not exists idx_listings_current_bid  on listings(current_bid);
create index if not exists idx_listings_active       on listings(is_active);

-- Full-text search index on make+model+vin
create index if not exists idx_listings_fts on listings
  using gin(to_tsvector('english', coalesce(make,'') || ' ' || coalesce(model,'') || ' ' || coalesce(vin,'')));

-- Trigram index for partial match on make/model
create index if not exists idx_listings_make_trgm  on listings using gin(make gin_trgm_ops);
create index if not exists idx_listings_model_trgm on listings using gin(model gin_trgm_ops);

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY — read is public, writes require service key
-- ----------------------------------------------------------------
alter table listings enable row level security;

create policy "Public can read active listings"
  on listings for select
  using (is_active = true);

-- Service role bypasses RLS automatically — no insert policy needed

-- ----------------------------------------------------------------
-- SCRAPE LOG — track when we last ran, how many rows added
-- ----------------------------------------------------------------
create table if not exists scrape_log (
  id         uuid primary key default gen_random_uuid(),
  source     text not null,
  started_at timestamptz default now(),
  ended_at   timestamptz,
  rows_added int default 0,
  rows_updated int default 0,
  error      text,
  status     text default 'running' check (status in ('running','success','error'))
);
