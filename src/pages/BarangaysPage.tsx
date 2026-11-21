import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, MapPin, Search, Users } from 'lucide-react';
import { BarangayPopulationChart } from '../components/BarangayPopulationChart';
import { PageHeader } from '../components/PageHeader';
import { SourceAttributionBlock, VerificationIndicator } from '../components/VerificationIndicator';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';
import { usePageSEO } from '../lib/seo';

export const BarangaysPage: React.FC<{ slug?: string }> = ({ slug }) => {
  const { navigate } = useApp();
  const { barangays, projects, getBarangayBySlug, getSourcesByIds } = useCivicData();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('All');

  const selectedBarangay = slug ? getBarangayBySlug(slug) : undefined;

  usePageSEO({
    title: selectedBarangay
      ? `Barangay ${selectedBarangay.name} – Alcala, Pangasinan`
      : '21 Barangays Directory – Alcala, Pangasinan',
    description: selectedBarangay
      ? `PSA 2020 population (${selectedBarangay.population2020.toLocaleString()}) and profile for Barangay ${selectedBarangay.name}, Alcala.`
      : 'Directory of all 21 barangays of Alcala, Pangasinan verified against PSA PSGC and 2020 Census records.',
    path: selectedBarangay ? `/barangays/${selectedBarangay.slug}` : '/barangays',
  });

  if (slug && !selectedBarangay) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-editorial text-2xl font-semibold text-[#0F294A]">Barangay Not Found</h1>
        <button
          type="button"
          onClick={() => navigate('/barangays')}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#0F294A] rounded-md cursor-pointer"
        >
          Back to All 21 Barangays
        </button>
      </div>
    );
  }

  if (selectedBarangay) {
    const sources = getSourcesByIds(selectedBarangay.sourceIds);
    const linkedProjects = projects.filter(
      (p) => p.barangaySlug === selectedBarangay.slug
    );

    return (
      <div>
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
            <button
              type="button"
              onClick={() => navigate('/barangays')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#0F294A] mb-3 min-h-[36px] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>All 21 Barangays</span>
            </button>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-mono font-semibold text-[#0F294A]">
                PSGC {selectedBarangay.psgcCode}
              </span>
              <span aria-hidden="true">·</span>
              <span>{selectedBarangay.classification}</span>
              <span aria-hidden="true">·</span>
              <VerificationIndicator status={selectedBarangay.verificationStatus} compact />
            </div>

            <h1 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#0F294A] mt-1.5">
              Barangay {selectedBarangay.name}
            </h1>
            {selectedBarangay.alternateSpelling && (
              <p className="text-xs text-slate-500 mt-1">
                Census Variant: {selectedBarangay.alternateSpelling}
              </p>
            )}
            <p className="text-sm sm:text-base text-slate-600 leading-snug sm:leading-relaxed mt-2 max-w-3xl">
              {selectedBarangay.geographicNotes}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="border border-slate-200 bg-white rounded-lg p-4">
              <p className="text-[11px] sm:text-xs text-slate-600">2020 Pop. (PSA)</p>
              <p className="text-xl sm:text-2xl font-semibold text-[#0F294A] font-mono tabular-nums mt-0.5">
                {selectedBarangay.population2020.toLocaleString()}
              </p>
              <div className="mt-1.5">
                <VerificationIndicator status="Verified" compact />
              </div>
            </div>

            <div className="border border-slate-200 bg-white rounded-lg p-4">
              <p className="text-[11px] sm:text-xs text-slate-600">Municipal Share</p>
              <p className="text-xl sm:text-2xl font-semibold text-[#0F294A] font-mono tabular-nums mt-0.5">
                {selectedBarangay.populationSharePercent}%
              </p>
              <div className="mt-1.5">
                <VerificationIndicator status="Verified" compact />
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 border border-slate-200 bg-white rounded-lg p-4">
              <p className="text-[11px] sm:text-xs text-slate-600">Punong Barangay</p>
              <p className="text-sm sm:text-base font-semibold text-slate-800 mt-0.5">
                {selectedBarangay.punongBarangay ?? 'Awaiting Verification'}
              </p>
              <div className="mt-1.5">
                <VerificationIndicator
                  status={selectedBarangay.punongBarangay ? selectedBarangay.verificationStatus : 'Unavailable'}
                  compact
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-2.5">
              <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#0F294A] flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Officials &amp; Contact</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {selectedBarangay.barangayCouncilNote}
              </p>
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                Contact: {selectedBarangay.contactNumber ?? 'Awaiting verification'}
              </p>
            </div>

            <div className="border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-2.5">
              <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#0F294A] flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Location &amp; Services</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold">Location:</span> {selectedBarangay.barangayHallLocation}
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold">Services:</span> {selectedBarangay.serviceNotes}
              </p>
            </div>
          </div>

          {linkedProjects.length > 0 && (
            <div className="border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-3">
              <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#0F294A]">
                Projects Mentioning {selectedBarangay.name}
              </h2>
              {linkedProjects.map((p) => (
                <div key={p.id} className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                    <p className="text-xs text-slate-600">{p.status} · {p.projectCostLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/projects')}
                    className="text-xs font-semibold text-[#0F294A] hover:underline shrink-0 cursor-pointer"
                  >
                    Registry
                  </button>
                </div>
              ))}
            </div>
          )}

          <SourceAttributionBlock
            sources={sources}
            verificationNotes={selectedBarangay.verificationNotes}
            lastUpdated={selectedBarangay.updatedAt}
          />
        </div>
      </div>
    );
  }

  const filtered = barangays.filter((b) => {
    if (classFilter !== 'All' && b.classification !== classFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.alternateSpelling && b.alternateSpelling.toLowerCase().includes(q)) ||
      b.psgcCode.includes(q)
    );
  });

  const sources = getSourcesByIds(['src-psa-2020', 'src-pangasinan-gov']);

  return (
    <div>
      <PageHeader
        kicker="21 Component Barangays · PSGC 0105504000"
        title="Barangay Directory"
        description="All 21 barangays of Alcala verified against PSA 2020 Census (48,908 total residents). Barangay rosters await official verification."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search barangay name or PSGC code..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
              aria-label="Search barangays"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['All', 'Poblacion / Urban Center', 'Rural / Agricultural'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setClassFilter(c)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
                  classFilter === c ? 'bg-[#0F294A] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Tap List (< md) */}
        <div className="md:hidden bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {filtered.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => navigate(`/barangays/${b.slug}`)}
              className="w-full text-left px-4 py-3 min-h-[56px] flex items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{b.name}</p>
                <p className="text-xs text-slate-600 font-mono tabular-nums mt-0.5">
                  Pop: {b.population2020.toLocaleString()} ({b.populationSharePercent}%) · {b.psgcCode}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            </button>
          ))}
        </div>

        {/* Desktop Table (>= md) */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Barangay</th>
                  <th className="py-3 px-4">PSGC Code</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">2020 Population</th>
                  <th className="py-3 px-4 text-right">Share</th>
                  <th className="py-3 px-4">Officials Roster</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {b.name}
                      {b.alternateSpelling && (
                        <span className="block text-xs font-normal text-slate-500">
                          {b.alternateSpelling}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 tabular-nums">{b.psgcCode}</td>
                    <td className="py-3 px-4 text-xs text-slate-700">{b.classification}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {b.population2020.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {b.populationSharePercent}%
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {b.punongBarangay ?? 'Awaiting Verification'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/barangays/${b.slug}`)}
                        className="text-xs font-semibold text-[#0F294A] hover:underline cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <BarangayPopulationChart />
        <SourceAttributionBlock sources={sources} lastUpdated="2026-11-20" />
      </div>
    </div>
  );
};
