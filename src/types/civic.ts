export type VerificationStatus = 'Verified' | 'Needs Review' | 'Outdated' | 'Unavailable';

export type LanguageCode = 'en' | 'fil';

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  sourceIds: string[];
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
}

export interface DataSource {
  id: string;
  title: string;
  agency: string;
  originalUrl: string | null;
  documentType:
    | 'Census & Geographic Dataset'
    | 'Provincial Official Portal'
    | 'Audit Report Archive'
    | 'Legislative Review Record'
    | 'National Statutory Framework'
    | 'Financial & Disclosure Portal'
    | 'Municipal Citizen Charter'
    | 'Procurement Registry';
  publicationDate: string;
  dateRetrieved: string;
  lastVerifiedDate: string;
  verificationStatus: VerificationStatus;
  notes?: string;
}

export interface MunicipalProfile extends BaseRecord {
  name: string;
  province: string;
  region: string;
  legislativeDistrict: string;
  psgcCode: string;
  zipCode: string;
  municipalHallAddress: string;
  coordinates: {
    lat: number;
    lng: number;
    label: string;
  };
  foundingDate: string;
  foundingDecree: string;
  formerName: string;
  motherTown: string;
  barangayCount: number;
  population2020: number;
  populationDensityPerSqKm: number;
  landAreaSqKm: {
    psaPhilAtlas: number;
    provincialProfile: number;
    varianceNote: string;
  };
  incomeClassification: {
    reportedClass: string;
    note: string;
  };
  majorWaterway: string;
  majorIndustries: string[];
  culturalFestival: {
    name: string;
    month: string;
    description: string;
  };
  overview: string;
  overviewFil: string;
  historicalSummary: string[];
  geographicNotes: string[];
  demographicHighlights: {
    label: string;
    value: string;
    sourceId: string;
    status: VerificationStatus;
  }[];
}

export interface Barangay extends BaseRecord {
  slug: string;
  name: string;
  alternateSpelling?: string;
  psgcCode: string;
  population2020: number;
  populationSharePercent: number;
  classification: 'Poblacion / Urban Center' | 'Rural / Agricultural' | 'Awaiting Classification';
  geographicNotes: string;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  punongBarangay: string | null;
  barangayCouncilNote: string;
  contactNumber: string | null;
  barangayHallLocation: string;
  facilities: string[];
  serviceNotes: string;
}

export interface GovernmentOffice extends BaseRecord {
  slug: string;
  name: string;
  nameFil: string;
  acronym: string;
  branch: 'Executive' | 'Legislative' | 'Mandatory LGU Department' | 'Specialized / Local Unit';
  description: string;
  mandateBasis: string;
  officeHead: string | null;
  address: string;
  contactPhone: string | null;
  contactEmail: string | null;
  operatingHours: string;
  serviceSlugs: string[];
}

export interface GovernmentOfficial extends BaseRecord {
  fullName: string;
  roleTitle: string;
  officeId: string;
  branch: 'Executive' | 'Legislative';
  termPeriod: string;
  committeeAssignments?: string[];
  termConfirmationNote: string;
}

export type ServiceCategory =
  | 'Civil Registration'
  | 'Business Permits and Licensing'
  | 'Taxation and Treasury'
  | 'Property Assessment'
  | 'Health Services'
  | 'Social Welfare'
  | 'Agriculture'
  | 'Building and Construction'
  | 'Employment Assistance'
  | 'Disaster Risk Reduction'
  | 'Senior Citizen Services'
  | 'PWD Services'
  | 'Solo Parent Services';

export interface MunicipalService extends BaseRecord {
  slug: string;
  title: string;
  titleFil: string;
  category: ServiceCategory;
  officeId: string;
  summary: string;
  summaryFil: string;
  legalBasis: string;
  eligibility: string[];
  documentaryRequirements: string[];
  procedureSteps: string[];
  processingTime: string;
  applicableFees: string;
  officeLocation: string;
  contactInfo: string;
  downloadableFormsNote: string;
  charterVerificationNote: string;
}

export type TransparencySectionKey =
  | 'annual-budgets'
  | 'aip'
  | 'app'
  | 'sre'
  | 'financial-statements'
  | 'coa-audit'
  | 'nta'
  | 'procurement'
  | 'public-expenditures'
  | 'development-programs';

export interface TransparencyLedgerItem extends BaseRecord {
  section: TransparencySectionKey;
  fiscalYear: number;
  title: string;
  reportingPeriod: string;
  documentType: string;
  summary: string;
  amountLabel: string;
  portalName: string;
  portalUrl: string | null;
  recordAvailability: 'Verified Public Reference' | 'Awaiting Official LGU Document';
}

export interface BudgetRecord extends BaseRecord {
  fiscalYear: number;
  category: string;
  recordType: 'Approved Budget' | 'Obligation' | 'Disbursement' | 'Actual Expenditure' | 'NTA Share';
  reportingPeriod: string;
  amountPhp: number | null;
  amountDisplay: string;
  notes: string;
}

export interface ProcurementRecord extends BaseRecord {
  fiscalYear: number;
  referenceNumber: string | null;
  projectTitle: string;
  procuringOfficeId: string;
  procurementMode: string;
  approvedBudgetPhp: number | null;
  contractAmountPhp: number | null;
  awardee: string | null;
  status: 'Awaiting PhilGEPS Verification' | 'Published' | 'Completed';
}

export interface InfrastructureProject extends BaseRecord {
  slug: string;
  title: string;
  description: string;
  implementingAgency: string;
  location: string;
  barangaySlug: string | null;
  projectCostLabel: string;
  fundingSource: string;
  contractor: string | null;
  status: 'Awaiting Verification' | 'Verified Reference' | 'Planning / Proposed' | 'Ongoing' | 'Completed';
  startDate: string | null;
  completionDate: string | null;
  procurementReference: string | null;
  coordinates: {
    lat: number;
    lng: number;
    precision: 'Municipal Center Reference' | 'Verified Site Coordinate';
  } | null;
}

export interface Ordinance extends BaseRecord {
  slug: string;
  ordinanceNumber: string;
  title: string;
  description: string;
  dateApproved: string;
  issuingBody: string;
  reviewBody?: string;
  category:
    | 'Public Safety & Order'
    | 'Social Welfare & Youth'
    | 'Labor & Local Economy'
    | 'Governance & Administration'
    | 'Health & Sanitation'
    | 'Finance & Taxation';
  year: number;
  pdfAttachmentUrl: string | null;
}

export interface Resolution extends BaseRecord {
  slug: string;
  resolutionNumber: string;
  title: string;
  description: string;
  dateApproved: string;
  issuingBody: string;
  category: string;
  year: number;
  pdfAttachmentUrl: string | null;
}

export interface Announcement extends BaseRecord {
  slug: string;
  title: string;
  titleFil: string;
  originType: 'Official Government Advisory' | 'BetterAlcala Project Update';
  category:
    | 'Government Announcement'
    | 'Public Advisory'
    | 'Community Program'
    | 'Public Consultation'
    | 'Important Deadline'
    | 'Disaster Advisory'
    | 'Platform Transparency';
  publishedDate: string;
  summary: string;
  body: string[];
}

export interface PublicDocument extends BaseRecord {
  title: string;
  documentCategory: 'Ordinance' | 'Resolution' | 'Audit Report' | 'Budget & Finance' | 'Citizen Charter' | 'Census Dataset';
  fiscalYear: number | null;
  issuingAgency: string;
  format: string;
  fileUrl: string | null;
  description: string;
}

export interface SearchResultItem {
  id: string;
  entityType:
    | 'Service'
    | 'Office'
    | 'Official'
    | 'Barangay'
    | 'Ordinance'
    | 'Resolution'
    | 'Project'
    | 'Document';
  title: string;
  subtitle: string;
  route: string;
  verificationStatus: VerificationStatus;
  keywords: string;
}
