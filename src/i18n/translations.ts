import { LanguageCode } from '../types/civic';

export const UI_COPY: Record<
  LanguageCode,
  {
    independentNoticeTitle: string;
    independentNoticeBody: string;
    navServices: string;
    navDirectory: string;
    navTransparency: string;
    navBarangays: string;
    navRecords: string;
    searchPlaceholder: string;
    searchButton: string;
    heroKicker: string;
    heroTitle: string;
    heroSubtitle: string;
    exploreServices: string;
    viewTransparency: string;
    quickAccessTitle: string;
    municipalSnapshotTitle: string;
    verifiedLabel: string;
    needsReviewLabel: string;
    unavailableLabel: string;
    outdatedLabel: string;
    officialDisclaimerShort: string;
    languageLabel: string;
    allSectionsLabel: string;
    backToHome: string;
    sourceAttributionTitle: string;
  }
> = {
  en: {
    independentNoticeTitle: 'Independent Civic Initiative',
    independentNoticeBody:
      'BetterAlcala is an independent open-data project inspired by BetterGov.ph—NOT an official Municipality of Alcala website. Unverified records are labeled Awaiting Verification.',
    navServices: 'Services',
    navDirectory: 'Directory',
    navTransparency: 'Transparency',
    navBarangays: 'Barangays',
    navRecords: 'Explore',
    searchPlaceholder: 'Search services, 21 barangays, offices, ordinances...',
    searchButton: 'Search',
    heroKicker: 'Alcala, Pangasinan · PSGC 0105504000',
    heroTitle: 'Public information & transparency for Alcala.',
    heroSubtitle:
      'Searchable municipal services, offices, 21 barangays, ordinances, and public finance trackers—with strict source attribution.',
    exploreServices: 'Public Services',
    viewTransparency: 'Transparency Center',
    quickAccessTitle: 'Public Services',
    municipalSnapshotTitle: 'Verified Municipal Baseline',
    verifiedLabel: 'Verified',
    needsReviewLabel: 'Needs Review',
    unavailableLabel: 'Awaiting Verification',
    outdatedLabel: 'Outdated',
    officialDisclaimerShort: 'Independent civic site · Not an official LGU portal',
    languageLabel: 'Language',
    allSectionsLabel: 'Explore Sections',
    backToHome: 'Back to Home',
    sourceAttributionTitle: 'Sources & Verification',
  },
  fil: {
    independentNoticeTitle: 'Malayang Proyektong Civic',
    independentNoticeBody:
      'Ang BetterAlcala ay malayang open-data portal na hango sa BetterGov.ph—HINDI opisyal na website ng Alcala, Pangasinan. Minamarkahan ang datos na naghihintay ng beripikasyon.',
    navServices: 'Serbisyo',
    navDirectory: 'Direktoryo',
    navTransparency: 'Transparensya',
    navBarangays: 'Barangay',
    navRecords: 'Talaan',
    searchPlaceholder: 'Maghanap ng serbisyo, 21 barangay, opisina, ordinansa...',
    searchButton: 'Hanapin',
    heroKicker: 'Alcala, Pangasinan · PSGC 0105504000',
    heroTitle: 'Impormasyong pampubliko at malinaw na pamamahala.',
    heroSubtitle:
      'Gabay sa serbisyo ng munisipyo, direktoryo, 21 barangay, ordinansa, at pampublikong pondo—may malinaw na pinagmulan ng datos.',
    exploreServices: 'Mga Serbisyo',
    viewTransparency: 'Transparency Center',
    quickAccessTitle: 'Mga Serbisyong Pampubliko',
    municipalSnapshotTitle: 'Kumpirmadong Datos',
    verifiedLabel: 'Beripikado',
    needsReviewLabel: 'Kailangan ng Pagsusuri',
    unavailableLabel: 'Naghihintay ng Beripikasyon',
    outdatedLabel: 'Luma na ang Tala',
    officialDisclaimerShort: 'Malayang proyekto · Hindi opisyal na website ng LGU',
    languageLabel: 'Wika',
    allSectionsLabel: 'Mga Seksyon',
    backToHome: 'Bumalik sa Home',
    sourceAttributionTitle: 'Pinagmulan at Beripikasyon',
  },
};
