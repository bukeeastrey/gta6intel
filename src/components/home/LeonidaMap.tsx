'use client';
// Interactive Leonida locations map.
//
// This renders a REAL map image (BASE_MAP) with clickable pins over it. Tapping
// a pin opens a side panel with that location's details + photos. If BASE_MAP is
// empty it falls back to a clean placeholder board — so set BASE_MAP for the real
// look (see READ-ME: upload a map you have the rights to, then paste its URL).
//
// Pin positions are percentages of the map area, so they work over any base image;
// tune x/y per region to line up with your chosen map.
import { useState } from 'react';
import { GalleryLightbox } from '@/components/database/GalleryLightbox';

// 👉 Set this to your base map image URL (Supabase Storage or /public). Empty = placeholder.
const BASE_MAP = '';

type Region = {
  id: string; name: string; x: number; y: number;
  status: 'confirmed' | 'rumor'; insp: string; note: string;
};

const REGIONS: Region[] = [
  { id: 'kalaga', name: 'Mount Kalaga National Park', x: 52, y: 15, status: 'confirmed',
    insp: 'North Florida / Providence Canyon, GA',
    note: "Leonida's remote northern highlands - forests, canyons and rivers. Hunting, fishing and off-road country." },
  { id: 'gellhorn', name: 'Port Gellhorn', x: 19, y: 45, status: 'confirmed',
    insp: 'Panama City, FL (Gulf coast)',
    note: 'A faded industrial port town on the western coast - motels, truck stops, rail yards and maritime smuggling.' },
  { id: 'ambrosia', name: 'Ambrosia', x: 50, y: 42, status: 'confirmed',
    insp: 'Rural / industrial central Florida',
    note: 'Industrial heartland beside Lake Leonida - sugar refineries, farmland and a heavy outlaw biker presence.' },
  { id: 'lake', name: 'Lake Leonida', x: 43, y: 34, status: 'rumor',
    insp: 'Lake Okeechobee',
    note: 'A large freshwater lake at the state centre. Widely reported from mapping analysis, not an officially named region.' },
  { id: 'grassrivers', name: 'Grassrivers', x: 33, y: 66, status: 'confirmed',
    insp: 'The Everglades',
    note: 'Vast subtropical wetlands - airboats, mangroves, alligators and off-grid communities.' },
  { id: 'vicecity', name: 'Vice City', x: 70, y: 60, status: 'confirmed',
    insp: 'Miami, FL',
    note: 'The neon-soaked centrepiece on the southeast coast - Art Deco beaches, nightlife, canals and downtown towers.' },
  { id: 'keys', name: 'Leonida Keys', x: 62, y: 87, status: 'confirmed',
    insp: 'The Florida Keys',
    note: 'A southern island chain linked by long bridges. Jason and Lucia start the story here.' },
];

export function LeonidaMap({ media = {} }: { media?: Record<string, string[]> }) {
  const [sel, setSel] = useState<Region | null>(null);
  const images = sel ? media[sel.id] ?? [] : [];

  return (
    <section className="lm-wrap" aria-labelledby="lm-title">
      <div className="section-header">
        <h2 className="section-title rl" id="lm-title">GTA 6 <span>Maps</span></h2>
      </div>

      <div className="lm-card">
        <div className="lm-banner">
          <span className="lm-badge">Speculative</span>
          <span className="lm-banner-txt">Regions are officially confirmed; pin positions are approximate. Not an official map.</span>
        </div>

        <div className="lm-stage">
          {/* MAP */}
          <div className={`lm-map${BASE_MAP ? '' : ' lm-map-placeholder'}`}>
            {BASE_MAP ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={BASE_MAP} alt="Map of the State of Leonida" className="lm-base" />
            ) : (
              <div className="lm-grid-bg" aria-hidden="true" />
            )}
            {REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`lm-pin lm-pin-${r.status}${sel?.id === r.id ? ' is-sel' : ''}`}
                style={{ left: `${r.x}%`, top: `${r.y}%` }}
                onClick={() => setSel(r)}
                aria-label={r.name}
              >
                <span className="lm-pin-dot" />
                <span className="lm-pin-label">{r.name}</span>
              </button>
            ))}
          </div>

          {/* SIDE PANEL */}
          <aside className="lm-panel">
            {sel ? (
              <div className="lm-panel-in">
                <div className="lm-p-head">
                  <h3>{sel.name}</h3>
                  <span className={`lm-status lm-${sel.status}`}>{sel.status.toUpperCase()}</span>
                </div>
                <p className="lm-insp">Inspired by {sel.insp}</p>
                <p className="lm-note">{sel.note}</p>
                {images.length > 0 ? (
                  <div className="lm-p-gallery">
                    <GalleryLightbox images={images} name={sel.name} />
                  </div>
                ) : (
                  <p className="lm-p-noimg">Photos coming soon.</p>
                )}
              </div>
            ) : (
              <div className="lm-panel-empty">
                <span className="lm-panel-empty-icon">📍</span>
                <p>Tap a location pin to see its details and photos.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
