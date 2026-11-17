import type { Patient } from '@/types/doctor';
import rawPatients from '@/data/patients.json';

export const INITIAL_60_PATIENTS: Patient[] = (rawPatients.slice(0, 60) as Patient[]).map((p, i) => ({ ...p, status: i < 15 ? 'Critical' : i < 35 ? 'Elevated' : 'Stable' }));

