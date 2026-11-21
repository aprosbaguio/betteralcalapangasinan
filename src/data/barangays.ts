import { Barangay } from '../types/civic';

const TOTAL_POPULATION_2020 = 48908;

const rawBarangays: Array<{
  name: string;
  alternateSpelling?: string;
  codeSuffix: string;
  population2020: number;
  classification: Barangay['classification'];
  geographicNotes: string;
}> = [
  {
    name: 'Anulid',
    codeSuffix: '001',
    population2020: 2594,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Agricultural barangay included in the 21 PSGC administrative subdivisions of Alcala.',
  },
  {
    name: 'Atainan',
    codeSuffix: '002',
    population2020: 1815,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Agricultural barangay in Alcala, Pangasinan.',
  },
  {
    name: 'Bersamin',
    codeSuffix: '003',
    population2020: 3679,
    classification: 'Rural / Agricultural',
    geographicNotes: 'One of the larger rural communities in Alcala by 2020 Census population.',
  },
  {
    name: 'Canarvacanan',
    codeSuffix: '004',
    population2020: 1968,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Agricultural barangay in Alcala, Pangasinan.',
  },
  {
    name: 'Caranglaan',
    codeSuffix: '005',
    population2020: 1340,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Agricultural barangay in Alcala, Pangasinan.',
  },
  {
    name: 'Curareng',
    codeSuffix: '006',
    population2020: 881,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Smallest barangay in Alcala by 2020 PSA Census population.',
  },
  {
    name: 'Gualsic',
    codeSuffix: '007',
    population2020: 1945,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Agricultural barangay in Alcala, Pangasinan.',
  },
  {
    name: 'Kisikis',
    alternateSpelling: 'Kasikis (PSA Census variant)',
    codeSuffix: '008',
    population2020: 3661,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Recorded as Kasikis in select PSA census tables; one of Alcala’s most populous barangays.',
  },
  {
    name: 'Laoac',
    codeSuffix: '009',
    population2020: 3829,
    classification: 'Rural / Agricultural',
    geographicNotes: 'High-population rural barangay in Alcala, Pangasinan.',
  },
  {
    name: 'Macayo',
    codeSuffix: '010',
    population2020: 2013,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Agricultural barangay in Alcala, Pangasinan.',
  },
  {
    name: 'Pindangan Centro',
    codeSuffix: '011',
    population2020: 1757,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Central cluster within the Pindangan barangay group.',
  },
  {
    name: 'Pindangan East',
    codeSuffix: '012',
    population2020: 1763,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Eastern cluster within the Pindangan barangay group.',
  },
  {
    name: 'Pindangan West',
    codeSuffix: '013',
    population2020: 1352,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Western cluster within the Pindangan barangay group.',
  },
  {
    name: 'Poblacion East',
    codeSuffix: '014',
    population2020: 1474,
    classification: 'Poblacion / Urban Center',
    geographicNotes: 'Forms part of the civic and commercial town center (Poblacion) of Alcala.',
  },
  {
    name: 'Poblacion West',
    codeSuffix: '015',
    population2020: 1783,
    classification: 'Poblacion / Urban Center',
    geographicNotes: 'Forms part of the civic and commercial town center (Poblacion) of Alcala.',
  },
  {
    name: 'San Juan',
    codeSuffix: '016',
    population2020: 2252,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Barangay in Alcala, Pangasinan.',
  },
  {
    name: 'San Nicolas',
    codeSuffix: '017',
    population2020: 1084,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Barangay in Alcala, Pangasinan.',
  },
  {
    name: 'San Pedro Apartado',
    codeSuffix: '018',
    population2020: 3924,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Third most populous barangay in Alcala per 2020 PSA Census.',
  },
  {
    name: 'San Pedro Ili',
    codeSuffix: '019',
    population2020: 4151,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Second most populous barangay in Alcala per 2020 PSA Census.',
  },
  {
    name: 'San Vicente',
    codeSuffix: '020',
    population2020: 4383,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Most populous barangay in Alcala per 2020 PSA Census (8.96% of municipal population).',
  },
  {
    name: 'Vacante',
    codeSuffix: '021',
    population2020: 1260,
    classification: 'Rural / Agricultural',
    geographicNotes: 'Barangay in Alcala, Pangasinan.',
  },
];

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const BARANGAYS: Barangay[] = rawBarangays.map((b) => ({
  id: `brgy-${toSlug(b.name)}`,
  slug: toSlug(b.name),
  name: b.name,
  alternateSpelling: b.alternateSpelling,
  psgcCode: `0105504${b.codeSuffix}`,
  population2020: b.population2020,
  populationSharePercent: Number(((b.population2020 / TOTAL_POPULATION_2020) * 100).toFixed(2)),
  classification: b.classification,
  geographicNotes: b.geographicNotes,
  coordinates: {
    lat: null,
    lng: null,
  },
  punongBarangay: null,
  barangayCouncilNote:
    'Barangay elected officials roster (2023 BSKE term) is currently awaiting verification against DILG / Comelec / Municipal Liga ng mga Barangay records.',
  contactNumber: null,
  barangayHallLocation: `Barangay Hall, ${b.name}, Alcala, Pangasinan (exact street coordinates awaiting verification)`,
  facilities: ['Barangay Hall (location awaiting coordinate verification)'],
  serviceNotes:
    'Standard Barangay Clearance, Certificate of Residency, Certificate of Indigency, and Lupong Tagapamayapa services are administered locally; exact barangay fees are awaiting verification.',
  createdAt: '2026-11-20',
  updatedAt: '2026-11-20',
  sourceIds: ['src-psa-2020', 'src-pangasinan-gov'],
  verificationStatus: 'Verified',
  verificationNotes:
    'Barangay name and 2020 population count verified via PSA 2020 Census. Official roster, coordinates, and contact details are marked Unavailable / Awaiting Verification.',
}));
