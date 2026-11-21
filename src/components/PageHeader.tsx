import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UI_COPY } from '../i18n/translations';

export const PageHeader: React.FC<{
  kicker: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}> = ({ kicker, title, description, actions }) => {
  const { navigate, language } = useApp();
  const copy = UI_COPY[language];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#0F294A] mb-2.5 min-h-[36px] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{copy.backToHome}</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] sm:text-xs font-semibold text-[#166534] tracking-wide">{kicker}</p>
            <h1 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#0F294A] tracking-tight mt-1">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-snug sm:leading-relaxed mt-2">
              {description}
            </p>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
};
