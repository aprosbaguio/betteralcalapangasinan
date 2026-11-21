import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';

export const BarangayPopulationChart: React.FC = () => {
  const { navigate } = useApp();
  const { barangays } = useCivicData();
  const [sortMode, setSortMode] = useState<'population' | 'alphabetical'>('population');

  const sorted = [...barangays].sort((a, b) =>
    sortMode === 'population' ? b.population2020 - a.population2020 : a.name.localeCompare(b.name)
  );
  const maxPop = Math.max(1, ...barangays.map((b) => b.population2020));

  return (
    <div className="border border-slate-200 bg-white rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#0F294A]">
            2020 PSA Census Population (21 Barangays)
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            PSA 2020 Census · Municipal Total: 48,908
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-md self-start">
          <button
            type="button"
            onClick={() => setSortMode('population')}
            className={`min-h-[32px] px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              sortMode === 'population' ? 'bg-white text-[#0F294A] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Population
          </button>
          <button
            type="button"
            onClick={() => setSortMode('alphabetical')}
            className={`min-h-[32px] px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              sortMode === 'alphabetical' ? 'bg-white text-[#0F294A] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A–Z
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        {sorted.map((b) => {
          const widthPct = Math.round((b.population2020 / maxPop) * 100);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => navigate(`/barangays/${b.slug}`)}
              className="group text-left py-1 min-h-[36px] focus-visible:outline-2 focus-visible:outline-[#0F294A] rounded cursor-pointer"
            >
              <div className="flex items-baseline justify-between gap-2 text-xs mb-1">
                <span className="font-medium text-slate-800 group-hover:text-[#0F294A] group-hover:underline truncate">
                  {b.name}
                  {b.classification === 'Poblacion / Urban Center' ? ' (Poblacion)' : ''}
                </span>
                <span className="font-mono text-slate-600 tabular-nums shrink-0">
                  {b.population2020.toLocaleString()} ({b.populationSharePercent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-sm overflow-hidden">
                <div
                  className={`h-full transition-opacity ${
                    b.classification === 'Poblacion / Urban Center' ? 'bg-[#166534]' : 'bg-[#0F294A]'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
