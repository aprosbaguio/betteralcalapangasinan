import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';

export const AlcalaMap: React.FC<{
  mode?: 'overview' | 'projects';
}> = ({ mode = 'overview' }) => {
  const { navigate } = useApp();
  const { barangays, municipalProfile: MUNICIPAL_PROFILE } = useCivicData();
  const [selectedSpot, setSelectedSpot] = useState<'center' | 'agno' | 'poblacion'>('center');

  const topBarangays = [...barangays].sort((a, b) => b.population2020 - a.population2020).slice(0, 5);

  const spots = {
    center: {
      title: 'Alcala Municipal Center Reference',
      coords: `${MUNICIPAL_PROFILE.coordinates.lat.toFixed(3)}° N, ${MUNICIPAL_PROFILE.coordinates.lng.toFixed(3)}° E`,
      detail:
        'Approximate town center near Poblacion East / West along the Carmen–Alcala highway corridor.',
    },
    agno: {
      title: 'Agno River Basin Corridor',
      coords: 'Watershed Corridor (GIS shapefiles awaiting DPWH)',
      detail:
        'Alcala sits in the Agno River alluvial plain, supporting rice/corn irrigation and flood-risk planning.',
    },
    poblacion: {
      title: 'Poblacion Civic Core',
      coords: 'Poblacion East (1,474) & Poblacion West (1,783)',
      detail:
        'Administrative hub housing Municipal Hall offices, treasury, civil registry, and social welfare desks.',
    },
  };

  return (
    <div className="border border-slate-200 bg-white rounded-lg overflow-hidden">
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-[#0F294A]">
            {mode === 'projects'
              ? 'Spatial Reference Map — Alcala, Pangasinan'
              : 'Geographic Context — Alcala, Pangasinan'}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Municipal center coordinates verified; barangay/project GIS pins await survey files.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-600 tabular-nums">
          15.847° N, 120.523° E
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-[#F4F6F8] p-3 sm:p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
          <svg
            viewBox="0 0 640 320"
            className="w-full h-auto rounded border border-slate-200 bg-[#FAFAF9]"
            role="img"
            aria-label="Schematic spatial reference map of Alcala, Pangasinan showing Agno River corridor and Poblacion center"
          >
            <g stroke="#E2E8F0" strokeWidth="1">
              <line x1="0" y1="80" x2="640" y2="80" />
              <line x1="0" y1="160" x2="640" y2="160" />
              <line x1="0" y1="240" x2="640" y2="240" />
              <line x1="160" y1="0" x2="160" y2="320" />
              <line x1="320" y1="0" x2="320" y2="320" />
              <line x1="480" y1="0" x2="480" y2="320" />
            </g>

            <path
              d="M120,85 L260,50 L450,65 L535,140 L505,245 L340,280 L165,250 L100,170 Z"
              fill="#FFFFFF"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />

            <path
              d="M40,235 C140,200 215,245 315,210 C410,175 495,205 605,165"
              fill="none"
              stroke="#0F294A"
              strokeOpacity="0.25"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M40,235 C140,200 215,245 315,210 C410,175 495,205 605,165"
              fill="none"
              stroke="#1D4ED8"
              strokeOpacity="0.5"
              strokeWidth="2.5"
            />

            <path
              d="M135,70 L318,155 L490,255"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="6 3"
            />

            <g
              className="cursor-pointer"
              onClick={() => setSelectedSpot('center')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedSpot('center')}
            >
              <circle cx="318" cy="155" r={selectedSpot === 'center' ? 16 : 12} fill="#0F294A" fillOpacity="0.14" />
              <circle cx="318" cy="155" r="6" fill="#0F294A" />
              <text x="332" y="150" fontSize="11" fontWeight="600" fill="#0F294A">
                Alcala Municipal Center
              </text>
              <text x="332" y="164" fontSize="10" fill="#64748B">
                15.847° N, 120.523° E
              </text>
            </g>

            <g
              className="cursor-pointer"
              onClick={() => setSelectedSpot('agno')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedSpot('agno')}
            >
              <circle cx="215" cy="227" r="6" fill="#1D4ED8" />
              <text x="145" y="254" fontSize="10" fontWeight="500" fill="#334155">
                Agno River Corridor
              </text>
            </g>

            <g
              className="cursor-pointer"
              onClick={() => setSelectedSpot('poblacion')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedSpot('poblacion')}
            >
              <circle cx="290" cy="138" r="6" fill="#166534" />
              <text x="180" y="128" fontSize="10" fontWeight="500" fill="#166534">
                Poblacion East &amp; West
              </text>
            </g>

            <text x="14" y="22" fontSize="9.5" fill="#64748B">
              SCHEMATIC MUNICIPAL CONTEXT · NOT A CADASTRAL SURVEY
            </text>
          </svg>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span>Tap nodes to inspect reference details.</span>
            <a
              href={`https://www.openstreetmap.org/?mlat=${MUNICIPAL_PROFILE.coordinates.lat}&mlon=${MUNICIPAL_PROFILE.coordinates.lng}#map=13/${MUNICIPAL_PROFILE.coordinates.lat}/${MUNICIPAL_PROFILE.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#0F294A] hover:underline whitespace-nowrap"
            >
              <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
              <span>OpenStreetMap</span>
            </a>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Selected Node</p>
            <h4 className="text-sm sm:text-base font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#0F294A] shrink-0" aria-hidden="true" />
              <span>{spots[selectedSpot].title}</span>
            </h4>
            <p className="text-xs font-mono text-slate-600 mt-1 tabular-nums">{spots[selectedSpot].coords}</p>
            <p className="text-xs sm:text-sm text-slate-700 leading-snug mt-2">{spots[selectedSpot].detail}</p>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Largest Barangays (2020 PSA)
            </p>
            <ul className="space-y-1 text-xs sm:text-sm">
              {topBarangays.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-0.5">
                  <button
                    type="button"
                    onClick={() => navigate(`/barangays/${b.slug}`)}
                    className="text-[#0F294A] hover:underline font-medium cursor-pointer"
                  >
                    {b.name}
                  </button>
                  <span className="font-mono text-xs text-slate-600 tabular-nums">
                    {b.population2020.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
