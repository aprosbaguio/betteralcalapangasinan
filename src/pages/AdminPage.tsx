import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  LogIn,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { AdminRecordModal } from '../components/AdminRecordModal';
import { PageHeader } from '../components/PageHeader';
import { VerificationIndicator } from '../components/VerificationIndicator';
import {
  CIVIC_CATEGORIES,
  CivicCategory,
  UnifiedReviewItem,
  useCivicData,
} from '../context/CivicDataContext';
import { usePageSEO } from '../lib/seo';

export const AdminPage: React.FC = () => {
  const {
    user,
    authLoading,
    isAdmin,
    isBootstrappedAdmin,
    adminUsers,
    signInWithGoogle,
    signOutUser,
    addAdminUser,
    removeAdminUser,
    needsReviewItems,
    allCategoryItems,
    markRecordVerified,
    deleteCivicRecord,
    restoreBaselineRecord,
    suppressedBaselineRecords,
    getVerificationStats,
  } = useCivicData();

  usePageSEO({
    title: 'Admin Content & Verification Console – BetterAlcala',
    description:
      'Authorized BetterAlcala administrator console for adding, editing, deleting, and verifying municipal civic records.',
    path: '/admin',
  });

  const [activeTab, setActiveTab] = useState<'review' | 'categories' | 'deleted' | 'admins'>('review');
  const [selectedCategory, setSelectedCategory] = useState<CivicCategory>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Needs Review' | 'Outdated' | 'Unavailable'>('All');

  const [modalTarget, setModalTarget] = useState<{
    category: CivicCategory;
    item: UnifiedReviewItem | null;
  } | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<UnifiedReviewItem | null>(null);
  const [verifyDraft, setVerifyDraft] = useState<{ item: UnifiedReviewItem; note: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Co-admin form state
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  const stats = getVerificationStats();

  const categoryItems = useMemo(
    () => allCategoryItems(selectedCategory),
    [allCategoryItems, selectedCategory]
  );

  const filteredCategoryItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categoryItems.filter((item) => {
      if (statusFilter !== 'All' && item.verificationStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    });
  }, [categoryItems, searchQuery, statusFilter]);

  const filteredReviewItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return needsReviewItems.filter((item) => {
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [needsReviewItems, searchQuery]);

  const handleSignIn = async () => {
    setBanner(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Google Sign-In did not complete.',
      });
    }
  };

  const handleQuickVerify = async (item: UnifiedReviewItem, customNote?: string) => {
    setBusyId(item.id);
    setBanner(null);
    try {
      await markRecordVerified(item.category, item, customNote);
      setVerifyDraft(null);
      setBanner({ type: 'success', text: `Marked "${item.title}" as Verified.` });
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to mark record as verified.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    setBanner(null);
    try {
      await deleteCivicRecord(confirmDelete.category, confirmDelete.id);
      setBanner({
        type: 'success',
        text: confirmDelete.isBaseline
          ? `Removed "${confirmDelete.title}" from public views (recoverable under Deleted Baselines).`
          : `Permanently deleted "${confirmDelete.title}".`,
      });
      setConfirmDelete(null);
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to delete record.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async (recordId: string, title: string) => {
    setBusyId(recordId);
    setBanner(null);
    try {
      await restoreBaselineRecord(recordId);
      setBanner({ type: 'success', text: `Restored baseline record "${title}".` });
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to restore baseline record.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleAddCoAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!newAdminUid.trim() || !newAdminEmail.trim()) return;
    try {
      await addAdminUser(newAdminUid, newAdminEmail);
      setBanner({ type: 'success', text: `Added co-admin ${newAdminEmail.trim()}.` });
      setNewAdminUid('');
      setNewAdminEmail('');
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to add admin.',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-slate-600">
        Checking administrator session...
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <PageHeader
          kicker="BetterAlcala Editorial Console"
          title="Administrator Sign-In"
          description="Manage records across all 13 BetterAlcala categories and mark Needs Review items as Verified once confirmed."
        />
        <div className="max-w-md mx-auto px-4 py-10">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#0F294A] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-[#0F294A]">Authorized Access Only</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Sign in with your verified BetterAlcala administrator Google account to add, edit, delete, or verify civic records.
                </p>
              </div>
            </div>

            {banner && (
              <p role="alert" className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3">
                {banner.text}
              </p>
            )}

            <button
              type="button"
              onClick={handleSignIn}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0F294A] rounded-md hover:bg-[#091B33] transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <PageHeader
          kicker="BetterAlcala Editorial Console"
          title="Administrator Access Restricted"
          description="Your Google account is signed in, but is not currently listed in BetterAlcala's verified admin registry."
        />
        <div className="max-w-lg mx-auto px-4 py-10">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1.5 min-w-0">
                <h2 className="text-base font-semibold text-slate-900">Not Authorized</h2>
                <p className="text-xs sm:text-sm text-slate-600 break-words">
                  Signed in as <span className="font-semibold text-slate-900">{user.email}</span>
                  {!user.emailVerified && ' (email not verified)'}.
                </p>
                <p className="text-xs font-mono text-slate-500 break-all">UID: {user.uid}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOutUser}
              className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0F294A] border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeCategoryMeta = CIVIC_CATEGORIES.find((c) => c.key === selectedCategory)!;

  return (
    <div>
      <PageHeader
        kicker="BetterAlcala Editorial Console"
        title="Content &amp; Verification Admin"
        description="Add, edit, delete, and mark Needs Review municipal records as Verified. All changes publish live to public pages."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600 truncate max-w-[190px]">{user.email}</span>
            <button
              type="button"
              onClick={signOutUser}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 text-xs font-semibold text-[#0F294A] bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Compact Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="border border-slate-200 bg-white rounded-lg p-3.5">
            <p className="text-[11px] sm:text-xs text-slate-600">Total Live Records</p>
            <p className="text-xl sm:text-2xl font-semibold text-[#0F294A] font-mono tabular-nums mt-0.5">
              {stats.total}
            </p>
          </div>
          <div className="border border-slate-200 bg-white rounded-lg p-3.5">
            <p className="text-[11px] sm:text-xs text-slate-600">Verified</p>
            <p className="text-xl sm:text-2xl font-semibold text-[#166534] font-mono tabular-nums mt-0.5">
              {stats.verified}
            </p>
          </div>
          <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-3.5">
            <p className="text-[11px] sm:text-xs text-amber-900 font-medium">Needs Review Queue</p>
            <p className="text-xl sm:text-2xl font-semibold text-amber-700 font-mono tabular-nums mt-0.5">
              {needsReviewItems.length}
            </p>
          </div>
          <div className="border border-slate-200 bg-white rounded-lg p-3.5">
            <p className="text-[11px] sm:text-xs text-slate-600">Awaiting Docs</p>
            <p className="text-xl sm:text-2xl font-semibold text-slate-700 font-mono tabular-nums mt-0.5">
              {stats.unavailable}
            </p>
          </div>
        </div>

        {banner && (
          <div
            role="status"
            className={`rounded-lg border p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm ${
              banner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-[#166534]'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span className="font-medium">{banner.text}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="text-xs font-semibold underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Primary Workspace Mode Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-md whitespace-nowrap border-b-2 transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'review'
                ? 'border-[#0F294A] text-[#0F294A] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
            <span>Needs Review Queue ({needsReviewItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-md whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'border-[#0F294A] text-[#0F294A] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Manage All 13 Categories
          </button>

          {suppressedBaselineRecords.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('deleted')}
              className={`min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-md whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === 'deleted'
                  ? 'border-[#0F294A] text-[#0F294A] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Deleted Baselines ({suppressedBaselineRecords.length})
            </button>
          )}

          {isBootstrappedAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('admins')}
              className={`min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-md whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === 'admins'
                  ? 'border-[#0F294A] text-[#0F294A] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin Access ({adminUsers.length + 1})
            </button>
          )}
        </div>

        {/* TAB 1: Needs Review Verification Queue */}
        {activeTab === 'review' && (
          <section aria-label="Needs Review Verification Queue" className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter Needs Review records across all categories..."
                  className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
                />
              </div>
              <p className="text-xs text-slate-600">
                Verify records directly or open Edit to update figures before publishing as Verified.
              </p>
            </div>

            {filteredReviewItems.length === 0 ? (
              <div className="border border-slate-200 bg-white rounded-lg p-8 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-[#166534] mx-auto" aria-hidden="true" />
                <p className="text-sm font-semibold text-slate-900">No items currently awaiting review</p>
                <p className="text-xs text-slate-600">
                  Switch to “Manage All 13 Categories” to add, edit, or inspect Verified and Unavailable entries.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-200 bg-white rounded-lg overflow-hidden">
                {filteredReviewItems.map((item) => (
                  <div
                    key={`${item.category}-${item.id}`}
                    className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-semibold text-[#0F294A]">{item.categoryLabel}</span>
                        <span aria-hidden="true">·</span>
                        <VerificationIndicator status={item.verificationStatus} compact />
                        {item.isOverride && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-[11px] text-slate-500">Firestore Saved</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 break-words">{item.subtitle}</p>
                      {item.verificationNotes && (
                        <p className="text-xs text-slate-500 italic break-words">
                          Note: {item.verificationNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() =>
                          setVerifyDraft({
                            item,
                            note: item.verificationNotes ?? '',
                          })
                        }
                        className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#166534] rounded-md hover:bg-[#14532D] disabled:opacity-60 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Mark Verified</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalTarget({ category: item.category, item })}
                        className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F294A] bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDelete(item)}
                        className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-md hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: Category Manager (All 13 Categories) */}
        {activeTab === 'categories' && (
          <section aria-label="Manage All 13 Categories" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Mobile Category Dropdown */}
            <div className="lg:hidden bg-white border border-slate-200 rounded-lg p-3.5 space-y-2">
              <label htmlFor="admin-cat-select" className="block text-xs font-semibold text-[#0F294A]">
                Select Category (13 Modules)
              </label>
              <select
                id="admin-cat-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CivicCategory)}
                className="w-full h-11 px-3 text-sm font-medium border border-slate-300 rounded-md bg-white"
              >
                {CIVIC_CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label} ({allCategoryItems(cat.key).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Category Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
              {CIVIC_CATEGORIES.map((cat) => {
                const items = allCategoryItems(cat.key);
                const reviewCount = items.filter((i) => i.verificationStatus === 'Needs Review').length;
                const active = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      active ? 'bg-[#0F294A] text-white' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{cat.label}</p>
                      {reviewCount > 0 && (
                        <p className={`text-[11px] ${active ? 'text-amber-200' : 'text-amber-700'}`}>
                          {reviewCount} needs review
                        </p>
                      )}
                    </div>
                    <span className={`font-mono text-xs tabular-nums ${active ? 'text-slate-200' : 'text-slate-500'}`}>
                      {items.length}
                    </span>
                  </button>
                );
              })}
            </aside>

            {/* Category Records Workspace */}
            <div className="lg:col-span-9 space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-editorial text-xl font-semibold text-[#0F294A]">
                      {activeCategoryMeta.label}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">{activeCategoryMeta.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalTarget({ category: selectedCategory, item: null })}
                    className="min-h-[42px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F294A] rounded-md hover:bg-[#091B33] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span>Add {activeCategoryMeta.singular}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
                  <div className="sm:col-span-8 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Filter ${activeCategoryMeta.label.toLowerCase()}...`}
                      className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      aria-label="Filter by verification status"
                      className="w-full h-10 px-3 text-xs sm:text-sm border border-slate-300 rounded-md bg-white"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Verified">Verified</option>
                      <option value="Needs Review">Needs Review</option>
                      <option value="Outdated">Outdated</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredCategoryItems.length === 0 ? (
                <div className="border border-slate-200 bg-white rounded-lg p-8 text-center text-sm text-slate-600">
                  No records match your filters in {activeCategoryMeta.label}.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 bg-white rounded-lg overflow-hidden">
                  {filteredCategoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                          <VerificationIndicator status={item.verificationStatus} compact />
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[11px]">
                            {item.isBaseline
                              ? item.isOverride
                                ? 'Edited Baseline'
                                : 'Baseline'
                              : 'Custom Record'}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-600 break-words">{item.subtitle}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {item.verificationStatus !== 'Verified' && (
                          <button
                            type="button"
                            disabled={busyId === item.id}
                            onClick={() =>
                              setVerifyDraft({
                                item,
                                note: item.verificationNotes ?? '',
                              })
                            }
                            className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#166534] rounded-md hover:bg-[#14532D] disabled:opacity-60 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Mark Verified</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setModalTarget({ category: item.category, item })}
                          className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F294A] bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(item)}
                          className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-md hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 3: Deleted Baseline Records */}
        {activeTab === 'deleted' && (
          <section aria-label="Deleted Baseline Records" className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            {suppressedBaselineRecords.map((rec) => (
              <div key={rec.recordId} className="p-4 sm:p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-mono text-slate-500">
                    {rec.category} · {rec.recordId}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{rec.title}</p>
                </div>
                <button
                  type="button"
                  disabled={busyId === rec.recordId}
                  onClick={() => handleRestore(rec.recordId, rec.title)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F294A] border border-slate-300 rounded-md hover:bg-slate-50 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </section>
        )}

        {/* TAB 4: Admin Access (Bootstrapped Admin Only) */}
        {activeTab === 'admins' && isBootstrappedAdmin && (
          <section aria-label="Administrator Access Management" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <h2 className="font-editorial text-lg font-semibold text-[#0F294A]">
                Add Co-Administrator
              </h2>
              <p className="text-xs text-slate-600">
                Enter the user’s Firebase Auth UID and verified Google email address to grant editorial access.
              </p>
              <form onSubmit={handleAddCoAdmin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Firebase Auth UID *</label>
                  <input
                    type="text"
                    required
                    value={newAdminUid}
                    onChange={(e) => setNewAdminUid(e.target.value)}
                    placeholder="e.g. X8k2..."
                    className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Google Email *</label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[42px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F294A] rounded-md hover:bg-[#091B33] cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  <span>Grant Admin Access</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <h2 className="font-editorial text-lg font-semibold text-[#0F294A]">
                Authorized Administrators
              </h2>
              <div className="divide-y divide-slate-100">
                <div className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">apros.baguio@gmail.com</p>
                    <p className="text-slate-500">Primary Bootstrapped Administrator</p>
                  </div>
                  <span className="font-mono text-[#166534] font-semibold">Protected</span>
                </div>
                {adminUsers.map((adm) => (
                  <div key={adm.uid} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{adm.email}</p>
                      <p className="font-mono text-slate-500 truncate">{adm.uid}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdminUser(adm.uid)}
                      className="text-rose-700 font-semibold hover:underline shrink-0 cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Add / Edit Record Modal */}
      {modalTarget && (
        <AdminRecordModal
          category={modalTarget.category}
          editingItem={modalTarget.item}
          onClose={() => setModalTarget(null)}
          onSaved={(msg) => setBanner({ type: 'success', text: msg })}
        />
      )}

      {/* Quick Verification Confirmation Modal */}
      {verifyDraft && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Record Verification"
          onClick={() => setVerifyDraft(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="text-xs font-semibold text-[#166534]">{verifyDraft.item.categoryLabel}</p>
              <h3 className="font-editorial text-lg font-semibold text-[#0F294A] mt-0.5">
                Mark Record as Verified
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 mt-1">{verifyDraft.item.title}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Note / Source Reference (optional)
              </label>
              <textarea
                rows={3}
                value={verifyDraft.note}
                onChange={(e) => setVerifyDraft({ ...verifyDraft, note: e.target.value })}
                placeholder="e.g., Confirmed via Alcala Citizen Charter 2026 PDF or Sangguniang Bayan registry..."
                className="w-full p-2.5 text-sm border border-slate-300 rounded-md focus:border-[#0F294A] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setVerifyDraft(null)}
                className="min-h-[40px] px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === verifyDraft.item.id}
                onClick={() => handleQuickVerify(verifyDraft.item, verifyDraft.note)}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#166534] rounded-md hover:bg-[#14532D] disabled:opacity-60 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{busyId === verifyDraft.item.id ? 'Verifying...' : 'Confirm Verified'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Replaces window.confirm for iframe compliance) */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Record Deletion"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-editorial text-lg font-semibold text-rose-800">
                Delete Civic Record?
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                {confirmDelete.isBaseline
                  ? `This will remove baseline record "${confirmDelete.title}" from public pages. You can restore it anytime under Deleted Baselines.`
                  : `This will permanently delete custom record "${confirmDelete.title}".`}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="min-h-[40px] px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === confirmDelete.id}
                onClick={handleConfirmDelete}
                className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-rose-700 rounded-md hover:bg-rose-800 disabled:opacity-60 cursor-pointer"
              >
                {busyId === confirmDelete.id ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
