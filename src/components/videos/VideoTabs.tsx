'use client';
// Splits /videos into tabs by category. "Live" only appears when there are
// stream-tagged videos, so it never shows an empty tab.
import { useState } from 'react';
import type { Video } from '@/lib/videos';
import { VideoGrid } from './VideoGrid';

export function VideoTabs({ videos }: { videos: Video[] }) {
  const trailers = videos.filter((v) => v.category === 'trailer');
  const streams = videos.filter((v) => v.category === 'stream');
  const general = videos.filter((v) => v.category !== 'trailer' && v.category !== 'stream');

  const tabs = [
    { key: 'trailer', label: 'Trailers', items: trailers },
    { key: 'video', label: 'Videos', items: general },
    ...(streams.length ? [{ key: 'stream', label: 'Live', items: streams }] : []),
  ].filter((t) => t.items.length > 0 || t.key === 'video');

  const [active, setActive] = useState(trailers.length ? 'trailer' : 'video');
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <>
      <div className="vtabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            className={`vtab${active === t.key ? ' is-active' : ''}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}<span className="vtab-n">{t.items.length}</span>
          </button>
        ))}
      </div>
      {current && current.items.length > 0 ? (
        <VideoGrid videos={current.items} />
      ) : (
        <p className="vtab-empty">Nothing here yet — check back soon.</p>
      )}
    </>
  );
}
