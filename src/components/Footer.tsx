import React from 'react';
import { useApp } from '../context/AppContext';
import { UI_COPY } from '../i18n/translations';

export const Footer: React.FC = () => {
  const { navigate, language, setLanguage } = useApp();
  const copy = UI_COPY[language];

  const handleLink = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <footer className="bg-[#091B33] text-slate-200 border-t border-slate-800 mt-10 sm:mt-14 pb-20 lg:pb-10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 pb-8 border-b border-slate-800">
          <div className="sm:col-span-2 space-y-3">
            <a
              href="/"
              onClick={(e) => handleLink(e, '/')}
              className="inline-flex items-center gap-2.5 font-editorial text-xl sm:text-2xl font-bold text-white tracking-tight"
            >
              <picture className="shrink-0">
                <source srcSet="/assets/alcala-logo.webp" type="image/webp" />
                <img
                  src="/assets/alcala-logo.png"
                  alt="BetterAlcala project logo"
                  width={36}
                  height={36}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 object-contain rounded-full bg-white/95 p-0.5"
                />
              </picture>
              <span>BetterAlcala</span>
            </a>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {copy.independentNoticeBody}
            </p>
            <p className="text-xs text-slate-400">
              Alcala, 5th District of Pangasinan · Region I · PSGC 0105504000
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs sm:text-sm font-semibold text-white font-sans">Public Information</h2>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
              <li>
                <a href="/municipality" onClick={(e) => handleLink(e, '/municipality')} className="hover:text-white hover:underline">
                  Municipality Profile
                </a>
              </li>
              <li>
                <a href="/services" onClick={(e) => handleLink(e, '/services')} className="hover:text-white hover:underline">
                  Public Services
                </a>
              </li>
              <li>
                <a href="/directory" onClick={(e) => handleLink(e, '/directory')} className="hover:text-white hover:underline">
                  Government Directory
                </a>
              </li>
              <li>
                <a href="/barangays" onClick={(e) => handleLink(e, '/barangays')} className="hover:text-white hover:underline">
                  21 Barangays
                </a>
              </li>
              <li>
                <a href="/announcements" onClick={(e) => handleLink(e, '/announcements')} className="hover:text-white hover:underline">
                  Announcements
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs sm:text-sm font-semibold text-white font-sans">Accountability</h2>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
              <li>
                <a href="/transparency" onClick={(e) => handleLink(e, '/transparency')} className="hover:text-white hover:underline">
                  Transparency Center
                </a>
              </li>
              <li>
                <a href="/projects" onClick={(e) => handleLink(e, '/projects')} className="hover:text-white hover:underline">
                  Infrastructure Projects
                </a>
              </li>
              <li>
                <a href="/ordinances" onClick={(e) => handleLink(e, '/ordinances')} className="hover:text-white hover:underline">
                  Ordinances &amp; Docs
                </a>
              </li>
              <li>
                <a href="/search" onClick={(e) => handleLink(e, '/search')} className="hover:text-white hover:underline">
                  Global Search
                </a>
              </li>
              <li>
                <a href="/about" onClick={(e) => handleLink(e, '/about')} className="hover:text-white hover:underline">
                  About &amp; Methodology
                </a>
              </li>
              <li>
                <a href="/admin" onClick={(e) => handleLink(e, '/admin')} className="hover:text-white hover:underline">
                  Admin Console
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <p>BetterAlcala · Inspired by BetterGov.ph &amp; BetterLGU.</p>
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'fil' : 'en')}
            className="text-slate-300 hover:text-white underline self-start sm:self-auto cursor-pointer"
          >
            {language === 'en' ? 'Switch to Filipino (FIL)' : 'Switch to English (EN)'}
          </button>
        </div>
      </div>
    </footer>
  );
};
