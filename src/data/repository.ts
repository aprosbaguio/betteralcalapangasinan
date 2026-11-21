import { ANNOUNCEMENTS } from './announcements';
import { BARANGAYS } from './barangays';
import { GOVERNMENT_OFFICES, GOVERNMENT_OFFICIALS } from './directory';
import { ORDINANCES, PUBLIC_DOCUMENTS, RESOLUTIONS } from './legislation';
import { MUNICIPAL_PROFILE } from './municipality';
import { INFRASTRUCTURE_PROJECTS } from './projects';
import { MUNICIPAL_SERVICES } from './services';
import { DATA_SOURCES, getSourcesByIds } from './sources';
import { BUDGET_RECORDS, PROCUREMENT_RECORDS, TRANSPARENCY_LEDGER, TRANSPARENCY_SECTIONS } from './transparency';
import { SearchResultItem } from '../types/civic';

/**
 * Centralized Data Repository abstraction.
 * Decouples UI components from underlying storage so a CMS, Supabase, or Cloudflare D1/Worker API
 * can replace static TypeScript modules without modifying presentation components.
 */
export const CivicRepository = {
  getMunicipalProfile: () => MUNICIPAL_PROFILE,
  getSources: () => DATA_SOURCES,
  getSourcesByIds,
  getBarangays: () => BARANGAYS,
  getBarangayBySlug: (slug: string) => BARANGAYS.find((b) => b.slug === slug),
  getOffices: () => GOVERNMENT_OFFICES,
  getOfficeById: (id: string) => GOVERNMENT_OFFICES.find((o) => o.id === id),
  getOfficials: () => GOVERNMENT_OFFICIALS,
  getOfficialsByOffice: (officeId: string) => GOVERNMENT_OFFICIALS.filter((o) => o.officeId === officeId),
  getServices: () => MUNICIPAL_SERVICES,
  getServiceBySlug: (slug: string) => MUNICIPAL_SERVICES.find((s) => s.slug === slug),
  getServicesByOffice: (officeId: string) => MUNICIPAL_SERVICES.filter((s) => s.officeId === officeId),
  getTransparencySections: () => TRANSPARENCY_SECTIONS,
  getTransparencyLedger: () => TRANSPARENCY_LEDGER,
  getBudgetRecords: () => BUDGET_RECORDS,
  getProcurementRecords: () => PROCUREMENT_RECORDS,
  getProjects: () => INFRASTRUCTURE_PROJECTS,
  getOrdinances: () => ORDINANCES,
  getResolutions: () => RESOLUTIONS,
  getPublicDocuments: () => PUBLIC_DOCUMENTS,
  getAnnouncements: () => ANNOUNCEMENTS,

  getVerificationStats: () => {
    const allRecords = [
      ...BARANGAYS,
      ...GOVERNMENT_OFFICES,
      ...GOVERNMENT_OFFICIALS,
      ...MUNICIPAL_SERVICES,
      ...TRANSPARENCY_LEDGER,
      ...INFRASTRUCTURE_PROJECTS,
      ...ORDINANCES,
      ...RESOLUTIONS,
      ...PUBLIC_DOCUMENTS,
    ];
    return {
      total: allRecords.length,
      verified: allRecords.filter((r) => r.verificationStatus === 'Verified').length,
      needsReview: allRecords.filter((r) => r.verificationStatus === 'Needs Review').length,
      outdated: allRecords.filter((r) => r.verificationStatus === 'Outdated').length,
      unavailable: allRecords.filter((r) => r.verificationStatus === 'Unavailable').length,
    };
  },

  buildSearchIndex: (): SearchResultItem[] => {
    const items: SearchResultItem[] = [];

    for (const s of MUNICIPAL_SERVICES) {
      const office = GOVERNMENT_OFFICES.find((o) => o.id === s.officeId);
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

    for (const o of GOVERNMENT_OFFICES) {
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

    for (const off of GOVERNMENT_OFFICIALS) {
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

    for (const b of BARANGAYS) {
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

    for (const ord of ORDINANCES) {
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

    for (const res of RESOLUTIONS) {
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

    for (const proj of INFRASTRUCTURE_PROJECTS) {
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

    for (const doc of PUBLIC_DOCUMENTS) {
      items.push({
        id: doc.id,
        entityType: 'Document',
        title: doc.title,
        subtitle: `${doc.documentCategory} · ${doc.issuingAgency}`,
        route: `/ordinances?tab=documents`,
        verificationStatus: doc.verificationStatus,
        keywords: `${doc.title} ${doc.documentCategory} ${doc.issuingAgency} ${doc.description}`.toLowerCase(),
      });
    }

    return items;
  },

  searchAll: (query: string, entityFilter?: string): SearchResultItem[] => {
    const trimmed = query.trim().toLowerCase();
    const index = CivicRepository.buildSearchIndex();
    return index.filter((item) => {
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

  exportFullDatasetJson: () => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        platform: 'BetterAlcala',
        disclaimer:
          'Independent civic transparency dataset for Alcala, Pangasinan. Records marked Needs Review or Unavailable require official LGU/agency confirmation.',
        sources: DATA_SOURCES,
        municipality: MUNICIPAL_PROFILE,
        barangays: BARANGAYS,
        offices: GOVERNMENT_OFFICES,
        officials: GOVERNMENT_OFFICIALS,
        services: MUNICIPAL_SERVICES,
        transparencyLedger: TRANSPARENCY_LEDGER,
        budgetRecords: BUDGET_RECORDS,
        procurementRecords: PROCUREMENT_RECORDS,
        infrastructureProjects: INFRASTRUCTURE_PROJECTS,
        ordinances: ORDINANCES,
        resolutions: RESOLUTIONS,
        publicDocuments: PUBLIC_DOCUMENTS,
        announcements: ANNOUNCEMENTS,
      },
      null,
      2
    );
  },
};
