import { ICU_NURSES, Nurse } from '@/features/doctor/mock/nurses';
import type { Patient } from '@/types/doctor';

export interface NurseAssignmentMap {
  [nurseId: string]: string[]; // nurseId -> patientIds
}

// Assignment map for each nurse ID to their assigned ICU patient IDs
export const NURSE_ASSIGNMENTS: NurseAssignmentMap = {
  'NUR-2048': Array.from({ length: 60 }, (_, i) => `P-${String(i + 1).padStart(3, '0')}`),
  'RN-101': Array.from({ length: 15 }, (_, i) => `P-${String(i + 1).padStart(3, '0')}`), // Critical (P-001 .. P-015)
  'RN-102': Array.from({ length: 15 }, (_, i) => `P-${String(i + 16).padStart(3, '0')}`), // Unstable (P-016 .. P-030)
  'RN-103': Array.from({ length: 20 }, (_, i) => `P-${String(i + 31).padStart(3, '0')}`), // Stable (P-031 .. P-050)
  'RN-104': Array.from({ length: 10 }, (_, i) => `P-${String(i + 51).padStart(3, '0')}`), // Recovering (P-051 .. P-060)
  'RN-105': ['P-001', 'P-002', 'P-003', 'P-004', 'P-005', 'P-006'],
  'RN-106': ['P-007', 'P-008', 'P-009', 'P-010', 'P-011', 'P-012'],
  'RN-107': ['P-013', 'P-014', 'P-015', 'P-016', 'P-017', 'P-018'],
  'RN-108': ['P-019', 'P-020', 'P-021', 'P-022', 'P-023', 'P-024'],
};

export function getNurseById(nurseId: string): Nurse | undefined {
  return ICU_NURSES.find((n) => n.id === nurseId) || ICU_NURSES[0];
}

export function getNurseAssignedPatientIds(nurseId: string): string[] {
  return NURSE_ASSIGNMENTS[nurseId] || Array.from({ length: 60 }, (_, i) => `P-${String(i + 1).padStart(3, '0')}`);
}

export function filterPatientsForNurse(nurseId: string, allPatients: Patient[]): Patient[] {
  const allowedIds = new Set(getNurseAssignedPatientIds(nurseId));
  const res = allPatients.filter((p) => allowedIds.has(p.id));
  return res.length > 0 ? res : allPatients;
}

export function isPatientAssignedToNurse(nurseId: string, patientId: string): boolean {
  const allowedIds = new Set(getNurseAssignedPatientIds(nurseId));
  return allowedIds.has(patientId);
}
