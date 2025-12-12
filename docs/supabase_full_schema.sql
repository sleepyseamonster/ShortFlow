/*
  # ShortPulse - Complete Database Schema
  
  This comprehensive migration creates all tables, functions, indexes, and RLS policies
  for the ShortPulse reel analytics platform.
  
  Tables:
  - reels: Main reel data with metrics
  - reels_raw_events: Event log for tracking changes over time
  - reels_latest_state: Materialized view of latest metrics
  - user_profiles: User account data
  - watchlist: User's tracked reels
  - reel_categories: Category tags for reels
  - saved_filters: User's filter presets
  - user_alerts: Alert configuration
  - reel_snapshots: Historical metrics snapshots
  - media_files: User uploaded media library
*/

-- ========== REELS CORE TABLES ==========

CREATE TABLE IF NOT EXISTS reels (
  id text PRIMARY KEY,
  url text NOT NULL,
  thumbnail_url text,
  embed_url text,
  creator_username text,
  creator_followers integer DEFAULT 0,
  published_at timestamptz NOT NULL,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  shares integer DEFAULT 0,
  duration_seconds real,
  caption text,
  audio_name text,
  scraped_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reels_raw_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id text NOT NULL,
  platform text NOT NULL DEFAULT 'instagram',
  reel_url text NOT NULL,
  scraped_at timestamptz NOT NULL DEFAULT now(),
  publish_time timestamptz NOT NULL,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  shares_or_saves integer,
  caption_text text,
  audio_id text,
  audio_name text,
  duration_seconds real,
  apify_run_id text,
  source_surface text DEFAULT 'reels_feed',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reels_latest_state (
  reel_id text PRIMARY KEY,
  platform text NOT NULL DEFAULT 'instagram',
  reel_url text NOT NULL,
  publish_time timestamptz NOT NULL,
  latest_views integer NOT NULL DEFAULT 0,
  latest_likes integer NOT NULL DEFAULT 0,
  latest_comments integer NOT NULL DEFAULT 0,
  latest_shares_or_saves integer,
  latest_scraped_at timestamptz NOT NULL,
  caption_text text,
  audio_id text,
  audio_name text,
  duration_seconds real,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========== USER TABLES ==========

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reel_id text NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(user_id, reel_id)
);

CREATE TABLE IF NOT EXISTS reel_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id text NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  category text NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(reel_id, category)
);

CREATE TABLE IF NOT EXISTS saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  filter_config jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reel_id text REFERENCES reels(id) ON DELETE CASCADE,
  category text,
  velocity_threshold integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reel_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id text NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  shares integer DEFAULT 0,
  snapshots_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  width integer,
  height integer,
  duration_seconds real,
  thumbnail_path text,
  tags text[] DEFAULT '{}',
  description text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========== INDEXES ==========

CREATE INDEX IF NOT EXISTS idx_reels_published_at ON reels(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_views ON reels(views DESC);
CREATE INDEX IF NOT EXISTS idx_reels_scraped_at ON reels(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_published_views ON reels(published_at DESC, views DESC);

CREATE INDEX IF NOT EXISTS idx_reels_raw_events_reel_id ON reels_raw_events(reel_id);
CREATE INDEX IF NOT EXISTS idx_reels_raw_events_scraped_at ON reels_raw_events(scraped_at);
CREATE INDEX IF NOT EXISTS idx_reels_raw_events_publish_time ON reels_raw_events(publish_time);
CREATE INDEX IF NOT EXISTS idx_reels_raw_events_reel_scraped ON reels_raw_events(reel_id, scraped_at);

CREATE INDEX IF NOT EXISTS idx_reels_latest_state_publish_time ON reels_latest_state(publish_time);
CREATE INDEX IF NOT EXISTS idx_reels_latest_state_scraped_at ON reels_latest_state(latest_scraped_at);

CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_reel_id ON watchlist(reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_categories_reel_id ON reel_categories(reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_categories_category ON reel_categories(category);
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_active ON user_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_reel_snapshots_reel_id ON reel_snapshots(reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_snapshots_timestamp ON reel_snapshots(snapshots_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_is_favorite ON media_files(is_favorite) WHERE is_favorite = true;

-- ========== FUNCTIONS ==========

CREATE OR REPLACE FUNCTION update_reel_latest_state()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO reels_latest_state (
    reel_id,
    platform,
    reel_url,
    publish_time,
    latest_views,
    latest_likes,
    latest_comments,
    latest_shares_or_saves,
    latest_scraped_at,
    caption_text,
    audio_id,
    audio_name,
    duration_seconds,
    updated_at
  ) VALUES (
    NEW.reel_id,
    NEW.platform,
    NEW.reel_url,
    NEW.publish_time,
    NEW.views,
    NEW.likes,
    NEW.comments,
    NEW.shares_or_saves,
    NEW.scraped_at,
    NEW.caption_text,
    NEW.audio_id,
    NEW.audio_name,
    NEW.duration_seconds,
    now()
  )
  ON CONFLICT (reel_id) DO UPDATE SET
    platform = EXCLUDED.platform,
    reel_url = EXCLUDED.reel_url,
    publish_time = EXCLUDED.publish_time,
    latest_views = CASE WHEN EXCLUDED.latest_scraped_at > reels_latest_state.latest_scraped_at 
                        THEN EXCLUDED.latest_views ELSE reels_latest_state.latest_views END,
    latest_likes = CASE WHEN EXCLUDED.latest_scraped_at > reels_latest_state.latest_scraped_at 
                        THEN EXCLUDED.latest_likes ELSE reels_latest_state.latest_likes END,
    latest_comments = CASE WHEN EXCLUDED.latest_scraped_at > reels_latest_state.latest_scraped_at 
                          THEN EXCLUDED.latest_comments ELSE reels_latest_state.latest_comments END,
    latest_shares_or_saves = CASE WHEN EXCLUDED.latest_scraped_at > reels_latest_state.latest_scraped_at 
                                  THEN EXCLUDED.latest_shares_or_saves ELSE reels_latest_state.latest_shares_or_saves END,
    latest_scraped_at = CASE WHEN EXCLUDED.latest_scraped_at > reels_latest_state.latest_scraped_at 
                             THEN EXCLUDED.latest_scraped_at ELSE reels_latest_state.latest_scraped_at END,
    caption_text = COALESCE(EXCLUDED.caption_text, reels_latest_state.caption_text),
    audio_id = COALESCE(EXCLUDED.audio_id, reels_latest_state.audio_id),
    audio_name = COALESCE(EXCLUDED.audio_name, reels_latest_state.audio_name),
    duration_seconds = COALESCE(EXCLUDED.duration_seconds, reels_latest_state.duration_seconds),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rebuild_reels_latest_state()
RETURNS void AS $$
BEGIN
  TRUNCATE reels_latest_state;
  
  INSERT INTO reels_latest_state (
    reel_id,
    platform,
    reel_url,
    publish_time,
    latest_views,
    latest_likes,
    latest_comments,
    latest_shares_or_saves,
    latest_scraped_at,
    caption_text,
    audio_id,
    audio_name,
    duration_seconds
  )
  SELECT DISTINCT ON (reel_id)
    reel_id,
    platform,
    reel_url,
    publish_time,
    views,
    likes,
    comments,
    shares_or_saves,
    scraped_at,
    caption_text,
    audio_id,
    audio_name,
    duration_seconds
  FROM reels_raw_events
  ORDER BY reel_id, scraped_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_media_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========== TRIGGERS ==========

DROP TRIGGER IF EXISTS trigger_update_latest_state ON reels_raw_events;
CREATE TRIGGER trigger_update_latest_state
  AFTER INSERT ON reels_raw_events
  FOR EACH ROW
  EXECUTE FUNCTION update_reel_latest_state();

CREATE TRIGGER media_files_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_media_files_updated_at();

-- ========== ROW LEVEL SECURITY ==========

ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels_raw_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels_latest_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Reels - Public read
CREATE POLICY "Service role has full access to reels"
  ON reels
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can read reels"
  ON reels
  FOR SELECT
  TO anon
  USING (true);

-- Reels Raw Events - Service role only
CREATE POLICY "Service role has full access to reels_raw_events"
  ON reels_raw_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Reels Latest State - Service role and public read
CREATE POLICY "Service role has full access to reels_latest_state"
  ON reels_latest_state
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can read reels_latest_state"
  ON reels_latest_state
  FOR SELECT
  TO anon
  USING (true);

-- User Profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
  ON user_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Watchlist
CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own watchlist"
  ON watchlist FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own watchlist items"
  ON watchlist FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage watchlist"
  ON watchlist FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Reel Categories - Public read
CREATE POLICY "Public can view reel categories"
  ON reel_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage reel categories"
  ON reel_categories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Saved Filters
CREATE POLICY "Users can view own saved filters"
  ON saved_filters FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own saved filters"
  ON saved_filters FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own saved filters"
  ON saved_filters FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saved filters"
  ON saved_filters FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage saved filters"
  ON saved_filters FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User Alerts
CREATE POLICY "Users can manage own alerts"
  ON user_alerts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create alerts"
  ON user_alerts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own alerts"
  ON user_alerts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own alerts"
  ON user_alerts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage alerts"
  ON user_alerts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Reel Snapshots - Public read
CREATE POLICY "Public can view reel snapshots"
  ON reel_snapshots FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage snapshots"
  ON reel_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Media Files
CREATE POLICY "Users can view their own media files"
  ON media_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own media files"
  ON media_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media files"
  ON media_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media files"
  ON media_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
