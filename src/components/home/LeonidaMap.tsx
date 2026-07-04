'use client';
// Interactive Leonida locations map: a real base map image with clickable pins.
// Tapping a pin opens a popup ON the map showing that location's details + photos.
// Set BASE_MAP to your (rights-cleared) map image URL. Credit the maker via
// BASE_MAP_CREDIT. Pin x/y are % of the image — tune to line up with your map.
import { useState } from 'react';
import { GalleryLightbox } from '@/components/database/GalleryLightbox';

const BASE_MAP = '';         // 👉 e.g. 'https://<supabase>/storage/v1/object/public/site/leonida.jpg'
const BASE_MAP_CREDIT = '';  // 👉 e.g. 'Map by AvatarSD — used with permission'

type Region = {
  id: string; name: string; x: number; y: number;
  status: 'confirmed' | 'rumor'; insp: string; note: string;
};

const REGIONS: Region[] = [
  { id: 'kalaga', name: 'Mount Kalaga', x: 52, y: 15, status: 'confirmed',
    insp: 'North Florida / Providence Canyon, GA',
    note: "Remote northern highlands - forests, canyons, hunting and off-road country." },
  { id: 'gellhorn', name: 'Port Gellhorn', x: 19, y: 45, status: 'confirmed',
    insp: 'Panama City, FL',
    note: 'A faded industrial port town on the western coast - motels, rail yards, smuggling.' },
  { id: 'ambrosia', name: 'Ambrosia', x: 50, y: 42, status: 'confirmed',
    insp: 'Rural / industrial central Florida',
    note: 'Industrial heartland by Lake Leonida - refineries, farmland, biker gangs.' },
  { id: 'lake', name: 'Lake Leonida', x: 43, y: 34, status: 'rumor',
    insp: 'Lake Okeechobee',
    note: 'Large central lake - widely mapped by the community, not an official name.' },
  { id: 'grassrivers', name: 'Grassrivers', x: 33, y: 66, status: 'confirmed',
    insp: 'The Everglades',
    note: 'Subtropical wetlands - airboats, mangroves, alligators, off-grid communities.' },
  { id: 'vicecity', name: 'Vice City', x: 70, y: 60, status: 'confirmed',
    insp: 'Miami, FL',
    note: 'The neon-soaked centrepiece - Art Deco beaches, nightlife, canals, downtown.' },
  { id: 'keys', name: 'Leonida Keys', x: 62, y: 87, status: 'confirmed',
    insp: 'The Florida Keys',
    note: 'Southern island chain linked by long bridges. Jason and Lucia start here.' },
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

        <div className="lm-mapzone">
          <div className={`lm-map${BASE_MAP ? '' : ' lm-map-placeholder'}`} onClick={() => setSel(null)}>
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
                onClick={(e) => { e.stopPropagation(); setSel(r); }}
                aria-label={r.name}
              >
                <span className="lm-pin-dot" />
                <span className="lm-pin-label">{r.name}</span>
              </button>
            ))}

            {sel && (
              <div
                className="lm-popup"
                style={{ left: `${sel.x}%`, top: `${sel.y}%` }}
                data-h={sel.x < 50 ? 'r' : 'l'}
                data-v={sel.y < 55 ? 'd' : 'u'}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="lm-popup-close" onClick={() => setSel(null)} aria-label="Close">&times;</button>
                <div className="lm-p-head">
                  <h3>{sel.name}</h3>
                  <span className={`lm-status lm-${sel.status}`}>{sel.status.toUpperCase()}</span>
                </div>
                <p className="lm-insp">Inspired by {sel.insp}</p>
                <p className="lm-note">{sel.note}</p>
                {images.length > 0 ? (
                  <div className="lm-p-gallery"><GalleryLightbox images={images} name={sel.name} /></div>
                ) : (
                  <p className="lm-p-noimg">Photos coming soon.</p>
                )}
              </div>
            )}

            {BASE_MAP && BASE_MAP_CREDIT && <span className="lm-credit">{BASE_MAP_CREDIT}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
