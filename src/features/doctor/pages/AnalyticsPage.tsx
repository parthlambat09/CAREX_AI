import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, SectionTitle, PageHeader, Button } from '@/features/doctor/components/ui';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { Filter, Download, CheckCircle2 } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AnalyticsPage() {
  const { patients, activeHospital } = useSimulation();
  const [unit, setUnit] = useState('all');
  const [risk, setRisk] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const occData = useMemo(() => DAYS.map((d, i) => ({ day: d, occ: 62 + Math.round(Math.sin(i) * 10) + i * 2 })), []);
  const riskDist = useMemo(() => {
    const high = patients.filter((p) => p.risk.overall >= 70).length;
    const med = patients.filter((p) => p.risk.overall >= 40 && p.risk.overall < 70).length;
    const low = patients.filter((p) => p.risk.overall < 40).length;
    return [
      { name: 'High Risk', value: high, color: '#dc2626' },
      { name: 'Medium Risk', value: med, color: '#d97706' },
      { name: 'Low Risk', value: low, color: '#059669' },
    ];
  }, [patients]);

  const critTrend = useMemo(() => DAYS.map((d, i) => ({ day: d, count: 3 + Math.round(Math.cos(i / 2) * 2) + Math.floor(i / 2) })), []);
  const alertFreq = useMemo(() => DAYS.map((d, i) => ({ day: d, count: 8 + Math.round(Math.sin(i) * 5) + i })), []);
  const sepsisTrend = useMemo(() => DAYS.map((d, i) => ({ day: d, rate: 14 + Math.round(Math.sin(i / 2) * 4) + i })), []);
  const mortTrend = useMemo(() => DAYS.map((d, i) => ({ day: d, risk: 12 + Math.round(Math.cos(i) * 3) + i * 1.5 })), []);
  const losData = useMemo(() => [
    { range: '1-3d', count: 5 }, { range: '4-7d', count: 6 }, { range: '8-14d', count: 3 }, { range: '15+d', count: 2 },
  ], []);
  const recoveryData = useMemo(() => DAYS.map((d, i) => ({ day: d, rate: 40 + Math.round(Math.sin(i / 2) * 8) + i * 2 })), []);

  const handleExportReport = () => {
    const report = [
      ['Metric', 'Current Value', 'Hospital'],
      ['Total Monitored Beds', patients.length, `"${activeHospital.name}"`],
      ['Critical Acuity Patients', patients.filter(p => p.risk.overall >= 80).length, `"${activeHospital.name}"`],
      ['Elevated Risk Patients', patients.filter(p => p.risk.overall >= 65 && p.risk.overall < 80).length, `"${activeHospital.name}"`],
      ['Average Length of Stay', '3.8 Days', `"${activeHospital.name}"`],
      ['Occupancy Rate', '78%', `"${activeHospital.name}"`],
    ].map(r => r.join(',')).join('\n');

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + report);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `carex_icu_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Exported clinical intelligence report.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Hospital Analytics & ICU Reports"
          description={`Departmental telemetry trends, capacity forecasting, sepsis incidence tracking, and length of stay distribution for ${activeHospital.name}.`}
          statusPill={{ label: 'Aggregated Analytics Nominal', variant: 'info' }}
        />

        <Button variant="primary" onClick={handleExportReport}>
          <Download className="h-4 w-4" />
          <span>Export Analytics Report</span>
        </Button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-blue-600 dark:text-orange-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Unit Filter:</span>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:border-blue-500 dark:focus:border-orange-500 focus:outline-none"
          >
            <option value="all">All ICU Units</option>
            <option value="general">General ICU</option>
            <option value="cardiac">Cardiac ICU</option>
            <option value="neuro">Neuro ICU</option>
            <option value="surgical">Surgical ICU</option>
          </select>

          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:border-blue-500 dark:focus:border-orange-500 focus:outline-none"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk Only</option>
            <option value="medium">Medium Risk Only</option>
            <option value="low">Low Risk Only</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="ICU Occupancy Rate" subtitle="Weekly occupancy trend %">
          <AreaChart data={occData}>
            <defs>
              <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tipStyle} />
            <Area type="monotone" dataKey="occ" stroke="#2563eb" strokeWidth={2} fill="url(#a1)" />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Patient Risk Breakdown" subtitle="Current census distribution">
          <PieChart>
            <Pie data={riskDist} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} stroke="none">
              {riskDist.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
            <Tooltip contentStyle={tipStyle} />
          </PieChart>
        </ChartCard>

        <ChartCard title="Critical Patient Volume" subtitle="Daily critical bed count">
          <LineChart data={critTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tipStyle} />
            <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} dot={{ r: 3, fill: '#dc2626' }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Alert Generation Frequency" subtitle="Total alerts per day">
          <BarChart data={alertFreq}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tipStyle} />
            <Bar dataKey="count" fill="#d97706" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Sepsis Prediction Incidence" subtitle="Predicted sepsis onset rate %">
          <AreaChart data={sepsisTrend}>
            <defs>
              <linearGradient id="a2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tipStyle} />
            <Area type="monotone" dataKey="rate" stroke="#d97706" strokeWidth={2} fill="url(#a2)" />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Mortality Drift Velocity" subtitle="Average predicted mortality index">
          <LineChart data={mortTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tipStyle} />
            <Line type="monotone" dataKey="risk" stroke="#ea580c" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Average Length of Stay (LOS)" subtitle="Patient count by duration range">
          <BarChart data={losData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="range" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={tipStyle} />
            <Bar dataKey="count" fill="#059669" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Discharge Readiness Index" subtitle="Recovery trend rate %">
          <AreaChart data={recoveryData}>
            <defs>
              <linearGradient id="a3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={tipStyle} />
            <Area type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2} fill="url(#a3)" />
          </AreaChart>
        </ChartCard>
      </div>
    </div>
  );
}

const tipStyle = { background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12, color: '#fff' };

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 border border-slate-200 dark:border-zinc-800">
      <SectionTitle title={title} subtitle={subtitle} />
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </Card>
  );
}
