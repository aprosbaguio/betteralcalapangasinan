import React, { useState } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { VerificationIndicator } from '../components/VerificationIndicator';
import { useCivicData } from '../context/CivicDataContext';
import { usePageSEO } from '../lib/seo';

export const AboutPage: React.FC = () => {
  const { exportFullDatasetJson } = useCivicData();
  const [recordTopic, setRecordTopic] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [details, setDetails] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedPayload, setSubmittedPayload] = useState<string | null>(null);

  usePageSEO({
    title: 'About BetterAlcala – Mission & Open Data Methodology',
    description:
      'BetterAlcala’s independent civic tech mission, BetterGov.ph alignment, verification statuses, and correction workflow.',
    path: '/about',
  });

  const handleDownloadJson = () => {
    const json = exportFullDatasetJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'betteralcala-open-dataset.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTopic = recordTopic.trim();
    const cleanUrl = sourceUrl.trim();
    const cleanDetails = details.trim();

    if (cleanTopic.length < 4) {
      setFormError('Please specify the municipal record, service, or barangay page requiring verification.');
      return;
    }
    if (cleanUrl && !/^https?:\/\/.+/i.test(cleanUrl)) {
      setFormError('If providing a source URL, please enter a valid http:// or https:// government document link.');
      return;
    }
    if (cleanDetails.length < 15) {
      setFormError('Please describe the factual correction or official document reference (at least 15 characters).');
      return;
    }

    const payload = JSON.stringify(
      {
        submittedAt: new Date().toISOString(),
        recordTopic: cleanTopic,
        officialSourceUrl: cleanUrl || 'Physical / Municipal Hall copy referenced',
        correctionDetails: cleanDetails,
      },
      null,
      2
    );
    setSubmittedPayload(payload);
    setRecordTopic('');
    setSourceUrl('');
    setDetails('');
  };

  return (
    <div>
      <PageHeader
        kicker="About BetterAlcala · Civic Open Data"
        title="Independent Civic Transparency"
        description="Community-driven initiative aligned with BetterGov.ph and BetterLGU—built on strict source attribution without official endorsement."
        actions={
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold text-[#0F294A] bg-white border border-slate-300 rounded-md hover:bg-slate-50 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export JSON</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 sm:p-8 space-y-5">
            <div>
              <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
                Mission &amp; Independent Standing
              </h2>
              <p className="text-xs sm:text-base text-slate-700 leading-relaxed mt-2 max-w-prose">
                Inspired by <span className="font-semibold text-slate-900">BetterGov.ph</span> and <span className="font-semibold text-slate-900">BetterLGU</span>, BetterAlcala organizes municipal services, budgets, ordinances, and 21 barangay profiles for Alcala, Pangasinan in an accessible format. It is strictly independent and not affiliated with the municipal government.
              </p>
            </div>

            <div className="pt-5 border-t border-slate-200">
              <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
                Priority Source Hierarchy
              </h2>
              <ol className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-800 list-decimal list-inside">
                <li>Municipality of Alcala (Charter &amp; LGU Docs)</li>
                <li>Pangasinan Provincial Gov &amp; SP</li>
                <li>Philippine Statistics Authority (PSA)</li>
                <li>Commission on Audit (COA)</li>
                <li>DBM &amp; BLGF Fiscal Portals</li>
                <li>PhilGEPS &amp; DPWH Registries</li>
              </ol>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <figure className="border border-slate-200 bg-white rounded-lg overflow-hidden">
              <div className="aspect-[4/3] bg-slate-200">
                <img
                  src="/src/assets/images/alcala_civic_archive_1795218180232.jpg"
                  alt="Bound municipal public records, civic charters, and architectural plans representing public documentation standards"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-3 sm:p-4 text-xs text-slate-600 leading-snug">
                Fig. 2 — Every municipal figure, fee, and ordinance is tied to a documented primary source.
              </figcaption>
            </figure>

            <div className="border border-slate-200 bg-white rounded-lg p-4 sm:p-6 space-y-2.5">
              <h3 className="text-sm sm:text-base font-semibold text-[#0F294A]">Verification Statuses</h3>
              <dl className="divide-y divide-slate-100 text-xs space-y-1.5">
                <div className="pt-1.5 first:pt-0">
                  <dt className="mb-0.5"><VerificationIndicator status="Verified" compact /></dt>
                  <dd className="text-slate-600">Confirmed using an authoritative government publication.</dd>
                </div>
                <div className="pt-1.5">
                  <dt className="mb-0.5"><VerificationIndicator status="Needs Review" compact /></dt>
                  <dd className="text-slate-600">Collected from secondary government portal; needs confirmation.</dd>
                </div>
                <div className="pt-1.5">
                  <dt className="mb-0.5"><VerificationIndicator status="Outdated" compact /></dt>
                  <dd className="text-slate-600">Superseded by a newer election term or fiscal year.</dd>
                </div>
                <div className="pt-1.5">
                  <dt className="mb-0.5"><VerificationIndicator status="Unavailable" compact /></dt>
                  <dd className="text-slate-600">Primary record not yet obtained; never fabricated.</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="border border-slate-200 bg-white rounded-lg p-4 sm:p-8 max-w-3xl">
          <h2 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0F294A]">
            Submit a Correction or Document Link
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
            Share official Citizen’s Charter PDFs, ordinance copies, or roster updates (do not submit private citizen data).
          </p>

          <form onSubmit={handleSubmitCorrection} className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="corr-topic" className="block text-xs font-semibold text-slate-700 mb-1">
                Record or Page *
              </label>
              <input
                id="corr-topic"
                type="text"
                value={recordTopic}
                onChange={(e) => setRecordTopic(e.target.value)}
                placeholder="e.g., MCR fees or Barangay San Vicente roster"
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="corr-url" className="block text-xs font-semibold text-slate-700 mb-1">
                Official Source URL (optional)
              </label>
              <input
                id="corr-url"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="corr-details" className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Details *
              </label>
              <textarea
                id="corr-details"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Cite the document title, ordinance number, or fiscal year..."
                className="w-full p-3 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
                required
              />
            </div>

            {formError && (
              <p role="alert" className="text-xs font-medium text-rose-700">
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-[#0F294A] rounded-md hover:bg-[#091B33] transition-colors cursor-pointer"
            >
              Generate Verification Ticket
            </button>
          </form>

          {submittedPayload && (
            <div className="mt-5 border border-[#166534]/30 bg-emerald-50/50 rounded-md p-4 space-y-2">
              <p className="text-xs font-semibold text-[#166534] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Verification Ticket Prepared</span>
              </p>
              <pre className="text-xs font-mono bg-white border border-slate-200 rounded p-3 overflow-x-auto text-slate-800">
                {submittedPayload}
              </pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
