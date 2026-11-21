import React from 'react';
import { AlcalaMap } from '../components/AlcalaMap';
import { BarangayPopulationChart } from '../components/BarangayPopulationChart';
import { PageHeader } from '../components/PageHeader';
import { SourceAttributionBlock, VerificationIndicator } from '../components/VerificationIndicator';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';
import { usePageSEO } from '../lib/seo';

export const MunicipalityPage: React.FC = () => {
  const { language } = useApp();
  const { municipalProfile: profile, getSourcesByIds } = useCivicData();
  const sources = getSourcesByIds(profile.sourceIds);

  usePageSEO({
    title: 'Municipality Profile – Alcala, Pangasinan',
    description:
      'Demographic, historical, geographic, and economic profile of Alcala, Pangasinan (PSGC 0105504000).',
    path: '/municipality',
    structuredData: {
      '@type': 'AdministrativeArea',
      name: 'Municipality of Alcala, Pangasinan',
      identifier: profile.psgcCode,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: profile.coordinates.lat,
        longitude: profile.coordinates.lng,
      },
    },
  });

  return (
    <div>
      <PageHeader
        kicker="Municipality Profile · 5th District of Pangasinan"
        title="Alcala, Pangasinan"
        description={language === 'fil' ? profile.overviewFil : profile.overview}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <section aria-label="Municipal Statistics">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {profile.demographicHighlights.map((item) => (
              <div key={item.label} className="border border-slate-200 bg-white rounded-lg p-3.5 sm:p-5">
                <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-1">{item.label}</p>
                <p className="text-base sm:text-2xl font-semibold text-[#0F294A] font-mono tabular-nums mt-0.5 truncate">
                  {item.value}
                </p>
                <div className="mt-1.5">
                  <VerificationIndicator status={item.status} compact />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6 bg-white border border-slate-200 rounded-lg p-4 sm:p-8">
            <div>
              <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
                Historical Foundation (1875)
              </h2>
              <div className="mt-3 space-y-2.5 text-xs sm:text-base text-slate-700 leading-relaxed max-w-prose">
                {profile.historicalSummary.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-200">
              <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
                Geography &amp; Agno River Basin
              </h2>
              <div className="mt-3 space-y-2.5 text-xs sm:text-base text-slate-700 leading-relaxed max-w-prose">
                {profile.geographicNotes.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-200">
              <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
                Economy &amp; {profile.culturalFestival.name}
              </h2>
              <p className="text-xs sm:text-base text-slate-700 leading-relaxed mt-2.5 max-w-prose">
                Agriculture anchors Alcala’s economy (rice, corn, tobacco, livestock). Each {profile.culturalFestival.month}, residents celebrate the <span className="font-semibold text-slate-900">{profile.culturalFestival.name}</span>—{profile.culturalFestival.description}
              </p>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-800">
                {profile.majorIndustries.map((ind) => (
                  <li key={ind} className="px-3 py-2 bg-[#FAFAF9] border border-slate-200 rounded">
                    {ind}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <figure className="border border-slate-200 bg-white rounded-lg overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#166534] to-[#0F294A]">
                <img
                  src="/src/assets/images/alcala_agriculture_landscape_1795218180514.jpg"
                  alt="Agricultural plains and irrigation river valley representative of Pangasinan farmland"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-3 sm:p-4 text-xs text-slate-600 leading-snug">
                Fig. 1 — River-valley agricultural plains supporting rice, corn, and tobacco.
              </figcaption>
            </figure>

            <div className="border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-[#0F294A]">
                Classification &amp; Dataset Notes
              </h3>
              <dl className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-2 flex justify-between gap-4">
                  <dt className="text-slate-600">PSGC Code</dt>
                  <dd className="font-mono font-medium text-slate-900 tabular-nums">{profile.psgcCode}</dd>
                </div>
                <div className="py-2 flex justify-between gap-4">
                  <dt className="text-slate-600">ZIP Code</dt>
                  <dd className="font-mono font-medium text-slate-900 tabular-nums">{profile.zipCode}</dd>
                </div>
                <div className="py-2 flex justify-between gap-4">
                  <dt className="text-slate-600">District</dt>
                  <dd className="font-medium text-slate-900 text-right">{profile.legislativeDistrict}</dd>
                </div>
                <div className="py-2 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-600">Land Area Variance</dt>
                    <VerificationIndicator status="Needs Review" compact />
                  </div>
                  <dd className="text-xs text-slate-700 leading-snug">
                    {profile.landAreaSqKm.varianceNote}
                  </dd>
                </div>
                <div className="py-2 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-600">Income Class</dt>
                    <VerificationIndicator status="Needs Review" compact />
                  </div>
                  <dd className="text-xs text-slate-700 leading-snug">
                    {profile.incomeClassification.note}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <AlcalaMap mode="overview" />
        <BarangayPopulationChart />

        <SourceAttributionBlock
          sources={sources}
          verificationNotes={profile.verificationNotes}
          lastUpdated={profile.updatedAt}
        />
      </div>
    </div>
  );
};
