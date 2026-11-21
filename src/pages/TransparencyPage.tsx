import React, { useState } from 'react';
import { Download, ExternalLink, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SourceAttributionBlock, VerificationIndicator } from '../components/VerificationIndicator';
import { useCivicData } from '../context/CivicDataContext';
import { usePageSEO } from '../lib/seo';

export const TransparencyPage: React.FC = () => {
  const {
    transparencySections: sections,
    transparencyLedger: ledger,
    budgetRecords,
    procurementRecords: procurement,
    getVerificationStats,
    getSourcesByIds,
  } = useCivicData();
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [query, setQuery] = useState('');

  usePageSEO({
    title: 'Government Transparency Center – Budgets, COA Audits & Procurement',
    description:
      'Municipal fiscal transparency hub for Alcala covering Budgets, AIP, APP, SRE, COA Audit Reports, NTA, and Procurement.',
    path: '/transparency',
  });

  const verificationStats = getVerificationStats();

  const years = Array.from(new Set(ledger.map((l) => l.fiscalYear))).sort((a, b) => b - a);

  const filteredLedger = ledger.filter((item) => {
    if (selectedSection !== 'all' && item.section !== selectedSection) return false;
    if (yearFilter !== 'all' && String(item.fiscalYear) !== yearFilter) return false;
    if (availabilityFilter !== 'all' && item.recordAvailability !== availabilityFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.documentType.toLowerCase().includes(q) ||
      item.portalName.toLowerCase().includes(q)
    );
  });

  const handleDownloadCsv = () => {
    const header = ['ID', 'Section', 'FiscalYear', 'ReportingPeriod', 'Title', 'Availability', 'VerificationStatus', 'PortalURL'];
    const rows = filteredLedger.map((r) => [
      r.id,
      r.section,
      String(r.fiscalYear),
      `"${r.reportingPeriod.replace(/"/g, '""')}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.recordAvailability}"`,
      r.verificationStatus,
      r.portalUrl ?? 'Unavailable',
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'betteralcala-transparency-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const sources = getSourcesByIds(['src-coa-aar', 'src-blgf-dbm', 'src-dilg-gfh', 'src-philgeps-dpwh']);

  return (
    <div>
      <PageHeader
        kicker="Government Transparency Center · 10 Accountability Pillars"
        title="Budgets, Audits &amp; Public Finance"
        description="Structured ledger for Budgets, AIP, APP, SRE, COA Audit Reports, NTA, and Procurement. Approved budgets, obligations, and disbursements are strictly separated."
        actions={
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold text-[#0F294A] bg-white border border-slate-300 rounded-md hover:bg-slate-50 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* Readiness & Oversight Portals */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-7 border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-3">
            <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#0F294A]">
              Record Verification Breakdown
            </h2>
            <div className="space-y-2.5 pt-1">
              {[
                { label: 'Verified Primary Source', count: verificationStats.verified, color: 'bg-[#166534]' },
                { label: 'Needs Review / Confirmation', count: verificationStats.needsReview, color: 'bg-amber-600' },
                { label: 'Awaiting Official Upload', count: verificationStats.unavailable, color: 'bg-slate-400' },
              ].map((bar) => {
                const pct = Math.round((bar.count / Math.max(1, verificationStats.total)) * 100);
                return (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-800">{bar.label}</span>
                      <span className="font-mono text-slate-600 tabular-nums">
                        {bar.count}/{verificationStats.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-sm overflow-hidden">
                      <div className={`h-full ${bar.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-2">
            <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#0F294A]">
              Official Oversight Portals
            </h2>
            <ul className="divide-y divide-slate-100 text-xs sm:text-sm">
              {[
                { name: 'COA Annual Audit Reports', url: 'https://www.coa.gov.ph/reports/annual-audit-reports/' },
                { name: 'DILG Full Disclosure Policy', url: 'https://fdpp.dilg.gov.ph/' },
                { name: 'BLGF LGU Fiscal Data (SRE)', url: 'https://blgf.gov.ph/' },
                { name: 'PhilGEPS Procurement Notices', url: 'https://notices.philgeps.gov.ph/' },
              ].map((portal) => (
                <li key={portal.name} className="py-2 flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800">{portal.name}</span>
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F294A] hover:underline whitespace-nowrap"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 10 Transparency Categories (horizontal scroll chips on mobile, grid on desktop) */}
        <section aria-label="10 Transparency Categories" className="space-y-3">
          <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
            Transparency Categories
          </h2>
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-2.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedSection('all')}
              className={`text-left border rounded-lg p-3 min-w-[140px] sm:min-w-0 shrink-0 transition-colors cursor-pointer ${
                selectedSection === 'all'
                  ? 'border-[#0F294A] bg-[#0F294A] text-white'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-[#0F294A]'
              }`}
            >
              <p className="text-xs font-semibold">All 10 Pillars</p>
              <p className={`text-[11px] mt-0.5 ${selectedSection === 'all' ? 'text-slate-200' : 'text-slate-500'}`}>
                Full disclosure index
              </p>
            </button>
            {sections.map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => setSelectedSection(sec.key)}
                className={`text-left border rounded-lg p-3 min-w-[155px] sm:min-w-0 shrink-0 transition-colors cursor-pointer ${
                  selectedSection === sec.key
                    ? 'border-[#0F294A] bg-[#0F294A] text-white'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-[#0F294A]'
                }`}
              >
                <p className="text-xs font-semibold truncate">{sec.shortTitle}</p>
                <p className={`text-[11px] mt-0.5 line-clamp-1 ${selectedSection === sec.key ? 'text-slate-200' : 'text-slate-500'}`}>
                  {sec.statutoryMandate}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Disclosure Ledger */}
        <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search budget, audit report, or NTA..."
                className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
                aria-label="Search transparency records"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                aria-label="Filter by fiscal year"
                className="h-10 px-2.5 text-xs font-medium border border-slate-300 rounded-md bg-white"
              >
                <option value="all">All Years</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    FY {y}
                  </option>
                ))}
              </select>

              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                aria-label="Filter by availability"
                className="h-10 px-2.5 text-xs font-medium border border-slate-300 rounded-md bg-white"
              >
                <option value="all">All States</option>
                <option value="Verified Public Reference">Verified Ref.</option>
                <option value="Awaiting Official LGU Document">Awaiting LGU Doc</option>
              </select>
            </div>
          </div>

          {/* Mobile Stacked Cards (< md) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredLedger.map((item) => (
              <div key={item.id} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-mono font-semibold text-slate-800 tabular-nums">
                    FY {item.fiscalYear} · {item.documentType}
                  </span>
                  <VerificationIndicator status={item.verificationStatus} compact />
                </div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-600 line-clamp-2">{item.summary}</p>
                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <span className="font-mono text-slate-600 truncate">{item.amountLabel}</span>
                  {item.portalUrl && (
                    <a
                      href={item.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#0F294A] shrink-0"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Document &amp; Period</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Value Status</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLedger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 align-top">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                      {item.fiscalYear}
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.reportingPeriod}</p>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">{item.summary}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">{item.documentType}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-700">{item.amountLabel}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <VerificationIndicator status={item.verificationStatus} compact />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {item.portalUrl ? (
                        <a
                          href={item.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F294A] hover:underline"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Budget vs Obligations vs Disbursements */}
        <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#0F294A]">
              Approved Budgets vs. Obligations vs. Disbursements
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Authorized ceilings, obligated contracts, and cash disbursements are tracked separately.
            </p>
          </div>

          <div className="md:hidden divide-y divide-slate-100">
            {budgetRecords.map((b) => (
              <div key={b.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#0F294A]">
                    FY {b.fiscalYear} · {b.recordType}
                  </span>
                  <VerificationIndicator status={b.verificationStatus} compact />
                </div>
                <p className="text-sm font-medium text-slate-900">{b.category}</p>
                <p className="text-xs font-mono text-slate-700">{b.amountDisplay}</p>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Budget / Expenditure Line</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Amount (PHP)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetRecords.map((b) => (
                  <tr key={b.id}>
                    <td className="py-3 px-4 font-mono text-xs tabular-nums">{b.fiscalYear}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-[#0F294A]">{b.recordType}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">{b.category}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{b.notes}</p>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">{b.reportingPeriod}</td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-700">{b.amountDisplay}</td>
                    <td className="py-3 px-4">
                      <VerificationIndicator status={b.verificationStatus} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Procurement */}
        <section className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-3">
          <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#0F294A]">
            Procurement Registry (PhilGEPS)
          </h2>
          {procurement.map((p) => (
            <div key={p.id} className="border border-slate-200 bg-[#FAFAF9] rounded-md p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>FY {p.fiscalYear}</span>
                  <span aria-hidden="true">·</span>
                  <VerificationIndicator status={p.verificationStatus} compact />
                </div>
                <p className="text-sm font-semibold text-slate-900 mt-1">{p.projectTitle}</p>
              </div>
              <a
                href="https://notices.philgeps.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-semibold text-[#0F294A] bg-white border border-slate-300 rounded-md hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                <span>Search PhilGEPS</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          ))}
        </section>

        <SourceAttributionBlock sources={sources} lastUpdated="2026-11-20" />
      </div>
    </div>
  );
};
