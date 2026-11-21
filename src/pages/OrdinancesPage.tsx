import React, { useState } from 'react';
import { ExternalLink, FileText, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SourceAttributionBlock, VerificationIndicator } from '../components/VerificationIndicator';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';
import { usePageSEO } from '../lib/seo';

export const OrdinancesPage: React.FC = () => {
  const { searchParams } = useApp();
  const { ordinances, resolutions, publicDocuments: documents, getSourcesByIds } = useCivicData();
  const initialTab = searchParams.get('tab') === 'documents' ? 'documents' : searchParams.get('type') === 'resolution' ? 'resolutions' : 'ordinances';

  const [activeTab, setActiveTab] = useState<'ordinances' | 'resolutions' | 'documents'>(initialTab);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  usePageSEO({
    title: 'Ordinances, Resolutions & Public Documents – Alcala, Pangasinan',
    description:
      'Searchable legislative archive and public document library for Alcala, Pangasinan.',
    path: '/ordinances',
  });

  const sources = getSourcesByIds(['src-sp-pangasinan-ordinances', 'src-coa-aar', 'src-psa-2020', 'src-alcala-charter']);

  const ordinanceCategories = ['All', ...Array.from(new Set(ordinances.map((o) => o.category)))];

  const filteredOrdinances = ordinances.filter((o) => {
    if (yearFilter !== 'All' && String(o.year) !== yearFilter) return false;
    if (categoryFilter !== 'All' && o.category !== categoryFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      o.category.toLowerCase().includes(q)
    );
  });

  const filteredResolutions = resolutions.filter((r) => {
    if (yearFilter !== 'All' && String(r.year) !== yearFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
  });

  const filteredDocs = documents.filter((d) => {
    if (yearFilter !== 'All' && String(d.fiscalYear ?? '') !== yearFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.issuingAgency.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        kicker="Legislative &amp; Document Archive"
        title="Ordinances &amp; Public Records"
        description="Alcala ordinances reviewed by the Sangguniang Panlalawigan, municipal resolutions, and verified public datasets."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex p-1 bg-slate-100 rounded-md overflow-x-auto">
              {[
                { key: 'ordinances', label: `Ordinances (${ordinances.length})` },
                { key: 'resolutions', label: `Resolutions (${resolutions.length})` },
                { key: 'documents', label: `Documents (${documents.length})` },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key as typeof activeTab)}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === t.key ? 'bg-white text-[#0F294A] shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                aria-label="Filter by year"
                className="h-9 px-2.5 text-xs border border-slate-300 rounded-md bg-white"
              >
                <option value="All">All Years</option>
                <option value="2026">2026</option>
                <option value="2024">2024</option>
                <option value="2022">2022</option>
                <option value="2020">2020</option>
              </select>

              {activeTab === 'ordinances' && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter by ordinance category"
                  className="h-9 px-2.5 text-xs border border-slate-300 rounded-md bg-white max-w-[170px]"
                >
                  {ordinanceCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="relative max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ordinances, categories, or agencies..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
              aria-label="Search ordinances and public documents"
            />
          </div>
        </div>

        {activeTab === 'ordinances' && (
          <div className="space-y-3">
            {filteredOrdinances.map((ord) => (
              <article key={ord.id} className="border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-[#0F294A]">{ord.category}</span>
                  <VerificationIndicator status={ord.verificationStatus} compact />
                </div>
                <h2 className="font-editorial text-lg sm:text-xl font-semibold text-slate-900">{ord.title}</h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-snug sm:leading-relaxed">{ord.description}</p>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-500">
                  <span>{ord.ordinanceNumber} · {ord.reviewBody}</span>
                  <span>{ord.pdfAttachmentUrl ? 'PDF Available' : 'PDF awaiting SB archive'}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'resolutions' && (
          <div className="space-y-3">
            {filteredResolutions.map((res) => (
              <article key={res.id} className="border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{res.resolutionNumber}</span>
                  <VerificationIndicator status={res.verificationStatus} compact />
                </div>
                <h2 className="font-editorial text-lg sm:text-xl font-semibold text-slate-900">{res.title}</h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-snug sm:leading-relaxed">{res.description}</p>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
            {filteredDocs.map((doc) => (
              <article key={doc.id} className="border border-slate-200 bg-white rounded-lg p-4 sm:p-5 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{doc.documentCategory} · {doc.fiscalYear ?? 'Multi-Year'}</span>
                    <VerificationIndicator status={doc.verificationStatus} compact />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 mt-1.5 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-[#0F294A] shrink-0 mt-1" aria-hidden="true" />
                    <span>{doc.title}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">{doc.description}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 truncate">{doc.format}</span>
                  {doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#0F294A] hover:underline shrink-0"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-slate-500 shrink-0">Awaiting PDF</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <SourceAttributionBlock sources={sources} lastUpdated="2026-11-20" />
      </div>
    </div>
  );
};
