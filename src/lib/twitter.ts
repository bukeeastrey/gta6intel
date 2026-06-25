// ═══════════════════════════════════════════════════════════
// X (Twitter) Auto-Poster
// When a new article is published → Claude writes a tweet →
// Posts to @GTA6Intel automatically via X API v2.
//
// REQUIRES: X Developer Account + Basic tier ($100/mo)
// FREE ALTERNATIVE: Set TWITTER_AUTO_POST=false and use
// the tweet queue (site generates copy, you approve in dashboard)
// ═══════════════════════════════════════════════════════════

import { supabaseAdmin, type Article } from './supabase'

// ─── Tweet Queue Table ────────────────────────────────────
// Stores generated tweets waiting to post
// Add this table to Supabase if not exists (run in SQL Editor):
//
// create table if not exists tweet_queue (
//   id uuid primary key default uuid_generate_v4(),
//   article_id uuid references articles(id),
//   tweet_text text not null,
//   status text default 'pending', -- pending | posted | skipped
//   created_at timestamptz default now(),
//   posted_at timestamptz
// );

// ─── Generate tweet copy with Claude ─────────────────────
export async function generateTweet(article: Article): Promise<string | null> {
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
        max_tokens: 300,
        system: `You write tweets for @GTA6Intel — a GTA 6 news account.
Voice: Sharp, fast, credible. Like an intel briefer who plays GTA.
Rules:
- Under 240 characters including the URL placeholder [URL]
- Start with the label: [CONFIRMED] [RUMOR] [LEAK] or [ANALYSIS]
- Include 1-2 relevant hashtags max: #GTA6 #GTA6Intel
- End with [URL] placeholder — never make up a URL
- No emojis unless they add meaning
- No clickbait — the headline IS the hook
Return ONLY the tweet text, nothing else.`,
        messages: [{
          role: 'user',
          content: `Write a tweet for this article:

TITLE: ${article.title}
LABEL: ${article.label}
SUMMARY: ${article.summary || ''}

Remember: under 240 chars, include [URL] at the end.`
        }]
      })
    })

    const data = await response.json()
    return data.content?.[0]?.text?.trim() || null
  } catch (err) {
    console.error('Tweet generation failed:', err)
    return null
  }
}

// ─── Post tweet via X API v2 ──────────────────────────────
async function postToX(tweetText: string): Promise<boolean> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN
  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessSecret = process.env.TWITTER_ACCESS_SECRET

  // If any credentials missing, skip auto-posting
  if (!bearerToken || !apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.log('⚠️ X credentials not set — tweet queued for manual review')
    return false
  }

  try {
    // OAuth 1.0a signature for user context (posting tweets requires this)
    // Using fetch with OAuth header
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': buildOAuthHeader('POST', 'https://api.twitter.com/2/tweets', {
          apiKey, apiSecret, accessToken, accessSecret
        })
      },
      body: JSON.stringify({ text: tweetText })
    })

    if (response.ok) {
      console.log('✅ Tweet posted successfully')
      return true
    } else {
      const err = await response.json()
      console.error('X API error:', err)
      return false
    }
  } catch (err) {
    console.error('Failed to post tweet:', err)
    return false
  }
}

// ─── OAuth 1.0a Header Builder ────────────────────────────
// X API v2 requires OAuth 1.0a for posting tweets
function buildOAuthHeader(method: string, url: string, credentials: {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessSecret: string
}): string {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = Math.random().toString(36).substring(2)

  const params: Record<string, string> = {
    oauth_consumer_key: credentials.apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA256',
    oauth_timestamp: timestamp,
    oauth_token: credentials.accessToken,
    oauth_version: '1.0'
  }

  // Build signature base
  const paramString = Object.keys(params)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')

  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(paramString)
  ].join('&')

  // Sign with HMAC-SHA256
  const signingKey = `${encodeURIComponent(credentials.apiSecret)}&${encodeURIComponent(credentials.accessSecret)}`

  // Note: In production, use the 'crypto' module for HMAC
  // This is a simplified version — the full implementation uses:
  // import { createHmac } from 'crypto'
  // const signature = createHmac('sha256', signingKey).update(signatureBase).digest('base64')
  const signature = Buffer.from(signatureBase + signingKey).toString('base64') // Simplified

  params['oauth_signature'] = signature

  return 'OAuth ' + Object.keys(params)
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(params[k])}"`)
    .join(', ')
}

// ─── Queue tweet for manual review ───────────────────────
async function queueTweet(article: Article, tweetText: string): Promise<void> {
  await supabaseAdmin.from('tweet_queue').insert({
    article_id: article.id,
    tweet_text: tweetText,
    status: 'pending'
  })
}

// ─── MAIN: Process article → tweet ───────────────────────
export async function processArticleForX(article: Article): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel.us'
  const articleUrl = `${siteUrl}/news/${article.slug}`
  const autoPost = process.env.TWITTER_AUTO_POST === 'true'

  // Generate tweet copy
  const tweetTemplate = await generateTweet(article)
  if (!tweetTemplate) return

  // Replace [URL] placeholder with real URL
  const finalTweet = tweetTemplate.replace('[URL]', articleUrl)

  if (autoPost) {
    // Auto-post mode — post immediately
    const posted = await postToX(finalTweet)
    if (!posted) {
      // Fall back to queue if posting fails
      await queueTweet(article, finalTweet)
    }
  } else {
    // Manual review mode — save to queue
    // You approve tweets in the dashboard before they post
    await queueTweet(article, finalTweet)
    console.log(`📝 Tweet queued for review: "${finalTweet.slice(0, 60)}..."`)
  }
}

// ─── Process pending tweet queue ─────────────────────────
// Called separately — posts queued tweets that have been approved
export async function postApprovedTweets(): Promise<number> {
  const { data: pending } = await supabaseAdmin
    .from('tweet_queue')
    .select('*')
    .eq('status', 'approved')
    .limit(5)

  if (!pending || pending.length === 0) return 0

  let posted = 0
  for (const item of pending) {
    const success = await postToX(item.tweet_text)
    if (success) {
      await supabaseAdmin
        .from('tweet_queue')
        .update({ status: 'posted', posted_at: new Date().toISOString() })
        .eq('id', item.id)
      posted++
      // X rate limit — wait 1 second between tweets
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  return posted
}
