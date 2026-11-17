import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, Droplet, Wind, Gauge, Thermometer, ArrowLeft, Brain,
  TrendingUp, TrendingDown, Minus, Activity, FlaskConical, Pill, Bell, Stethoscope, ChevronRight,
  LogOut, Plus, CheckCircle2, X, Building2, Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { Card, SectionTitle, StatusBadge, RiskBadge, Button } from '@/features/doctor/components/ui';
import { DischargePatientModal } from '@/features/doctor/components/DischargePatientModal';
import { ReferPatientModal } from '@/features/doctor/components/ReferPatientModal';
import { AIShiftHandoffModal } from '@/features/doctor/components/AIShiftHandoffModal';
import { ECGWaveform } from '@/features/doctor/components/ECGWaveform';
import { formatDateTime, timeAgo } from '@/features/doctor/utils/format';

export function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, acknowledgeAlert } = useSimulation();
  const patient = patients.find((p) => p.id === id);

  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'observation' | 'medication' | 'lab'>('observation');
  const [successNoteMessage, setSuccessNoteMessage] = useState<string | null>(null);

  const history = useMemo(() => {
    if (!patient) return [];
    return Array.from({ length: 12 }, (_, i) => {
      const t = i - 11;
      const drift = (n: number, amp: number) => Math.round(n + Math.sin(i / 2) * amp + (Math.random() - 0.5) * amp * 0.5);
      return {
        time: `-${Math.abs(t) * 30}m`,
        hr: drift(patient.vitals.heartRate, 6),
        spo2: Math.min(100, Math.max(80, drift(patient.vitals.spo2, 2))),
        rr: drift(patient.vitals.respiratoryRate, 3),
        sys: drift(patient.vitals.systolic, 6),
        temp: parseFloat((patient.vitals.temperature + Math.sin(i / 3) * 0.3).toFixed(1)),
      };
    });
  }, [patient]);

  if (!patient) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Link to="/doctor/patients" className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-orange-400 hover:underline">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Return to Patient Directory
        </Link>
        <Card className="p-8 text-center text-slate-500 dark:text-zinc-400">Patient profile non-existent or discharged.</Card>
      </div>
    );
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    patient.timeline.unshift({
      id: `note-${Date.now()}`,
      time: new Date().toISOString(),
      type: noteType,
      title: noteTitle.trim(),
      description: noteContent.trim() || 'Clinical note entered by attending physician.',
    });

    setSuccessNoteMessage('Clinical entry appended to patient chart.');
    setNoteTitle('');
    setNoteContent('');
    setTimeout(() => {
      setSuccessNoteMessage(null);
      setIsAddNoteModalOpen(false);
    }, 1000);
  };

  const ecgColor = patient.status === 'critical' ? '#dc2626' : patient.status === 'elevated' || patient.status === 'caution' ? '#d97706' : '#059669';
  const risks = [
    { label: 'Overall Deterioration Score', value: patient.risk.overall, color: '#dc2626' },
    { label: 'Sepsis Risk', value: patient.risk.sepsis, color: '#d97706' },
    { label: 'Cardiac Arrest Likelihood', value: patient.risk.cardiacArrest, color: '#dc2626' },
    { label: 'Respiratory Failure Probability', value: patient.risk.respiratoryFailure, color: '#d97706' },
    { label: 'Short-Term Mortality Risk', value: patient.risk.mortality, color: '#e11d48' },
  ];

  const eventIcon = { vital: Activity, lab: FlaskConical, medication: Pill, alert: Bell, observation: Stethoscope };

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/doctor/patients" className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-orange-400 hover:underline">
        <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Patient Census
      </Link>

      {/* Patient Profile Header */}
      <Card className="p-6 border border-slate-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white dark:bg-orange-500 dark:text-black text-lg font-bold shadow-md shadow-blue-600/20 dark:shadow-orange-500/20 shrink-0">
              {patient.id.slice(-2)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-zinc-100">{patient.name}</h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700">
                  {patient.id}
                </span>
                <StatusBadge status={patient.status} />
              </div>
              <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-zinc-400">
                {patient.age} yrs / {patient.sex} • <strong>Bed {patient.bed}</strong> • Diagnosis: <strong className="text-slate-800 dark:text-zinc-200">{patient.diagnosis}</strong> • Admitted {patient.admittedDays}d ago
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">AI Deterioration Index</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <RiskBadge score={patient.risk.overall} />
                {patient.risk.trend === 'up' ? <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" /> : patient.risk.trend === 'down' ? <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Minus className="h-4 w-4 text-slate-400" />}
              </div>
            </div>

            {(patient.status.toLowerCase() === 'critical' || patient.risk.overall >= 75) && (
              <Button
                variant="primary"
                size="md"
                onClick={() => acknowledgeAlert(patient.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold animate-pulse shadow-md shadow-red-600/30"
                title="Acknowledge Critical Alert & Randomly Step-Down Status (Unstable, Stable, Recovering)"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>ACK & Step-Down</span>
              </Button>
            )}

            <Button variant="default" size="md" onClick={() => setIsHandoffModalOpen(true)} className="border-teal-300 dark:border-teal-500/40 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10">
              <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>AI Shift Handoff</span>
            </Button>

            <Button variant="default" size="md" onClick={() => setIsReferModalOpen(true)} className="border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10">
              <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Refer to Another Hospital</span>
            </Button>

            <Button variant="danger" size="md" onClick={() => setIsDischargeModalOpen(true)}>
              <LogOut className="h-4 w-4" />
              <span>Discharge</span>
            </Button>

            <Link to="/doctor/support">
              <Button variant="primary" size="md">
                Clinical Support <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Live Vitals & ECG Waveform */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2 border border-slate-200 dark:border-zinc-800">
          <SectionTitle title="Live Telemetry Vitals" subtitle="Real-time sensor feeds • auto-refreshing" />
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            <VitalPill icon={<Heart className="h-4 w-4 text-red-500" />} label="Heart Rate" value={patient.vitals.heartRate} unit="bpm" danger={patient.vitals.heartRate > 110 || patient.vitals.heartRate < 50} />
            <VitalPill icon={<Droplet className="h-4 w-4 text-blue-500 dark:text-orange-400" />} label="SpO2" value={patient.vitals.spo2} unit="%" danger={patient.vitals.spo2 < 92} />
            <VitalPill icon={<Wind className="h-4 w-4 text-emerald-500" />} label="Resp Rate" value={patient.vitals.respiratoryRate} unit="/min" danger={patient.vitals.respiratoryRate > 24} />
            <VitalPill icon={<Gauge className="h-4 w-4 text-amber-500" />} label="Blood Pressure" value={`${patient.vitals.systolic}/${patient.vitals.diastolic}`} unit="mmHg" danger={patient.vitals.systolic > 160 || patient.vitals.systolic < 90} />
            <VitalPill icon={<Thermometer className="h-4 w-4 text-orange-500" />} label="Temperature" value={patient.vitals.temperature} unit="°C" danger={patient.vitals.temperature > 38.5} />
          </div>
        </Card>

        <Card className="overflow-hidden p-0 border border-slate-200 dark:border-zinc-800">
          <div className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">ECG Telemetry • Lead II</p>
          </div>
          <div className="bg-slate-950 dark:bg-black px-2 py-4">
            <ECGWaveform color={ecgColor} height={120} speed={patient.status === 'critical' ? 1.5 : 1} />
          </div>
        </Card>
      </div>

      {/* Time-Series Charts Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TrendCard title="Heart Rate Trend" data={history} keyName="hr" color="#dc2626" unit="bpm" />
        <TrendCard title="SpO2 Oxygenation" data={history} keyName="spo2" color="#059669" unit="%" />
        <TrendCard title="Respiratory Velocity" data={history} keyName="rr" color="#2563eb" unit="/min" />
        <TrendCard title="Systolic BP Drift" data={history} keyName="sys" color="#d97706" unit="mmHg" />
        <TrendCard title="Core Temperature" data={history} keyName="temp" color="#ea580c" unit="°C" />
      </div>

      {/* AI Risk & Factors */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5 border border-slate-200 dark:border-zinc-800">
          <SectionTitle title="AI Deterioration Matrix" subtitle="Predictive scoring outputs" />
          <div className="mt-4 space-y-3.5">
            {risks.map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-zinc-300">{r.label}</span>
                  <span className="font-mono font-bold tabular-nums" style={{ color: r.color }}>{r.value}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${r.value}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 dark:border-zinc-800">
          <SectionTitle title="Risk Explainability Breakdown" subtitle="Physiological drivers & clinical factor weights" />
          <div className="mt-4 space-y-3">
            {patient.factors.slice(0, 6).map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-800 dark:text-zinc-200 font-semibold">{f.label}</span>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 font-bold">{f.contribution}% weight</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500" style={{ width: `${Math.min(100, f.contribution * 1.5)}%` }} />
                  </div>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">{f.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="p-5 border border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
          <SectionTitle title="Clinical Timeline & Interventions" subtitle="Recorded events, lab reports, and medication administrations" />
          <Button size="sm" variant="default" onClick={() => setIsAddNoteModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            <span>Add Clinical Entry</span>
          </Button>
        </div>

        {successNoteMessage && (
          <div className="my-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successNoteMessage}</span>
          </div>
        )}

        <div className="mt-5 space-y-0">
          {patient.timeline.map((ev, i) => {
            const Icon = eventIcon[ev.type] || Activity;
            return (
              <div key={ev.id} className="flex gap-3 pb-4 last:pb-0">
                <div className="relative flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  {i < patient.timeline.length - 1 && <div className="mt-1 w-px flex-1 bg-slate-200 dark:bg-zinc-800" />}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{ev.title}</p>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">{formatDateTime(ev.time)} • {timeAgo(ev.time)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-zinc-300">{ev.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add Clinical Note Modal */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0" onClick={() => setIsAddNoteModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Add Clinical Note / Vitals Entry</h3>
              <button onClick={() => setIsAddNoteModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Entry Classification</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                >
                  <option value="observation">Clinical Observation / Progress Note</option>
                  <option value="medication">Medication Order / Bolus Titration</option>
                  <option value="lab">Stat Arterial Lab Analysis</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Entry Title / Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Norepinephrine weaned to 0.04 mcg/kg/min"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Detailed Physician Notes</label>
                <textarea
                  rows={3}
                  placeholder="Clinical rationale, MAP stability observations, or response to therapy..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <Button variant="ghost" type="button" onClick={() => setIsAddNoteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Record Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Shift Handoff Modal */}
      <AIShiftHandoffModal
        isOpen={isHandoffModalOpen}
        patient={patient}
        onClose={() => setIsHandoffModalOpen(false)}
      />

      {/* Refer Patient Modal */}
      <ReferPatientModal
        isOpen={isReferModalOpen}
        patient={patient}
        onClose={() => setIsReferModalOpen(false)}
        onReferred={(destName) => {
          setSuccessNoteMessage(`Patient ${patient.name} successfully referred to ${destName}. Transfer record appended.`);
          setTimeout(() => setSuccessNoteMessage(null), 4000);
        }}
      />

      {/* Discharge Patient Modal */}
      <DischargePatientModal
        isOpen={isDischargeModalOpen}
        patient={patient}
        onClose={() => setIsDischargeModalOpen(false)}
        onDischarged={() => {
          setTimeout(() => {
            navigate('/doctor/patients');
          }, 500);
        }}
      />

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-500">
        <Brain className="h-3.5 w-3.5 text-blue-600 dark:text-orange-500" /> CAREX AI outputs provide clinical decision support and do not replace attending physician judgment.
      </p>
    </div>
  );
}

function VitalPill({ icon, label, value, unit, danger }: { icon: React.ReactNode; label: string; value: string | number; unit: string; danger: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${danger ? 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10' : 'border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60'}`}>
      <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${danger ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-zinc-400'}`}>
        {icon}{label}
      </span>
      <p className={`mt-1 font-mono text-lg font-extrabold tabular-nums ${danger ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-slate-900 dark:text-zinc-100'}`}>{value}</p>
      <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium">{unit}</p>
    </div>
  );
}

function TrendCard({ title, data, keyName, color, unit }: { title: string; data: Record<string, string | number>[]; keyName: string; color: string; unit: string }) {
  return (
    <Card className="p-4 border border-slate-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{title}</p>
        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">{unit}</span>
      </div>
      <div className="mt-2 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`g-${keyName}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} width={28} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12, color: '#fff' }} />
            <Area type="monotone" dataKey={keyName} stroke={color} strokeWidth={2} fill={`url(#g-${keyName})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
