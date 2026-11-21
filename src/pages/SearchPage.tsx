import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { VerificationIndicator } from '../components/VerificationIndicator';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';
import { usePageSEO } from '../lib/seo';

const TYPES = ['All', 'Service', 'Office', 'Official', 'Barangay', 'Ordinance', 'Resolution', 'Project', 'Document'] as const;

export const SearchPage: React.FC = () => {
  const { searchParams, navigate } = useApp();
  const { searchAll } = useCivicData();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  usePageSEO({
    title: query ? `Search: ${query} – BetterAlcala` : 'Search Civic Records – BetterAlcala',
    description:
      'Search Alcala services, offices, officials, 21 barangays, ordinances, projects, and public documents.',
    path: '/search',
  });

  const results = searchAll(query, typeFilter);

  return (
    <div>
      <PageHeader
        kicker="Global Discovery"
        title="Search Civic Records"
        description="Filter across services, offices, officials, 21 barangays, ordinances, projects, and documents."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-4">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Keyword (Birth Certificate, San Vicente, COA, Curfew)..."
              className="w-full h-11 pl-10 pr-4 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
              aria-label="Search all civic records"
            />
          </div>

          <div className="flex sm:flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                  typeFilter === t ? 'bg-[#0F294A] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs font-mono text-slate-600 tabular-nums">
          {results.length} matching {results.length === 1 ? 'record' : 'records'}
        </p>

        {results.length === 0 ? (
          <div className="border border-slate-200 bg-white rounded-lg p-8 text-center space-y-3">
            <p className="text-sm text-slate-700">No records matched “{query}”.</p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setTypeFilter('All');
              }}
              className="px-4 py-2 text-xs font-semibold text-[#0F294A] border border-slate-300 rounded-md cursor-pointer"
            >
              Show All Records
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 border border-slate-200 bg-white rounded-lg overflow-hidden">
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.route)}
                className="w-full text-left p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 min-h-[60px] cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-500">
                    <span className="font-semibold text-[#0F294A]">{item.entityType}</span>
                    <span aria-hidden="true">·</span>
                    <VerificationIndicator status={item.verificationStatus} compact />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-slate-900 mt-0.5 truncate">{item.title}</h2>
                  <p className="text-xs text-slate-600 truncate">{item.subtitle}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
