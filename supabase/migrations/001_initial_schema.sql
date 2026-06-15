-- Plou.ai Initial Schema
-- Run against your Supabase project SQL editor

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username          TEXT UNIQUE,
  full_name         TEXT,
  avatar_url        TEXT,
  plan              TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  stripe_customer_id TEXT,
  onboarded_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- =============================================
-- CREATOR ACCOUNTS
-- =============================================
CREATE TABLE IF NOT EXISTS creator_accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL CHECK (platform IN ('youtube','tiktok','instagram','x')),
  handle            TEXT NOT NULL,
  display_name      TEXT,
  avatar_url        TEXT,
  follower_count    BIGINT,
  is_primary        BOOLEAN DEFAULT FALSE,
  last_analyzed_at  TIMESTAMPTZ,
  raw_profile_data  JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, handle)
);

-- =============================================
-- VIRAL DNA PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS viral_dna_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_account_id      UUID REFERENCES creator_accounts(id),
  overall_score           INT CHECK (overall_score BETWEEN 0 AND 100),
  growth_score            INT CHECK (growth_score BETWEEN 0 AND 100),
  consistency_score       INT CHECK (consistency_score BETWEEN 0 AND 100),
  branding_score          INT CHECK (branding_score BETWEEN 0 AND 100),
  audience_clarity_score  INT CHECK (audience_clarity_score BETWEEN 0 AND 100),
  audience_type           TEXT,
  content_style           TEXT,
  creator_positioning     TEXT,
  analysis_summary        TEXT,
  raw_analysis            JSONB,
  status                  TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','complete','failed')),
  version                 INT DEFAULT 1,
  generated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONTENT PILLARS
-- =============================================
CREATE TABLE IF NOT EXISTS content_pillars (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viral_dna_id  UUID NOT NULL REFERENCES viral_dna_profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  strength      TEXT CHECK (strength IN ('strong','medium','weak')),
  description   TEXT,
  examples      TEXT[],
  score         INT,
  rank          INT
);

-- =============================================
-- VIRAL PATTERNS
-- =============================================
CREATE TABLE IF NOT EXISTS viral_patterns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viral_dna_id  UUID NOT NULL REFERENCES viral_dna_profiles(id) ON DELETE CASCADE,
  type          TEXT CHECK (type IN ('topic','hook','format','cta','length','timing')),
  pattern       TEXT NOT NULL,
  performance   TEXT CHECK (performance IN ('high','medium','low')),
  examples      TEXT[],
  frequency     INT
);

-- =============================================
-- COMPETITORS
-- =============================================
CREATE TABLE IF NOT EXISTS competitors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL CHECK (platform IN ('youtube','tiktok','instagram','x')),
  handle        TEXT NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  follower_count BIGINT,
  added_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitor_analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competitor_id   UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  viral_dna_id    UUID REFERENCES viral_dna_profiles(id),
  strengths       TEXT[],
  weaknesses      TEXT[],
  content_gaps    TEXT[],
  opportunities   TEXT[],
  comparison_data JSONB,
  generated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONTENT IDEAS
-- =============================================
CREATE TABLE IF NOT EXISTS content_ideas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viral_dna_id    UUID REFERENCES viral_dna_profiles(id),
  type            TEXT CHECK (type IN ('video','post','hook','cta','series')),
  platform        TEXT CHECK (platform IN ('youtube','tiktok','instagram','x')),
  title           TEXT NOT NULL,
  description     TEXT,
  hook            TEXT,
  cta             TEXT,
  estimated_score INT,
  is_saved        BOOLEAN DEFAULT FALSE,
  is_used         BOOLEAN DEFAULT FALSE,
  generated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WEEKLY REPORTS
-- =============================================
CREATE TABLE IF NOT EXISTS weekly_reports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start            DATE NOT NULL,
  week_end              DATE NOT NULL,
  wins                  TEXT[],
  losses                TEXT[],
  growth_opportunities  TEXT[],
  recommended_actions   TEXT[],
  dna_score_delta       INT,
  report_data           JSONB,
  pdf_url               TEXT,
  share_token           UUID DEFAULT gen_random_uuid(),
  generated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_price_id         TEXT,
  plan                    TEXT CHECK (plan IN ('pro','agency')),
  status                  TEXT CHECK (status IN ('active','canceled','past_due','trialing')),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_dna_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/write their own
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Creator accounts
CREATE POLICY "creator_accounts_own" ON creator_accounts FOR ALL USING (auth.uid() = user_id);

-- Viral DNA
CREATE POLICY "viral_dna_own" ON viral_dna_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "content_pillars_own" ON content_pillars FOR ALL
  USING (EXISTS (SELECT 1 FROM viral_dna_profiles WHERE id = viral_dna_id AND user_id = auth.uid()));
CREATE POLICY "viral_patterns_own" ON viral_patterns FOR ALL
  USING (EXISTS (SELECT 1 FROM viral_dna_profiles WHERE id = viral_dna_id AND user_id = auth.uid()));

-- Competitors
CREATE POLICY "competitors_own" ON competitors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "competitor_analyses_own" ON competitor_analyses FOR ALL USING (auth.uid() = user_id);

-- Ideas
CREATE POLICY "content_ideas_own" ON content_ideas FOR ALL USING (auth.uid() = user_id);

-- Reports (own + public share token read)
CREATE POLICY "weekly_reports_own" ON weekly_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "weekly_reports_public_read" ON weekly_reports FOR SELECT USING (share_token IS NOT NULL);

-- Subscriptions
CREATE POLICY "subscriptions_own" ON subscriptions FOR ALL USING (auth.uid() = user_id);
