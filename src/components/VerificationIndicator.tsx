import React from 'react';
import { AlertCircle, CheckCircle2, Clock, ExternalLink, HelpCircle } from 'lucide-react';
import { DataSource, VerificationStatus } from '../types/civic';
import { useApp } from '../context/AppContext';
import { UI_COPY } from '../i18n/translations';

export const VerificationIndicator: React.FC<{
  status: VerificationStatus;
  compact?: boolean;
}> = ({ status, compact = false }) => {
  const { language } = useApp();
  const copy = UI_COPY[language];

  const config: Record<
    VerificationStatus,
    { label: string; colorClass: string; Icon: React.FC<{ className?: string }> }
  > = {
    Verified: {
      label: copy.verifiedLabel,
      colorClass: 'text-[#166534]',
      Icon: CheckCircle2,
    },
    'Needs Review': {
      label: copy.needsReviewLabel,
      colorClass: 'text-amber-700',
      Icon: Clock,
    },
    Outdated: {
      label: copy.outdatedLabel,
      colorClass: 'text-rose-700',
      Icon: AlertCircle,
    },
    Unavailable: {
      label: copy.unavailableLabel,
      colorClass: 'text-slate-600',
      Icon: HelpCircle,
    },
  };

  const { label, colorClass, Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${colorClass}`}
      title={`Data Verification Status: ${label}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{compact ? label : `Status: ${label}`}</span>
    </span>
  );
};

export const SourceAttributionBlock: React.FC<{
  sources: DataSource[];
  verificationNotes?: string;
  lastUpdated?: string;
}> = ({ sources, verificationNotes, lastUpdated }) => {
  const { language } = useApp();
  const copy = UI_COPY[language];

  return (
    <section
      aria-label={copy.sourceAttributionTitle}
      className="border border-slate-200 bg-white rounded-lg p-4 sm:p-5 mt-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2.5 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-[#0F294A]">{copy.sourceAttributionTitle}</h3>
        {lastUpdated && (
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Updated: {lastUpdated}
          </span>
        )}
      </div>

      {verificationNotes && (
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-2.5 break-words">{verificationNotes}</p>
      )}

      <div className="mt-3 divide-y divide-slate-100">
        {sources.map((src) => (
          <div
            key={src.id}
            className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                <span className="font-medium text-slate-800">{src.agency}</span>
                <span aria-hidden="true">·</span>
                <VerificationIndicator status={src.verificationStatus} compact />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-900 break-words">{src.title}</p>
              {src.notes && (
                <p className="text-xs text-slate-600 leading-snug line-clamp-2 sm:line-clamp-none break-words">
                  {src.notes}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-mono text-slate-500 tabular-nums">
                <span>Pub: {src.publicationDate}</span>
                <span aria-hidden="true">/</span>
                <span>Verified: {src.lastVerifiedDate}</span>
              </div>
            </div>

            {src.originalUrl ? (
              <a
                href={src.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F294A] hover:underline whitespace-nowrap shrink-0 min-h-[36px]"
              >
                <span>Source Portal</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            ) : (
              <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                No public URL
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
