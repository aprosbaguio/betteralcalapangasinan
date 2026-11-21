import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { AlcalaMap } from '../components/AlcalaMap';
import { PageHeader } from '../components/PageHeader';
import { SourceAttributionBlock, VerificationIndicator } from '../components/VerificationIndicator';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';
import { usePageSEO } from '../lib/seo';

export const ProjectsPage: React.FC = () => {
  const { searchParams, navigate } = useApp();
  const { projects, getBarangayBySlug, getSourcesByIds } = useCivicData();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  usePageSEO({
    title: 'Infrastructure Projects – Alcala, Pangasinan',
    description:
      'Public infrastructure and development project tracker for Alcala, Pangasinan with spatial reference.',
    path: '/projects',
  });

  const sources = getSourcesByIds(['src-philgeps-dpwh', 'src-blgf-dbm', 'src-pangasinan-gov']);

  const filtered = projects.filter((p) => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.implementingAgency.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        kicker="Infrastructure &amp; Development"
        title="Infrastructure Projects"
        description="Tracks municipal capital works, 20% LDF, and DPWH corridors in Alcala. Costs, contractors, and completion remain flagged until verified."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <AlcalaMap mode="projects" />

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, agencies, or barangays..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
              aria-label="Search infrastructure projects"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Awaiting Verification', 'Ongoing', 'Completed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === st ? 'bg-[#0F294A] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="border border-slate-200 bg-white rounded-lg p-8 text-center text-sm text-slate-600">
            No infrastructure project records match the selected filter.
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map((proj) => {
              const brgy = proj.barangaySlug ? getBarangayBySlug(proj.barangaySlug) : null;
              return (
                <article key={proj.id} className="border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#0F294A]">{proj.location}</span>
                    <VerificationIndicator status={proj.verificationStatus} compact />
                  </div>

                  <div>
                    <h2 className="font-editorial text-lg sm:text-xl font-semibold text-slate-900">{proj.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-700 leading-snug sm:leading-relaxed mt-1.5">{proj.description}</p>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <dt className="text-slate-500">Project Cost</dt>
                      <dd className="font-mono font-medium text-slate-900 mt-0.5">{proj.projectCostLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Funding Source</dt>
                      <dd className="font-medium text-slate-900 mt-0.5">{proj.fundingSource}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Contractor</dt>
                      <dd className="font-medium text-slate-900 mt-0.5">
                        {proj.contractor ?? 'Awaiting PhilGEPS Award'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Timeline / Barangay</dt>
                      <dd className="font-medium text-slate-900 mt-0.5">
                        {proj.startDate ?? 'Dates pending'}
                        {brgy && (
                          <>
                            {' · '}
                            <button
                              type="button"
                              onClick={() => navigate(`/barangays/${brgy.slug}`)}
                              className="text-[#0F294A] hover:underline cursor-pointer"
                            >
                              Brgy. {brgy.name}
                            </button>
                          </>
                        )}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        )}

        <SourceAttributionBlock sources={sources} lastUpdated="2026-11-20" />
      </div>
    </div>
  );
};
