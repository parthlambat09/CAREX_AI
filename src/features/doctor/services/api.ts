import { INITIAL_60_PATIENTS } from '@/data/centralizedPatients';
import { generateAlerts } from '@/features/doctor/mock/patients';
import type { Patient, Alert, KPIData, NotificationChannel } from '@/types/doctor';

let patients: Patient[] = [...INITIAL_60_PATIENTS];
let alerts: Alert[] = generateAlerts(patients);

const LATENCY = 120;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));
}

export const api = {
  getPatients(): Promise<Patient[]> {
    return delay([...patients]);
  },
  getPatient(id: string): Promise<Patient | undefined> {
    return delay(patients.find((p) => p.id === id));
  },
  getPatientVitals(id: string): Promise<Patient | undefined> {
    return delay(patients.find((p) => p.id === id));
  },
  getRiskPrediction(id: string): Promise<Patient | undefined> {
    return delay(patients.find((p) => p.id === id));
  },
  getAlerts(): Promise<Alert[]> {
    return delay([...alerts]);
  },
  acknowledgeAlert(id: string): Promise<void> {
    let targetPatientId: string | null = null;
    const a = alerts.find((x) => x.id === id);
    if (a) {
      a.acknowledged = true;
      targetPatientId = a.patientId || null;
    } else {
      targetPatientId = id;
    }

    const pMatch = String(id).match(/P-\d+/i) || String(id).match(/ICU-\d+/i);
    const extractedId = pMatch ? pMatch[0].toUpperCase() : null;

    const p = patients.find(
      (x) =>
        x.id === targetPatientId ||
        x.id === id ||
        (extractedId && x.id.toUpperCase() === extractedId) ||
        x.bed === id ||
        (a && (x.id === a.patientId || x.bed === a.bed))
    );

    if (p) {
      p.statusOverride = true;
      const isLowercase = p.status === 'critical' || p.status === 'unstable' || p.status === 'stable';
      const options = isLowercase
        ? ['unstable', 'stable', 'recovering']
        : ['Unstable', 'Stable', 'Recovering'];
      const newStatus = options[Math.floor(Math.random() * options.length)] as PatientStatus;
      p.status = newStatus;
      const lower = newStatus.toLowerCase();
      let newRisk = 35;
      let newHr = 76;
      let newSpo2 = 97;
      let newBpSys = 120;
      let newBpDia = 80;
      let newTemp = 37.0;

      if (lower === 'unstable' || lower === 'elevated') newRisk = Math.floor(Math.random() * 14) + 55;
      else if (lower === 'stable') newRisk = Math.floor(Math.random() * 15) + 28;
      else newRisk = Math.floor(Math.random() * 13) + 10;

      p.risk.overall = newRisk;
      p.risk.trend = 'down';
      p.telemetry = {
        ...p.telemetry,
        overall_risk: newRisk,
        HR: newHr,
        O2Sat: newSpo2,
        SBP: newBpSys,
      };
      p.vitals = {
        ...p.vitals,
        heartRate: newHr,
        spo2: newSpo2,
        systolic: newBpSys,
        diastolic: newBpDia,
        temperature: newTemp,
      };
    }
    return delay(undefined);
  },
  escalateAlert(id: string): Promise<void> {
    const a = alerts.find((x) => x.id === id);
    if (a) a.acknowledged = true;
    return delay(undefined);
  },
  getAnalytics(): Promise<KPIData> {
    const critical = patients.filter((p) => p.status.toLowerCase() === 'critical').length;
    const high = patients.filter((p) => p.risk.overall >= 70).length;
    return delay({
      totalPatients: patients.length,
      criticalPatients: critical,
      highRiskPatients: high,
      icuOccupancy: Math.round((patients.length / 20) * 100),
      activeAlerts: alerts.filter((a) => !a.acknowledged).length,
      avgLengthOfStay: 6.4,
      mortalityRiskTrend: [12, 14, 13, 16, 18, 17, 19],
    });
  },
  getNotificationChannels(): Promise<NotificationChannel[]> {
    return delay([
      { id: 'dashboard', name: 'Dashboard Alerts', enabled: true, description: 'Real-time on-screen alerts in the command center' },
      { id: 'mobile', name: 'Mobile Push', enabled: true, description: 'Push notifications to the on-call clinician mobile app' },
      { id: 'whatsapp', name: 'WhatsApp', enabled: false, description: 'WhatsApp messages to the assigned care team group' },
      { id: 'email', name: 'Email', enabled: true, description: 'Email summaries for escalations and shift handoffs' },
    ]);
  },
  sendNotification(_patientId: string, _channel: string): Promise<{ ok: boolean }> {
    return delay({ ok: true });
  },
};

export const _internal = {
  get patients() {
    return patients;
  },
  set patients(v: Patient[]) {
    patients = v;
  },
  get alerts() {
    return alerts;
  },
  set alerts(v: Alert[]) {
    alerts = v;
  },
  addAlert(a: Alert) {
    alerts.unshift(a);
  },
};
