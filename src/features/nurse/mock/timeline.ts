export interface CareTimelineItem {
  id: string;
  patientId: string;
  time: string;
  type: 'vitals' | 'medication' | 'doctor_round' | 'nurse_note' | 'alert' | 'procedure';
  title: string;
  description: string;
  performedBy: string;
}

export const NURSE_CARE_TIMELINES: Record<string, CareTimelineItem[]> = {
  'ICU-100': [
    {
      id: 'EV-100-1',
      patientId: 'ICU-100',
      time: '10:00 AM',
      type: 'vitals',
      title: 'Vitals Logged — Telemetry Sync',
      description: 'HR 112 bpm (Sinus Tachycardia), SpO2 89%, BP 161/80 mmHg, RR 30/min, Temp 38.1°C.',
      performedBy: 'Elena Rostova, BSN (Charge Nurse)',
    },
    {
      id: 'EV-100-2',
      patientId: 'ICU-100',
      time: '09:30 AM',
      type: 'medication',
      title: 'IV Norepinephrine Titration Increased',
      description: 'Increased infusion rate to 0.08 mcg/kg/min due to transient MAP drop to 61 mmHg.',
      performedBy: 'Elena Rostova, BSN (Charge Nurse)',
    },
    {
      id: 'EV-100-3',
      patientId: 'ICU-100',
      time: '09:00 AM',
      type: 'doctor_round',
      title: 'Attending Physician ICU Rounds',
      description: 'Dr. Rajesh Sharma evaluated high AI sepsis risk score (84%). Ordered repeat ABG and fluid challenge.',
      performedBy: 'Dr. Rajesh Sharma, MD, FCCM',
    },
    {
      id: 'EV-100-4',
      patientId: 'ICU-100',
      time: '08:15 AM',
      type: 'nurse_note',
      title: 'Nursing Shift Handover Completed',
      description: 'SBAR handover received from night shift. Endotracheal suctioning performed; clear secretions noted.',
      performedBy: 'Elena Rostova, BSN (Charge Nurse)',
    },
    {
      id: 'EV-100-5',
      patientId: 'ICU-100',
      time: '07:30 AM',
      type: 'medication',
      title: 'IV Ceftriaxone 2g Administered',
      description: 'Slow IV piggyback infusion completed with no adverse reaction noted.',
      performedBy: 'Elena Rostova, BSN (Charge Nurse)',
    },
  ],
  'ICU-102': [
    {
      id: 'EV-102-1',
      patientId: 'ICU-102',
      time: '09:45 AM',
      type: 'vitals',
      title: 'Vitals Recorded — Stable',
      description: 'HR 88 bpm, SpO2 96% on 2L NC, BP 124/76 mmHg, Temp 37.2°C.',
      performedBy: 'Elena Rostova, BSN (Charge Nurse)',
    },
    {
      id: 'EV-102-2',
      patientId: 'ICU-102',
      time: '08:30 AM',
      type: 'nurse_note',
      title: 'Morning Hygiene & Mobility Assessment',
      description: 'Assisted patient to sitting position in bedside cardiac chair for 30 minutes.',
      performedBy: 'Elena Rostova, BSN (Charge Nurse)',
    },
  ],
};

export function getTimelineForPatient(patientId: string): CareTimelineItem[] {
  return NURSE_CARE_TIMELINES[patientId] || [
    {
      id: `EV-DEF-${patientId}`,
      patientId,
      time: '08:00 AM',
      type: 'nurse_note',
      title: 'Bedside Care Initialized',
      description: 'Continuous monitoring active; baseline assessment documented.',
      performedBy: 'Assigned Bedside Nurse',
    },
  ];
}
