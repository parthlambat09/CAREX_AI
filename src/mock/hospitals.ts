export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  location: string;
  type: string;
  totalBeds: number;
  icuBeds: number;
  activePatientsCount: number;
  units: string[];
}

export const HOSPITALS: Hospital[] = [
  {
    id: 'aiims',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    shortName: 'AIIMS',
    location: 'New Delhi, DL',
    type: 'Level 1 Apex Trauma & Quaternary Critical Care',
    totalBeds: 500,
    icuBeds: 30,
    activePatientsCount: 24,
    units: ['ICU — General', 'ICU — Cardiac', 'ICU — Neuro', 'ICU — Surgical', 'ICU — Trauma'],
  },
  {
    id: 'gmc',
    name: 'Government Medical College (GMC)',
    shortName: 'GMC',
    location: 'Mumbai, MH',
    type: 'Academic Emergency & Surgical ICU Center',
    totalBeds: 420,
    icuBeds: 22,
    activePatientsCount: 18,
    units: ['ICU — General', 'ICU — Surgical', 'ICU — Burn Unit'],
  },
  {
    id: 'igmc',
    name: 'Indira Gandhi Medical College (IGMC)',
    shortName: 'IGMC',
    location: 'Shimla, HP',
    type: 'Regional Tertiary & Critical Care Institute',
    totalBeds: 350,
    icuBeds: 18,
    activePatientsCount: 14,
    units: ['ICU — General', 'ICU — Respiratory', 'ICU — Surgical'],
  },
  {
    id: 'sevenstar',
    name: 'Sevenstar Hospital',
    shortName: 'Sevenstar Hospital',
    location: 'Nagpur, MH',
    type: 'Specialized Cardiovascular & Multi-Organ ICU',
    totalBeds: 320,
    icuBeds: 16,
    activePatientsCount: 12,
    units: ['ICU — Cardiac', 'ICU — Cardiothoracic Surgical', 'ICU — ECMO Unit'],
  },
  {
    id: 'wockhardt',
    name: 'Wockhardt Hospital',
    shortName: 'Wockhardt Hospital',
    location: 'Bengaluru, KA',
    type: 'Advanced Surgical & Neuro ICU Center',
    totalBeds: 300,
    icuBeds: 15,
    activePatientsCount: 10,
    units: ['ICU — Neuro', 'ICU — Surgical', 'ICU — Transplant Unit'],
  },
];
