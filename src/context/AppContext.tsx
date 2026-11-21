import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LanguageCode } from '../types/civic';

interface AppContextValue {
  pathname: string;
  searchParams: URLSearchParams;
  navigate: (to: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locationState, setLocationState] = useState(() => ({
    pathname: window.location.pathname || '/',
    search: window.location.search || '',
  }));
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigate = useCallback((to: string) => {
    const url = new URL(to, window.location.origin);
    const nextPath = url.pathname;
    const nextSearch = url.search;
    window.history.pushState({}, '', `${nextPath}${nextSearch}`);
    setLocationState({ pathname: nextPath, search: nextSearch });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setLocationState({
        pathname: window.location.pathname || '/',
        search: window.location.search || '',
      });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchParams = new URLSearchParams(locationState.search);

  return (
    <AppContext.Provider
      value={{
        pathname: locationState.pathname,
        searchParams,
        navigate,
        language,
        setLanguage,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
