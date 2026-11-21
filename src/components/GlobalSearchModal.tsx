import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCivicData } from '../context/CivicDataContext';
import { VerificationIndicator } from './VerificationIndicator';

const ENTITY_FILTERS = ['All', 'Service', 'Barangay', 'Office', 'Official', 'Ordinance', 'Project', 'Document'] as const;

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, navigate } = useApp();
  const { searchAll } = useCivicData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const results = searchAll(query, filter).slice(0, 12);

  const handleSelect = (route: string) => {
    setIsSearchOpen(false);
    navigate(route);
  };

  const handleFullSearchPage = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] flex items-start justify-center p-4 sm:pt-16"
      role="dialog"
      aria-modal="true"
      aria-label="Global Civic Records Search"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleFullSearchPage} className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, 21 barangays, offices, officials, ordinances..."
            className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
            aria-label="Search Alcala civic records"
          />
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search dialog"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {ENTITY_FILTERS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                filter === type
                  ? 'bg-[#0F294A] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-600">
              No matching records found for “{query}”. Try searching for a barangay name (e.g. San Vicente), office (MCR), or service (Business Permit).
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.route)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#0F294A]">{item.entityType}</span>
                    <span aria-hidden="true">·</span>
                    <VerificationIndicator status={item.verificationStatus} compact />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">{item.title}</p>
                  <p className="text-xs text-slate-600 truncate">{item.subtitle}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Press Enter for full search results page</span>
          <button
            type="button"
            onClick={() => handleSelect(`/search?q=${encodeURIComponent(query)}`)}
            className="font-semibold text-[#0F294A] hover:underline cursor-pointer"
          >
            Open Full Search View
          </button>
        </div>
      </div>
    </div>
  );
};
