import React, { useState } from 'react';
import { Clock, MapPin, Phone, Search, UserCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SourceAttributionBlock, VerificationIndicator } from '../components/VerificationIndicator';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';
import { usePageSEO } from '../lib/seo';

const BRANCH_FILTERS = ['All', 'Executive', 'Legislative', 'Mandatory LGU Department', 'Specialized / Local Unit'] as const;

export const DirectoryPage: React.FC = () => {
  const { searchParams, navigate, language } = useApp();
  const { offices, officials, services: allServices, getSourcesByIds } = useCivicData();
  const initialQuery = searchParams.get('q') ?? '';
  const selectedOfficeSlug = searchParams.get('office') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [branchFilter, setBranchFilter] = useState<string>('All');

  usePageSEO({
    title: 'Government Directory – Municipal Offices & Officials of Alcala',
    description:
      'Searchable directory of municipal offices, operating hours, and officials for Alcala, Pangasinan.',
    path: '/directory',
  });

  const filteredOffices = offices.filter((o) => {
    if (selectedOfficeSlug && o.slug !== selectedOfficeSlug && !query) {
      return true;
    }
    if (branchFilter !== 'All' && o.branch !== branchFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.nameFil.toLowerCase().includes(q) ||
      o.acronym.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      (o.officeHead && o.officeHead.toLowerCase().includes(q))
    );
  });

  const filteredOfficials = officials.filter((off) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return off.fullName.toLowerCase().includes(q) || off.roleTitle.toLowerCase().includes(q);
  });

  const sources = getSourcesByIds(['src-pangasinan-gov', 'src-ra7160-laws', 'src-alcala-charter']);
  const allOfficialsVerified =
    officials.length > 0 && officials.every((o) => o.verificationStatus === 'Verified');

  return (
    <div>
      <PageHeader
        kicker="Government Directory · Alcala, Pangasinan"
        title="Municipal Offices &amp; Officials"
        description="Municipal departments and provincial-sourced officials. Unverified phone numbers and post-May 2025 confirmations are flagged."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter offices, acronyms, or officials..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
              aria-label="Filter government offices and officials"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {BRANCH_FILTERS.map((branch) => (
              <button
                key={branch}
                type="button"
                onClick={() => setBranchFilter(branch)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  branchFilter === branch
                    ? 'bg-[#0F294A] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {branch}
              </button>
            ))}
          </div>
        </div>

        {/* Offices Grid */}
        <section aria-label="Municipal Offices">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
              Municipal Offices ({filteredOffices.length})
            </h2>
            {selectedOfficeSlug && (
              <button
                type="button"
                onClick={() => navigate('/directory')}
                className="text-xs font-semibold text-[#0F294A] hover:underline cursor-pointer"
              >
                Clear highlight
              </button>
            )}
          </div>

          {filteredOffices.length === 0 ? (
            <div className="border border-slate-200 bg-white rounded-lg p-6 text-center text-sm text-slate-600">
              No municipal offices matched your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
              {filteredOffices.map((office) => {
                const isHighlighted = selectedOfficeSlug === office.slug;
                const officeServices = allServices.filter((s) => office.serviceSlugs.includes(s.slug));

                return (
                  <article
                    key={office.id}
                    className={`border rounded-lg p-4 sm:p-5 bg-white flex flex-col justify-between gap-3 ${
                      isHighlighted ? 'border-[#0F294A] ring-2 ring-[#0F294A]/15' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-[#0F294A]">
                          {office.acronym} · {office.branch}
                        </span>
                        <VerificationIndicator status={office.verificationStatus} compact />
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mt-1.5">
                        {language === 'fil' ? office.nameFil : office.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-snug mt-1 line-clamp-2 sm:line-clamp-none">
                        {office.description}
                      </p>

                      <dl className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-start gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                          <div className="min-w-0">
                            <dt className="inline font-semibold text-slate-800">Head: </dt>
                            <dd className="inline break-words">
                              {office.officeHead ?? 'Awaiting LGU verification'}
                            </dd>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                          <div className="min-w-0">
                            <dt className="inline font-semibold text-slate-800">Location: </dt>
                            <dd className="inline break-words">{office.address}</dd>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                          <div className="min-w-0">
                            <dt className="inline font-semibold text-slate-800">Hours: </dt>
                            <dd className="inline">{office.operatingHours}</dd>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                          <div className="min-w-0">
                            <dt className="inline font-semibold text-slate-800">Contact: </dt>
                            <dd className="inline text-slate-600">
                              {office.contactPhone ?? 'Awaiting verification'}
                            </dd>
                          </div>
                        </div>
                      </dl>
                    </div>

                    {officeServices.length > 0 && (
                      <div className="pt-2.5 border-t border-slate-100">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {officeServices.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => navigate(`/services/${s.slug}`)}
                              className="text-xs font-semibold text-[#0F294A] hover:underline py-1 cursor-pointer"
                            >
                              {s.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Officials Roster: Mobile Cards (< md) + Desktop Table (>= md) */}
        <section aria-label="Elected Officials Roster" className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
                Executive &amp; Sangguniang Bayan Roster
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Provincial portal roster; post-May 2025 confirmation pending.
              </p>
            </div>
            <VerificationIndicator status={allOfficialsVerified ? 'Verified' : 'Needs Review'} />
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredOfficials.map((off) => (
              <div key={off.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{off.fullName}</p>
                  <VerificationIndicator status={off.verificationStatus} compact />
                </div>
                <p className="text-xs text-slate-700">
                  {off.roleTitle} · {off.branch}
                </p>
                <p className="text-[11px] text-slate-500">{off.termPeriod}</p>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Official Name</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Term &amp; Verification Note</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOfficials.map((off) => (
                  <tr key={off.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">{off.fullName}</td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{off.roleTitle}</td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{off.branch}</td>
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-md">{off.termPeriod}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <VerificationIndicator status={off.verificationStatus} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <SourceAttributionBlock sources={sources} lastUpdated="2026-11-20" />
      </div>
    </div>
  );
};
