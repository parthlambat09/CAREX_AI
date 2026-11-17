import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Droplet, Wind, Thermometer, Gauge } from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { Card, PageHeader, Toggle } from '@/features/doctor/components/ui';
import { ECGWaveform } from '@/features/doctor/components/ECGWaveform';
import type { Patient } from '@/types/doctor';

type Filter = 'all' | 'critical' | 'elevated' | 'caution' | 'stable';
type Sort = 'risk' | 'recent' | 'bed';

// 4-Tier ICU Command Center Color-Coding System
export function getTierInfo(riskScore: number) {
  if (riskScore >= 80) {
    return {
      tier: 'critical' as const,
      label: 'Critical',
      color: 'red',
      borderClass: 'border-l-4 border-l-red-600 dark:border-l-red-500',
      badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
      ecgColor: '#ef4444',
      bgHover: 'hover:border-red-300 dark:hover:border-red-500/50',
      description: 'Severe Physiological Decompensation (Risk ≥ 80)',
    };
  }
  if (riskScore >= 65) {
    return {
      tier: 'elevated' as const,
      label: 'Elevated Risk',
      color: 'orange',
      borderClass: 'border-l-4 border-l-orange-500 dark:border-l-orange-400',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
      ecgColor: '#f97316',
      bgHover: 'hover:border-orange-300 dark:hover:border-orange-500/50',
      description: 'Trending Toward Crisis Boundary (Risk 65–79)',
    };
  }
  if (riskScore >= 40) {
    return {
      tier: 'caution' as const,
      label: 'Caution',
      color: 'yellow',
      borderClass: 'border-l-4 border-l-amber-500 dark:border-l-amber-400',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
      ecgColor: '#eab308',
      bgHover: 'hover:border-amber-300 dark:hover:border-amber-500/50',
      description: 'Moderate Drift Observed (Risk 40–64)',
    };
  }
  return {
    tier: 'stable' as const,
    label: 'Stable',
    color: 'green',
    borderClass: 'border-l-4 border-l-emerald-600 dark:border-l-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
    ecgColor: '#10b981',
    bgHover: 'hover:border-emerald-300 dark:hover:border-emerald-500/50',
    description: 'Physiological Parameters Nominal (Risk < 40)',
  };
}

export function MonitoringPage() {
  const { patients, alerts, activeHospital } = useSimulation();
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('risk');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const lastAlertTime = useMemo(() => {
    const m = new Map<string, string>();
    alerts.forEach((a) => { if (!m.has(a.patientId)) m.set(a.patientId, a.time); });
    return m;
  }, [alerts]);

  const filtered = useMemo(() => {
    let list = [...patients];
    if (filter === 'critical') list = list.filter((p) => p.risk.overall >= 80);
    else if (filter === 'elevated') list = list.filter((p) => p.risk.overall >= 65 && p.risk.overall < 80);
    else if (filter === 'caution') list = list.filter((p) => p.risk.overall >= 40 && p.risk.overall < 65);
    else if (filter === 'stable') list = list.filter((p) => p.risk.overall < 40);

    if (sort === 'risk') list.sort((a, b) => b.risk.overall - a.risk.overall);
    else if (sort === 'bed') list.sort((a, b) => a.bed.localeCompare(b.bed));
    else list.sort((a, b) => +new Date(lastAlertTime.get(b.id) ?? 0) - +new Date(lastAlertTime.get(a.id) ?? 0));
    return list;
  }, [patients, filter, sort, lastAlertTime]);

  const counts = useMemo(() => ({
    all: patients.length,
    critical: patients.filter((p) => p.risk.overall >= 80).length,
    elevated: patients.filter((p) => p.risk.overall >= 65 && p.risk.overall < 80).length,
    caution: patients.filter((p) => p.risk.overall >= 40 && p.risk.overall < 65).length,
    stable: patients.filter((p) => p.risk.overall < 40).length,
  }), [patients]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Real-Time Telemetry Wall"
        description={`High-frequency telemetry grid monitoring live ECG waveforms, arterial blood pressure, SpO2, and AI risk drift across ${activeHospital.name}.`}
        statusPill={{ label: autoRefresh ? 'Stream Active (3s)' : 'Paused', variant: autoRefresh ? 'stable' : 'warning' }}
        actions={
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-xs">
            <Toggle checked={autoRefresh} onChange={setAutoRefresh} label="Live Updates" />
          </div>
        }
      />

      {/* 4-Tier Acuity Severity Legend Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0 shadow-xs shadow-emerald-500/30" />
          <div>
            <span className="font-bold text-slate-900 dark:text-zinc-100">Green — Stable</span>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Risk &lt; 40 • {counts.stable} Beds</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 shadow-xs shadow-amber-500/30" />
          <div>
            <span className="font-bold text-slate-900 dark:text-zinc-100">Yellow — Caution</span>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Risk 40–64 • {counts.caution} Beds</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shrink-0 shadow-xs shadow-orange-500/30" />
          <div>
            <span className="font-bold text-slate-900 dark:text-zinc-100">Orange — Elevated</span>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Risk 65–79 • {counts.elevated} Beds</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 shrink-0 animate-pulse shadow-xs shadow-red-600/40" />
          <div>
            <span className="font-bold text-slate-900 dark:text-zinc-100">Red — Critical</span>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Risk &ge; 80 • {counts.critical} Beds</p>
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white dark:bg-orange-500 dark:text-black shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            All Beds ({counts.all})
          </button>

          <button
            onClick={() => setFilter('critical')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === 'critical'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            Red / Critical ({counts.critical})
          </button>

          <button
            onClick={() => setFilter('elevated')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === 'elevated'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300'
            }`}
          >
            Orange / Elevated ({counts.elevated})
          </button>

          <button
            onClick={() => setFilter('caution')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === 'caution'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
            }`}
          >
            Yellow / Caution ({counts.caution})
          </button>

          <button
            onClick={() => setFilter('stable')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === 'stable'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            Green / Stable ({counts.stable})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:outline-none"
          >
            <option value="risk">Highest AI Risk</option>
            <option value="recent">Most Recent Alert</option>
            <option value="bed">Bed Assignment</option>
          </select>
        </div>
      </div>

      {/* Grid of Patient Telemetry Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((p) => (
          <PatientMonitorCard key={p.id} patient={p} />
        ))}
      </div>
    </div>
  );
}

function PatientMonitorCard({ patient: p }: { patient: Patient }) {
  const tier = getTierInfo(p.risk.overall);

  return (
    <Link to={`/doctor/patient/${p.id}`} className="block">
      <Card
        hover
        className={`overflow-hidden p-0 border border-slate-200 dark:border-zinc-800 ${tier.borderClass} ${tier.bgHover} transition-all duration-200`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 px-4 py-3 bg-slate-50 dark:bg-zinc-950">
          <div>
            <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">{p.name}</span>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              Bed {p.bed} • <span className="font-bold">{p.id}</span>
            </div>
          </div>
          
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${tier.badgeClass}`}>
            {tier.label}
          </span>
        </div>

        {/* ECG Waveform Strip */}
        <div className="relative bg-slate-950 dark:bg-black px-2 py-1">
          <ECGWaveform color={tier.ecgColor} height={52} speed={tier.tier === 'critical' ? 1.5 : 1} />
          <span className="absolute right-3 top-1 font-mono text-[9px] text-slate-400">Lead II • 25mm/s</span>
        </div>

        {/* Vitals Telemetry Grid */}
        <div className="grid grid-cols-3 gap-px bg-slate-200 dark:bg-zinc-800">
          <VitalCell
            icon={<Heart className="h-3.5 w-3.5 text-red-500" />}
            label="HR"
            value={p.vitals.heartRate}
            unit="bpm"
            danger={p.vitals.heartRate > 110 || p.vitals.heartRate < 50}
          />
          <VitalCell
            icon={<Droplet className="h-3.5 w-3.5 text-blue-500 dark:text-orange-400" />}
            label="SpO2"
            value={p.vitals.spo2}
            unit="%"
            danger={p.vitals.spo2 < 92}
          />
          <VitalCell
            icon={<Wind className="h-3.5 w-3.5 text-emerald-500" />}
            label="RR"
            value={p.vitals.respiratoryRate}
            unit="/min"
            danger={p.vitals.respiratoryRate > 24}
          />
          <VitalCell
            icon={<Gauge className="h-3.5 w-3.5 text-amber-500" />}
            label="BP"
            value={`${p.vitals.systolic}/${p.vitals.diastolic}`}
            unit="mmHg"
            danger={p.vitals.systolic > 160 || p.vitals.systolic < 90}
          />
          <VitalCell
            icon={<Thermometer className="h-3.5 w-3.5 text-orange-500" />}
            label="Temp"
            value={p.vitals.temperature}
            unit="°C"
            danger={p.vitals.temperature > 38.5}
          />

          <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 px-2 py-2.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">AI Risk</span>
            <span className={`mt-0.5 font-mono text-base font-black ${
              tier.tier === 'critical' ? 'text-red-600 dark:text-red-400' :
              tier.tier === 'elevated' ? 'text-orange-600 dark:text-orange-400' :
              tier.tier === 'caution' ? 'text-amber-600 dark:text-amber-400' :
              'text-emerald-600 dark:text-emerald-400'
            }`}>
              {p.risk.overall}%
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function VitalCell({ icon, label, value, unit, danger }: { icon: React.ReactNode; label: string; value: string | number; unit: string; danger: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 px-2 py-2.5">
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
        {icon}{label}
      </span>
      <span className={`mt-0.5 font-mono text-base font-extrabold tabular-nums ${danger ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-slate-900 dark:text-zinc-100'}`}>
        {value}
      </span>
      <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium">{unit}</span>
    </div>
  );
}
