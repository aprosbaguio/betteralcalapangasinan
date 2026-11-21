import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ANNOUNCEMENTS } from '../data/announcements';
import { BARANGAYS } from '../data/barangays';
import { GOVERNMENT_OFFICES, GOVERNMENT_OFFICIALS } from '../data/directory';
import { ORDINANCES, PUBLIC_DOCUMENTS, RESOLUTIONS } from '../data/legislation';
import { MUNICIPAL_PROFILE } from '../data/municipality';
import { INFRASTRUCTURE_PROJECTS } from '../data/projects';
import { MUNICIPAL_SERVICES } from '../data/services';
import { DATA_SOURCES } from '../data/sources';
import {
  BUDGET_RECORDS,
  PROCUREMENT_RECORDS,
  TRANSPARENCY_LEDGER,
  TRANSPARENCY_SECTIONS,
} from '../data/transparency';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  Announcement,
  Barangay,
  BudgetRecord,
  DataSource,
  GovernmentOffice,
  GovernmentOfficial,
  InfrastructureProject,
  MunicipalProfile,
  Ordinance,
  ProcurementRecord,
  PublicDocument,
  Resolution,
  SearchResultItem,
  MunicipalService,
  TransparencyLedgerItem,
  VerificationStatus,
} from '../types/civic';

export type CivicCategory =
  | 'services'
  | 'offices'
  | 'officials'
  | 'barangays'
  | 'transparency'
  | 'budgets'
  | 'procurement'
  | 'projects'
  | 'ordinances'
  | 'resolutions'
  | 'documents'
  | 'announcements'
  | 'sources';

export interface CivicCategoryMeta {
  key: CivicCategory;
  label: string;
  singular: string;
  description: string;
}

export const CIVIC_CATEGORIES: CivicCategoryMeta[] = [
  { key: 'services', label: 'Public Services', singular: 'Service', description: 'Citizen charter guides, fees, and steps' },
  { key: 'offices', label: 'Municipal Offices', singular: 'Office', description: 'Departments, heads, hours, and contacts' },
  { key: 'officials', label: 'Officials Roster', singular: 'Official', description: 'Executive & Sangguniang Bayan members' },
  { key: 'barangays', label: '21 Barangays', singular: 'Barangay', description: 'Barangay captains, halls, and census profiles' },
  { key: 'transparency', label: 'Transparency Ledger', singular: 'Ledger Entry', description: 'Budgets, AIP, APP, SRE, COA, and NTA disclosures' },
  { key: 'budgets', label: 'Budget Records', singular: 'Budget Record', description: 'Approved budgets, obligations, and disbursements' },
  { key: 'procurement', label: 'Procurement', singular: 'Procurement Record', description: 'PhilGEPS notices and contract awards' },
  { key: 'projects', label: 'Infrastructure', singular: 'Project', description: 'Public works, funding sources, and contractors' },
  { key: 'ordinances', label: 'Ordinances', singular: 'Ordinance', description: 'Municipal ordinances and SP reviews' },
  { key: 'resolutions', label: 'Resolutions', singular: 'Resolution', description: 'Sangguniang Bayan resolutions' },
  { key: 'documents', label: 'Public Documents', singular: 'Document', description: 'Audit reports, charters, and open datasets' },
  { key: 'announcements', label: 'Announcements', singular: 'Announcement', description: 'Official advisories and platform updates' },
  { key: 'sources', label: 'Data Sources', singular: 'Data Source', description: 'Authoritative agencies and citation URLs' },
];

export interface FirestoreCivicRecord {
  recordId: string;
  category: CivicCategory;
  title: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  isBaselineOverride: boolean;
  isDeleted: boolean;
  payload: Record<string, unknown>;
  updatedByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AdminUserRecord {
  uid: string;
  email: string;
  role: 'admin';
  createdAt?: unknown;
}

export interface UnifiedReviewItem {
  id: string;
  category: CivicCategory;
  categoryLabel: string;
  title: string;
  subtitle: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  isBaseline: boolean;
  isOverride: boolean;
  rawRecord: Record<string, unknown>;
}

interface UpsertRecordInput {
  recordId: string;
  category: CivicCategory;
  title: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  payload: Record<string, unknown>;
  isBaselineOverride: boolean;
}

interface CivicDataContextValue {
  // Auth & Admin state
  user: User | null;
  authLoading: boolean;
  isAdmin: boolean;
  isBootstrappedAdmin: boolean;
  adminUsers: AdminUserRecord[];
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  addAdminUser: (uid: string, email: string) => Promise<void>;
  removeAdminUser: (uid: string) => Promise<void>;

  // Live merged public datasets
  municipalProfile: MunicipalProfile;
  sources: DataSource[];
  barangays: Barangay[];
  offices: GovernmentOffice[];
  officials: GovernmentOfficial[];
  services: MunicipalService[];
  transparencySections: typeof TRANSPARENCY_SECTIONS;
  transparencyLedger: TransparencyLedgerItem[];
  budgetRecords: BudgetRecord[];
  procurementRecords: ProcurementRecord[];
  projects: InfrastructureProject[];
  ordinances: Ordinance[];
  resolutions: Resolution[];
  publicDocuments: PublicDocument[];
  announcements: Announcement[];

  // Lookup & Discovery helpers
  getSourcesByIds: (ids: string[]) => DataSource[];
  getBarangayBySlug: (slug: string) => Barangay | undefined;
  getOfficeById: (id: string) => GovernmentOffice | undefined;
  getServiceBySlug: (slug: string) => MunicipalService | undefined;
  getVerificationStats: () => {
    total: number;
    verified: number;
    needsReview: number;
    outdated: number;
    unavailable: number;
  };
  searchAll: (queryStr: string, entityFilter?: string) => SearchResultItem[];
  exportFullDatasetJson: () => string;

  // Admin inspection & mutations
  firestoreRecords: FirestoreCivicRecord[];
  recordsLoading: boolean;
  baselineIdsByCategory: Record<CivicCategory, Set<string>>;
  suppressedBaselineRecords: FirestoreCivicRecord[];
  needsReviewItems: UnifiedReviewItem[];
  allCategoryItems: (category: CivicCategory) => UnifiedReviewItem[];
  upsertCivicRecord: (input: UpsertRecordInput) => Promise<void>;
  markRecordVerified: (
    category: CivicCategory,
    item: UnifiedReviewItem,
    notes?: string
  ) => Promise<void>;
  deleteCivicRecord: (category: CivicCategory, recordId: string) => Promise<void>;
  restoreBaselineRecord: (recordId: string) => Promise<void>;
}

const CivicDataContext = createContext<CivicDataContextValue | null>(null);

function formatFirestoreTimestamp(val: unknown, fallback: string): string {
  if (!val) return fallback;
  if (val instanceof Timestamp) {
    return val.toDate().toISOString().slice(0, 10);
  }
  if (typeof val === 'string' && val.trim()) {
    return val.slice(0, 10);
  }
  return fallback;
}

export function sanitizeRecordId(raw: string): string {
  const cleaned = raw
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return cleaned || `rec-${Date.now()}`;
}

function sanitizePayload(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const entries = Object.entries(obj).slice(0, 29);
  for (const [k, v] of entries) {
    if (v === undefined) continue;
    if (v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      result[k] = v;
    } else if (Array.isArray(v)) {
      result[k] = v.filter((item) => item !== undefined);
    } else if (typeof v === 'object') {
      result[k] = v;
    }
  }
  return result;
}

function mergeCategory<T extends { id: string; verificationStatus: VerificationStatus; verificationNotes?: string; updatedAt?: string }>(
  baseline: T[],
  overrides: FirestoreCivicRecord[],
  buildCustomItem: (rec: FirestoreCivicRecord) => T
): T[] {
  const overrideMap = new Map<string, FirestoreCivicRecord>();
  for (const ov of overrides) {
    overrideMap.set(ov.recordId, ov);
  }

  const baselineIds = new Set(baseline.map((b) => b.id));
  const merged: T[] = [];

  for (const base of baseline) {
    const ov = overrideMap.get(base.id);
    if (ov) {
      if (ov.isDeleted) continue;
      merged.push({
        ...base,
        ...ov.payload,
        id: base.id,
        verificationStatus: ov.verificationStatus,
        verificationNotes: ov.verificationNotes ?? base.verificationNotes,
        updatedAt: formatFirestoreTimestamp(ov.updatedAt, base.updatedAt ?? '2026-11-20'),
      } as T);
    } else {
      merged.push(base);
    }
  }

  for (const ov of overrides) {
    if (!baselineIds.has(ov.recordId) && !ov.isDeleted) {
      merged.push(buildCustomItem(ov));
    }
  }

  return merged;
}

const TODAY = new Date().toISOString().slice(0, 10);

export const CivicDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBootstrappedAdmin, setIsBootstrappedAdmin] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);

  const [firestoreRecords, setFirestoreRecords] = useState<FirestoreCivicRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  if (fatalError) {
    throw fatalError;
  }

  // Listen to Firebase Auth and check admin authorization
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser || !currentUser.emailVerified) {
        setIsAdmin(false);
        setIsBootstrappedAdmin(false);
        setAuthLoading(false);
        return;
      }

      const bootstrapped = currentUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL;
      setIsBootstrappedAdmin(bootstrapped);

      if (bootstrapped) {
        setIsAdmin(true);
        setAuthLoading(false);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
        setIsAdmin(adminSnap.exists());
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.GET, `admins/${currentUser.uid}`);
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // Live subscription to public /civic_records collection (matches allow list: isDeleted in [false, true])
  useEffect(() => {
    const recordsQuery = query(
      collection(db, 'civic_records'),
      where('isDeleted', 'in', [false, true])
    );

    const unsub = onSnapshot(
      recordsQuery,
      (snapshot) => {
        const next: FirestoreCivicRecord[] = [];
        snapshot.forEach((docSnap) => {
          next.push(docSnap.data() as FirestoreCivicRecord);
        });
        setFirestoreRecords(next);
        setRecordsLoading(false);
      },
      (error) => {
        setRecordsLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, 'civic_records');
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      }
    );

    return () => unsub();
  }, []);

  // Bootstrapped admin can view/manage additional admin accounts in /admins
  useEffect(() => {
    if (!isBootstrappedAdmin) {
      setAdminUsers([]);
      return;
    }

    const unsub = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        const list: AdminUserRecord[] = [];
        snapshot.forEach((d) => list.push(d.data() as AdminUserRecord));
        setAdminUsers(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'admins');
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      }
    );

    return () => unsub();
  }, [isBootstrappedAdmin]);

  const recordsByCategory = useMemo(() => {
    const map: Record<CivicCategory, FirestoreCivicRecord[]> = {
      services: [],
      offices: [],
      officials: [],
      barangays: [],
      transparency: [],
      budgets: [],
      procurement: [],
      projects: [],
      ordinances: [],
      resolutions: [],
      documents: [],
      announcements: [],
      sources: [],
    };
    for (const rec of firestoreRecords) {
      if (rec.category in map) {
        map[rec.category].push(rec);
      }
    }
    return map;
  }, [firestoreRecords]);

  const baselineIdsByCategory = useMemo<Record<CivicCategory, Set<string>>>(
    () => ({
      services: new Set(MUNICIPAL_SERVICES.map((x) => x.id)),
      offices: new Set(GOVERNMENT_OFFICES.map((x) => x.id)),
      officials: new Set(GOVERNMENT_OFFICIALS.map((x) => x.id)),
      barangays: new Set(BARANGAYS.map((x) => x.id)),
      transparency: new Set(TRANSPARENCY_LEDGER.map((x) => x.id)),
      budgets: new Set(BUDGET_RECORDS.map((x) => x.id)),
      procurement: new Set(PROCUREMENT_RECORDS.map((x) => x.id)),
      projects: new Set(INFRASTRUCTURE_PROJECTS.map((x) => x.id)),
      ordinances: new Set(ORDINANCES.map((x) => x.id)),
      resolutions: new Set(RESOLUTIONS.map((x) => x.id)),
      documents: new Set(PUBLIC_DOCUMENTS.map((x) => x.id)),
      announcements: new Set(ANNOUNCEMENTS.map((x) => x.id)),
      sources: new Set(Object.values(DATA_SOURCES).map((x) => x.id)),
    }),
    []
  );

  // Merged datasets per category
  const sources = useMemo<DataSource[]>(
    () =>
      mergeCategory(
        Object.values(DATA_SOURCES).map((s) => ({ ...s, updatedAt: s.lastVerifiedDate })),
        recordsByCategory.sources,
        (ov) => {
          const p = ov.payload;
          const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
          return {
            id: ov.recordId,
            title: String(p.title ?? ov.title),
            agency: String(p.agency ?? 'Community / Official Verification'),
            originalUrl: typeof p.originalUrl === 'string' && p.originalUrl ? p.originalUrl : null,
            documentType: (p.documentType as DataSource['documentType']) ?? 'Municipal Citizen Charter',
            publicationDate: String(p.publicationDate ?? dateStr),
            dateRetrieved: String(p.dateRetrieved ?? dateStr),
            lastVerifiedDate: String(p.lastVerifiedDate ?? dateStr),
            verificationStatus: ov.verificationStatus,
            notes: ov.verificationNotes ?? (typeof p.notes === 'string' ? p.notes : undefined),
            updatedAt: dateStr,
          };
        }
      ),
    [recordsByCategory.sources]
  );

  const offices = useMemo<GovernmentOffice[]>(
    () =>
      mergeCategory(GOVERNMENT_OFFICES, recordsByCategory.offices, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-alcala-charter'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          slug: String(p.slug ?? ov.recordId),
          name: String(p.name ?? ov.title),
          nameFil: String(p.nameFil ?? p.name ?? ov.title),
          acronym: String(p.acronym ?? 'LGU'),
          branch: (p.branch as GovernmentOffice['branch']) ?? 'Mandatory LGU Department',
          description: String(p.description ?? ''),
          mandateBasis: String(p.mandateBasis ?? 'RA 7160 (Local Government Code)'),
          officeHead: typeof p.officeHead === 'string' && p.officeHead ? p.officeHead : null,
          address: String(p.address ?? 'Municipal Hall, Alcala, Pangasinan'),
          contactPhone: typeof p.contactPhone === 'string' && p.contactPhone ? p.contactPhone : null,
          contactEmail: typeof p.contactEmail === 'string' && p.contactEmail ? p.contactEmail : null,
          operatingHours: String(p.operatingHours ?? 'Monday–Friday, 8:00 AM – 5:00 PM'),
          serviceSlugs: Array.isArray(p.serviceSlugs) ? (p.serviceSlugs as string[]) : [],
        };
      }),
    [recordsByCategory.offices]
  );

  const officials = useMemo<GovernmentOfficial[]>(
    () =>
      mergeCategory(GOVERNMENT_OFFICIALS, recordsByCategory.officials, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-pangasinan-gov'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          fullName: String(p.fullName ?? ov.title),
          roleTitle: String(p.roleTitle ?? 'Municipal Official'),
          officeId: String(p.officeId ?? 'office-mayor'),
          branch: (p.branch as GovernmentOfficial['branch']) ?? 'Executive',
          termPeriod: String(p.termPeriod ?? '2025–2028'),
          committeeAssignments: Array.isArray(p.committeeAssignments)
            ? (p.committeeAssignments as string[])
            : undefined,
          termConfirmationNote: String(
            p.termConfirmationNote ?? ov.verificationNotes ?? 'Recorded via BetterAlcala Admin.'
          ),
        };
      }),
    [recordsByCategory.officials]
  );

  const barangays = useMemo<Barangay[]>(
    () =>
      mergeCategory(BARANGAYS, recordsByCategory.barangays, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-psa-2020'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          slug: String(p.slug ?? ov.recordId),
          name: String(p.name ?? ov.title),
          alternateSpelling: typeof p.alternateSpelling === 'string' ? p.alternateSpelling : undefined,
          psgcCode: String(p.psgcCode ?? '0105504000'),
          population2020: Number(p.population2020 ?? 0),
          populationSharePercent: Number(p.populationSharePercent ?? 0),
          classification:
            (p.classification as Barangay['classification']) ?? 'Rural / Agricultural',
          geographicNotes: String(p.geographicNotes ?? ''),
          coordinates: {
            lat: null,
            lng: null,
          },
          punongBarangay: typeof p.punongBarangay === 'string' && p.punongBarangay ? p.punongBarangay : null,
          barangayCouncilNote: String(p.barangayCouncilNote ?? ''),
          contactNumber: typeof p.contactNumber === 'string' && p.contactNumber ? p.contactNumber : null,
          barangayHallLocation: String(p.barangayHallLocation ?? 'Barangay Hall, Alcala, Pangasinan'),
          facilities: Array.isArray(p.facilities) ? (p.facilities as string[]) : [],
          serviceNotes: String(p.serviceNotes ?? 'Barangay Clearance, Residency, and Indigency Certificates.'),
        };
      }),
    [recordsByCategory.barangays]
  );

  const services = useMemo<MunicipalService[]>(
    () =>
      mergeCategory(MUNICIPAL_SERVICES, recordsByCategory.services, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-alcala-charter'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          slug: String(p.slug ?? ov.recordId),
          title: String(p.title ?? ov.title),
          titleFil: String(p.titleFil ?? p.title ?? ov.title),
          category: (p.category as MunicipalService['category']) ?? 'Civil Registration',
          officeId: String(p.officeId ?? 'office-mcr'),
          summary: String(p.summary ?? ''),
          summaryFil: String(p.summaryFil ?? p.summary ?? ''),
          legalBasis: String(p.legalBasis ?? 'RA 11032 (Ease of Doing Business)'),
          eligibility: Array.isArray(p.eligibility) ? (p.eligibility as string[]) : ['Residents and eligible applicants'],
          documentaryRequirements: Array.isArray(p.documentaryRequirements)
            ? (p.documentaryRequirements as string[])
            : ['Valid Government ID'],
          procedureSteps: Array.isArray(p.procedureSteps)
            ? (p.procedureSteps as string[])
            : ['Submit requirements at the responsible municipal desk.'],
          processingTime: String(p.processingTime ?? 'Awaiting Citizen Charter verification'),
          applicableFees: String(p.applicableFees ?? 'Awaiting Citizen Charter verification'),
          officeLocation: String(p.officeLocation ?? 'Alcala Municipal Hall'),
          contactInfo: String(p.contactInfo ?? 'Awaiting verified municipal line'),
          downloadableFormsNote: String(p.downloadableFormsNote ?? 'Forms available at the municipal window.'),
          charterVerificationNote: String(
            p.charterVerificationNote ??
              ov.verificationNotes ??
              'Maintained via BetterAlcala civic records registry.'
          ),
        };
      }),
    [recordsByCategory.services]
  );

  const transparencyLedger = useMemo<TransparencyLedgerItem[]>(
    () =>
      mergeCategory(TRANSPARENCY_LEDGER, recordsByCategory.transparency, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-dilg-gfh'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          section: (p.section as TransparencyLedgerItem['section']) ?? 'annual-budgets',
          fiscalYear: Number(p.fiscalYear ?? 2026),
          title: String(p.title ?? ov.title),
          reportingPeriod: String(p.reportingPeriod ?? 'Annual'),
          documentType: String(p.documentType ?? 'Public Disclosure'),
          summary: String(p.summary ?? ''),
          amountLabel: String(p.amountLabel ?? 'Awaiting verification'),
          portalName: String(p.portalName ?? 'DILG Full Disclosure Policy Portal'),
          portalUrl: typeof p.portalUrl === 'string' && p.portalUrl ? p.portalUrl : null,
          recordAvailability:
            (p.recordAvailability as TransparencyLedgerItem['recordAvailability']) ??
            (ov.verificationStatus === 'Verified'
              ? 'Verified Public Reference'
              : 'Awaiting Official LGU Document'),
        };
      }),
    [recordsByCategory.transparency]
  );

  const budgetRecords = useMemo<BudgetRecord[]>(
    () =>
      mergeCategory(BUDGET_RECORDS, recordsByCategory.budgets, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-blgf-dbm'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          fiscalYear: Number(p.fiscalYear ?? 2026),
          category: String(p.category ?? ov.title),
          recordType: (p.recordType as BudgetRecord['recordType']) ?? 'Approved Budget',
          reportingPeriod: String(p.reportingPeriod ?? 'Annual'),
          amountPhp: typeof p.amountPhp === 'number' ? p.amountPhp : null,
          amountDisplay: String(p.amountDisplay ?? 'Awaiting verification'),
          notes: String(p.notes ?? ''),
        };
      }),
    [recordsByCategory.budgets]
  );

  const procurementRecords = useMemo<ProcurementRecord[]>(
    () =>
      mergeCategory(PROCUREMENT_RECORDS, recordsByCategory.procurement, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-philgeps-dpwh'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          fiscalYear: Number(p.fiscalYear ?? 2026),
          referenceNumber: typeof p.referenceNumber === 'string' && p.referenceNumber ? p.referenceNumber : null,
          projectTitle: String(p.projectTitle ?? ov.title),
          procuringOfficeId: String(p.procuringOfficeId ?? 'office-bac'),
          procurementMode: String(p.procurementMode ?? 'Public Bidding'),
          approvedBudgetPhp: typeof p.approvedBudgetPhp === 'number' ? p.approvedBudgetPhp : null,
          contractAmountPhp: typeof p.contractAmountPhp === 'number' ? p.contractAmountPhp : null,
          awardee: typeof p.awardee === 'string' && p.awardee ? p.awardee : null,
          status: (p.status as ProcurementRecord['status']) ?? 'Awaiting PhilGEPS Verification',
        };
      }),
    [recordsByCategory.procurement]
  );

  const projects = useMemo<InfrastructureProject[]>(
    () =>
      mergeCategory(INFRASTRUCTURE_PROJECTS, recordsByCategory.projects, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-philgeps-dpwh'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          slug: String(p.slug ?? ov.recordId),
          title: String(p.title ?? ov.title),
          description: String(p.description ?? ''),
          implementingAgency: String(p.implementingAgency ?? 'Municipality of Alcala / Engineering Office'),
          location: String(p.location ?? 'Alcala, Pangasinan'),
          barangaySlug: typeof p.barangaySlug === 'string' && p.barangaySlug ? p.barangaySlug : null,
          projectCostLabel: String(p.projectCostLabel ?? 'Awaiting verification'),
          fundingSource: String(p.fundingSource ?? '20% Local Development Fund'),
          contractor: typeof p.contractor === 'string' && p.contractor ? p.contractor : null,
          status: (p.status as InfrastructureProject['status']) ?? 'Awaiting Verification',
          startDate: typeof p.startDate === 'string' && p.startDate ? p.startDate : null,
          completionDate: typeof p.completionDate === 'string' && p.completionDate ? p.completionDate : null,
          procurementReference:
            typeof p.procurementReference === 'string' && p.procurementReference
              ? p.procurementReference
              : null,
          coordinates: null,
        };
      }),
    [recordsByCategory.projects]
  );

  const ordinances = useMemo<Ordinance[]>(
    () =>
      mergeCategory(ORDINANCES, recordsByCategory.ordinances, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-sp-pangasinan-ordinances'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          slug: String(p.slug ?? ov.recordId),
          ordinanceNumber: String(p.ordinanceNumber ?? 'Pending Number'),
          title: String(p.title ?? ov.title),
          description: String(p.description ?? ''),
          dateApproved: String(p.dateApproved ?? dateStr),
          issuingBody: String(p.issuingBody ?? 'Sangguniang Bayan of Alcala'),
          reviewBody: typeof p.reviewBody === 'string' ? p.reviewBody : 'Sangguniang Panlalawigan of Pangasinan',
          category: (p.category as Ordinance['category']) ?? 'Governance & Administration',
          year: Number(p.year ?? new Date().getFullYear()),
          pdfAttachmentUrl: typeof p.pdfAttachmentUrl === 'string' && p.pdfAttachmentUrl ? p.pdfAttachmentUrl : null,
        };
      }),
    [recordsByCategory.ordinances]
  );

  const resolutions = useMemo<Resolution[]>(
    () =>
      mergeCategory(RESOLUTIONS, recordsByCategory.resolutions, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-sp-pangasinan-ordinances'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          slug: String(p.slug ?? ov.recordId),
          resolutionNumber: String(p.resolutionNumber ?? 'Pending Number'),
          title: String(p.title ?? ov.title),
          description: String(p.description ?? ''),
          dateApproved: String(p.dateApproved ?? dateStr),
          issuingBody: String(p.issuingBody ?? 'Sangguniang Bayan of Alcala'),
          category: String(p.category ?? 'Governance'),
          year: Number(p.year ?? new Date().getFullYear()),
          pdfAttachmentUrl: typeof p.pdfAttachmentUrl === 'string' && p.pdfAttachmentUrl ? p.pdfAttachmentUrl : null,
        };
      }),
    [recordsByCategory.resolutions]
  );

  const publicDocuments = useMemo<PublicDocument[]>(
    () =>
      mergeCategory(PUBLIC_DOCUMENTS, recordsByCategory.documents, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-alcala-charter'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          title: String(p.title ?? ov.title),
          documentCategory: (p.documentCategory as PublicDocument['documentCategory']) ?? 'Citizen Charter',
          fiscalYear: typeof p.fiscalYear === 'number' ? p.fiscalYear : null,
          issuingAgency: String(p.issuingAgency ?? 'Municipality of Alcala'),
          format: String(p.format ?? 'PDF Document'),
          fileUrl: typeof p.fileUrl === 'string' && p.fileUrl ? p.fileUrl : null,
          description: String(p.description ?? ''),
        };
      }),
    [recordsByCategory.documents]
  );

  const announcements = useMemo<Announcement[]>(
    () =>
      mergeCategory(ANNOUNCEMENTS, recordsByCategory.announcements, (ov) => {
        const p = ov.payload;
        const dateStr = formatFirestoreTimestamp(ov.updatedAt, TODAY);
        return {
          id: ov.recordId,
          createdAt: formatFirestoreTimestamp(ov.createdAt, dateStr),
          updatedAt: dateStr,
          sourceIds: Array.isArray(p.sourceIds) ? (p.sourceIds as string[]) : ['src-alcala-charter'],
          verificationStatus: ov.verificationStatus,
          verificationNotes: ov.verificationNotes,
          slug: String(p.slug ?? ov.recordId),
          title: String(p.title ?? ov.title),
          titleFil: String(p.titleFil ?? p.title ?? ov.title),
          originType:
            (p.originType as Announcement['originType']) ?? 'BetterAlcala Project Update',
          category: (p.category as Announcement['category']) ?? 'Platform Transparency',
          publishedDate: String(p.publishedDate ?? dateStr),
          summary: String(p.summary ?? ''),
          body: Array.isArray(p.body)
            ? (p.body as string[])
            : typeof p.bodyText === 'string'
              ? p.bodyText.split('\n\n').filter(Boolean)
              : [String(p.summary ?? '')],
        };
      }),
    [recordsByCategory.announcements]
  );

  const getSourcesByIds = useCallback(
    (ids: string[]) => sources.filter((s) => ids.includes(s.id)),
    [sources]
  );

  const getBarangayBySlug = useCallback(
    (slug: string) => barangays.find((b) => b.slug === slug),
    [barangays]
  );

  const getOfficeById = useCallback(
    (id: string) => offices.find((o) => o.id === id),
    [offices]
  );

  const getServiceBySlug = useCallback(
    (slug: string) => services.find((s) => s.slug === slug),
    [services]
  );

  const getVerificationStats = useCallback(() => {
    const allRecords = [
      ...barangays,
      ...offices,
      ...officials,
      ...services,
      ...transparencyLedger,
      ...projects,
      ...ordinances,
      ...resolutions,
      ...publicDocuments,
    ];
    return {
      total: allRecords.length,
      verified: allRecords.filter((r) => r.verificationStatus === 'Verified').length,
      needsReview: allRecords.filter((r) => r.verificationStatus === 'Needs Review').length,
      outdated: allRecords.filter((r) => r.verificationStatus === 'Outdated').length,
      unavailable: allRecords.filter((r) => r.verificationStatus === 'Unavailable').length,
    };
  }, [
    barangays,
    offices,
    officials,
    services,
    transparencyLedger,
    projects,
    ordinances,
    resolutions,
    publicDocuments,
  ]);

  const searchAll = useCallback(
    (queryStr: string, entityFilter?: string): SearchResultItem[] => {
      const items: SearchResultItem[] = [];

      for (const s of services) {
        const office = offices.find((o) => o.id === s.officeId);
        items.push({
          id: s.id,
          entityType: 'Service',
          title: s.title,
          subtitle: `${s.category} · ${office?.name ?? 'Municipal Office'}`,
          route: `/services/${s.slug}`,
          verificationStatus: s.verificationStatus,
          keywords: `${s.title} ${s.titleFil} ${s.category} ${s.summary} ${s.legalBasis} ${office?.name ?? ''}`.toLowerCase(),
        });
      }

      for (const o of offices) {
        items.push({
          id: o.id,
          entityType: 'Office',
          title: o.name,
          subtitle: `${o.acronym} · ${o.branch}`,
          route: `/directory?office=${o.slug}`,
          verificationStatus: o.verificationStatus,
          keywords: `${o.name} ${o.nameFil} ${o.acronym} ${o.description} ${o.mandateBasis}`.toLowerCase(),
        });
      }

      for (const off of officials) {
        items.push({
          id: off.id,
          entityType: 'Official',
          title: off.fullName,
          subtitle: `${off.roleTitle} · ${off.branch}`,
          route: `/directory?q=${encodeURIComponent(off.fullName)}`,
          verificationStatus: off.verificationStatus,
          keywords: `${off.fullName} ${off.roleTitle} ${off.branch} ${off.termPeriod}`.toLowerCase(),
        });
      }

      for (const b of barangays) {
        items.push({
          id: b.id,
          entityType: 'Barangay',
          title: `Barangay ${b.name}`,
          subtitle: `PSGC ${b.psgcCode} · 2020 Pop: ${b.population2020.toLocaleString()}`,
          route: `/barangays/${b.slug}`,
          verificationStatus: b.verificationStatus,
          keywords: `${b.name} ${b.alternateSpelling ?? ''} ${b.psgcCode} ${b.classification} ${b.geographicNotes}`.toLowerCase(),
        });
      }

      for (const ord of ordinances) {
        items.push({
          id: ord.id,
          entityType: 'Ordinance',
          title: ord.title,
          subtitle: `${ord.category} · ${ord.issuingBody}`,
          route: `/ordinances?type=ordinance&q=${encodeURIComponent(ord.title)}`,
          verificationStatus: ord.verificationStatus,
          keywords: `${ord.title} ${ord.description} ${ord.category} ${ord.ordinanceNumber}`.toLowerCase(),
        });
      }

      for (const res of resolutions) {
        items.push({
          id: res.id,
          entityType: 'Resolution',
          title: res.title,
          subtitle: `${res.category} · ${res.issuingBody}`,
          route: `/ordinances?type=resolution`,
          verificationStatus: res.verificationStatus,
          keywords: `${res.title} ${res.description} ${res.category}`.toLowerCase(),
        });
      }

      for (const proj of projects) {
        items.push({
          id: proj.id,
          entityType: 'Project',
          title: proj.title,
          subtitle: `${proj.location} · ${proj.status}`,
          route: `/projects?q=${encodeURIComponent(proj.title)}`,
          verificationStatus: proj.verificationStatus,
          keywords: `${proj.title} ${proj.description} ${proj.location} ${proj.implementingAgency}`.toLowerCase(),
        });
      }

      for (const docItem of publicDocuments) {
        items.push({
          id: docItem.id,
          entityType: 'Document',
          title: docItem.title,
          subtitle: `${docItem.documentCategory} · ${docItem.issuingAgency}`,
          route: `/ordinances?tab=documents`,
          verificationStatus: docItem.verificationStatus,
          keywords: `${docItem.title} ${docItem.documentCategory} ${docItem.issuingAgency} ${docItem.description}`.toLowerCase(),
        });
      }

      const trimmed = queryStr.trim().toLowerCase();
      return items.filter((item) => {
        if (entityFilter && entityFilter !== 'All' && item.entityType !== entityFilter) {
          return false;
        }
        if (!trimmed) return true;
        const tokens = trimmed.split(/\s+/).filter(Boolean);
        return tokens.every(
          (token) =>
            item.keywords.includes(token) ||
            item.title.toLowerCase().includes(token) ||
            item.subtitle.toLowerCase().includes(token)
        );
      });
    },
    [services, offices, officials, barangays, ordinances, resolutions, projects, publicDocuments]
  );

  const exportFullDatasetJson = useCallback(() => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        platform: 'BetterAlcala',
        disclaimer:
          'Independent civic transparency dataset for Alcala, Pangasinan. Records marked Needs Review or Unavailable require official LGU/agency confirmation.',
        sources,
        municipality: MUNICIPAL_PROFILE,
        barangays,
        offices,
        officials,
        services,
        transparencyLedger,
        budgetRecords,
        procurementRecords,
        infrastructureProjects: projects,
        ordinances,
        resolutions,
        publicDocuments,
        announcements,
      },
      null,
      2
    );
  }, [
    sources,
    barangays,
    offices,
    officials,
    services,
    transparencyLedger,
    budgetRecords,
    procurementRecords,
    projects,
    ordinances,
    resolutions,
    publicDocuments,
    announcements,
  ]);

  const allCategoryItems = useCallback(
    (category: CivicCategory): UnifiedReviewItem[] => {
      const overrideIds = new Set(recordsByCategory[category].map((r) => r.recordId));
      const baseSet = baselineIdsByCategory[category];
      const catMeta = CIVIC_CATEGORIES.find((c) => c.key === category)!;

      const wrap = <T extends { id: string }>(
        items: T[],
        getTitle: (x: T) => string,
        getSubtitle: (x: T) => string,
        getStatus: (x: T) => VerificationStatus,
        getNotes: (x: T) => string | undefined
      ): UnifiedReviewItem[] =>
        items.map((x) => {
          const id = String(x.id);
          return {
            id,
            category,
            categoryLabel: catMeta.label,
            title: getTitle(x),
            subtitle: getSubtitle(x),
            verificationStatus: getStatus(x),
            verificationNotes: getNotes(x),
            isBaseline: baseSet.has(id),
            isOverride: overrideIds.has(id),
            rawRecord: x as unknown as Record<string, unknown>,
          };
        });

      switch (category) {
        case 'services':
          return wrap(services, (x) => x.title, (x) => `${x.category} · ${x.applicableFees}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'offices':
          return wrap(offices, (x) => x.name, (x) => `${x.acronym} · Head: ${x.officeHead ?? 'Unverified'}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'officials':
          return wrap(officials, (x) => x.fullName, (x) => `${x.roleTitle} · ${x.termPeriod}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'barangays':
          return wrap(barangays, (x) => x.name, (x) => `PSGC ${x.psgcCode} · Punong Brgy: ${x.punongBarangay ?? 'Unverified'}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'transparency':
          return wrap(transparencyLedger, (x) => x.title, (x) => `FY ${x.fiscalYear} · ${x.documentType}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'budgets':
          return wrap(budgetRecords, (x) => x.category, (x) => `FY ${x.fiscalYear} · ${x.recordType} · ${x.amountDisplay}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'procurement':
          return wrap(procurementRecords, (x) => x.projectTitle, (x) => `FY ${x.fiscalYear} · ${x.status}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'projects':
          return wrap(projects, (x) => x.title, (x) => `${x.location} · ${x.status}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'ordinances':
          return wrap(ordinances, (x) => x.title, (x) => `${x.ordinanceNumber} · ${x.year}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'resolutions':
          return wrap(resolutions, (x) => x.title, (x) => `${x.resolutionNumber} · ${x.year}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'documents':
          return wrap(publicDocuments, (x) => x.title, (x) => `${x.documentCategory} · ${x.issuingAgency}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'announcements':
          return wrap(announcements, (x) => x.title, (x) => `${x.originType} · ${x.publishedDate}`, (x) => x.verificationStatus, (x) => x.verificationNotes);
        case 'sources':
          return wrap(sources, (x) => x.title, (x) => `${x.agency} · ${x.documentType}`, (x) => x.verificationStatus, (x) => x.notes);
      }
    },
    [
      recordsByCategory,
      baselineIdsByCategory,
      services,
      offices,
      officials,
      barangays,
      transparencyLedger,
      budgetRecords,
      procurementRecords,
      projects,
      ordinances,
      resolutions,
      publicDocuments,
      announcements,
      sources,
    ]
  );

  const needsReviewItems = useMemo(() => {
    const collected: UnifiedReviewItem[] = [];
    for (const cat of CIVIC_CATEGORIES) {
      const items = allCategoryItems(cat.key);
      for (const item of items) {
        if (item.verificationStatus === 'Needs Review') {
          collected.push(item);
        }
      }
    }
    return collected;
  }, [allCategoryItems]);

  const suppressedBaselineRecords = useMemo(
    () => firestoreRecords.filter((r) => r.isBaselineOverride && r.isDeleted),
    [firestoreRecords]
  );

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const upsertCivicRecord = useCallback(
    async ({
      recordId,
      category,
      title,
      verificationStatus,
      verificationNotes,
      payload,
      isBaselineOverride,
    }: UpsertRecordInput) => {
      if (!auth.currentUser) {
        throw new Error('Authentication required for admin writes.');
      }
      const cleanId = sanitizeRecordId(recordId);
      const docRef = doc(db, 'civic_records', cleanId);
      const cleanPayload = sanitizePayload(payload);
      const cleanTitle = title.trim().slice(0, 300) || cleanId;
      const cleanNotes = verificationNotes?.trim().slice(0, 1000);

      try {
        const existingSnap = await getDoc(docRef);
        if (existingSnap.exists()) {
          const updateData: Record<string, unknown> = {
            title: cleanTitle,
            verificationStatus,
            isBaselineOverride,
            isDeleted: false,
            payload: cleanPayload,
            updatedByUid: auth.currentUser.uid,
            updatedAt: serverTimestamp(),
          };
          if (cleanNotes !== undefined && cleanNotes !== '') {
            updateData.verificationNotes = cleanNotes;
          }
          await updateDoc(docRef, updateData);
        } else {
          const createData: Record<string, unknown> = {
            recordId: cleanId,
            category,
            title: cleanTitle,
            verificationStatus,
            isBaselineOverride,
            isDeleted: false,
            payload: cleanPayload,
            updatedByUid: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          if (cleanNotes !== undefined && cleanNotes !== '') {
            createData.verificationNotes = cleanNotes;
          }
          await setDoc(docRef, createData);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `civic_records/${cleanId}`);
      }
    },
    []
  );

  const markRecordVerified = useCallback(
    async (category: CivicCategory, item: UnifiedReviewItem, notes?: string) => {
      const payloadCopy = { ...item.rawRecord };
      delete payloadCopy.id;
      delete payloadCopy.createdAt;
      delete payloadCopy.updatedAt;
      delete payloadCopy.verificationStatus;
      delete payloadCopy.verificationNotes;

      const finalNotes =
        notes?.trim() ||
        item.verificationNotes ||
        `Verified by BetterAlcala administrator on ${new Date().toISOString().slice(0, 10)}.`;

      if (category === 'sources') {
        payloadCopy.lastVerifiedDate = new Date().toISOString().slice(0, 10);
        payloadCopy.notes = finalNotes;
      }

      await upsertCivicRecord({
        recordId: item.id,
        category,
        title: item.title,
        verificationStatus: 'Verified',
        verificationNotes: finalNotes,
        payload: payloadCopy,
        isBaselineOverride: item.isBaseline,
      });
    },
    [upsertCivicRecord]
  );

  const deleteCivicRecord = useCallback(
    async (category: CivicCategory, recordId: string) => {
      if (!auth.currentUser) {
        throw new Error('Authentication required for admin writes.');
      }
      const cleanId = sanitizeRecordId(recordId);
      const isBaseline = baselineIdsByCategory[category].has(cleanId);
      const docRef = doc(db, 'civic_records', cleanId);

      try {
        if (isBaseline) {
          const existingSnap = await getDoc(docRef);
          if (existingSnap.exists()) {
            await updateDoc(docRef, {
              isBaselineOverride: true,
              isDeleted: true,
              updatedByUid: auth.currentUser.uid,
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(docRef, {
              recordId: cleanId,
              category,
              title: cleanId,
              verificationStatus: 'Unavailable',
              isBaselineOverride: true,
              isDeleted: true,
              payload: {},
              updatedByUid: auth.currentUser.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } else {
          await deleteDoc(docRef);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `civic_records/${cleanId}`);
      }
    },
    [baselineIdsByCategory]
  );

  const restoreBaselineRecord = useCallback(async (recordId: string) => {
    const cleanId = sanitizeRecordId(recordId);
    try {
      await deleteDoc(doc(db, 'civic_records', cleanId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `civic_records/${cleanId}`);
    }
  }, []);

  const addAdminUser = useCallback(async (uid: string, email: string) => {
    const cleanUid = sanitizeRecordId(uid);
    const cleanEmail = email.trim().toLowerCase();
    try {
      await setDoc(doc(db, 'admins', cleanUid), {
        uid: cleanUid,
        email: cleanEmail,
        role: 'admin',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `admins/${cleanUid}`);
    }
  }, []);

  const removeAdminUser = useCallback(async (uid: string) => {
    const cleanUid = sanitizeRecordId(uid);
    try {
      await deleteDoc(doc(db, 'admins', cleanUid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admins/${cleanUid}`);
    }
  }, []);

  const value: CivicDataContextValue = {
    user,
    authLoading,
    isAdmin,
    isBootstrappedAdmin,
    adminUsers,
    signInWithGoogle,
    signOutUser,
    addAdminUser,
    removeAdminUser,
    municipalProfile: MUNICIPAL_PROFILE,
    sources,
    barangays,
    offices,
    officials,
    services,
    transparencySections: TRANSPARENCY_SECTIONS,
    transparencyLedger,
    budgetRecords,
    procurementRecords,
    projects,
    ordinances,
    resolutions,
    publicDocuments,
    announcements,
    getSourcesByIds,
    getBarangayBySlug,
    getOfficeById,
    getServiceBySlug,
    getVerificationStats,
    searchAll,
    exportFullDatasetJson,
    firestoreRecords,
    recordsLoading,
    baselineIdsByCategory,
    suppressedBaselineRecords,
    needsReviewItems,
    allCategoryItems,
    upsertCivicRecord,
    markRecordVerified,
    deleteCivicRecord,
    restoreBaselineRecord,
  };

  return <CivicDataContext.Provider value={value}>{children}</CivicDataContext.Provider>;
};

export function useCivicData() {
  const ctx = useContext(CivicDataContext);
  if (!ctx) throw new Error('useCivicData must be used inside CivicDataProvider');
  return ctx;
}
