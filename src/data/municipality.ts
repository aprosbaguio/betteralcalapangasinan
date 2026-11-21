import { MunicipalProfile } from '../types/civic';

export const MUNICIPAL_PROFILE: MunicipalProfile = {
  id: 'alcala-pangasinan-profile',
  createdAt: '2026-11-20',
  updatedAt: '2026-11-20',
  sourceIds: ['src-psa-2020', 'src-pangasinan-gov'],
  verificationStatus: 'Verified',
  verificationNotes:
    'Core demographic and geographic facts verified via PSA 2020 Census and Pangasinan Provincial Government; land area dataset variance and income reclassification are transparently noted.',
  name: 'Municipality of Alcala',
  province: 'Pangasinan',
  region: 'Ilocos Region (Region I)',
  legislativeDistrict: '5th Legislative District of Pangasinan',
  psgcCode: '0105504000',
  zipCode: '2425',
  municipalHallAddress: 'Carmen–Alcala Road / Santo Tomas–Alcala National Highway, Alcala, 2425 Pangasinan',
  coordinates: {
    lat: 15.847,
    lng: 120.523,
    label: 'Municipal Center Reference (Alcala Poblacion)',
  },
  foundingDate: 'September 20, 1875',
  foundingDecree: 'Spanish Royal Decree No. 682',
  formerName: 'Barrio Dangla',
  motherTown: 'Bayambang, Pangasinan',
  barangayCount: 21,
  population2020: 48908,
  populationDensityPerSqKm: 1070,
  landAreaSqKm: {
    psaPhilAtlas: 45.71,
    provincialProfile: 55.08,
    varianceNote:
      'PSA/PhilAtlas spatial boundary records list 45.71 km², whereas the Pangasinan Provincial Profile reports 5,508 hectares (55.08 km²). Requires Cadastral Survey confirmation from NAMRIA / Municipal Assessor.',
  },
  incomeClassification: {
    reportedClass: '3rd Class Municipality (historical classification; recent updates cite reclassification review)',
    note: 'Official provincial and DTI profiles list Alcala as a 3rd-class municipality, while some directories cite 4th-class or 1st-class transition under updated DOF Department Order brackets. Marked Needs Review pending latest BLGF/DOF official bracket certificate.',
  },
  majorWaterway: 'Agno River Basin',
  majorIndustries: [
    'Paddy Rice Cultivation',
    'Corn & Yellow Maize Production',
    'Tobacco Farming',
    'Livestock & Poultry',
    'Agricultural Cooperatives & Local Trade',
  ],
  culturalFestival: {
    name: 'Turak Festival',
    month: 'September',
    description:
      'Annual music and founding anniversary celebration commemorating the establishment of Alcala as an independent municipality on September 20, 1875.',
  },
  overview:
    'Alcala is a landlocked agricultural municipality situated in the eastern-central plains of Pangasinan along the Agno River basin and the 5th Legislative District corridor. Subdivided into 21 barangays under PSGC code 0105504000, it recorded 48,908 residents in the 2020 Philippine Statistics Authority (PSA) Census.',
  overviewFil:
    'Ang Alcala ay isang landlocked na bayang pang-agrikultura sa lalawigan ng Pangasinan na matatagpuan malapit sa Agno River basin at kabilang sa Ika-5 Distrito ng Pangasinan. Binubuo ito ng 21 barangay (PSGC 0105504000) na may populasyong 48,908 ayon sa 2020 PSA Census.',
  historicalSummary: [
    'Before gaining municipal independence, the settlement was known as “Dangla,” named after a medicinal shrub that grew abundantly across the plain, and existed as a barrio of Bayambang.',
    'Early settlers were predominantly migrants from the Ilocos provinces who traveled overland using animal-drawn carts and cultivated the fertile river valley.',
    'Following a resident petition filed on April 1, 1873, the Spanish Crown promulgated Royal Decree No. 682 on September 20, 1875, separating Dangla from Bayambang and establishing it as the independent Municipality of Alcala.',
  ],
  geographicNotes: [
    'Located in Region I (Ilocos Region), Province of Pangasinan, roughly along the Carmen–Alcala and Santo Tomas–Alcala highway corridors.',
    'Topography consists primarily of flat, fertile alluvial lowlands within the Agno River watershed, making the municipality suited to irrigated rice, corn, and tobacco agriculture while subjecting river-adjacent barangays to seasonal flood dynamics.',
    'Administrative jurisdiction encompasses 21 barangays, anchored commercially and civically by Poblacion East and Poblacion West.',
  ],
  demographicHighlights: [
    {
      label: 'Total Population (2020 PSA Census)',
      value: '48,908',
      sourceId: 'src-psa-2020',
      status: 'Verified',
    },
    {
      label: 'Official Barangays (PSGC)',
      value: '21',
      sourceId: 'src-psa-2020',
      status: 'Verified',
    },
    {
      label: 'PSGC Municipal Code',
      value: '0105504000',
      sourceId: 'src-psa-2020',
      status: 'Verified',
    },
    {
      label: 'Most Populous Barangay (2020)',
      value: 'San Vicente (4,383)',
      sourceId: 'src-psa-2020',
      status: 'Verified',
    },
    {
      label: 'Least Populous Barangay (2020)',
      value: 'Curareng (881)',
      sourceId: 'src-psa-2020',
      status: 'Verified',
    },
    {
      label: '2025 Census / Projected Population',
      value: 'Awaiting PSA Release',
      sourceId: 'src-psa-2020',
      status: 'Unavailable',
    },
  ],
};
