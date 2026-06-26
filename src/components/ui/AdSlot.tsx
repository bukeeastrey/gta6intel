'use client';
// ════════════════════════════════════════════════════════════
// AdSlot — wrapper around a Google AdSense unit.
// Every format reserves its exact height via CSS (.ad-<format>) so
// ads never cause layout shift (CLS target < 0.1). Pushes to adsbygoogle
// on mount. Set NEXT_PUBLIC_ADSENSE_CLIENT + per-slot IDs in env.
// ════════════════════════════════════════════════════════════
import { useEffect, useRef } from 'react';

type AdFormat = 'leaderboard' | 'rectangle' | 'anchor';

const SIZES: Record<AdFormat, { w: number; h: number }> = {
  leaderboard: { w: 728, h: 90 },
  rectangle: { w: 336, h: 280 },
  anchor: { w: 320, h: 50 },
};

interface AdSlotProps {
  format: AdFormat;
  slot: string; // AdSense data-ad-slot id
  /** Mobile-only sticky anchor needs the `.enabled` flag to show. */
  enabled?: boolean;
  className?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var adsbygoogle: unknown[] | undefined;
}

export function AdSlot({ format, slot, enabled, className }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const { w, h } = SIZES[format];

  useEffect(() => {
    if (!client) return; // no client id in dev → render the placeholder only
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense not ready yet — ignore */
    }
  }, [client]);

  return (
    <div
      className={`ad-slot ad-${format}${format === 'anchor' && enabled ? ' enabled' : ''}${
        className ? ` ${className}` : ''
      }`}
      style={{ minHeight: h }}
      aria-label="Advertisement"
    >
      {client ? (
        <ins
          ref={ref}
          className="adsbygoogle"
          style={{ display: 'inline-block', width: w, height: h }}
          data-ad-client={client}
          data-ad-slot={slot}
        />
      ) : (
        // Dev / no-config fallback keeps the reserved space visible.
        <span>{`Ad · ${w}×${h}`}</span>
      )}
    </div>
  );
}
