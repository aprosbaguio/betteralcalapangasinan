import { Announcement } from '../types/civic';

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-betteralcala-launch',
    slug: 'betteralcala-open-data-baseline-release',
    title: 'BetterAlcala Publishes Initial Civic Data Baseline & Verification Standards',
    titleFil: 'Inilathala ng BetterAlcala ang Paunang Datos at Pamantayan sa Beripikasyon',
    originType: 'BetterAlcala Project Update',
    category: 'Platform Transparency',
    publishedDate: '2026-11-20',
    summary:
      'Independent launch baseline incorporating PSA 2020 Census records for all 21 barangays, provincial historical records, COA archive pointers, and explicit awaiting-verification flags.',
    body: [
      'BetterAlcala has published its initial civic reference platform for the Municipality of Alcala, Pangasinan, modeled after the BetterGov.ph open-source civic transparency initiative.',
      'In accordance with our strict anti-fabrication policy, only data confirmed by primary national or provincial sources (such as PSA 2020 Census counts totaling 48,908 residents across 21 barangays and Sangguniang Panlalawigan legislative review records) is marked Verified or Needs Review.',
      'Fields requiring primary municipal records—such as Alcala’s latest Citizen’s Charter fee schedules, direct office phone lines, FY 2026 budget line items, and post-May 2025 official rosters—are explicitly labeled Awaiting Verification until official documents are acquired.',
    ],
    createdAt: '2026-11-20',
    updatedAt: '2026-11-20',
    sourceIds: ['src-psa-2020', 'src-pangasinan-gov'],
    verificationStatus: 'Verified',
  },
  {
    id: 'ann-charter-call',
    slug: 'call-for-official-alcala-citizens-charter-and-ordinances',
    title: 'Community & Researcher Call: Verifying Alcala’s Latest Citizen’s Charter and SB PDFs',
    titleFil: 'Panawagan para sa Beripikasyon ng Citizen’s Charter at mga Ordinansa ng Alcala',
    originType: 'BetterAlcala Project Update',
    category: 'Public Consultation',
    publishedDate: '2026-11-20',
    summary:
      'How residents, civil society volunteers, and local researchers can submit verifiable government document copies or corrections.',
    body: [
      'To complete exact service fee tables, processing timeframes, and ordinance PDF archives without guesswork, BetterAlcala invites civic volunteers and researchers to share publicly posted official copies of Alcala’s Citizen’s Charter, Sangguniang Bayan ordinances, and DILG Full Disclosure Policy postings.',
      'All submissions undergo source verification against official issuing agencies (Municipality of Alcala, Province of Pangasinan, COA, DBM, BLGF, PSA, PhilGEPS, or DPWH) before status updates are published.',
    ],
    createdAt: '2026-11-20',
    updatedAt: '2026-11-20',
    sourceIds: ['src-alcala-charter'],
    verificationStatus: 'Verified',
  },
  {
    id: 'ann-official-lgu-feed-pending',
    slug: 'official-lgu-advisory-feed-awaiting-verification',
    title: 'Official Municipal Government Advisories & Calamity Notices (Awaiting Direct LGU Feed)',
    titleFil: 'Opisyal na mga Anunsyo ng Pamahalaang Bayan (Naghihintay ng Direktang Pinagmulan)',
    originType: 'Official Government Advisory',
    category: 'Government Announcement',
    publishedDate: '2026-11-20',
    summary:
      'BetterAlcala does not mirror unverified social media posts as official advisories. Direct LGU bulletin verification is pending.',
    body: [
      'Official municipal advisories—such as tax payment deadlines, MDRRMO Agno River flood alerts, class suspensions, and municipal health vaccination schedules—will only be republished in this feed once confirmed from an official Municipality of Alcala or MDRRMO / Provincial Government of Pangasinan issuance.',
      'For urgent advisories or official deadlines, residents should consult Alcala Municipal Hall notice boards, their Barangay Hall, or the Provincial Government of Pangasinan official portal.',
    ],
    createdAt: '2026-11-20',
    updatedAt: '2026-11-20',
    sourceIds: ['src-pangasinan-gov', 'src-alcala-charter'],
    verificationStatus: 'Unavailable',
  },
];
