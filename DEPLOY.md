# GTA6Intel.us — Deployment Guide
# Follow these steps in order. Takes about 20 minutes total.
# ═══════════════════════════════════════════════════════════

## STEP 1 — Set up Supabase (5 mins)

1. Go to supabase.com → Sign up (free)
2. Click "New Project"
   - Name: gta6intel
   - Password: create a strong one (save it)
   - Region: pick closest to you
3. Wait ~2 mins for project to spin up
4. Go to: SQL Editor → New Query
5. Copy the ENTIRE contents of:
   supabase/migrations/001_initial_schema.sql
6. Paste it → click "Run"
   ✓ This creates all tables and seeds news sources
7. Go to: Settings → API
   - Copy "Project URL" → save as NEXT_PUBLIC_SUPABASE_URL
   - Copy "anon public" key → save as NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Copy "service_role secret" key → save as SUPABASE_SERVICE_ROLE_KEY


## STEP 2 — Get Anthropic API Key (2 mins)

1. Go to console.anthropic.com → Sign up
2. Go to API Keys → Create Key
3. Copy key → save as ANTHROPIC_API_KEY
4. Add $5 credits: Billing → Add credits
   (This runs the pipeline for 1-2 months at low volume)


## STEP 3 — Get YouTube API Key (3 mins)

1. Go to console.cloud.google.com → Sign in
2. Create new project (name it "gta6intel")
3. APIs & Services → Enable APIs → search "YouTube Data API v3" → Enable
4. APIs & Services → Credentials → Create Credentials → API Key
5. Copy key → save as YOUTUBE_API_KEY


## STEP 4 — Push code to GitHub (2 mins)

1. Go to github.com → New repository → name: "gta6intel" → Private
2. On your computer, open terminal:

   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/bukeeastrey/gta6intel.git
   git push -u origin main


## STEP 5 — Deploy to Vercel (5 mins)

1. Go to vercel.com → Sign up with GitHub
2. Click "Add New Project"
3. Import your "gta6intel" repository
4. Framework: Next.js (auto-detected)
5. Add Environment Variables (click "Add" for each):

   NEXT_PUBLIC_SUPABASE_URL         = [from Step 1]
   NEXT_PUBLIC_SUPABASE_ANON_KEY    = [from Step 1]
   SUPABASE_SERVICE_ROLE_KEY        = [from Step 1]
   ANTHROPIC_API_KEY                = [from Step 2]
   YOUTUBE_API_KEY                  = [from Step 3]
   CRON_SECRET                      = [make up any random string e.g. "gta6intel2026secret"]
   NEXT_PUBLIC_SITE_URL             = https://gta6intel.us

6. Click "Deploy"
   ✓ Vercel builds and deploys automatically (~2 mins)


## STEP 6 — Connect your domain (3 mins)

1. In Vercel → your project → Settings → Domains
2. Add domain: gta6intel.us
3. Vercel shows you DNS records to add
4. Log into Namecheap (where you bought the domain)
5. Domain List → Manage → Advanced DNS
6. Add the records Vercel shows you (usually 2 records)
7. Wait 5-30 mins for DNS to propagate
   ✓ Site goes live at gta6intel.us


## STEP 7 — Verify the pipeline runs (1 min)

1. In Vercel → your project → Settings → Cron Jobs
2. You should see: /api/pipeline/trigger — every 30 minutes
3. Click "Run" to trigger it manually once
4. Check Vercel logs to see it working
   ✓ Pipeline now runs automatically every 30 minutes forever


## STEP 8 — Submit to Google (1 min)

1. Go to search.google.com/search-console
2. Add property: https://gta6intel.us
3. Verify ownership (Vercel DNS method is easiest)
4. Sitemaps → add: https://gta6intel.us/sitemap.xml
   ✓ Google starts indexing your site


## WHAT HAPPENS AFTER THIS

Every 30 minutes automatically:
  → Pipeline fetches news from Rockstar, IGN, GamesRadar, Eurogamer, PC Gamer
  → Claude reads each article and writes a branded summary
  → New articles appear on gta6intel.us automatically
  → Rockstar official posts auto-publish immediately
  → Other sources queue for review (you can change this)

You don't need to do anything. The site runs itself.


## OPTIONAL: Set up Google AdSense

1. Go to adsense.google.com → Sign up
2. Add your site: gta6intel.us
3. Google reviews it (takes 1-7 days)
4. Once approved, get your Publisher ID (ca-pub-XXXXXXXXXX)
5. Add to your layout.tsx in the <head>:
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossorigin="anonymous"></script>


## OPTIONAL: Set up Amazon Associates

1. affiliate-program.amazon.com → Sign up
2. Select your country (Nigeria may require .co.uk or .com international)
3. Add gta6intel.us as your site
4. Get your Associate ID
5. When linking to products, add: ?tag=YOUR-ASSOCIATE-ID


## COSTS SUMMARY

  Supabase:     $0 (free tier)
  Vercel:       $0 (free tier)
  Domain:       ~$5-10/year
  Claude API:   ~$2-5/month (load $5 to start)
  YouTube API:  $0
  ─────────────────────────────
  TOTAL MONTH 1: ~$7-15


## SUPPORT

If anything breaks:
- Vercel logs: Project → Functions → check for errors
- Pipeline logs: Supabase → Table Editor → pipeline_logs
- Database: Supabase → Table Editor → articles

The site is designed to fail gracefully.
One broken article never crashes the full pipeline.
