'use client'

import { useEffect, useState } from 'react'

// GTA 6 Launch: November 19, 2026
const LAUNCH_DATE = new Date('2026-11-19T00:00:00Z')

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number }

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const tick = () => {
      const now = new Date()
      const diff = LAUNCH_DATE.getTime() - now.getTime()
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
      <div className="font-mono text-xs text-text-muted tracking-widest uppercase mb-4">
        // GTA 6 launches in
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.minutes, label: 'Mins' },
          { value: timeLeft.seconds, label: 'Secs' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center bg-bg border border-border2 rounded p-2 sm:p-3">
            <div className="font-display text-3xl sm:text-4xl text-accent leading-none">
              {String(value).padStart(2, '0')}
            </div>
            <div className="font-mono text-xs text-text-muted mt-1 uppercase tracking-wider">
              {label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-text-muted font-mono text-center">
        November 19, 2026 — PS5 & Xbox Series X/S
      </div>
    </div>
  )
}
