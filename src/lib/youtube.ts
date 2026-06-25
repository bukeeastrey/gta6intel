// ═══════════════════════════════════════════════════════════
// YouTube Monitor
// Watches Rockstar Games' official YouTube channel.
// When a new video drops → creates an article with embed + summary.
// Runs every 6 hours via Vercel Cron.
// ═══════════════════════════════════════════════════════════

import { supabaseAdmin } from './supabase'
import slugify from 'slugify'

// Rockstar Games official YouTube channel ID
const ROCKSTAR_CHANNEL_ID = 'UCM7CFIQQ0MFSE36K3T8VD9g'

// GTA-related keywords to filter for — only create articles for relevant videos
const GTA_KEYWORDS = [
  'gta', 'grand theft auto', 'gta 6', 'gta vi', 'leonida',
  'vice city', 'jason', 'lucia', 'rockstar'
]

type YouTubeVideo = {
  videoId: string
  title: string
  description: string
  publishedAt: string
  thumbnailUrl: string
}

// ─── Fetch latest videos from Rockstar's channel ─────────
async function fetchLatestVideos(): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set')

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('key', apiKey)
  url.searchParams.set('channelId', ROCKSTAR_CHANNEL_ID)
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('order', 'date')
  url.searchParams.set('maxResults', '10')
  url.searchParams.set('type', 'video')

  const res = await fetch(url.toString())
  const data = await res.json()

  if (!data.items) return []

  return data.items.map((item: {
    id: { videoId: string }
    snippet: {
      title: string
      description: string
      publishedAt: string
      thumbnails: { high?: { url: string }; default?: { url: string } }
    }
  }) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || ''
  }))
}

// ─── Check if video is GTA-related ───────────────────────
function isGTARelated(title: string, description: string): boolean {
  const text = (title + ' ' + description).toLowerCase()
  return GTA_KEYWORDS.some(keyword => text.includes(keyword))
}

// ─── Check if video already in database ──────────────────
async function videoAlreadyProcessed(videoId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('seen_urls')
    .select('url_hash')
    .eq('url_hash', `youtube_${videoId}`)
    .single()
  return !!data
}

// ─── Mark video as processed ─────────────────────────────
async function markVideoProcessed(videoId: string): Promise<void> {
  await supabaseAdmin
    .from('seen_urls')
    .insert({ url_hash: `youtube_${videoId}`, source_url: `https://youtube.com/watch?v=${videoId}` })
}

// ─── Generate article from video using Claude ─────────────
async function generateVideoArticle(video: YouTubeVideo): Promise<{
  title: string
  summary: string
  body: string
  label: 'CONFIRMED' | 'RUMOR' | 'LEAK' | 'ANALYSIS'
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
        system: `You are a gaming journalist for GTA6Intel.us.
Write about official Rockstar Games YouTube videos.
This is CONFIRMED official content — always label as CONFIRMED.
Direct voice, excited but credible, zero filler.
Return ONLY valid JSON, no markdown.`,
        messages: [{
          role: 'user',
          content: `Rockstar Games just uploaded a new YouTube video. Write a site article for it.

VIDEO TITLE: ${video.title}
VIDEO DESCRIPTION: ${video.description.slice(0, 500)}
VIDEO URL: https://youtube.com/watch?v=${video.videoId}

Return this exact JSON:
{
  "title": "headline under 65 chars that makes people want to watch",
  "label": "CONFIRMED",
  "summary": "155-char meta description mentioning it's official Rockstar footage",
  "body": "150-200 words. Start with [CONFIRMED]. Describe what the video is, why it matters, what players should look for. End with: Watch it embedded below."
}`
        }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error('Claude video article generation failed:', err)
    return null
  }
}

// ─── Build article body with YouTube embed ───────────────
function buildBodyWithEmbed(articleBody: string, videoId: string): string {
  const embedHtml = `

---YOUTUBE_EMBED:${videoId}---

`
  return articleBody + embedHtml
}

// ─── Generate slug ────────────────────────────────────────
function generateSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 60)
  const timestamp = Date.now().toString(36)
  return `${base}-${timestamp}`
}

// ─── MAIN: Run YouTube monitor ────────────────────────────
export async function runYouTubeMonitor(): Promise<{
  videosChecked: number
  newVideos: number
  articlesCreated: number
}> {
  const stats = { videosChecked: 0, newVideos: 0, articlesCreated: 0 }

  console.log('📺 YouTube monitor started')

  try {
    const videos = await fetchLatestVideos()
    stats.videosChecked = videos.length

    for (const video of videos) {
      // Skip non-GTA content
      if (!isGTARelated(video.title, video.description)) continue

      // Skip already processed
      const alreadyDone = await videoAlreadyProcessed(video.videoId)
      if (alreadyDone) continue

      stats.newVideos++

      // Mark as processed immediately
      await markVideoProcessed(video.videoId)

      // Generate article with Claude
      const generated = await generateVideoArticle(video)
      if (!generated) continue

      // Build body with embed marker
      const bodyWithEmbed = buildBodyWithEmbed(generated.body, video.videoId)
      const slug = generateSlug(generated.title)

      // Save to database — auto-publish all official Rockstar videos
      await supabaseAdmin.from('articles').insert({
        title: generated.title,
        slug,
        body: bodyWithEmbed,
        summary: generated.summary,
        category: 'news',
        label: 'CONFIRMED',
        source_url: `https://youtube.com/watch?v=${video.videoId}`,
        source_name: 'Rockstar Games (Official)',
        image_url: video.thumbnailUrl,
        is_published: true,
        auto_published: true,
        published_at: new Date().toISOString()
      })

      stats.articlesCreated++
      console.log(`✅ Video article created: ${generated.title}`)

      // Small delay between Claude calls
      await new Promise(r => setTimeout(r, 1000))
    }

  } catch (err) {
    console.error('YouTube monitor error:', err)
  }

  console.log('📺 YouTube monitor complete:', stats)
  return stats
}
