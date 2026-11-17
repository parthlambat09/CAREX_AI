export type PatientStatus = 'Critical' | 'Unstable' | 'Elevated' | 'Stable' | 'Recovering' | 'critical' | 'elevated' | 'caution' | 'stable';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface TelemetryData {
  HR: number;
  SBP: number;
  O2Sat: number;
  overall_risk: number;
}

export interface Vitals {
  heartRate: number;
  spo2: number;
  respiratoryRate: number;
  systolic: number;
  diastolic: number;
  temperature: number;
}

export interface RiskPrediction {
  overall: number;
  sepsis: number;
  cardiacArrest: number;
  respiratoryFailure: number;
  mortality: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ContributingFactor {
  label: string;
  contribution: number; // 0-100
  detail: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  type: 'vital' | 'lab' | 'medication' | 'alert' | 'observation';
  title: string;
  description: string;
}

export type ECGRhythm = 'normal sinus rhythm' | 'sinus tachycardia' | 'atrial fibrillation' | 'bradycardia';

export interface Patient {
  id: string;
  bed: string;
  room?: string;
  name: string;
  age: number;
  sex: 'M' | 'F';
  gender?: string;
  department?: string;
  diagnosis: string;
  admittedDays: number;
  status: PatientStatus;
  telemetry?: TelemetryData;
  vitals: Vitals;
  risk: RiskPrediction;
  factors: ContributingFactor[];
  timeline: TimelineEvent[];
  lastUpdated: number;
  hospitalId?: string;
  admittingDoctor?: string;
  discharged?: boolean;
  ecgRhythm: ECGRhythm;
  sepsisScore: number;
  medications: string[];
  labs: string[];
  observations: string[];
}

export type AlertCategory =
  | 'critical_deterioration'
  | 'sepsis_risk'
  | 'cardiac_arrest_risk'
  | 'respiratory_failure_risk'
  | 'abnormal_vitals'
  | 'drug_interaction'
  | 'escalation_required';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  patientId: string;
  bed: string;
  category: AlertCategory;
  severity: AlertSeverity;
  time: string;
  riskScore: number;
  reason: string;
  recommendation: string;
  acknowledged: boolean;
}

export interface NotificationChannel {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

export interface KPIData {
  totalPatients: number;
  criticalPatients: number;
  highRiskPatients: number;
  icuOccupancy: number;
  activeAlerts: number;
  avgLengthOfStay: number;
  mortalityRiskTrend: number[];
}
