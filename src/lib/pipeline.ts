// ═══════════════════════════════════════════════════════════
// GTA6Intel.us — Automation Pipeline
// This is the engine. It runs every 30 minutes via Vercel Cron.
// Flow: Fetch RSS → Deduplicate → Claude summarizes → Publish
// ═══════════════════════════════════════════════════════════

import Parser from 'rss-parser'
import { createHash } from 'crypto'
import slugify from 'slugify'
import { supabaseAdmin, type Source } from './supabase'
import { processArticleForX } from './twitter'

const parser = new Parser()

// ─── STEP 1: Fetch all active sources ────────────────────
async function fetchActiveSources(): Promise<Source[]> {
  const { data, error } = await supabaseAdmin
    .from('sources')
    .select('*')
    .eq('is_active', true)

  if (error) throw new Error(`Failed to fetch sources: ${error.message}`)
  return data || []
}

// ─── STEP 2: Parse RSS feed ───────────────────────────────
async function parseFeed(source: Source) {
  try {
    const feed = await parser.parseURL(source.rss_url!)
    return feed.items.slice(0, 10) // Process last 10 items per source
  } catch {
    console.error(`RSS parse failed for ${source.name}`)
    return []
  }
}

// ─── STEP 3: Deduplicate via URL hash ────────────────────
function hashUrl(url: string): string {
  return createHash('md5').update(url).digest('hex')
}

async function isAlreadySeen(url: string): Promise<boolean> {
  const hash = hashUrl(url)
  const { data } = await supabaseAdmin
    .from('seen_urls')
    .select('url_hash')
    .eq('url_hash', hash)
    .single()
  return !!data
}

async function markAsSeen(url: string): Promise<void> {
  await supabaseAdmin
    .from('seen_urls')
    .insert({ url_hash: hashUrl(url), source_url: url })
}

// ─── STEP 4: Claude AI Summarization ─────────────────────
// This is where Research + Content departments live in code
async function summarizeWithClaude(item: {
  title: string
  content: string
  sourceUrl: string
  sourceName: string
}): Promise<{
  title: string
  label: 'CONFIRMED' | 'RUMOR' | 'LEAK' | 'ANALYSIS'
  summary: string
  body: string
} | null> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are a gaming journalist for GTA6Intel.us — a GTA 6 intelligence hub.
Editorial voice: direct, informed, zero filler. Readers are 18-35 passionate GTA fans.
Always label content accurately. Never state rumors as confirmed facts.
Return ONLY valid JSON, no markdown, no extra text.`,
        messages: [{
          role: 'user',
          content: `Analyze this GTA 6 news item and produce a site article.

SOURCE: ${item.sourceName}
ORIGINAL TITLE: ${item.title}
CONTENT: ${item.content.slice(0, 2000)}

Return this exact JSON structure:
{
  "title": "punchy SEO headline under 65 characters",
  "label": "CONFIRMED or RUMOR or LEAK or ANALYSIS",
  "summary": "155-character meta description with target keyword",
  "body": "200-250 word article. Start with label in brackets e.g. [CONFIRMED]. Direct voice, cite source (${item.sourceName}), explain what it means for players. No padding."
}`
        }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // Parse JSON safely
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error('Claude summarization failed:', err)
    return null
  }
}

// ─── STEP 5: Generate unique slug ────────────────────────
async function generateSlug(title: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 60)
  const timestamp = Date.now().toString(36)
  return `${base}-${timestamp}`
}

// ─── STEP 6: Save article to Supabase ────────────────────
async function saveArticle(article: {
  title: string
  slug: string
  body: string
  summary: string
  label: string
  sourceUrl: string
  sourceName: string
  autoPublish: boolean
}): Promise<void> {
  const now = new Date().toISOString()

  await supabaseAdmin.from('articles').insert({
    title: article.title,
    slug: article.slug,
    body: article.body,
    summary: article.summary,
    category: 'news',
    label: article.label,
    source_url: article.sourceUrl,
    source_name: article.sourceName,
    is_published: article.autoPublish,
    auto_published: article.autoPublish,
    published_at: article.autoPublish ? now : null
  })
}

// ─── MAIN PIPELINE FUNCTION ───────────────────────────────
// Called by the Vercel Cron job every 30 minutes
export async function runPipeline(): Promise<{
  totalFetched: number
  totalNew: number
  totalPublished: number
  errors: string[]
}> {
  const stats = { totalFetched: 0, totalNew: 0, totalPublished: 0, errors: [] as string[] }
  const startTime = Date.now()

  console.log('🚀 Pipeline started:', new Date().toISOString())

  try {
    const sources = await fetchActiveSources()
    console.log(`📡 Processing ${sources.length} sources`)

    for (const source of sources) {
      if (!source.rss_url) continue

      const logEntry = {
        source_id: source.id,
        source_name: source.name,
        items_fetched: 0,
        items_new: 0,
        items_published: 0,
        error_message: null as string | null,
        duration_ms: 0
      }

      try {
        // Parse RSS feed
        const items = await parseFeed(source)
        logEntry.items_fetched = items.length
        stats.totalFetched += items.length

        // Update last_fetched timestamp
        await supabaseAdmin
          .from('sources')
          .update({ last_fetched: new Date().toISOString() })
          .eq('id', source.id)

        // Process each item
        for (const item of items) {
          const itemUrl = item.link || item.guid
          if (!itemUrl) continue

          // Skip if already seen
          const seen = await isAlreadySeen(itemUrl)
          if (seen) continue

          // Mark as seen immediately to prevent double-processing
          await markAsSeen(itemUrl)

          // Summarize with Claude
          const summarized = await summarizeWithClaude({
            title: item.title || 'GTA 6 Update',
            content: item.contentSnippet || item.content || item.summary || '',
            sourceUrl: itemUrl,
            sourceName: source.name
          })

          if (!summarized) continue

          // Generate slug
          const slug = await generateSlug(summarized.title)

          // Auto-publish if source trust_level = 1 (Rockstar official)
          const autoPublish = source.trust_level === 1

          // Save to database
          await saveArticle({
            title: summarized.title,
            slug,
            body: summarized.body,
            summary: summarized.summary,
            label: summarized.label,
            sourceUrl: itemUrl,
            sourceName: source.name,
            autoPublish
          })

          logEntry.items_new++
          stats.totalNew++

          if (autoPublish) {
            logEntry.items_published++
            stats.totalPublished++

            // Generate & queue tweet for this article
            const { data: savedArticle } = await supabaseAdmin
              .from('articles')
              .select('*')
              .eq('slug', slug)
              .single()

            if (savedArticle) {
              processArticleForX(savedArticle).catch(err =>
                console.error('Tweet generation error:', err)
              )
            }
          }

          // Respect rate limits — small delay between Claude calls
          await new Promise(r => setTimeout(r, 500))
        }

      } catch (sourceError: unknown) {
        const msg = sourceError instanceof Error ? sourceError.message : 'Unknown error'
        logEntry.error_message = msg
        stats.errors.push(`${source.name}: ${msg}`)
        console.error(`Error processing ${source.name}:`, msg)
      }

      // Log this source run
      logEntry.duration_ms = Date.now() - startTime
      await supabaseAdmin.from('pipeline_logs').insert(logEntry)
    }

  } catch (fatalError: unknown) {
    const msg = fatalError instanceof Error ? fatalError.message : 'Fatal pipeline error'
    stats.errors.push(msg)
    console.error('Fatal pipeline error:', msg)
  }

  console.log('✅ Pipeline complete:', stats)
  return stats
}
