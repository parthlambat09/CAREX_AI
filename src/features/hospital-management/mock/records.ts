export interface ClinicalRecordEntry {
  id: string;
  patientId: string;
  patientName: string;
  bed: string;
  timestamp: string;
  recordedBy: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  respiratoryRate: number;
  spo2: number;
  temperature: number; // °C
  weightKg: number;
  bloodGlucoseMgDl: number;
  gcsScore: number; // Glasgow Coma Scale 3-15
  urineOutputMlHr: number;
  clinicalNotes: string;
}

export const INITIAL_CLINICAL_RECORDS: ClinicalRecordEntry[] = [
  {
    id: 'REC-101',
    patientId: 'ICU-100',
    patientName: 'Vikram Bhat',
    bed: 'Bed B10',
    timestamp: '2026-03-04 10:00 AM',
    recordedBy: 'Elena Rostova, BSN (Charge Nurse)',
    bloodPressureSystolic: 161,
    bloodPressureDiastolic: 80,
    respiratoryRate: 30,
    spo2: 89,
    temperature: 38.1,
    weightKg: 78.5,
    bloodGlucoseMgDl: 168,
    gcsScore: 11,
    urineOutputMlHr: 35,
    clinicalNotes: 'Persistent hypoxemia on SIMV mode; arterial line wave clean. Norepinephrine titrated.',
  },
  {
    id: 'REC-102',
    patientId: 'ICU-100',
    patientName: 'Vikram Bhat',
    bed: 'Bed B10',
    timestamp: '2026-03-04 08:00 AM',
    recordedBy: 'Elena Rostova, BSN (Charge Nurse)',
    bloodPressureSystolic: 155,
    bloodPressureDiastolic: 78,
    respiratoryRate: 28,
    spo2: 91,
    temperature: 38.4,
    weightKg: 78.5,
    bloodGlucoseMgDl: 174,
    gcsScore: 12,
    urineOutputMlHr: 40,
    clinicalNotes: 'Morning laboratory draws sent; blood cultures drawn before IV antibiotic administration.',
  },
  {
    id: 'REC-103',
    patientId: 'ICU-101',
    patientName: 'Sai Chawla',
    bed: 'Bed B7',
    timestamp: '2026-03-04 09:30 AM',
    recordedBy: 'Marcus Chen, RN',
    bloodPressureSystolic: 124,
    bloodPressureDiastolic: 76,
    respiratoryRate: 18,
    spo2: 97,
    temperature: 37.0,
    weightKg: 65.0,
    bloodGlucoseMgDl: 112,
    gcsScore: 15,
    urineOutputMlHr: 60,
    clinicalNotes: 'Post-extubation recovery smooth. Tolerating nasal cannula oxygen.',
  },
];
