import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  ChevronDown,
  FileText,
  Globe,
  Home,
  LayoutGrid,
  MapPin,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UI_COPY } from '../i18n/translations';

const EXPLORE_LINKS = [
  { label: 'Municipality Profile', labelFil: 'Profayl ng Bayan', path: '/municipality' },
  { label: 'Transparency Center', labelFil: 'Transparensya', path: '/transparency' },
  { label: 'Infrastructure Projects', labelFil: 'Mga Proyekto', path: '/projects' },
  { label: 'Ordinances & Resolutions', labelFil: 'Mga Ordinansa', path: '/ordinances' },
  { label: 'Public Announcements', labelFil: 'Mga Anunsyo', path: '/announcements' },
  { label: 'About BetterAlcala', labelFil: 'Tungkol sa Proyekto', path: '/about' },
  { label: 'Admin Console', labelFil: 'Admin Portal', path: '/admin' },
];

export const Header: React.FC = () => {
  const { pathname, navigate, language, setLanguage, setIsSearchOpen } = useApp();
  const copy = UI_COPY[language];
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (path: string) => {
    setMobileSheetOpen(false);
    setExploreOpen(false);
    navigate(path);
  };

  const navItems = [
    { label: copy.navServices, path: '/services' },
    { label: copy.navDirectory, path: '/directory' },
    { label: copy.navTransparency, path: '/transparency' },
    { label: copy.navBarangays, path: '/barangays' },
  ];

  const isExploreActive = EXPLORE_LINKS.some((item) => pathname.startsWith(item.path));

  const bottomTabs = [
    { label: 'Home', path: '/', Icon: Home },
    { label: copy.navServices, path: '/services', Icon: FileText },
    { label: copy.navDirectory, path: '/directory', Icon: Building2 },
    { label: copy.navBarangays, path: '/barangays', Icon: MapPin },
  ];

  return (
    <div className="no-print">
      {/* Compact Independent Project Notice & Language Utility Strip (scrolls normally to stay under 15% mobile sticky cap) */}
      <div className="bg-[#0F294A] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2">
          <p className="text-slate-100 truncate">
            <span className="font-semibold text-white">BetterAlcala</span>
            <span className="hidden sm:inline"> — {copy.officialDisclaimerShort}</span>
            <span className="sm:hidden"> · Independent Civic Portal</span>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Globe className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" aria-hidden="true" />
            <div className="inline-flex items-center border border-slate-500/60 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  language === 'en' ? 'bg-white text-[#0F294A]' : 'text-slate-200 hover:text-white'
                }`}
                aria-pressed={language === 'en'}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('fil')}
                className={`px-2 py-0.5 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  language === 'fil' ? 'bg-white text-[#0F294A]' : 'text-slate-200 hover:text-white'
                }`}
                aria-pressed={language === 'fil'}
              >
                FIL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Zone Top Bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Logo + Wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/');
            }}
            className="inline-flex items-center gap-2 font-editorial text-lg sm:text-xl font-bold tracking-tight text-[#0F294A] whitespace-nowrap shrink-0"
          >
            <picture className="shrink-0">
              <source srcSet="/assets/alcala-logo.webp" type="image/webp" />
              <img
                src="/assets/alcala-logo.png"
                alt="BetterAlcala project logo featuring the Bayan ng Alcala seal"
                width={36}
                height={36}
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
              />
            </picture>
            <span>BetterAlcala</span>
          </a>

          {/* Zone 2: Desktop single-line navigation links */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
            {navItems.map((item) => {
              const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(item.path);
                  }}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                    active
                      ? 'text-[#0F294A] border-[#0F294A] font-semibold'
                      : 'border-transparent hover:text-[#0F294A] hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            <div className="relative" ref={exploreRef}>
              <button
                type="button"
                onClick={() => setExploreOpen((prev) => !prev)}
                aria-expanded={exploreOpen}
                className={`inline-flex items-center gap-1 py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 cursor-pointer ${
                  isExploreActive
                    ? 'text-[#0F294A] border-[#0F294A] font-semibold'
                    : 'border-transparent hover:text-[#0F294A] hover:border-slate-300'
                }`}
              >
                <span>{copy.navRecords}</span>
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              {exploreOpen && (
                <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
                  {EXPLORE_LINKS.filter((l) => l.path !== '/transparency').map((link) => {
                    const active = pathname === link.path;
                    return (
                      <a
                        key={link.path}
                        href={link.path}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNav(link.path);
                        }}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          active
                            ? 'bg-slate-100 text-[#0F294A] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-[#0F294A]'
                        }`}
                      >
                        {language === 'fil' ? link.labelFil : link.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label={copy.searchButton}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 min-h-[40px] sm:min-h-[36px] text-xs font-semibold text-white bg-[#0F294A] rounded-md hover:bg-[#091B33] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copy.searchButton}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              aria-label="Open sections menu"
              className="hidden sm:inline-flex lg:hidden p-2 text-slate-700 hover:text-[#0F294A] border border-slate-200 rounded-md min-h-[40px] min-w-[40px] items-center justify-center cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile-First Fixed Bottom Thumb Tab Bar (< lg) — 56px height keeps sticky footprint <= 7% */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200"
      >
        <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
          {bottomTabs.map(({ label, path, Icon }) => {
            const active = path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
            return (
              <button
                key={path}
                type="button"
                onClick={() => handleNav(path)}
                className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors cursor-pointer ${
                  active ? 'text-[#0F294A]' : 'text-slate-500 hover:text-slate-800'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className={`text-[10px] mt-0.5 truncate max-w-full ${active ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setMobileSheetOpen(true)}
            className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors cursor-pointer ${
              mobileSheetOpen || isExploreActive || pathname === '/transparency'
                ? 'text-[#0F294A]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            aria-expanded={mobileSheetOpen}
          >
            <LayoutGrid className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-medium mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Sheet Drawer for Remaining Sections */}
      {mobileSheetOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Civic Sections Menu"
          onClick={() => setMobileSheetOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl border-t border-slate-200 p-4 pb-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-[#0F294A]">{copy.allSectionsLabel}</p>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                aria-label="Close sections menu"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {EXPLORE_LINKS.map((link) => {
                const active = pathname === link.path;
                return (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => handleNav(link.path)}
                    className={`min-h-[44px] px-3 py-2 text-left text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? 'border-[#0F294A] bg-[#0F294A] text-white'
                        : 'border-slate-200 bg-[#FAFAF9] text-slate-800 hover:border-[#0F294A]'
                    }`}
                  >
                    {language === 'fil' ? link.labelFil : link.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1 text-xs text-slate-600">
              <span>{copy.officialDisclaimerShort}</span>
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'fil' : 'en')}
                className="font-semibold text-[#0F294A] min-h-[44px] px-2 cursor-pointer"
              >
                {language === 'en' ? 'FIL' : 'EN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
