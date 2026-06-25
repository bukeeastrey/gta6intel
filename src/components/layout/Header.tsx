'use client'

import Link from 'next/link'
import { useState } from 'react'

const categories = [
  { label: 'All', href: '/news' },
  { label: 'Confirmed', href: '/news?label=CONFIRMED' },
  { label: 'Rumor', href: '/news?label=RUMOR' },
  { label: 'Leak', href: '/news?label=LEAK' },
  { label: 'Analysis', href: '/news?label=ANALYSIS' },
  { label: 'Videos', href: '/videos' },
  { label: 'Guides', href: '/guides' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
              <span className="font-mono font-bold text-black text-xs">G6</span>
            </div>
            <span className="font-display text-xl tracking-widest">
              <span className="text-accent">GTA6</span>INTEL
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {categories.map(cat => (
              <Link
                key={cat.label}
                href={cat.href}
                className="px-3 py-1.5 text-xs font-mono text-text-muted hover:text-text-primary hover:bg-surface rounded transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-surface border border-border rounded px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-confirmed animate-pulse" />
              <span className="font-mono text-xs text-text-muted">LIVE</span>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-text-muted hover:text-text-primary p-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen
                  ? <path d="M6 6l12 12M6 18L18 6" />
                  : <path d="M3 7h18M3 12h18M3 17h18" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-3">
            {categories.map(cat => (
              <Link
                key={cat.label}
                href={cat.href}
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-2 text-sm font-mono text-text-muted hover:text-text-primary"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
