import React, { useState } from 'react';
import { ArrowLeft, CheckSquare, FileText, Printer, Search, Square } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SourceAttributionBlock, VerificationIndicator } from '../components/VerificationIndicator';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';
import { usePageSEO } from '../lib/seo';
import { ServiceCategory } from '../types/civic';

const SERVICE_CATEGORIES: Array<'All' | ServiceCategory> = [
  'All',
  'Civil Registration',
  'Business Permits and Licensing',
  'Taxation and Treasury',
  'Property Assessment',
  'Health Services',
  'Social Welfare',
  'Agriculture',
  'Building and Construction',
  'Employment Assistance',
  'Disaster Risk Reduction',
  'Senior Citizen Services',
  'PWD Services',
  'Solo Parent Services',
];

export const ServicesPage: React.FC<{ slug?: string }> = ({ slug }) => {
  const { navigate, language } = useApp();
  const { services, offices, getServiceBySlug, getOfficeById, getSourcesByIds } = useCivicData();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [officeFilter, setOfficeFilter] = useState<string>('All');
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});

  const selectedService = slug ? getServiceBySlug(slug) : undefined;

  usePageSEO({
    title: selectedService ? `${selectedService.title} – Public Services` : 'Public Services Catalog – Alcala, Pangasinan',
    description: selectedService
      ? selectedService.summary
      : 'Searchable catalog of municipal public services in Alcala across 13 categories.',
    path: selectedService ? `/services/${selectedService.slug}` : '/services',
  });

  if (slug && !selectedService) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-editorial text-2xl font-semibold text-[#0F294A]">Service Record Not Found</h1>
        <button
          type="button"
          onClick={() => navigate('/services')}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#0F294A] rounded-md cursor-pointer"
        >
          Return to Services
        </button>
      </div>
    );
  }

  if (selectedService) {
    const office = getOfficeById(selectedService.officeId);
    const sources = getSourcesByIds(selectedService.sourceIds);

    return (
      <div>
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#0F294A] mb-3 min-h-[36px] cursor-pointer no-print"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>All Public Services</span>
            </button>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-[#0F294A]">{selectedService.category}</span>
              <span aria-hidden="true">·</span>
              <span>{office?.acronym ?? 'Municipal Office'}</span>
              <span aria-hidden="true">·</span>
              <VerificationIndicator status={selectedService.verificationStatus} compact />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mt-1.5">
              <div>
                <h1 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#0F294A] tracking-tight">
                  {language === 'fil' ? selectedService.titleFil : selectedService.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-snug sm:leading-relaxed mt-2 max-w-3xl">
                  {language === 'fil' ? selectedService.summaryFil : selectedService.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold text-[#0F294A] bg-white border border-slate-300 rounded-md hover:bg-slate-50 whitespace-nowrap shrink-0 self-start cursor-pointer no-print"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Print Checklist</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
          <div className="border border-amber-300 bg-amber-50/70 rounded-lg p-4">
            <p className="text-xs sm:text-sm font-semibold text-amber-950">
              Citizen’s Charter Verification Notice
            </p>
            <p className="text-xs sm:text-sm text-amber-900 leading-snug mt-1">
              {selectedService.charterVerificationNote}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="border border-slate-200 bg-white rounded-lg p-4 sm:p-5">
              <p className="text-xs font-semibold text-slate-500">Responsible Office</p>
              <p className="text-sm font-semibold text-[#0F294A] mt-1">{office?.name}</p>
              <p className="text-xs text-slate-600 mt-1">{selectedService.officeLocation}</p>
              {office && (
                <button
                  type="button"
                  onClick={() => navigate(`/directory?office=${office.slug}`)}
                  className="text-xs font-semibold text-[#0F294A] hover:underline mt-2 inline-block cursor-pointer no-print"
                >
                  Office Details
                </button>
              )}
            </div>

            <div className="border border-slate-200 bg-white rounded-lg p-4 sm:p-5">
              <p className="text-xs font-semibold text-slate-500">Legal Basis</p>
              <p className="text-xs sm:text-sm text-slate-900 mt-1 leading-snug">{selectedService.legalBasis}</p>
              <p className="text-xs text-slate-600 mt-2">
                Contact: {selectedService.contactInfo}
              </p>
            </div>

            <div className="border border-slate-200 bg-white rounded-lg p-4 sm:p-5">
              <p className="text-xs font-semibold text-slate-500">Applicable Fees</p>
              <p className="text-xs sm:text-sm text-slate-900 mt-1 leading-snug">{selectedService.applicableFees}</p>
            </div>

            <div className="border border-slate-200 bg-white rounded-lg p-4 sm:p-5">
              <p className="text-xs font-semibold text-slate-500">Processing Time</p>
              <p className="text-xs sm:text-sm text-slate-900 mt-1 leading-snug">{selectedService.processingTime}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-3">
              <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#0F294A]">Eligibility</h2>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed list-disc pl-4">
                {selectedService.eligibility.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0F294A]" aria-hidden="true" />
                  <span>Forms</span>
                </h3>
                <p className="text-xs text-slate-600 leading-snug mt-1">
                  {selectedService.downloadableFormsNote}
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 border border-slate-200 bg-white rounded-lg p-4 sm:p-6">
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#0F294A]">
                  Requirements Checklist
                </h2>
                <span className="text-[11px] text-slate-500">Tap to check off</span>
              </div>

              <ul className="divide-y divide-slate-100">
                {selectedService.documentaryRequirements.map((doc, idx) => {
                  const checked = !!checkedDocs[idx];
                  return (
                    <li key={idx} className="py-2 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => setCheckedDocs((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                        className="w-full text-left flex items-start gap-2.5 min-h-[40px] py-1 text-xs sm:text-sm text-slate-800 hover:text-[#0F294A] cursor-pointer"
                      >
                        {checked ? (
                          <CheckSquare className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" aria-hidden="true" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                        )}
                        <span className={checked ? 'line-through text-slate-500' : ''}>{doc}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="border border-slate-200 bg-white rounded-lg p-4 sm:p-6">
            <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#0F294A]">
              Application Procedure
            </h2>
            <ol className="mt-3 space-y-2.5">
              {selectedService.procedureSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-snug sm:leading-relaxed">
                  <span className="font-mono text-[11px] font-semibold text-[#0F294A] bg-slate-100 px-2 py-1 rounded shrink-0 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <SourceAttributionBlock
            sources={sources}
            lastUpdated={selectedService.updatedAt}
          />
        </div>
      </div>
    );
  }

  const filteredServices = services.filter((s) => {
    if (categoryFilter !== 'All' && s.category !== categoryFilter) return false;
    if (officeFilter !== 'All' && s.officeId !== officeFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.titleFil.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.legalBasis.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        kicker="Public Services Catalog · 13 Categories"
        title="Municipal Public Services"
        description="Guides by municipal office. Local fees and turnaround times are marked awaiting verification until confirmed via Alcala’s Citizen’s Charter."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search birth cert, business permit, amilyar, RSBSA..."
                className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
                aria-label="Search public services"
              />
            </div>

            <div className="md:col-span-5">
              <label htmlFor="office-filter" className="sr-only">
                Filter by Municipal Office
              </label>
              <select
                id="office-filter"
                value={officeFilter}
                onChange={(e) => setOfficeFilter(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm border border-slate-300 rounded-md bg-white focus:border-[#0F294A] focus:outline-none"
              >
                <option value="All">All Municipal Offices</option>
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.acronym} — {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex sm:flex-wrap gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto pb-1 sm:pb-0">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#0F294A] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="border border-slate-200 bg-white rounded-lg p-8 text-center space-y-3">
            <p className="text-sm text-slate-700">No public services matched your filters.</p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategoryFilter('All');
                setOfficeFilter('All');
              }}
              className="px-4 py-2 text-xs font-semibold text-[#0F294A] border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {filteredServices.map((svc) => {
              const office = getOfficeById(svc.officeId);
              return (
                <article
                  key={svc.id}
                  className="border border-slate-200 bg-white rounded-lg p-4 sm:p-5 flex flex-col justify-between gap-3 hover:border-[#0F294A] transition-colors"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{svc.category}</span>
                      <span aria-hidden="true">·</span>
                      <VerificationIndicator status={svc.verificationStatus} compact />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mt-1.5">
                      {language === 'fil' ? svc.titleFil : svc.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-snug mt-1 line-clamp-2">
                      {language === 'fil' ? svc.summaryFil : svc.summary}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 space-y-2.5">
                    <p className="text-xs text-slate-600 truncate">
                      <span className="font-semibold text-slate-800">Office:</span> {office?.acronym}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/services/${svc.slug}`)}
                      className="w-full min-h-[42px] py-2 px-3 text-xs font-semibold text-white bg-[#0F294A] rounded-md hover:bg-[#091B33] transition-colors cursor-pointer"
                    >
                      Requirements &amp; Steps
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
