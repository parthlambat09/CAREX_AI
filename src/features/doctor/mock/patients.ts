import { mulberry32, pick, randInt, randFloat } from '@/features/doctor/utils/rng';
import type {
  Patient,
  Alert,
  AlertCategory,
  ContributingFactor,
  PatientStatus,
  TimelineEvent,
} from '@/types/doctor';

const FIRST_NAMES = [
  'Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Ishaan', 'Sai', 'Krishna',
  'Arjun', 'Rajesh', 'Suresh', 'Priya', 'Sunita', 'Lakshmi', 'Pooja', 'Neha',
  'Kavita', 'Rohan', 'Aditya', 'Amit', 'Vikram', 'Meera', 'Shreya', 'Rahul',
];
const LAST_NAMES = [
  'Sharma', 'Patel', 'Verma', 'Gupta', 'Iyer', 'Nair', 'Deshmukh', 'Kulkarni',
  'Rao', 'Singh', 'Joshi', 'Mehta', 'Chatterji', 'Reddy', 'Pillai', 'Bhat',
  'Mukherji', 'Saxena', 'Chawla', 'Bhasin', 'Dutt', 'Sen', 'Dutta',
];
const DIAGNOSES = [
  'Post-cardiac surgery',
  'Septic shock',
  'Acute respiratory distress',
  'Post-operative recovery',
  'Intracranial hemorrhage',
  'Acute kidney injury',
  'Diabetic ketoacidosis',
  'Pneumonia with respiratory failure',
  'Multi-organ dysfunction',
  'Trauma recovery',
  'Stroke (ischemic)',
  'Acute liver failure',
];

const MEDICATIONS = [
  'Norepinephrine', 'Furosemide', 'Midazolam', 'Insulin (regular)',
  'Ceftriaxone', 'Heparin', 'Propofol', 'Fentanyl',
];
const LABS = [
  'Lactate 3.2 mmol/L (↑)', 'WBC 18.4 (↑)', 'Creatinine 2.1 mg/dL (↑)',
  'Platelets 88k (↓)', 'pH 7.31 (↓)', 'Troponin 0.14 (↑)',
  'Lactate 1.8 mmol/L (↑)', 'Bicarbonate 18 mmol/L (↓)',
];
const OBSERVATIONS = [
  'Patient responsive to verbal stimuli',
  'Nurse notes increased work of breathing',
  'Urine output decreased over last 2h',
  'Mentation improved after fluid bolus',
  'New onset atrial fibrillation on monitor',
  'Oxygenation improved after proning',
];

function statusFromRisk(risk: number): PatientStatus {
  if (risk >= 80) return 'critical';
  if (risk >= 65) return 'elevated';
  if (risk >= 40) return 'caution';
  return 'stable';
}

function buildFactors(rng: () => number, risk: number): ContributingFactor[] {
  const all: ContributingFactor[] = [
    { label: 'Increasing heart rate', contribution: 0, detail: 'HR trending upward over 4h window' },
    { label: 'Decreasing SpO2', contribution: 0, detail: 'Oxygen saturation falling below 94%' },
    { label: 'Increasing respiratory rate', contribution: 0, detail: 'RR elevated above 24 bpm' },
    { label: 'Abnormal blood pressure', contribution: 0, detail: 'MAP outside 65-110 mmHg' },
    { label: 'Recent abnormal lab values', contribution: 0, detail: 'Elevated lactate / abnormal CBC' },
    { label: 'Temperature deviation', contribution: 0, detail: 'Core temp outside 36.5-38.0°C' },
    { label: 'Age & comorbidity burden', contribution: 0, detail: 'Baseline risk from history' },
  ];

  const weights = all.map(() => randFloat(rng, 0.2, 1.0, 2));
  const sum = weights.reduce((a, b) => a + b, 0);
  return all
    .map((f, i) => ({
      ...f,
      contribution: Math.round((weights[i] / sum) * risk * 10) / 10,
    }))
    .sort((a, b) => b.contribution - a.contribution);
}

function buildTimeline(rng: () => number): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const now = Date.now();
  const types: TimelineEvent['type'][] = ['vital', 'lab', 'medication', 'alert', 'observation'];
  for (let i = 0; i < 8; i++) {
    const t = types[Math.floor(rng() * types.length)];
    const minsAgo = i * randInt(rng, 20, 90);
    const time = new Date(now - minsAgo * 60000).toISOString();
    let title = 'Vital trend change';
    let description = 'SpO2 decreased 2%';
    if (t === 'lab') {
      title = 'Lab result';
      description = pick(rng, LABS);
    } else if (t === 'medication') {
      title = 'Medication administered';
      description = `${pick(rng, MEDICATIONS)} — standard dose`;
    } else if (t === 'alert') {
      title = 'Alert generated';
      description = pick(rng, ['Risk score crossed threshold', 'Vital outside normal range']);
    } else if (t === 'observation') {
      title = 'Clinical observation';
      description = pick(rng, OBSERVATIONS);
    } else if (t === 'vital') {
      title = 'Vital trend change';
      description = pick(rng, ['HR increased 8 bpm', 'SpO2 decreased 2%', 'RR increased 4 bpm']);
    }
    events.push({ id: `ev-${i}-${Math.floor(rng() * 1e6)}`, time, type: t, title, description });
  }
  return events.sort((a, b) => +new Date(b.time) - +new Date(a.time));
}

function buildPatient(rng: () => number, idx: number, usedNames: Set<string>): Patient {
  const id = `ICU-${100 + idx}`;
  const bed = `${pick(rng, ['A', 'B', 'C'])}${randInt(rng, 1, 12)}`;
  
  let name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
  let attempts = 0;
  while (usedNames.has(name) && attempts < 100) {
    attempts++;
    name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
  }
  usedNames.add(name);

  const age = randInt(rng, 28, 84);
  const sex: 'M' | 'F' = rng() > 0.5 ? 'M' : 'F';
  const diagnosis = pick(rng, DIAGNOSES);
  const admittedDays = randInt(rng, 1, 18);
  const hospitalList = ['aiims', 'gmc', 'igmc', 'sevenstar', 'wockhardt'];
  const hospitalId = hospitalList[idx % hospitalList.length];

  const skew = idx % 8 < 2 ? randFloat(rng, 78, 96, 1) : idx % 8 < 5 ? randFloat(rng, 42, 74, 1) : randFloat(rng, 8, 40, 1);
  const overall = skew;
  const sepsis = clamp(overall + randFloat(rng, -15, 15, 1));
  const cardiacArrest = clamp(overall + randFloat(rng, -20, 10, 1));
  const respiratoryFailure = clamp(overall + randFloat(rng, -12, 18, 1));
  const mortality = clamp(overall + randFloat(rng, -25, 5, 1));
  const trend: 'up' | 'down' | 'stable' = overall > 60 ? (rng() > 0.3 ? 'up' : 'stable') : rng() > 0.5 ? 'down' : 'stable';

  const status = statusFromRisk(overall);
  const hrBase = status === 'critical' ? randInt(rng, 108, 132) : status === 'elevated' ? randInt(rng, 94, 108) : status === 'caution' ? randInt(rng, 82, 94) : randInt(rng, 64, 82);
  const spo2Base = status === 'critical' ? randInt(rng, 86, 92) : status === 'elevated' ? randInt(rng, 92, 94) : status === 'caution' ? randInt(rng, 94, 96) : randInt(rng, 96, 99);
  const rrBase = status === 'critical' ? randInt(rng, 24, 34) : status === 'elevated' ? randInt(rng, 20, 24) : status === 'caution' ? randInt(rng, 16, 20) : randInt(rng, 12, 16);
  const sysBase = status === 'critical' ? randInt(rng, 140, 175) : randInt(rng, 100, 140);
  const diaBase = status === 'critical' ? randInt(rng, 80, 105) : randInt(rng, 60, 85);
  const tempBase = status === 'critical' ? randFloat(rng, 38.0, 39.4, 1) : randFloat(rng, 36.4, 37.6, 1);

  let ecgRhythm: Patient['ecgRhythm'] = 'normal sinus rhythm';
  if (hrBase > 105) ecgRhythm = 'sinus tachycardia';
  else if (hrBase < 55) ecgRhythm = 'bradycardia';
  else if (overall > 75) ecgRhythm = 'atrial fibrillation';

  const pMeds = [pick(rng, MEDICATIONS), pick(rng, MEDICATIONS)];
  const pLabs = [pick(rng, LABS), pick(rng, LABS)];
  const pObs = [pick(rng, OBSERVATIONS), pick(rng, OBSERVATIONS)];

  return {
    id,
    bed,
    name,
    age,
    sex,
    diagnosis,
    admittedDays,
    status,
    hospitalId,
    vitals: {
      heartRate: hrBase,
      spo2: spo2Base,
      respiratoryRate: rrBase,
      systolic: sysBase,
      diastolic: diaBase,
      temperature: tempBase,
    },
    risk: { overall, sepsis, cardiacArrest, respiratoryFailure, mortality, trend },
    factors: buildFactors(rng, overall),
    timeline: buildTimeline(rng),
    lastUpdated: Date.now(),
    ecgRhythm,
    sepsisScore: sepsis,
    medications: Array.from(new Set(pMeds)),
    labs: Array.from(new Set(pLabs)),
    observations: Array.from(new Set(pObs)),
  };
}

function clamp(v: number): number {
  return Math.max(1, Math.min(99, Math.round(v * 10) / 10));
}

export function generatePatients(count = 32): Patient[] {
  const rng = mulberry32(42);
  const usedNames = new Set<string>();
  return Array.from({ length: count }, (_, i) => buildPatient(rng, i, usedNames));
}

const ALERT_REASONS: Record<AlertCategory, { reason: string; rec: string }> = {
  critical_deterioration: {
    reason: 'Multi-parameter deterioration detected across HR, SpO2, and RR',
    rec: 'Immediate bedside review recommended; consider rapid response activation',
  },
  sepsis_risk: {
    reason: 'qSOFA criteria trending positive; lactate elevated',
    rec: 'Review for sepsis bundle; consider blood cultures and broad-spectrum antibiotics',
  },
  cardiac_arrest_risk: {
    reason: 'Arrhythmia burden increasing; QTc prolonged',
    rec: 'Cardiology consult; review electrolytes and pro-arrhythmic medications',
  },
  respiratory_failure_risk: {
    reason: 'SpO2 trending downward; work of breathing increased',
    rec: 'Assess ventilator settings; consider escalation of respiratory support',
  },
  abnormal_vitals: {
    reason: 'Vital sign outside normal range sustained >10 min',
    rec: 'Confirm reading; review medication effects and fluid status',
  },
  drug_interaction: {
    reason: 'Potential interaction between QTc-prolonging agents',
    rec: 'Pharmacy review; consider alternative agent or dose adjustment',
  },
  escalation_required: {
    reason: 'Risk sustained above threshold without improvement',
    rec: 'Escalate to attending physician; document escalation in chart',
  },
};

export function generateAlerts(patients: Patient[]): Alert[] {
  const rng = mulberry32(7);
  const alerts: Alert[] = [];
  const cats: AlertCategory[] = [
    'critical_deterioration', 'sepsis_risk', 'cardiac_arrest_risk',
    'respiratory_failure_risk', 'abnormal_vitals', 'escalation_required',
  ];
  patients.forEach((p, i) => {
    if (p.risk.overall > 70 || (p.risk.overall > 50 && i % 2 === 0)) {
      const cat = pick(rng, cats);
      const sev = p.risk.overall > 80 ? 'critical' : p.risk.overall > 55 ? 'warning' : 'info';
      const meta = ALERT_REASONS[cat];
      const minsAgo = randInt(rng, 2, 240);
      alerts.push({
        id: `alert-${p.id}-${i}`,
        patientId: p.id,
        bed: p.bed,
        category: cat,
        severity: sev,
        time: new Date(Date.now() - minsAgo * 60000).toISOString(),
        riskScore: p.risk.overall,
        reason: meta.reason,
        recommendation: meta.rec,
        acknowledged: false,
      });
    }
  });
  return alerts.sort((a, b) => +new Date(b.time) - +new Date(a.time));
}

export function labelForCategory(c: AlertCategory): string {
  const map: Record<AlertCategory, string> = {
    critical_deterioration: 'Critical Deterioration',
    sepsis_risk: 'Sepsis Risk',
    cardiac_arrest_risk: 'Cardiac Arrest Risk',
    respiratory_failure_risk: 'Respiratory Failure Risk',
    abnormal_vitals: 'Abnormal Vital Signs',
    drug_interaction: 'Drug Interaction',
    escalation_required: 'Escalation Required',
  };
  return map[c];
}
