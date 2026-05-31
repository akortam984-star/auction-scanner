-- AuctionScanner Supabase Schema
-- Run this in your Supabase SQL editor at:
-- https://vkzeastiznjjqoovmkrs.supabase.co

-- ============================================
-- LISTING CACHE TABLE
-- Stores scraped results to avoid hammering
-- Copart/IAAI on every search. TTL: 10 min.
-- ============================================
CREATE TABLE IF NOT EXISTS listing_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  listings jsonb NOT NULL DEFAULT '[]',
  total integer NOT NULL DEFAULT 0,
  cached_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast cache lookups
CREATE INDEX IF NOT EXISTS idx_listing_cache_key ON listing_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_listing_cache_cached_at ON listing_cache(cached_at);

-- Auto-cleanup: delete cache entries older than 1 hour
-- (Run this as a cron job in Supabase if available on your plan)
-- DELETE FROM listing_cache WHERE cached_at < now() - interval '1 hour';

-- ============================================
-- SAVED SEARCHES TABLE (future feature)
-- ============================================
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- for future auth
  name text NOT NULL,
  filters jsonb NOT NULL,
  alert_email text,
  alert_enabled boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_run_at timestamptz
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- listing_cache: public read (needed for server-side caching)
ALTER TABLE listing_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read listing cache"
  ON listing_cache FOR SELECT
  USING (true);

CREATE POLICY "Server can write listing cache"
  ON listing_cache FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Server can update listing cache"
  ON listing_cache FOR UPDATE
  USING (true);

-- saved_searches: for future use
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
