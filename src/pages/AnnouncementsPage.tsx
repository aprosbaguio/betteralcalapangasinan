import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { SourceAttributionBlock, VerificationIndicator } from '../components/VerificationIndicator';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';
import { usePageSEO } from '../lib/seo';

export const AnnouncementsPage: React.FC = () => {
  const { language } = useApp();
  const { announcements, getSourcesByIds } = useCivicData();
  const [originFilter, setOriginFilter] = useState<'All' | 'Official Government Advisory' | 'BetterAlcala Project Update'>('All');

  usePageSEO({
    title: 'Public Announcements & Advisories – BetterAlcala',
    description:
      'Public advisories and civic updates for Alcala, separating official LGU notices from BetterAlcala project updates.',
    path: '/announcements',
  });

  const sources = getSourcesByIds(['src-psa-2020', 'src-pangasinan-gov', 'src-alcala-charter']);

  const filtered = announcements.filter((a) =>
    originFilter === 'All' ? true : a.originType === originFilter
  );

  return (
    <div>
      <PageHeader
        kicker="Public Information &amp; Advisories"
        title="Announcements &amp; Updates"
        description="Official municipal advisories are strictly separated from independent BetterAlcala platform notes."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-wrap gap-1.5">
          {(['All', 'Official Government Advisory', 'BetterAlcala Project Update'] as const).map((origin) => (
            <button
              key={origin}
              type="button"
              onClick={() => setOriginFilter(origin)}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                originFilter === origin
                  ? 'bg-[#0F294A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {origin}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((item) => (
            <article key={item.id} className="border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-[#0F294A]">{item.originType}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{item.publishedDate}</span>
                </div>
                <VerificationIndicator status={item.verificationStatus} compact />
              </div>

              <h2 className="font-editorial text-lg sm:text-2xl font-semibold text-slate-900">
                {language === 'fil' ? item.titleFil : item.title}
              </h2>

              <div className="space-y-2 text-xs sm:text-base text-slate-700 leading-relaxed max-w-prose">
                {item.body.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <SourceAttributionBlock sources={sources} lastUpdated="2026-11-20" />
      </div>
    </div>
  );
};
