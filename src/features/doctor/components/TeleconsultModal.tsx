import React, { useState, useEffect } from 'react';
import { Video, PhoneOff, ShieldAlert, Activity, Radio } from 'lucide-react';
import { Patient } from '@/types/doctor';
import { RiskBadge, StatusBadge, Button } from '@/features/doctor/components/ui';

export interface TeleconsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  allPatients: Patient[];
}

const SPECIALISTS = [
  { title: 'Cardiologist', name: 'Dr. Vikramaditya Rao, DM', hospital: 'CAREX Tele-Cardiology Node' },
  { title: 'Intensivist', name: 'Dr. Rajesh Sharma, MD, FCCM', hospital: 'AIIMS Central ICU' },
  { title: 'Neurologist', name: 'Dr. Kavita Nair, MD, DM', hospital: 'Wockhardt Neuro Node' },
  { title: 'Pulmonologist', name: 'Dr. Sunita Deshmukh, MD, FCCP', hospital: 'GMC Respiratory ICU' },
  { title: 'Nephrologist', name: 'Dr. Anish Gupta, MD, EDIC', hospital: 'IGMC Renal Unit' },
];

export const TeleconsultModal: React.FC<TeleconsultModalProps> = ({
  isOpen,
  onClose,
  patient,
  allPatients,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [specialistIndex, setSpecialistIndex] = useState(0);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected'>('idle');

  const activePatient = allPatients.find((p) => p.id === selectedPatientId) || patient || allPatients[0];
  const activeSpecialist = SPECIALISTS[specialistIndex];

  const prevIsOpen = React.useRef(isOpen);

  useEffect(() => {
    // Only set initial selected patient when the modal opens or if no patient is currently selected
    if (isOpen && (!prevIsOpen.current || !selectedPatientId)) {
      if (patient) {
        setSelectedPatientId(patient.id);
      } else if (allPatients.length > 0) {
        setSelectedPatientId(allPatients[0].id);
      }
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, patient]);

  if (!isOpen) return null;

  const handleStartCall = () => {
    setConnectionState('connecting');
    setTimeout(() => {
      setConnectionState('connected');
    }, 2500);
  };

  const handleEndCall = () => {
    setConnectionState('idle');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={connectionState === 'connected' ? undefined : onClose} />

      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white dark:bg-orange-500 dark:text-black shadow-md">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">One-Tap Teleconsult Launch</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-orange-500/10 dark:text-orange-400 border border-blue-200 dark:border-orange-500/30">
                  LIVE TELEMETRY SHARED
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Instant off-site specialist video link & shared live patient dashboard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {connectionState === 'idle' && (
            <>
              {/* Specialist Selection & Patient Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Select Off-Site Specialist</label>
                  <select
                    value={specialistIndex}
                    onChange={(e) => setSpecialistIndex(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-orange-500"
                  >
                    {SPECIALISTS.map((s, idx) => (
                      <option key={idx} value={idx}>
                        {s.title} — {s.name} ({s.hospital})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Select ICU Bed / Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-orange-500"
                  >
                    {allPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}, Bed {p.bed}) — Risk {p.risk.overall}%
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Shared Live Telemetry Dashboard Preview */}
              {activePatient && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">{activePatient.name}</span>
                        <span className="font-mono text-xs text-slate-400">({activePatient.id})</span>
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px]">
                          Bed {activePatient.bed}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Primary Diagnosis: <strong className="text-slate-800 dark:text-zinc-200">{activePatient.diagnosis}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <RiskBadge score={activePatient.risk.overall} />
                      <StatusBadge status={activePatient.status} />
                    </div>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center pt-1">
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Heart Rate</span>
                      <p className="font-mono font-bold text-sm text-slate-900 dark:text-zinc-100">{activePatient.vitals.heartRate} bpm</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">SpO2</span>
                      <p className={`font-mono font-bold text-sm ${activePatient.vitals.spo2 < 92 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-zinc-100'}`}>
                        {activePatient.vitals.spo2}%
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Resp Rate</span>
                      <p className="font-mono font-bold text-sm text-slate-900 dark:text-zinc-100">{activePatient.vitals.respiratoryRate}/m</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Blood Press</span>
                      <p className="font-mono font-bold text-sm text-slate-900 dark:text-zinc-100">{activePatient.vitals.systolic}/{activePatient.vitals.diastolic}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">ECG Rhythm</span>
                      <p className="font-mono font-bold text-[11px] text-slate-900 dark:text-zinc-100 truncate">{activePatient.ecgRhythm || 'Normal Sinus'}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Sepsis Score</span>
                      <p className="font-mono font-bold text-sm text-slate-900 dark:text-zinc-100">{activePatient.sepsisScore || activePatient.risk.sepsis}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Call Launch Button */}
              <div className="pt-2 flex justify-end">
                <Button variant="primary" size="lg" onClick={handleStartCall} className="w-full sm:w-auto">
                  <Video className="h-4 w-4" />
                  <span>Launch Teleconsult with {activeSpecialist.name}</span>
                </Button>
              </div>
            </>
          )}

          {connectionState === 'connecting' && (
            <div className="py-12 text-center space-y-4">
              <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 dark:border-orange-500/20 animate-ping" />
                <div className="h-16 w-16 rounded-full bg-blue-600 dark:bg-orange-500 text-white dark:text-black flex items-center justify-center shadow-lg">
                  <Radio className="h-8 w-8 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Connecting encrypted video call to {activeSpecialist.name}...
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Broadcasting real-time telemetry feed for patient {activePatient.name} ({activePatient.bed})
                </p>
              </div>
            </div>
          )}

          {connectionState === 'connected' && (
            <div className="space-y-4">
              {/* Mock Video Stream Container */}
              <div className="relative h-64 sm:h-72 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
                {/* Specialist Mock Video Placeholder */}
                <div className="text-center space-y-2 p-6">
                  <div className="mx-auto h-16 w-16 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 flex items-center justify-center text-xl font-bold">
                    {activeSpecialist.name.split(' ')[1]?.[0] || 'D'}S
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{activeSpecialist.name}</h4>
                    <p className="text-xs text-zinc-400">{activeSpecialist.title} • {activeSpecialist.hospital}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      Encrypted Audio / Video Stream Active
                    </div>
                  </div>
                </div>

                {/* Self View (Doctor Cam) */}
                <div className="absolute bottom-3 right-3 h-24 w-32 rounded-xl bg-zinc-900 border border-zinc-700 p-2 flex flex-col justify-between shadow-lg">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">You (Bedside Doctor)</span>
                  <div className="text-[10px] text-zinc-300 font-medium">CAREX ICU Terminal</div>
                </div>

                {/* Patient Live Banner Overlay */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-[11px] text-zinc-200 flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-blue-400" />
                  <span>Sharing telemetry: <strong className="text-white">{activePatient.name}</strong> ({activePatient.bed})</span>
                </div>
              </div>

              {/* Patient Live Summary in Call */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 dark:text-zinc-400">Diagnosis: </span>
                  <strong className="text-slate-800 dark:text-zinc-200">{activePatient.diagnosis}</strong>
                </div>
                <div className="flex items-center gap-3 font-mono font-bold text-slate-800 dark:text-zinc-200">
                  <span>HR: {activePatient.vitals.heartRate}</span>
                  <span>SpO2: {activePatient.vitals.spo2}%</span>
                  <span>BP: {activePatient.vitals.systolic}/{activePatient.vitals.diastolic}</span>
                </div>
              </div>

              {/* End Call Button */}
              <div className="flex justify-end">
                <Button variant="danger" size="md" onClick={handleEndCall}>
                  <PhoneOff className="h-4 w-4" />
                  <span>End Teleconsultation</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Disclaimer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[10px] text-slate-500 dark:text-zinc-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            <span>Simulation only — no real video connection is initiated.</span>
          </div>
          <span className="font-semibold text-slate-600 dark:text-zinc-400">CAREX Educational Teleconsult Engine</span>
        </div>
      </div>
    </div>
  );
};
