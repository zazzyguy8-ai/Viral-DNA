# Plou.ai — Implementation Plan
> CTO Document · v1.0 · 2026-06-15

---

## 1. PRODUCT ARCHITECTURE

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Plou.ai                                │
├────────────────────────────────────────────────────────────────┤
│  FRONTEND (Next.js 15 · App Router · TypeScript · Tailwind)    │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Landing  │  │   Auth   │  │Dashboard │  │  Public  │       │
│  │   Page    │  │Sign in/up│  │  Shell   │  │  Report  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
├────────────────────────────────────────────────────────────────┤
│  CORE FEATURES                                                   │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Viral DNA │  │  Idea    │  │Competitor│  │ Weekly   │       │
│  │  Engine  │  │  Engine  │  │   DNA    │  │ Reports  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
├────────────────────────────────────────────────────────────────┤
│  API LAYER (Next.js Route Handlers)                             │
│  /api/analyze · /api/ideas · /api/competitors · /api/reports   │
│  /api/export · /api/webhooks/stripe                            │
├────────────────────────────────────────────────────────────────┤
│  BACKEND SERVICES                                               │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │  Supabase    │   │   OpenAI     │   │    Stripe    │       │
│  │  PostgreSQL  │   │   GPT-4o     │   │  Payments    │       │
│  │  Auth        │   │  Embeddings  │   │              │       │
│  │  Storage     │   │              │   │              │       │
│  └──────────────┘   └──────────────┘   └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Viral DNA Engine (Core Innovation)

The Viral DNA Engine is a multi-step AI pipeline:

```
STEP 1: INGESTION
  Creator enters platform handles
  → System fetches public profile data (YouTube API, scraping)
  → Stores raw platform data

STEP 2: PATTERN EXTRACTION (GPT-4o)
  → Analyze content history
  → Identify recurring topics, hooks, formats
  → Detect publishing patterns
  → Score engagement patterns
  → Extract audience signals

STEP 3: DNA SYNTHESIS
  → Calculate sub-scores (Growth, Consistency, Branding, Audience Clarity)
  → Identify strongest/weakest content pillars
  → Define audience type and creator positioning
  → Generate Viral DNA Score (0–100)

STEP 4: DOWNSTREAM FEATURES
  Viral DNA Profile powers:
  → Idea Engine (personalized ideas based on DNA)
  → Competitor DNA (compare DNA profiles)
  → Weekly Reports (track DNA evolution)
```

---

## 2. DATABASE SCHEMA

```sql
-- =========================================
-- USERS & PROFILES
-- =========================================

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  plan          TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  stripe_customer_id TEXT,
  onboarded_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- PLATFORM CONNECTIONS
-- =========================================

CREATE TABLE creator_accounts (
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

-- =========================================
-- VIRAL DNA PROFILES (CORE TABLE)
-- =========================================

CREATE TABLE viral_dna_profiles (
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

-- =========================================
-- CONTENT PILLARS
-- =========================================

CREATE TABLE content_pillars (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viral_dna_id    UUID NOT NULL REFERENCES viral_dna_profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  strength        TEXT CHECK (strength IN ('strong','medium','weak')),
  description     TEXT,
  examples        TEXT[],
  score           INT,
  rank            INT
);

-- =========================================
-- VIRAL PATTERNS
-- =========================================

CREATE TABLE viral_patterns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viral_dna_id  UUID NOT NULL REFERENCES viral_dna_profiles(id) ON DELETE CASCADE,
  type          TEXT CHECK (type IN ('topic','hook','format','cta','length','timing')),
  pattern       TEXT NOT NULL,
  performance   TEXT CHECK (performance IN ('high','medium','low')),
  examples      TEXT[],
  frequency     INT
);

-- =========================================
-- COMPETITORS
-- =========================================

CREATE TABLE competitors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL,
  handle        TEXT NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  follower_count BIGINT,
  added_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE competitor_analyses (
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

-- =========================================
-- CONTENT IDEAS
-- =========================================

CREATE TABLE content_ideas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viral_dna_id    UUID REFERENCES viral_dna_profiles(id),
  type            TEXT CHECK (type IN ('video','post','hook','cta','series')),
  platform        TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  hook            TEXT,
  cta             TEXT,
  estimated_score INT,
  is_saved        BOOLEAN DEFAULT FALSE,
  is_used         BOOLEAN DEFAULT FALSE,
  generated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- WEEKLY REPORTS
-- =========================================

CREATE TABLE weekly_reports (
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

-- =========================================
-- SUBSCRIPTIONS
-- =========================================

CREATE TABLE subscriptions (
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
```

---

## 3. USER FLOWS

### Flow 1: Onboarding (New User)
```
Landing Page
  → Click "Start for Free"
  → Sign Up (email + password OR Google OAuth)
  → Email verification
  → Onboarding wizard:
      Step 1: "What platforms are you on?" (select YouTube/TikTok/X/Instagram)
      Step 2: Enter your handles for selected platforms
      Step 3: "Analyzing your Viral DNA..." (loading screen with progress)
  → First Viral DNA Report shown
  → Dashboard home
```

### Flow 2: Viral DNA Analysis
```
Dashboard → "Run New Analysis"
  → Select platform + enter handle
  → Processing state (progress steps shown):
      [✓] Fetching public profile data
      [✓] Analyzing content patterns
      [✓] Calculating scores
      [✓] Generating insights
  → Viral DNA Report:
      - Overall Score ring (0-100)
      - Score breakdown radar chart
      - Content Pillars (strong → weak)
      - Audience Profile
      - Viral Patterns (hooks, formats, topics)
      - Creator Positioning summary
```

### Flow 3: Idea Engine
```
Sidebar → "Ideas"
  → Ideas page shows:
      - Filter by platform / content type
      - "Generate New Ideas" button
      - Existing saved ideas grid
  → Generate:
      - AI generates 10 ideas based on DNA
      - Each idea shows: title, hook, estimated score, type
      - User can save / mark as used / dismiss
```

### Flow 4: Competitor DNA
```
Sidebar → "Competitors"
  → "Add Competitor" → enter platform + handle
  → Competitor card appears (fetching data...)
  → Analysis complete:
      - Side-by-side score comparison
      - Strengths/weaknesses matrix
      - Content gaps table
      - Opportunities list
  → Actionable recommendations
```

### Flow 5: Weekly Report
```
Auto-generated every Monday OR manual trigger
  → Report card on dashboard ("New Report Available")
  → Open report:
      - Week summary (wins/losses)
      - DNA score change
      - Growth opportunities
      - 3 recommended actions
  → Export options:
      - Download PDF
      - Copy shareable link (public URL: plou.ai/r/[token])
```

---

## 4. FOLDER STRUCTURE

```
plou-ai/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   ├── sign-up/
│   │   │   └── page.tsx
│   │   ├── verify/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  -- Sidebar + header shell
│   │   ├── page.tsx                    -- Dashboard home
│   │   ├── onboarding/
│   │   │   └── page.tsx               -- New user wizard
│   │   ├── viral-dna/
│   │   │   ├── page.tsx               -- DNA overview (multi-platform)
│   │   │   └── [accountId]/
│   │   │       └── page.tsx           -- Per-platform deep dive
│   │   ├── ideas/
│   │   │   └── page.tsx
│   │   ├── competitors/
│   │   │   ├── page.tsx               -- Competitor list
│   │   │   └── [competitorId]/
│   │   │       └── page.tsx           -- Competitor analysis
│   │   ├── reports/
│   │   │   ├── page.tsx               -- Reports list
│   │   │   └── [reportId]/
│   │   │       └── page.tsx           -- Individual report
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts               -- POST: trigger DNA analysis
│   │   ├── ideas/
│   │   │   └── route.ts               -- POST: generate ideas
│   │   ├── competitors/
│   │   │   ├── route.ts               -- POST: add competitor
│   │   │   └── [id]/
│   │   │       └── route.ts           -- POST: analyze competitor
│   │   ├── reports/
│   │   │   └── route.ts               -- POST: generate report
│   │   ├── export/
│   │   │   └── route.ts               -- POST: generate PDF
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts
│   ├── r/
│   │   └── [token]/
│   │       └── page.tsx               -- Public shared report view
│   ├── layout.tsx
│   ├── page.tsx                       -- Landing page
│   └── globals.css
│
├── components/
│   ├── ui/                            -- shadcn/ui primitives
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── DashboardStats.tsx
│   │   └── QuickActions.tsx
│   ├── viral-dna/
│   │   ├── DNAScoreRing.tsx           -- Animated score ring
│   │   ├── DNARadarChart.tsx          -- 5-axis score chart
│   │   ├── ContentPillarGrid.tsx
│   │   ├── ViralPatternCard.tsx
│   │   ├── AudienceProfileCard.tsx
│   │   ├── AnalysisProgress.tsx       -- Processing state UI
│   │   └── DNASummaryBanner.tsx
│   ├── ideas/
│   │   ├── IdeaCard.tsx
│   │   ├── IdeaGenerator.tsx
│   │   └── IdeaTypeFilter.tsx
│   ├── competitors/
│   │   ├── CompetitorCard.tsx
│   │   ├── ScoreComparisonBar.tsx
│   │   ├── GapOpportunityTable.tsx
│   │   └── AddCompetitorModal.tsx
│   ├── reports/
│   │   ├── WeeklyReportCard.tsx
│   │   ├── ReportExportBar.tsx
│   │   └── PublicReportView.tsx
│   ├── onboarding/
│   │   ├── PlatformSelector.tsx
│   │   ├── HandleInput.tsx
│   │   └── AnalysisLoader.tsx
│   └── shared/
│       ├── PlatformIcon.tsx
│       ├── ScoreBadge.tsx
│       ├── GradientHeading.tsx
│       ├── LoadingDots.tsx
│       └── EmptyState.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── openai/
│   │   ├── client.ts
│   │   ├── viral-dna-analyzer.ts      -- Core DNA prompt + parser
│   │   ├── idea-generator.ts
│   │   ├── competitor-analyzer.ts
│   │   └── report-generator.ts
│   ├── platforms/
│   │   ├── youtube.ts
│   │   ├── types.ts
│   │   └── mock.ts                    -- Dev mocks
│   ├── pdf/
│   │   └── generator.ts
│   ├── stripe/
│   │   └── client.ts
│   └── utils/
│       ├── cn.ts
│       └── scores.ts
│
├── types/
│   ├── database.ts                    -- Generated from Supabase
│   ├── viral-dna.ts
│   └── platform.ts
│
├── hooks/
│   ├── use-viral-dna.ts
│   ├── use-ideas.ts
│   ├── use-competitors.ts
│   └── use-reports.ts
│
├── middleware.ts                       -- Route protection
├── next.config.ts
├── tailwind.config.ts
├── components.json                    -- shadcn config
└── package.json
```

---

## 5. DEVELOPMENT ROADMAP

### Phase 0 — Foundation (Days 1–3)
**Goal: Running app with auth**
- [ ] `npx create-next-app@latest plou-ai --typescript --tailwind --app`
- [ ] Install shadcn/ui, configure design tokens
- [ ] Supabase project + auth tables
- [ ] Sign up / sign in pages
- [ ] Auth middleware (protected routes)
- [ ] Dashboard shell (sidebar, header)
- [ ] Design system: fonts (Geist), colors (black/white + accent), spacing

### Phase 1 — Viral DNA Core (Days 4–10)
**Goal: A creator can analyze their channel and get a DNA report**
- [ ] `creator_accounts` table + form UI
- [ ] YouTube public data fetching (Data API v3)
- [ ] OpenAI analysis pipeline (`/api/analyze`)
- [ ] DNA score calculation logic
- [ ] Viral DNA dashboard page
- [ ] DNA Score Ring component (animated)
- [ ] DNA Radar Chart (5 axes)
- [ ] Content Pillars grid
- [ ] Viral Patterns list
- [ ] Audience Profile card
- [ ] Analysis processing/loading UI

### Phase 2 — Idea Engine (Days 11–14)
**Goal: Creator can generate personalized content ideas**
- [ ] Idea generation prompt (GPT-4o, DNA-aware)
- [ ] `/api/ideas` route
- [ ] Ideas page + IdeaCard components
- [ ] Save / mark used functionality
- [ ] Platform + type filters

### Phase 3 — Competitor DNA (Days 15–18)
**Goal: Creator can compare themselves to any competitor**
- [ ] Add competitor flow
- [ ] Competitor analysis pipeline
- [ ] Score comparison UI
- [ ] Gap + opportunity table

### Phase 4 — Reports & Export (Days 19–22)
**Goal: Weekly reports with PDF + sharing**
- [ ] Weekly report generation (GPT-4o)
- [ ] Report UI (wins/losses/actions)
- [ ] PDF generation (react-pdf or puppeteer)
- [ ] Public share links (`/r/[token]`)

### Phase 5 — Monetization (Days 23–25)
**Goal: Paid plans with Stripe**
- [ ] Stripe products + prices setup
- [ ] Pricing page
- [ ] Checkout flow
- [ ] Webhook handler
- [ ] Plan-based feature gating

### Phase 6 — Polish & Launch (Days 26–30)
**Goal: Production-ready, launchable product**
- [ ] Landing page (hero, features, pricing, CTA)
- [ ] Framer Motion animations
- [ ] Mobile responsiveness audit
- [ ] Performance (lazy loading, image optimization)
- [ ] Error states + empty states
- [ ] Vercel deployment + env configuration
- [ ] Analytics (PostHog)

---

## 6. PRICING MODEL

| Plan    | Price  | Limits                                   |
|---------|--------|------------------------------------------|
| Free    | $0/mo  | 1 platform, 1 DNA analysis/month, 5 ideas |
| Pro     | $29/mo | 4 platforms, unlimited analysis, 50 ideas, PDF export |
| Agency  | $99/mo | 10 platforms, 10 competitor slots, white-label reports |

---

## 7. AI PROMPTING STRATEGY

### Viral DNA Analysis Prompt Structure
```
SYSTEM: You are the Viral DNA Engine for Plou.ai. You analyze creator 
content patterns and identify what makes them grow or stagnate.

USER: Analyze this creator:
- Platform: [platform]
- Handle: [handle]  
- Profile data: [public profile JSON]
- Recent content: [last 20 content items if available]

Return a structured JSON with:
{
  "overall_score": 0-100,
  "sub_scores": { growth, consistency, branding, audience_clarity },
  "audience_type": "string",
  "content_style": "string",
  "creator_positioning": "string",
  "content_pillars": [{ name, strength, description, examples, score }],
  "viral_patterns": [{ type, pattern, performance, examples }],
  "analysis_summary": "2-3 sentence summary"
}
```

---

## FILES TO CREATE [NEW]

- `app/(auth)/sign-in/page.tsx`
- `app/(auth)/sign-up/page.tsx`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/page.tsx`
- `app/(dashboard)/viral-dna/page.tsx`
- `app/(dashboard)/ideas/page.tsx`
- `app/(dashboard)/competitors/page.tsx`
- `app/(dashboard)/reports/page.tsx`
- `app/(dashboard)/settings/page.tsx`
- `app/api/analyze/route.ts`
- `app/api/ideas/route.ts`
- `app/api/competitors/route.ts`
- `app/api/reports/route.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/openai/viral-dna-analyzer.ts`
- `lib/openai/idea-generator.ts`
- `middleware.ts`
- `supabase/migrations/001_initial_schema.sql`

---

*Approved by: Pending user sign-off*
