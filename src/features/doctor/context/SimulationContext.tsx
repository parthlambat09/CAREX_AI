import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { _internal } from '@/features/doctor/services/api';
import { labelForCategory } from '@/features/doctor/mock/patients';
import type { Patient, Alert, PatientStatus } from '@/types/doctor';

const TICK_MS = 1000;
const DISABLE_RANDOM = true;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function statusFromRisk(risk: number): PatientStatus {
  if (risk >= 80) return 'Critical';
  if (risk >= 65) return 'Elevated';
  if (risk >= 40) return 'Stable';
  return 'Recovering';
}

function recomputeRisk(p: Patient): number {
  const v = p.vitals;
  let score = 20;
  if (v.heartRate > 110) score += (v.heartRate - 110) * 0.8;
  else if (v.heartRate < 50) score += (50 - v.heartRate) * 0.8;
  if (v.spo2 < 92) score += (92 - v.spo2) * 2.5;
  if (v.respiratoryRate > 24) score += (v.respiratoryRate - 24) * 1.2;
  if (v.systolic > 160 || v.systolic < 90) score += 8;
  if (v.temperature > 38.5) score += (v.temperature - 38.5) * 6;
  return clamp(Math.round(score * 10) / 10, 1, 99);
}

import { HOSPITALS, Hospital } from '@/mock/hospitals';
import { DOCTORS, DoctorProfile } from '@/mock/doctors';

interface SimState {
  patients: Patient[];
  alerts: Alert[];
  tick: number;
  lastEvent: string | null;
  activeHospitalId: string;
}

interface SimContextValue {
  patients: Patient[];
  allPatients: Patient[];
  alerts: Alert[];
  tick: number;
  lastEvent: string | null;
  activeHospitalId: string;
  activeHospital: Hospital;
  activeDoctor: DoctorProfile;
  doctors: DoctorProfile[];
  hospitals: Hospital[];
  setActiveHospitalId: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
  escalateAlert: (id: string) => void;
  admitPatient: (data: {
    name: string;
    age: number;
    sex: 'M' | 'F';
    bed: string;
    diagnosis: string;
    admittingDoctor?: string;
    initialRisk?: number;
    hospitalId?: string;
  }) => Patient;
  dischargePatient: (id: string, reason?: string) => void;
  referPatient: (patientId: string, destinationHospitalId: string, reason: string) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addPatientObservation: (id: string, title: string, description: string, performedBy?: string) => void;
}

const SimContext = createContext<SimContextValue | null>(null);

import { useAuth } from '@/features/auth/context/AuthContext';

export function SimulationProvider({ children }: { children: ReactNode }) {
  let authUser = null;
  try {
    const auth = useAuth();
    authUser = auth.user;
  } catch {
    // Optional fallback if mounted outside AuthProvider
  }

  const initialHospitalId = () => {
    try {
      return localStorage.getItem('carex_selected_hospital') || 'aiims';
    } catch {
      return 'aiims';
    }
  };

  const [activeHospitalId, setActiveHospitalId] = useState<string>(initialHospitalId);
  const [state, setState] = useState<SimState>(() => ({
    patients: _internal.patients.map((p) => ({ ...p, vitals: { ...p.vitals }, risk: { ...p.risk } })),
    alerts: [..._internal.alerts],
    tick: 0,
    lastEvent: null,
    activeHospitalId: initialHospitalId(),
  }));
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const interval = setInterval(() => {
      // If random simulation is disabled, simply increment tick without modifying patients
      if (DISABLE_RANDOM) {
        setState((s) => ({
          ...s,
          tick: s.tick + 1,
        }));
        return;
      }
      const patients = stateRef.current.patients.map((p) => {
        const oldRisk = p.risk.overall;
        const v = { ...p.vitals };
        const isStable = p.status === 'Stable' || p.status === 'stable';
        const isCritical = p.status === 'Critical' || p.status === 'critical';

        if (!DISABLE_RANDOM) {
          // Natural, bounded micro-variations based on patient clinical state
          if (Math.random() < 0.75) {
            if (isStable) {
              // Stable patients fluctuate mildly around normal baseline
              v.heartRate = clamp(v.heartRate + Math.round((Math.random() - 0.5) * 1.2), 65, 85);
              v.spo2 = clamp(v.spo2 + (Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0), 96, 100);
              v.respiratoryRate = clamp(v.respiratoryRate + Math.round((Math.random() - 0.5) * 0.8), 12, 18);
              v.systolic = clamp(v.systolic + Math.round((Math.random() - 0.5) * 1.5), 110, 130);
              v.diastolic = clamp(v.diastolic + Math.round((Math.random() - 0.5) * 1.2), 70, 84);
              v.temperature = parseFloat(clamp(v.temperature + (Math.random() - 0.5) * 0.04, 36.4, 37.3).toFixed(1));
            } else if (isCritical) {
              // Critical patients sustain critical ranges with gradual drift
              v.heartRate = clamp(v.heartRate + Math.round((Math.random() - 0.5) * 1.8), 105, 140);
              v.spo2 = clamp(v.spo2 + (Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0), 85, 92);
              v.respiratoryRate = clamp(v.respiratoryRate + Math.round((Math.random() - 0.5) * 1), 22, 34);
              v.systolic = clamp(v.systolic + Math.round((Math.random() - 0.5) * 2), 140, 175);
              v.diastolic = clamp(v.diastolic + Math.round((Math.random() - 0.5) * 1.5), 88, 108);
              v.temperature = parseFloat(clamp(v.temperature + (Math.random() - 0.5) * 0.05, 37.8, 39.5).toFixed(1));
            } else {
              // Caution/Elevated patients show moderate controlled variation
              v.heartRate = clamp(v.heartRate + Math.round((Math.random() - 0.5) * 1.5), 75, 108);
              v.spo2 = clamp(v.spo2 + (Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0), 92, 96);
              v.respiratoryRate = clamp(v.respiratoryRate + Math.round((Math.random() - 0.5) * 0.8), 16, 24);
              v.systolic = clamp(v.systolic + Math.round((Math.random() - 0.5) * 1.8), 120, 148);
              v.diastolic = clamp(v.diastolic + Math.round((Math.random() - 0.5) * 1.2), 78, 92);
              v.temperature = parseFloat(clamp(v.temperature + (Math.random() - 0.5) * 0.04, 36.8, 38.2).toFixed(1));
            }
          }
        }

        // Calculate raw vitals risk and apply Exponential Moving Average (EMA) smoothing
        const rawRisk = recomputeRisk({ ...p, vitals: v });
        const newRisk = p.statusOverride ? p.risk.overall : Math.round((oldRisk * 0.92 + rawRisk * 0.08) * 10) / 10;
        const newStatus = p.statusOverride ? p.status : statusFromRisk(newRisk);
        const crossed = newStatus !== p.status;
        const riskUp = !p.statusOverride && newRisk > oldRisk + 5;

        let newEcgRhythm: Patient['ecgRhythm'] = 'normal sinus rhythm';
        if (v.heartRate > 105) newEcgRhythm = 'sinus tachycardia';
        else if (v.heartRate < 55) newEcgRhythm = 'bradycardia';
        else if (newRisk > 75) newEcgRhythm = 'atrial fibrillation';

        const newSepsisScore = clamp(Math.round((p.sepsisScore ?? p.risk.sepsis ?? newRisk) + (Math.random() - 0.5) * 1), 1, 99);

        return {
          ...p,
          vitals: p.statusOverride ? p.vitals : v,
          telemetry: {
            HR: (p.statusOverride ? p.vitals : v).heartRate,
            SBP: (p.statusOverride ? p.vitals : v).systolic,
            O2Sat: (p.statusOverride ? p.vitals : v).spo2,
            overall_risk: newRisk,
          },
          status: newStatus,
          ecgRhythm: p.statusOverride ? p.ecgRhythm : newEcgRhythm,
          sepsisScore: newSepsisScore,
          risk: { ...p.risk, overall: newRisk, sepsis: newSepsisScore, trend: p.statusOverride ? 'down' : newRisk > oldRisk ? 'up' : newRisk < oldRisk ? 'down' : 'stable' },
          lastUpdated: Date.now(),
          timeline: crossed || riskUp
            ? [
                {
                  id: `sim-${Date.now()}-${p.id}`,
                  time: new Date().toISOString(),
                  type: crossed ? 'alert' : 'vital',
                  title: crossed ? `Status changed to ${newStatus}` : 'Risk score increased',
                  description: `AI risk ${newRisk}% (${newRisk > oldRisk ? '+' : ''}${(newRisk - oldRisk).toFixed(1)})`,
                },
                ...p.timeline,
              ].slice(0, 20)
            : p.timeline,
        } as Patient;
      });

      const newAlerts: Alert[] = [];
      const prev = stateRef.current.patients;
      patients.forEach((p, i) => {
        const was = prev[i];
        const becameCritical = (was.status !== 'Critical' && was.status !== 'critical') && (p.status === 'Critical' || p.status === 'critical');

        const riskJumped = p.risk.overall > was.risk.overall + 8 && p.risk.overall > 60;
        if (becameCritical || riskJumped) {
          const cat = becameCritical ? 'critical_deterioration' : 'abnormal_vitals';
          newAlerts.push({
            id: `alert-${Date.now()}-${p.id}`,
            patientId: p.id,
            bed: p.bed,
            category: cat,
            severity: p.risk.overall > 80 ? 'critical' : 'warning',
            time: new Date().toISOString(),
            riskScore: p.risk.overall,
            reason: becameCritical
              ? 'Patient crossed into critical status — vitals outside safe range'
              : 'Risk score increased sharply over last observation window',
            recommendation: 'Bedside review recommended; verify vitals and assess intervention',
            acknowledged: false,
          });
        }
      });

      if (newAlerts.length) {
        _internal.alerts = [...newAlerts, ..._internal.alerts].slice(0, 100);
      }
      _internal.patients = patients;

      setState((s) => ({
        ...s,
        patients,
        alerts: newAlerts.length ? [...newAlerts, ...s.alerts].slice(0, 100) : s.alerts,
        tick: s.tick + 1,
        lastEvent: newAlerts.length
          ? `${newAlerts.length} new alert${newAlerts.length > 1 ? 's' : ''}: ${newAlerts.map((a) => `${a.patientId} (${labelForCategory(a.category)})`).join(', ')}`
          : s.lastEvent,
      }));
    }, TICK_MS);

    // Connect to CAREX backend live WebSocket telemetry stream if available
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWs = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Use Vite proxy (/ws/telemetry) or direct backend port (8000)
        const host = window.location.hostname || 'localhost';
        const wsUrl = `${protocol}//${host}:8000/ws/telemetry`;
        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (!data || !data.mapped_id) return;
            const targetId = data.mapped_id;

            setState((prev) => {
              const prevPatients = prev.patients;
              const idx = prevPatients.findIndex((p, i) => 
                p.id === targetId || 
                targetId === `P-${String(i + 1).padStart(3, '0')}` || 
                p.id === `ICU-${100 + i}`
              );
              if (idx === -1) return prev;

              const p = prevPatients[idx];
              if (p.statusOverride) return prev;

              const oldRisk = p.risk.overall;
              const newRisk = typeof data.risk?.overall === 'number' ? data.risk.overall : oldRisk;
              const newStatus = statusFromRisk(newRisk);
              const crossed = newStatus !== p.status;
              const riskUp = newRisk > oldRisk + 5;

              const v = { ...p.vitals };
              if (data.vitals) {
                if (data.vitals.heartRate != null) v.heartRate = Math.round(data.vitals.heartRate);
                if (data.vitals.spo2 != null) v.spo2 = Math.round(data.vitals.spo2);
                if (data.vitals.respiratoryRate != null) v.respiratoryRate = Math.round(data.vitals.respiratoryRate);
                if (data.vitals.systolic != null) v.systolic = Math.round(data.vitals.systolic);
                if (data.vitals.diastolic != null) v.diastolic = Math.round(data.vitals.diastolic);
                if (data.vitals.temperature != null) v.temperature = parseFloat(Number(data.vitals.temperature).toFixed(1));
              }

              const updatedPatient: Patient = {
                ...p,
                vitals: v,
                status: newStatus,
                risk: {
                  ...p.risk,
                  overall: newRisk,
                  sepsis: data.risk?.sepsis ?? p.risk.sepsis,
                  cardiacArrest: data.risk?.cardiacArrest ?? p.risk.cardiacArrest,
                  respiratoryFailure: data.risk?.respiratoryFailure ?? p.risk.respiratoryFailure,
                  mortality: data.risk?.mortality ?? p.risk.mortality,
                  trend: data.risk?.trend ?? (newRisk > oldRisk ? 'up' : newRisk < oldRisk ? 'down' : 'stable'),
                },
                factors: data.factors && data.factors.length > 0 ? data.factors : p.factors,
                lastUpdated: Date.now(),
                timeline: crossed || riskUp
                  ? [
                      {
                        id: `live-${Date.now()}-${p.id}`,
                        time: new Date().toISOString(),
                        type: crossed ? ('alert' as const) : ('vital' as const),
                        title: crossed ? `AI Alert: Status changed to ${newStatus}` : 'AI Risk Score Updated',
                        description: `Sepsis/Deterioration model evaluated risk at ${newRisk}% (${newRisk > oldRisk ? '+' : ''}${(newRisk - oldRisk).toFixed(1)})`,
                      },
                      ...p.timeline,
                    ].slice(0, 20)
                  : p.timeline,
              };

              const updatedPatients = [...prevPatients];
              updatedPatients[idx] = updatedPatient;
              _internal.patients = updatedPatients;

              let newAlerts = [...prev.alerts];
              if (crossed && newStatus === 'critical') {
                const alert: Alert = {
                  id: `alert-${Date.now()}-${p.id}`,
                  patientId: p.id,
                  bed: p.bed,
                  category: 'critical_deterioration',
                  severity: 'critical',
                  time: new Date().toISOString(),
                  riskScore: newRisk,
                  reason: 'AI Sepsis/Deterioration model predicted critical risk threshold breach',
                  recommendation: 'Immediate bedside clinical evaluation and lactate review recommended',
                  acknowledged: false,
                };
                newAlerts = [alert, ...newAlerts].slice(0, 100);
                _internal.alerts = newAlerts;
              }

              return {
                ...prev,
                patients: updatedPatients,
                alerts: newAlerts,
                tick: prev.tick + 1,
                lastEvent: `Live telemetry: ${p.id} AI risk ${newRisk}%`,
              };
            });
          } catch (e) {
            console.debug('[CAREX-WS] stream frame parse error', e);
          }
        };

        ws.onclose = () => {
          reconnectTimer = setTimeout(connectWs, 5000);
        };
      } catch (err) {
        console.debug('[CAREX-WS] stream connection warning', err);
      }
    };

    connectWs();

    return () => {
      clearInterval(interval);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  const acknowledgeAlert = (id: string) => {
    let targetPatientId: string | null = null;

    // 1. Search alert in both _internal and state alerts
    const matchedAlert =
      _internal.alerts.find((a) => a.id === id) ||
      stateRef.current.alerts.find((a) => a.id === id);

    if (matchedAlert) {
      matchedAlert.acknowledged = true;
      targetPatientId = matchedAlert.patientId || null;
    }

    // 2. Extract embedded patient ID from string (e.g. alert-P-009-8 -> P-009 or alert-178873-P-009)
    const pMatch = String(id).match(/P-\d+/i) || String(id).match(/ICU-\d+/i);
    const extractedId = pMatch ? pMatch[0].toUpperCase() : null;

    // 3. Locate target patient in state
    const currentPatients = stateRef.current.patients;
    const targetPatient = currentPatients.find(
      (p) =>
        p.id === targetPatientId ||
        p.id === id ||
        (extractedId && p.id.toUpperCase() === extractedId) ||
        p.bed === id ||
        p.name.toLowerCase() === String(id).toLowerCase() ||
        p.name.toLowerCase().includes(String(id).toLowerCase()) ||
        (matchedAlert && (p.id === matchedAlert.patientId || p.bed === matchedAlert.bed))
    );

    let updatedPatients = currentPatients;

    // 4. Step down patient status if target patient exists
    if (targetPatient) {
      const isLowercase = targetPatient.status === 'critical' || targetPatient.status === 'unstable' || targetPatient.status === 'stable';
      const statusPool = isLowercase
        ? ['unstable', 'stable', 'recovering']
        : ['Unstable', 'Stable', 'Recovering'];

      const newStatus = statusPool[Math.floor(Math.random() * statusPool.length)] as PatientStatus;

      let newRisk = 35;
      let newHr = 78;
      let newSpo2 = 97;
      let newBpSys = 120;
      let newBpDia = 80;
      let newTemp = 37.0;

      const lower = newStatus.toLowerCase();
      if (lower === 'unstable' || lower === 'elevated') {
        newRisk = Math.floor(Math.random() * 14) + 55; // 55 - 68%
        newHr = Math.floor(Math.random() * 10) + 88; // 88 - 97 bpm
        newSpo2 = Math.floor(Math.random() * 3) + 93; // 93 - 95%
        newBpSys = 130;
        newBpDia = 85;
        newTemp = 37.5;
      } else if (lower === 'stable') {
        newRisk = Math.floor(Math.random() * 15) + 28; // 28 - 42%
        newHr = Math.floor(Math.random() * 8) + 74; // 74 - 81 bpm
        newSpo2 = Math.floor(Math.random() * 3) + 96; // 96 - 98%
        newBpSys = 120;
        newBpDia = 80;
        newTemp = 37.0;
      } else {
        // recovering
        newRisk = Math.floor(Math.random() * 13) + 10; // 10 - 22%
        newHr = Math.floor(Math.random() * 7) + 68; // 68 - 74 bpm
        newSpo2 = Math.floor(Math.random() * 2) + 98; // 98 - 99%
        newBpSys = 118;
        newBpDia = 78;
        newTemp = 36.8;
      }

      updatedPatients = currentPatients.map((p) => {
        if (
          p.id === targetPatient.id ||
          p.id === id ||
          (extractedId && p.id.toUpperCase() === extractedId)
        ) {
          const obs = p.observations || [];
          return {
            ...p,
            statusOverride: true,
            status: newStatus,
            ecgRhythm: lower === 'unstable' ? 'sinus rhythm with PACs' : 'normal sinus rhythm',
            telemetry: {
              ...p.telemetry,
              overall_risk: newRisk,
              HR: newHr,
              O2Sat: newSpo2,
              SBP: newBpSys,
            },
            vitals: {
              ...p.vitals,
              heartRate: newHr,
              spo2: newSpo2,
              systolic: newBpSys,
              diastolic: newBpDia,
              temperature: newTemp,
            },
            risk: {
              ...p.risk,
              overall: newRisk,
              sepsis: Math.max(5, newRisk - 8),
              cardiacArrest: Math.max(5, newRisk - 12),
              respiratoryFailure: Math.max(5, newRisk - 10),
              trend: 'down',
            },
            observations: [
              `Acknowledged & clinical status de-escalated to ${newStatus} by attending clinician`,
              ...obs,
            ],
          };
        }
        return p;
      });

      _internal.patients = updatedPatients;
    }

    _internal.alerts = _internal.alerts.map((a) =>
      a.id === id || (targetPatientId && a.patientId === targetPatientId) || (targetPatient && a.patientId === targetPatient.id) || (extractedId && a.patientId && a.patientId.toUpperCase() === extractedId)
        ? { ...a, acknowledged: true }
        : a
    );

    setState((s) => ({
      ...s,
      patients: updatedPatients,
      alerts: s.alerts.map((a) =>
        a.id === id || (targetPatientId && a.patientId === targetPatientId) || (targetPatient && a.patientId === targetPatient.id) || (extractedId && a.patientId && a.patientId.toUpperCase() === extractedId)
          ? { ...a, acknowledged: true }
          : a
      ),
      lastEvent: targetPatient
        ? `Acknowledged alert: ${targetPatient.name} de-escalated to ${updatedPatients.find(p => p.id === targetPatient.id)?.status}`
        : s.lastEvent,
    }));
  };
  const escalateAlert = (id: string) => {
    acknowledgeAlert(id);
  };

  const admitPatient = (data: {
    name: string;
    age: number;
    sex: 'M' | 'F';
    bed: string;
    diagnosis: string;
    admittingDoctor?: string;
    initialRisk?: number;
    hospitalId?: string;
  }): Patient => {
    const nextNum = stateRef.current.patients.length + 1;
    const id = `P-${String(nextNum).padStart(3, '0')}`;
    const targetHospital = data.hospitalId || activeHospitalId;
    const initialRiskScore = data.initialRisk ?? 35;
    const status: PatientStatus = statusFromRisk(initialRiskScore);

    const newPatient: Patient = {
      id,
      name: data.name,
      age: Number(data.age),
      sex: data.sex,
      bed: data.bed,
      diagnosis: data.diagnosis,
      admittedDays: 1,
      status,
      hospitalId: targetHospital,
      admittingDoctor: data.admittingDoctor || 'Dr. Rajesh Sharma, MD, FCCM',
      discharged: false,
      ecgRhythm: status === 'critical' ? 'sinus tachycardia' : 'normal sinus rhythm',
      sepsisScore: Math.max(5, initialRiskScore - 10),
      medications: ['Norepinephrine', 'Ceftriaxone'],
      labs: ['Lactate 1.8 mmol/L', 'WBC 11.2'],
      observations: [`Admitted to Bed ${data.bed} by ${data.admittingDoctor || 'Dr. Rajesh Sharma'}`],
      vitals: {
        heartRate: status === 'critical' ? 116 : status === 'elevated' ? 102 : status === 'caution' ? 88 : 74,
        spo2: status === 'critical' ? 90 : status === 'elevated' ? 93 : status === 'caution' ? 95 : 98,
        respiratoryRate: status === 'critical' ? 26 : status === 'elevated' ? 22 : status === 'caution' ? 18 : 16,
        systolic: status === 'critical' ? 148 : 124,
        diastolic: status === 'critical' ? 92 : 78,
        temperature: 37.1,
      },
      risk: {
        overall: initialRiskScore,
        sepsis: Math.max(5, initialRiskScore - 10),
        cardiacArrest: Math.max(5, initialRiskScore - 15),
        respiratoryFailure: Math.max(5, initialRiskScore - 5),
        mortality: Math.max(2, Math.round(initialRiskScore * 0.25)),
        trend: 'stable',
      },
      factors: [
        { label: 'Initial ICU admission triage', contribution: 30, detail: `Admitted under diagnosis: ${data.diagnosis}` },
        { label: 'Physiological baseline establishing', contribution: 20, detail: 'Initial 4h telemetry window active' },
      ],
      timeline: [
        {
          id: `admit-${Date.now()}-${id}`,
          time: new Date().toISOString(),
          type: 'observation',
          title: 'Admitted to Intensive Care Unit',
          description: `Admitted to Bed ${data.bed} by ${data.admittingDoctor || 'Dr. R. Okafor'}. Diagnosis: ${data.diagnosis}`,
        },
      ],
      lastUpdated: Date.now(),
    };

    const updatedPatients = [newPatient, ...stateRef.current.patients];
    _internal.patients = updatedPatients;
    setState((s) => ({
      ...s,
      patients: updatedPatients,
      lastEvent: `Patient ${newPatient.name} admitted to Bed ${newPatient.bed}`,
    }));

    return newPatient;
  };

  const dischargePatient = (id: string, reason?: string) => {
    const prevPatients = stateRef.current.patients;
    const target = prevPatients.find((p) => p.id === id);
    if (!target) return;

    const updatedPatients = prevPatients.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          discharged: true,
          status: 'stable' as PatientStatus,
          timeline: [
            {
              id: `discharge-${Date.now()}-${p.id}`,
              time: new Date().toISOString(),
              type: 'observation' as const,
              title: 'Discharged from ICU',
              description: reason || 'Patient clinical parameters stabilized; transferred out of ICU.',
            },
            ...p.timeline,
          ],
        };
      }
      return p;
    });

    _internal.patients = updatedPatients;
    setState((s) => ({
      ...s,
      patients: updatedPatients,
      lastEvent: `Patient ${target.name} (${target.bed}) successfully discharged`,
    }));
  };

  const referPatient = (patientId: string, destinationHospitalId: string, reason: string) => {
    const prevPatients = stateRef.current.patients;
    const target = prevPatients.find((p) => p.id === patientId);
    if (!target) return;

    const sourceHospital = HOSPITALS.find((h) => h.id === (target.hospitalId || activeHospitalId)) || HOSPITALS[0];
    const destHospital = HOSPITALS.find((h) => h.id === destinationHospitalId) || HOSPITALS[0];

    const updatedPatients = prevPatients.map((p) => {
      if (p.id === patientId) {
        return {
          ...p,
          hospitalId: destinationHospitalId,
          status: 'elevated' as PatientStatus,
          timeline: [
            {
              id: `refer-${Date.now()}-${p.id}`,
              time: new Date().toISOString(),
              type: 'observation' as const,
              title: `Referred to ${destHospital.shortName}`,
              description: `Inter-hospital referral from ${sourceHospital.shortName} to ${destHospital.name}. Rationale: ${reason}`,
            },
            ...p.timeline,
          ],
        };
      }
      return p;
    });

    const newAlert: Alert = {
      id: `alert-refer-${Date.now()}-${target.id}`,
      patientId: target.id,
      bed: target.bed,
      category: 'escalation_required',
      severity: 'warning',
      time: new Date().toISOString(),
      riskScore: target.risk.overall,
      reason: `Patient referred from ${sourceHospital.shortName} to ${destHospital.shortName}: ${reason}`,
      recommendation: `Prepare transport documentation & clinical handoff report for ${destHospital.shortName}`,
      acknowledged: false,
    };

    _internal.patients = updatedPatients;
    _internal.alerts = [newAlert, ..._internal.alerts].slice(0, 100);

    setState((s) => ({
      ...s,
      patients: updatedPatients,
      alerts: [newAlert, ...s.alerts].slice(0, 100),
      lastEvent: `Patient ${target.name} referred from ${sourceHospital.shortName} to ${destHospital.shortName}`,
    }));
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    const prevPatients = stateRef.current.patients;
    const targetIdx = prevPatients.findIndex((p) => p.id === id);
    if (targetIdx === -1) return;

    const updatedPatients = prevPatients.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          vitals: updates.vitals ? { ...p.vitals, ...updates.vitals } : p.vitals,
          telemetry: updates.vitals
            ? {
                HR: updates.vitals.heartRate ?? p.telemetry?.HR ?? p.vitals.heartRate,
                SBP: updates.vitals.systolic ?? p.telemetry?.SBP ?? p.vitals.systolic,
                O2Sat: updates.vitals.spo2 ?? p.telemetry?.O2Sat ?? p.vitals.spo2,
                overall_risk: updates.risk?.overall ?? p.risk.overall,
              }
            : p.telemetry,
          risk: updates.risk ? { ...p.risk, ...updates.risk } : p.risk,
          lastUpdated: Date.now(),
        };
      }
      return p;
    });

    _internal.patients = updatedPatients;
    setState((s) => ({
      ...s,
      patients: updatedPatients,
      lastEvent: `Patient ${prevPatients[targetIdx].name} updated globally`,
    }));
  };

  const addPatientObservation = (id: string, title: string, description: string, performedBy = 'Clinical Staff') => {
    const prevPatients = stateRef.current.patients;
    const target = prevPatients.find((p) => p.id === id);
    if (!target) return;

    const newEv = {
      id: `ev-obs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: new Date().toISOString(),
      type: 'observation' as const,
      title,
      description: `${description} (By ${performedBy})`,
    };

    const updatedPatients = prevPatients.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          observations: [title, ...(p.observations || [])],
          timeline: [newEv, ...(p.timeline || [])],
          lastUpdated: Date.now(),
        };
      }
      return p;
    });

    _internal.patients = updatedPatients;
    setState((s) => ({
      ...s,
      patients: updatedPatients,
      lastEvent: `Observation logged for ${target.name}: ${title}`,
    }));
  };

  const activeHospital = HOSPITALS.find((h) => h.id === activeHospitalId) || HOSPITALS[0];

  let loggedInDoctor: DoctorProfile | undefined;
  if (authUser && authUser.role === 'doctor' && authUser.id) {
    loggedInDoctor = DOCTORS.find((d) => d.id.toUpperCase() === authUser.id.toUpperCase()) || authUser.record;
  }

  const activeDoctor = loggedInDoctor || DOCTORS.find((d) => d.hospitalId === activeHospitalId) || DOCTORS[0];
  const hospitalPatients = state.patients.filter(
    (p) => !p.discharged
  );

  return (
    <SimContext.Provider
      value={{
        ...state,
        patients: hospitalPatients,
        allPatients: state.patients,
        activeHospitalId,
        activeHospital,
        activeDoctor,
        doctors: DOCTORS,
        hospitals: HOSPITALS,
        setActiveHospitalId,
        acknowledgeAlert,
        escalateAlert,
        admitPatient,
        dischargePatient,
        referPatient,
        updatePatient,
        addPatientObservation,
      }}
    >
      {children}
    </SimContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
