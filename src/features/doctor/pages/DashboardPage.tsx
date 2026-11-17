import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, HeartPulse, AlertTriangle, BedDouble, Bell, Clock,
  Brain, ChevronRight, ArrowRight, Radio, Video
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, LineChart, Line,
} from 'recharts';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { Card, SectionTitle, RiskBadge, Button, PageHeader, StatCard } from '@/features/doctor/components/ui';
import { ECGWaveform } from '@/features/doctor/components/ECGWaveform';
import { timeAgo } from '@/features/doctor/utils/format';
import { labelForCategory } from '@/features/doctor/mock/patients';
import { TeleconsultModal } from '@/features/doctor/components/TeleconsultModal';

export function DashboardPage() {
  const { patients, alerts, acknowledgeAlert, activeHospital } = useSimulation();
  const [isTeleconsultOpen, setIsTeleconsultOpen] = useState(false);

  const kpi = useMemo(() => {
    const critical = patients.filter((p) => p.risk.overall >= 80).length;
    const elevated = patients.filter((p) => p.risk.overall >= 65 && p.risk.overall < 80).length;
    const caution = patients.filter((p) => p.risk.overall >= 40 && p.risk.overall < 65).length;
    const stable = patients.filter((p) => p.risk.overall < 40).length;
    const high = critical + elevated;
    const active = alerts.filter((a) => !a.acknowledged).length;
    const avgStay = patients.length > 0 ? (patients.reduce((s, p) => s + p.admittedDays, 0) / patients.length).toFixed(1) : '3.5';
    return {
      total: patients.length,
      critical,
      elevated,
      caution,
      stable,
      high,
      occupancy: Math.min(100, Math.round((patients.length / 20) * 100)),
      active,
      avgStay,
    };
  }, [patients, alerts]);

  const riskDist = useMemo(() => {
    const critical = patients.filter((p) => p.risk.overall >= 80).length;
    const elevated = patients.filter((p) => p.risk.overall >= 65 && p.risk.overall < 80).length;
    const caution = patients.filter((p) => p.risk.overall >= 40 && p.risk.overall < 65).length;
    const stable = patients.filter((p) => p.risk.overall < 40).length;
    return [
      { name: 'Critical (≥80)', value: critical, color: '#ef4444' },
      { name: 'Elevated (65–79)', value: elevated, color: '#f97316' },
      { name: 'Caution (40–64)', value: caution, color: '#eab308' },
      { name: 'Stable (<40)', value: stable, color: '#10b981' },
    ];
  }, [patients]);

  const trend7 = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({ day: `D-${6 - i}`, risk: 12 + Math.round(Math.sin(i) * 3) + i * 1.5 })),
    []
  );
  const occTrend = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ h: `${i * 2}:00`, occ: 60 + Math.round(Math.sin(i / 2) * 12) + i })),
    []
  );
  const alertTrend = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({ day: `D-${6 - i}`, alerts: 8 + Math.round(Math.cos(i) * 4) + i })),
    []
  );
  const losDist = useMemo(
    () => [
      { range: '1-3d', count: 5 },
      { range: '4-7d', count: 6 },
      { range: '8-14d', count: 3 },
      { range: '15+d', count: 2 },
    ],
    []
  );

  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="ICU Command Center"
        description={`Real-time critical care telemetry, AI deterioration risk scoring, and bed capacity intelligence across ${activeHospital.name}.`}
        statusPill={{ label: 'Simulation Telemetry Active', variant: 'info' }}
        actions={
          <Link to="/doctor/monitoring">
            <Button variant="primary" size="md">
              Open Live Telemetry <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      {/* Prominent One-Tap Teleconsult Launch Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-blue-500/10 dark:border-teal-500/30 dark:from-teal-950/40 dark:to-zinc-900 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white dark:bg-teal-500 dark:text-black shadow-md shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">One-Tap Teleconsult Launch</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
                INSTANT SPECIALIST LINK
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Connect instantly with off-site Cardiologists, Intensivists, or Neurologists with full live telemetry sharing.
            </p>
          </div>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsTeleconsultOpen(true)} className="shrink-0">
          <Video className="h-4 w-4" />
          <span>One-Tap Teleconsult</span>
        </Button>
      </div>

      {/* Simulation Banner */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 dark:border-orange-500/30 dark:bg-orange-500/10 p-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-orange-500/20 dark:text-orange-400 shrink-0">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-zinc-100">ICU Simulation Mode Active</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-slate-600 dark:text-zinc-400 mt-0.5">
              Live vitals, SpO2 telemetry, and risk algorithms are operating on high-frequency simulated drift data.
            </p>
          </div>
        </div>
        <Link to="/doctor/monitoring" className="hidden sm:inline-flex">
          <Button variant="ghost" size="sm">Configure Stream</Button>
        </Link>
      </div>

      {/* Enterprise KPI Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Monitored" value={kpi.total} unit="beds" subtitle="16 staffed beds" icon={Users} status="stable" />
        <StatCard title="Critical State" value={kpi.critical} unit="beds" trend="Requires review" trendDirection="down" status="critical" icon={HeartPulse} />
        <StatCard title="High Deterioration" value={kpi.high} unit="patients" trend="+1 last hr" trendDirection="up" status="warning" icon={AlertTriangle} />
        <StatCard title="ICU Occupancy" value={kpi.occupancy} unit="%" subtitle="16 / 20 beds filled" status="monitoring" icon={BedDouble} />
        <StatCard title="Unacknowledged" value={kpi.active} unit="alerts" trend="Active queue" trendDirection="down" status="critical" icon={Bell} />
        <StatCard title="Avg ICU Stay" value={kpi.avgStay} unit="days" subtitle="Benchmark 4.2d" status="stable" icon={Clock} />
      </div>

      {/* Real-time Telemetry Table */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 px-5 py-4 bg-slate-50 dark:bg-zinc-950">
          <SectionTitle title="Real-Time Patient Telemetry" subtitle="Sub-second vitals stream & ECG wave analysis" />
          <Link to="/doctor/monitoring" className="text-xs font-semibold text-blue-600 dark:text-orange-400 hover:underline">
            View All Telemetry →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold bg-slate-100 dark:bg-zinc-900">
                <th className="px-5 py-3">Patient ID</th>
                <th className="px-3 py-3">Bed</th>
                <th className="px-3 py-3">HR (bpm)</th>
                <th className="px-3 py-3">SpO2 (%)</th>
                <th className="px-3 py-3">RR (/min)</th>
                <th className="px-3 py-3">BP (mmHg)</th>
                <th className="px-3 py-3">Temp (°C)</th>
                <th className="px-3 py-3">ECG Waveform</th>
                <th className="px-3 py-3">AI Risk</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {patients.slice(0, 8).map((p) => {
                const isCritical = p.risk.overall >= 80;
                const isElevated = p.risk.overall >= 65 && p.risk.overall < 80;
                const isCaution = p.risk.overall >= 40 && p.risk.overall < 65;
                const tierColor = isCritical ? '#ef4444' : isElevated ? '#f97316' : isCaution ? '#eab308' : '#10b981';
                const borderClass = isCritical
                  ? 'border-l-4 border-l-red-600 dark:border-l-red-500'
                  : isElevated
                  ? 'border-l-4 border-l-orange-500 dark:border-l-orange-400'
                  : isCaution
                  ? 'border-l-4 border-l-amber-500 dark:border-l-amber-400'
                  : 'border-l-4 border-l-emerald-600 dark:border-l-emerald-500';

                return (
                  <tr key={p.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50 ${borderClass}`}>
                    <td className="px-5 py-3 font-semibold">
                      <Link to={`/doctor/patient/${p.id}`} className="text-blue-600 dark:text-orange-400 hover:underline">
                        {p.name} <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">({p.id})</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-700 dark:text-zinc-300 font-medium">{p.bed}</td>
                    <td className="px-3 py-3 font-mono tabular-nums text-slate-900 dark:text-zinc-100 font-bold">{p.vitals.heartRate}</td>
                    <td className={`px-3 py-3 font-mono tabular-nums font-bold ${p.vitals.spo2 < 92 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-zinc-100'}`}>
                      {p.vitals.spo2}%
                    </td>
                    <td className="px-3 py-3 font-mono tabular-nums text-slate-800 dark:text-zinc-200">{p.vitals.respiratoryRate}</td>
                    <td className="px-3 py-3 font-mono tabular-nums text-slate-800 dark:text-zinc-200">{p.vitals.systolic}/{p.vitals.diastolic}</td>
                    <td className="px-3 py-3 font-mono tabular-nums text-slate-800 dark:text-zinc-200">{p.vitals.temperature}°</td>
                    <td className="px-3 py-3 w-28">
                      <ECGWaveform color={tierColor} height={28} speed={isCritical ? 1.4 : 1} />
                    </td>
                    <td className="px-3 py-3"><RiskBadge score={p.risk.overall} /></td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCritical ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                        isElevated ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                        isCaution ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                      }`}>
                        {isCritical ? 'Critical' : isElevated ? 'Elevated' : isCaution ? 'Caution' : 'Stable'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Risk + Alerts Feed Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <SectionTitle title="AI Risk Matrix" subtitle="Unit deterioration score breakdown" />
          <div className="mt-4 flex items-center gap-4">
            <div className="h-36 w-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskDist} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={3} stroke="none">
                    {riskDist.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5">
              {riskDist.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-zinc-300 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name}-risk
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{d.value} beds</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 border-t border-slate-200 dark:border-zinc-800 pt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">7-Day Deterioration Trend</p>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend7}>
                  <defs>
                    <linearGradient id="riskG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d97706" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                  <Area type="monotone" dataKey="risk" stroke="#d97706" strokeWidth={2} fill="url(#riskG)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionTitle
            title="Live Clinical Alerts & Escalation"
            subtitle="AI-prioritized events requiring immediate response"
            action={
              <Link to="/doctor/alerts" className="text-xs font-semibold text-blue-600 dark:text-orange-400 hover:underline">
                View All Queue →
              </Link>
            }
          />
          <div className="mt-4 space-y-2.5">
            {recentAlerts.map((a) => (
              <div
                key={a.id}
                className={`flex items-center gap-3 rounded-xl border p-3 text-xs transition ${
                  a.severity === 'critical'
                    ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-zinc-100'
                    : 'border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    a.severity === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}
                >
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/doctor/patient/${a.patientId}`} className="font-bold text-blue-600 dark:text-orange-400 hover:underline">
                      {patients.find((p) => p.id === a.patientId)?.name || a.patientId}
                    </Link>
                    <span className="text-slate-500 dark:text-zinc-400">· Bed {a.bed}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' : 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'}`}>
                      {labelForCategory(a.category)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-slate-700 dark:text-zinc-300">{a.reason}</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">{timeAgo(a.time)} · Deterioration Score: {a.riskScore}%</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!a.acknowledged && (
                    <Button size="sm" variant="ghost" onClick={() => acknowledgeAlert(a.id)}>Ack</Button>
                  )}
                  <Link to={`/doctor/patient/${a.patientId}`}>
                    <Button size="sm" variant="default">View <ChevronRight className="h-3 w-3" /></Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Analytics Mini-Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">ICU Bed Occupancy Trend</p>
          <div className="mt-3 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occTrend}>
                <defs>
                  <linearGradient id="occG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="h" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                <Area type="monotone" dataKey="occ" stroke="#2563eb" strokeWidth={2} fill="url(#occG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Alert Frequency Trend</p>
          <div className="mt-3 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertTrend}>
                <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} width={20} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                <Bar dataKey="alerts" fill="#dc2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Mortality Drift Velocity</p>
          <div className="mt-3 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend7}>
                <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} width={20} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                <Line type="monotone" dataKey="risk" stroke="#d97706" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Length of Stay (LOS)</p>
          <div className="mt-3 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={losDist} layout="vertical">
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="range" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={38} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                <Bar dataKey="count" fill="#059669" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Footer Disclaimer */}
      <div className="py-2 text-center text-[11px] text-slate-500 dark:text-zinc-500 flex items-center justify-center gap-1.5">
        <Brain className="h-3.5 w-3.5 text-blue-600 dark:text-orange-500" />
        <span>CAREX ICU Intelligence Platform • High-frequency clinical telemetry prototype.</span>
      </div>

      {/* Teleconsult Modal */}
      <TeleconsultModal
        isOpen={isTeleconsultOpen}
        onClose={() => setIsTeleconsultOpen(false)}
        patient={patients[0] || null}
        allPatients={patients}
      />
    </div>
  );
}
