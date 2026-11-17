export type TaskPriority = 'high' | 'medium' | 'routine';
export type TaskCategory = 'medication' | 'vitals' | 'assessment' | 'hygiene' | 'lab';

export interface NurseTask {
  id: string;
  patientId: string;
  bed: string;
  title: string;
  description: string;
  dueTime: string;
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  assignedNurseId: string;
}

export const INITIAL_NURSE_TASKS: NurseTask[] = [
  {
    id: 'TASK-101',
    patientId: 'ICU-100',
    bed: 'Bed B10',
    title: 'Administer IV Norepinephrine Infusion Titration',
    description: 'Titrate at 0.05 mcg/kg/min to maintain target Mean Arterial Pressure (MAP) ≥ 65 mmHg.',
    dueTime: '10:30 AM',
    priority: 'high',
    category: 'medication',
    completed: false,
    assignedNurseId: 'RN-101',
  },
  {
    id: 'TASK-102',
    patientId: 'ICU-100',
    bed: 'Bed B10',
    title: 'Q1H Vitals & Arterial Blood Gas (ABG) Check',
    description: 'Verify PaO2/FiO2 ratio, lactate level, and check arterial line wave transducer calibration.',
    dueTime: '11:00 AM',
    priority: 'high',
    category: 'vitals',
    completed: false,
    assignedNurseId: 'RN-101',
  },
  {
    id: 'TASK-103',
    patientId: 'ICU-100',
    bed: 'Bed B10',
    title: 'Aspiration Risk & Endotracheal Tube Cuff Pressure Check',
    description: 'Maintain cuff pressure between 20-30 cmH2O and perform oral chlorhexidine swab.',
    dueTime: '12:00 PM',
    priority: 'medium',
    category: 'hygiene',
    completed: true,
    assignedNurseId: 'RN-101',
  },
  {
    id: 'TASK-104',
    patientId: 'ICU-102',
    bed: 'Bed A3',
    title: 'Send STAT Blood Cultures & Serum Lactate',
    description: 'Draw peripheral and central line blood cultures prior to second dose of IV Piperacillin/Tazobactam.',
    dueTime: '11:15 AM',
    priority: 'high',
    category: 'lab',
    completed: false,
    assignedNurseId: 'RN-101',
  },
  {
    id: 'TASK-105',
    patientId: 'ICU-102',
    bed: 'Bed A3',
    title: 'Urine Output & Fluid Balance Calculation',
    description: 'Record hourly urinary drainage and calculate cumulative net balance for attending rounds.',
    dueTime: '12:30 PM',
    priority: 'routine',
    category: 'assessment',
    completed: false,
    assignedNurseId: 'RN-101',
  },
  {
    id: 'TASK-106',
    patientId: 'ICU-101',
    bed: 'Bed B7',
    title: 'Post-Extubation Nebulization & Incentive Spirometry',
    description: 'Deliver Salbutamol nebulization 2.5mg and coach deep breathing exercises.',
    dueTime: '10:45 AM',
    priority: 'medium',
    category: 'medication',
    completed: false,
    assignedNurseId: 'RN-102',
  },
  {
    id: 'TASK-107',
    patientId: 'ICU-103',
    bed: 'Bed A4',
    title: 'Central Venous Catheter Dressing Change',
    description: 'Perform aseptic site inspection, apply biopatch, and secure sterile transparent dressing.',
    dueTime: '01:00 PM',
    priority: 'routine',
    category: 'hygiene',
    completed: false,
    assignedNurseId: 'RN-102',
  },
];
