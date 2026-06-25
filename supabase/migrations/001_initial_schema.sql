-- ═══════════════════════════════════════════════════════
-- GTA6Intel.us — Full Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── SOURCES ─────────────────────────────────────────────
-- News sources the pipeline monitors
create table if not exists sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  rss_url text,
  site_url text,
  trust_level int default 2,
  -- 1 = official (Rockstar), 2 = verified journalist, 3 = community
  is_active boolean default true,
  last_fetched timestamptz,
  created_at timestamptz default now()
);

-- Seed with initial sources
insert into sources (name, rss_url, site_url, trust_level) values
  ('Rockstar Newswire', 'https://www.rockstargames.com/newswire/rss', 'https://www.rockstargames.com/newswire', 1),
  ('IGN GTA', 'https://feeds.feedburner.com/ign/games-all', 'https://www.ign.com', 2),
  ('GamesRadar GTA 6', 'https://www.gamesradar.com/rss/', 'https://www.gamesradar.com', 2),
  ('Eurogamer', 'https://www.eurogamer.net/?format=rss', 'https://www.eurogamer.net', 2),
  ('PC Gamer', 'https://www.pcgamer.com/rss/', 'https://www.pcgamer.com', 2);

-- ─── ARTICLES ────────────────────────────────────────────
create table if not exists articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  body text,
  summary text,          -- 150-160 chars for meta description
  category text default 'news',
  -- news | analysis | guide | roundup
  label text default 'CONFIRMED',
  -- CONFIRMED | RUMOR | LEAK | ANALYSIS
  source_url text,
  source_name text,
  image_url text,
  is_published boolean default false,
  auto_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Full text search index
create index if not exists articles_search_idx
  on articles using gin(to_tsvector('english', title || ' ' || coalesce(body, '')));

-- Slug index for fast lookups
create index if not exists articles_slug_idx on articles (slug);

-- Published articles index
create index if not exists articles_published_idx on articles (is_published, published_at desc);

-- ─── PIPELINE LOGS ───────────────────────────────────────
create table if not exists pipeline_logs (
  id uuid primary key default uuid_generate_v4(),
  run_at timestamptz default now(),
  source_id uuid references sources(id),
  source_name text,
  items_fetched int default 0,
  items_new int default 0,
  items_published int default 0,
  error_message text,
  duration_ms int
);

-- ─── NEWSLETTER SUBSCRIBERS ──────────────────────────────
create table if not exists subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  subscribed_at timestamptz default now(),
  is_active boolean default true
);

-- ─── URL HASHES (deduplication) ──────────────────────────
-- Stores hashes of seen URLs so pipeline never re-processes
create table if not exists seen_urls (
  url_hash text primary key,
  source_url text,
  seen_at timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────
alter table articles enable row level security;
alter table sources enable row level security;
alter table subscribers enable row level security;

-- Public can read published articles
create policy "Public can read published articles"
  on articles for select
  using (is_published = true);

-- Service role can do everything (pipeline uses this)
create policy "Service role full access to articles"
  on articles for all
  using (auth.role() = 'service_role');

create policy "Service role full access to sources"
  on sources for all
  using (auth.role() = 'service_role');

create policy "Service role full access to subscribers"
  on subscribers for all
  using (auth.role() = 'service_role');

-- Public can insert to subscribers (newsletter signup)
create policy "Public can subscribe"
  on subscribers for insert
  with check (true);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_updated_at
  before update on articles
  for each row execute function update_updated_at();

-- ─── TWEET QUEUE ─────────────────────────────────────────
-- Stores auto-generated tweets waiting for approval or posting
create table if not exists tweet_queue (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid references articles(id) on delete cascade,
  tweet_text text not null,
  status text default 'pending',
  -- pending | approved | posted | skipped
  created_at timestamptz default now(),
  posted_at timestamptz
);

alter table tweet_queue enable row level security;

create policy "Service role full access to tweet_queue"
  on tweet_queue for all
  using (auth.role() = 'service_role');

-- ─── VIDEOS TABLE ────────────────────────────────────────
-- Tracks YouTube videos separately for the videos page
create table if not exists videos (
  id uuid primary key default uuid_generate_v4(),
  youtube_id text unique not null,
  title text not null,
  description text,
  thumbnail_url text,
  published_at timestamptz,
  article_id uuid references articles(id),
  created_at timestamptz default now()
);

alter table videos enable row level security;

create policy "Public can read videos"
  on videos for select using (true);

create policy "Service role full access to videos"
  on videos for all
  using (auth.role() = 'service_role');
