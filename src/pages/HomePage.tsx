import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  ChevronRight,
  FileText,
  Landmark,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';
import { UI_COPY } from '../i18n/translations';
import { usePageSEO } from '../lib/seo';
import { VerificationIndicator } from '../components/VerificationIndicator';

export const HomePage: React.FC = () => {
  const { navigate, language } = useApp();
  const {
    municipalProfile: municipality,
    services: allServices,
    offices: allOffices,
    getOfficeById,
    publicDocuments,
    announcements,
    projects,
    barangays,
    getVerificationStats,
  } = useCivicData();
  const copy = UI_COPY[language];
  const [heroQuery, setHeroQuery] = useState('');

  usePageSEO({
    title: 'BetterAlcala – Civic Information & Public Transparency for Alcala, Pangasinan',
    description:
      'Independent civic technology platform making Alcala, Pangasinan public services, offices, 21 barangays, ordinances, and municipal transparency records searchable.',
    path: '/',
    structuredData: {
      '@type': 'WebApplication',
      name: 'BetterAlcala',
      applicationCategory: 'GovernmentAndCivic',
      operatingSystem: 'All',
      description:
        'Independent civic technology platform for public services, municipal directory, 21 barangays, and open records in Alcala, Pangasinan.',
    },
  });

  const services = allServices.slice(0, 6);
  const offices = allOffices.slice(0, 6);
  const documents = publicDocuments.slice(0, 4);
  const verificationStats = getVerificationStats();

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(heroQuery)}`);
  };

  return (
    <div>
      {/* Hero Section: Compact on mobile, full 2-col split on desktop */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-5">
              <div>
                <p className="text-[11px] sm:text-xs font-semibold text-[#166534] tracking-wide">
                  {copy.heroKicker}
                </p>
                <h1 className="font-editorial text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#0F294A] tracking-tight leading-[1.15] mt-1.5 sm:mt-2">
                  {copy.heroTitle}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-snug sm:leading-relaxed mt-2.5 max-w-2xl">
                  {copy.heroSubtitle}
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleHeroSearch} className="max-w-2xl">
                <label htmlFor="hero-civic-search" className="sr-only">
                  {copy.searchPlaceholder}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Search
                      className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="hero-civic-search"
                      type="search"
                      value={heroQuery}
                      onChange={(e) => setHeroQuery(e.target.value)}
                      placeholder={copy.searchPlaceholder}
                      className="w-full h-11 sm:h-12 pl-9 pr-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm font-semibold text-white bg-[#0F294A] rounded-md hover:bg-[#091B33] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copy.searchButton}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
                  <span className="hidden sm:inline">Quick queries:</span>
                  {['Birth Certificate', 'Business Permit', 'San Vicente', 'COA'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                      className="text-[#0F294A] hover:underline font-medium py-0.5 cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </form>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/services')}
                  className="min-h-[44px] px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0F294A] rounded-md hover:bg-[#091B33] transition-colors whitespace-nowrap cursor-pointer"
                >
                  {copy.exploreServices}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/transparency')}
                  className="min-h-[44px] px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-[#0F294A] bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {copy.viewTransparency}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <figure className="h-full flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                <div className="relative flex-1 aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto lg:min-h-[290px] bg-gradient-to-br from-[#0F294A] to-[#166534]">
                  <picture>
                    <source srcSet="/assets/alcala-hero.webp" type="image/webp" />
                    <img
                      src="/assets/alcala-hero.jpg"
                      alt="Alcala Municipal Hall facade, civic monument, and municipal seal of Alcala, Pangasinan"
                      fetchPriority="high"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full lg:absolute lg:inset-0 object-cover object-top"
                    />
                  </picture>
                </div>
                <figcaption className="px-3.5 py-2.5 bg-white border-t border-slate-200 text-[11px] sm:text-xs text-slate-600">
                  Alcala Municipal Hall · 5th District of Pangasinan · Est. Sept 20, 1875
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Compact 2x2 Mobile / 4-col Desktop Municipal Snapshot Row */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-xs sm:text-sm font-semibold text-slate-700 font-sans">
                {copy.municipalSnapshotTitle}
              </h2>
              <button
                type="button"
                onClick={() => navigate('/municipality')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F294A] hover:underline cursor-pointer"
              >
                <span>Profile</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="border border-slate-200 bg-[#FAFAF9] rounded-lg p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-slate-600 truncate">2020 Population (PSA)</p>
                <p className="text-lg sm:text-2xl font-semibold text-[#0F294A] font-mono tabular-nums mt-0.5">
                  {municipality.population2020.toLocaleString()}
                </p>
                <div className="mt-1.5">
                  <VerificationIndicator status="Verified" compact />
                </div>
              </div>

              <div className="border border-slate-200 bg-[#FAFAF9] rounded-lg p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-slate-600 truncate">Barangays (PSGC)</p>
                <p className="text-lg sm:text-2xl font-semibold text-[#0F294A] font-mono tabular-nums mt-0.5">
                  {municipality.barangayCount}
                </p>
                <div className="mt-1.5">
                  <VerificationIndicator status="Verified" compact />
                </div>
              </div>

              <div className="border border-slate-200 bg-[#FAFAF9] rounded-lg p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-slate-600 truncate">PSGC Code</p>
                <p className="text-base sm:text-2xl font-semibold text-[#0F294A] font-mono tabular-nums mt-0.5 truncate">
                  {municipality.psgcCode}
                </p>
                <div className="mt-1.5">
                  <VerificationIndicator status="Verified" compact />
                </div>
              </div>

              <div className="border border-slate-200 bg-[#FAFAF9] rounded-lg p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-slate-600 truncate">Land Area</p>
                <p className="text-base sm:text-2xl font-semibold text-[#0F294A] font-mono tabular-nums mt-0.5">
                  45.7–55.1 km²
                </p>
                <div className="mt-1.5">
                  <VerificationIndicator status="Needs Review" compact />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Independent Project Notice Box (compact on mobile) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="border border-slate-300 bg-white rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-[#0F294A] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#166534] shrink-0" aria-hidden="true" />
              <span>{copy.independentNoticeTitle}</span>
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-snug sm:leading-relaxed">
              {copy.independentNoticeBody}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/about')}
            className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-[#0F294A] border border-slate-300 rounded-md hover:bg-slate-50 whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer"
          >
            Methodology
          </button>
        </div>
      </section>

      {/* Quick Access to Public Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
        <div className="flex items-end justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="font-editorial text-xl sm:text-3xl font-semibold text-[#0F294A]">
              {copy.quickAccessTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Citizen guides by municipal office with Charter verification tracking.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#0F294A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>All {allServices.length}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          {services.map((service) => {
            const office = getOfficeById(service.officeId);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => navigate(`/services/${service.slug}`)}
                className="text-left border border-slate-200 bg-white rounded-lg p-4 sm:p-5 hover:border-[#0F294A] transition-colors flex flex-col justify-between gap-2.5 min-h-[44px] cursor-pointer"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{service.category}</span>
                    <span aria-hidden="true">·</span>
                    <VerificationIndicator status={service.verificationStatus} compact />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 mt-1.5">
                    {language === 'fil' ? service.titleFil : service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-snug mt-1 line-clamp-2">
                    {language === 'fil' ? service.summaryFil : service.summary}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate">{office?.acronym ?? 'Municipal Office'}</span>
                  <span className="font-semibold text-[#0F294A] shrink-0 inline-flex items-center gap-0.5">
                    Guide <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Office Shortcuts + Public Documents */}
      <section className="bg-white border-y border-slate-200 py-7 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-10">
          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            <div className="flex items-end justify-between gap-3 pb-2.5 border-b border-slate-200">
              <div>
                <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
                  Municipal Offices
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Core departments under RA 7160 and local ordinances.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/directory')}
                className="text-xs font-semibold text-[#0F294A] hover:underline whitespace-nowrap cursor-pointer"
              >
                Full Directory
              </button>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-[#FAFAF9]">
              {offices.map((office) => (
                <button
                  key={office.id}
                  type="button"
                  onClick={() => navigate(`/directory?office=${office.slug}`)}
                  className="w-full text-left px-3.5 sm:px-4 py-3 min-h-[52px] hover:bg-white transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {language === 'fil' ? office.nameFil : office.name}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {office.acronym} · {office.branch}
                    </p>
                  </div>
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            <div className="flex items-end justify-between gap-3 pb-2.5 border-b border-slate-200">
              <div>
                <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
                  Public Documents &amp; Audits
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  COA audit portals, PSA datasets, and charter status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/ordinances')}
                className="text-xs font-semibold text-[#0F294A] hover:underline whitespace-nowrap cursor-pointer"
              >
                Library
              </button>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-[#FAFAF9]">
              {documents.map((doc) => (
                <div key={doc.id} className="px-3.5 sm:px-4 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-500">
                      <span>{doc.documentCategory}</span>
                      <span aria-hidden="true">·</span>
                      <VerificationIndicator status={doc.verificationStatus} compact />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5 line-clamp-2">{doc.title}</p>
                    <p className="text-xs text-slate-600 truncate">{doc.issuingAgency}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/ordinances?tab=documents')}
                    className="text-xs font-semibold text-[#0F294A] hover:underline whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer"
                  >
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure & Announcements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-10">
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          <div className="flex items-end justify-between gap-3 pb-2.5 border-b border-slate-200">
            <div>
              <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
                Infrastructure Registry
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Public works tracking with zero fabricated progress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-[#0F294A] hover:underline whitespace-nowrap cursor-pointer"
            >
              All Projects
            </button>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id} className="border border-slate-200 bg-white rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-500">
                  <span className="font-medium text-slate-700 truncate">{proj.location}</span>
                  <span aria-hidden="true">·</span>
                  <VerificationIndicator status={proj.verificationStatus} compact />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mt-1">{proj.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug line-clamp-2">{proj.description}</p>
                <p className="text-[11px] sm:text-xs font-mono text-slate-500 mt-2">
                  Cost: {proj.projectCostLabel}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          <div className="flex items-end justify-between gap-3 pb-2.5 border-b border-slate-200">
            <div>
              <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
                Announcements
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Official LGU advisories vs. BetterAlcala platform notes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/announcements')}
              className="text-xs font-semibold text-[#0F294A] hover:underline whitespace-nowrap cursor-pointer"
            >
              All Updates
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((item) => (
              <div key={item.id} className="border border-slate-200 bg-white rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-500">
                  <span className="font-semibold text-[#0F294A]">{item.originType}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{item.publishedDate}</span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mt-1">
                  {language === 'fil' ? item.titleFil : item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug line-clamp-2">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 21 Barangays Quick Grid & Data Provenance Summary */}
      <section className="bg-white border-t border-slate-200 py-7 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="font-editorial text-xl sm:text-3xl font-semibold text-[#0F294A]">
                All 21 Barangays
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Verified PSA 2020 Census counts · PSGC 0105504000.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/barangays')}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#0F294A] hover:underline whitespace-nowrap cursor-pointer"
            >
              <span>Full List</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {barangays.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => navigate(`/barangays/${b.slug}`)}
                className="text-left border border-slate-200 bg-[#FAFAF9] hover:border-[#0F294A] hover:bg-white rounded-md p-2.5 sm:p-3 min-h-[52px] transition-colors cursor-pointer"
              >
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{b.name}</p>
                <p className="text-[11px] sm:text-xs font-mono text-slate-600 tabular-nums mt-0.5">
                  {b.population2020.toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          <div className="border border-slate-200 bg-[#FAFAF9] rounded-lg p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-8 space-y-1">
              <h3 className="text-sm sm:text-base font-semibold text-[#0F294A] flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#166534] shrink-0" aria-hidden="true" />
                <span>Data Provenance Ledger</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-snug sm:leading-relaxed">
                Of <span className="font-mono font-semibold tabular-nums">{verificationStats.total}</span> records:{' '}
                <span className="font-mono font-semibold text-[#166534] tabular-nums">{verificationStats.verified}</span> Verified,{' '}
                <span className="font-mono font-semibold text-amber-700 tabular-nums">{verificationStats.needsReview}</span> Needs Review,{' '}
                <span className="font-mono font-semibold text-slate-700 tabular-nums">{verificationStats.unavailable}</span> Awaiting Verification.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate('/transparency')}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-semibold text-white bg-[#0F294A] rounded-md hover:bg-[#091B33] cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Transparency</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-semibold text-[#0F294A] bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span>About</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
