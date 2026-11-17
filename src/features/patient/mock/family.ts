export interface FamilyAccount {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  linkedPatientId: string;
  patientName: string;
  roomBed: string;
}

export const FAMILY_ACCOUNTS: FamilyAccount[] = [
  {
    id: 'FAM-8821',
    name: 'Sunita Bhat',
    relationship: 'Spouse',
    phone: '+91 98765 43210',
    linkedPatientId: 'PAT-3092',
    patientName: 'Vikram Bhat',
    roomBed: 'ICU Bed B10',
  },
  {
    id: 'FAM-100',
    name: 'Priya Sharma',
    relationship: 'Spouse',
    phone: '+91 98765 12345',
    linkedPatientId: 'ICU-100',
    patientName: 'Aarav Sharma',
    roomBed: 'Bed 07 — Pod A',
  },
];

export const CURRENT_FAMILY_ACCOUNT: FamilyAccount = FAMILY_ACCOUNTS[0];
