'use client';
// ════════════════════════════════════════════════════════════
// CountdownTimer — live ticker to the GTA 6 launch.
// Ports the v9 "pop" scale animation on each digit change. The pop
// class is cleared on animationend so it can replay every tick
// (a continuously-present class would only animate once).
// Hydration-safe: renders placeholders until mounted.
// ════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from 'react';

const LAUNCH = new Date('2026-11-19T00:00:00Z').getTime();

type Key = 'd' | 'h' | 'm' | 's';
type Parts = Record<Key, string>;

function compute(): Parts {
  const diff = Math.max(0, LAUNCH - Date.now());
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    d: String(Math.floor(diff / 86400000)),
    h: pad(Math.floor((diff % 86400000) / 3600000)),
    m: pad(Math.floor((diff % 3600000) / 60000)),
    s: pad(Math.floor((diff % 60000) / 1000)),
  };
}

const UNITS: { key: Key; label: string }[] = [
  { key: 'd', label: 'Days' },
  { key: 'h', label: 'Hours' },
  { key: 'm', label: 'Mins' },
  { key: 's', label: 'Secs' },
];

export function CountdownTimer() {
  const [parts, setParts] = useState<Parts | null>(null);
  const [popping, setPopping] = useState<Record<Key, boolean>>({
    d: false, h: false, m: false, s: false,
  });
  const prev = useRef<Parts | null>(null);

  useEffect(() => {
    const tick = () => {
      const next = compute();
      setParts(next);
      if (prev.current) {
        const justChanged: Partial<Record<Key, boolean>> = {};
        (Object.keys(next) as Key[]).forEach((k) => {
          if (next[k] !== prev.current![k]) justChanged[k] = true;
        });
        if (Object.keys(justChanged).length) {
          setPopping((p) => ({ ...p, ...justChanged }));
        }
      }
      prev.current = next;
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="cd-block">
      <div className="cd-eyebrow">GTA 6 Launches In</div>
      <div className="cd-grid">
        {UNITS.map((u) => (
          <div
            key={u.key}
            className={`cd-unit${popping[u.key] ? ' pop' : ''}`}
            onAnimationEnd={() => setPopping((p) => ({ ...p, [u.key]: false }))}
          >
            <span className="cd-n">{parts ? parts[u.key] : '—'}</span>
            <span className="cd-l">{u.label}</span>
          </div>
        ))}
      </div>
      <div className="cd-sub">Nov 19, 2026 · PS5 &amp; Xbox Series X/S</div>
    </div>
  );
}
