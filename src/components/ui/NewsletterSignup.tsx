'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) return
    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Subscribed!')
        setEmail('')
      } else {
        throw new Error(data.error)
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Try again.')
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 sm:p-5">
      <div className="font-mono text-xs text-accent tracking-widest uppercase mb-2">
        // Weekly Intel Drop
      </div>
      <h3 className="font-bold text-sm mb-1">GTA6Intel Weekly</h3>
      <p className="text-xs text-text-muted mb-4 leading-relaxed">
        5 key GTA 6 developments every Sunday. No spam. Unsubscribe anytime.
      </p>

      {status === 'success' ? (
        <div className="text-xs font-mono text-confirmed bg-confirmed/10 border border-confirmed/30 rounded p-3">
          ✓ {message}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="your@email.com"
            className="flex-1 bg-bg border border-border rounded px-3 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleSubmit}
            disabled={status === 'loading'}
            className="btn-primary text-xs px-4 shrink-0"
          >
            {status === 'loading' ? '...' : 'Join'}
          </button>
        </div>
      )}

      {status === 'error' && (
        <p className="text-xs text-leak mt-2">{message}</p>
      )}
    </div>
  )
}
