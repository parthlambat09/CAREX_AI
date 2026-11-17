import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Check, Eye, ArrowUpCircle,
  Activity, Brain, Heart, Wind, Pill, ArrowUp, Download, CheckCheck, CheckCircle2
} from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { Card, SectionTitle, Button, PageHeader, EmptyState } from '@/features/doctor/components/ui';
import { severityBg, formatDateTime, timeAgo } from '@/features/doctor/utils/format';
import { labelForCategory } from '@/features/doctor/mock/patients';
import type { AlertCategory, AlertSeverity } from '@/types/doctor';

const CAT_ICON: Record<AlertCategory, typeof AlertTriangle> = {
  critical_deterioration: AlertTriangle,
  sepsis_risk: Brain,
  cardiac_arrest_risk: Heart,
  respiratory_failure_risk: Wind,
  abnormal_vitals: Activity,
  drug_interaction: Pill,
  escalation_required: ArrowUp,
};

export function AlertsPage() {
  const { alerts, patients, acknowledgeAlert, escalateAlert, activeHospital } = useSimulation();
  const [cat, setCat] = useState<'all' | AlertCategory>('all');
  const [sev, setSev] = useState<'all' | AlertSeverity>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return alerts.filter((a) => (cat === 'all' || a.category === cat) && (sev === 'all' || a.severity === sev));
  }, [alerts, cat, sev]);

  const unreadAlerts = filtered.filter((a) => !a.acknowledged);
  const unreadCount = unreadAlerts.length;

  const handleAcknowledgeAll = () => {
    unreadAlerts.forEach((a) => acknowledgeAlert(a.id));
    setToastMessage(`Acknowledged ${unreadCount} active clinical alerts in queue.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEscalateWithFeedback = (id: string, bed: string) => {
    escalateAlert(id);
    setToastMessage(`Escalation protocol initiated for Bed ${bed}. Critical care team dispatched.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportAlerts = () => {
    const headers = ['ID', 'PatientID', 'Bed', 'Severity', 'Category', 'RiskScore', 'Reason', 'Time', 'Acknowledged'];
    const rows = filtered.map((a) => [
      a.id,
      a.patientId,
      a.bed,
      a.severity,
      a.category,
      a.riskScore,
      `"${a.reason}"`,
      `"${a.time}"`,
      a.acknowledged ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `carex_alerts_${activeHospital.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`Exported ${filtered.length} alert records.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const cats: { id: 'all' | AlertCategory; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'critical_deterioration', label: 'Critical Deterioration' },
    { id: 'sepsis_risk', label: 'Sepsis Risk' },
    { id: 'cardiac_arrest_risk', label: 'Cardiac Arrest' },
    { id: 'respiratory_failure_risk', label: 'Resp. Failure' },
    { id: 'abnormal_vitals', label: 'Abnormal Vitals' },
    { id: 'drug_interaction', label: 'Drug Interaction' },
    { id: 'escalation_required', label: 'Escalation' },
  ];

  const sevs = [
    { id: 'all', label: 'All Severities' },
    { id: 'critical', label: 'Critical' },
    { id: 'warning', label: 'Warning' },
    { id: 'info', label: 'Info' },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Early Warning & Clinical Escalation Queue"
          description={`Real-time queue of AI-detected physiological alerts, sepsis warnings, and escalation protocols for ${activeHospital.name}.`}
          statusPill={{ label: `${unreadCount} Active Unacknowledged`, variant: unreadCount > 0 ? 'critical' : 'stable' }}
        />

        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="default" onClick={handleExportAlerts}>
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>

          {unreadCount > 0 && (
            <Button variant="primary" onClick={handleAcknowledgeAll}>
              <CheckCheck className="h-4 w-4" />
              <span>Acknowledge All ({unreadCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as 'all' | AlertCategory)}
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3.5 py-1.5 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:border-blue-500 dark:focus:border-orange-500 focus:outline-none"
          >
            {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>

          <select
            value={sev}
            onChange={(e) => setSev(e.target.value as 'all' | AlertSeverity)}
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3.5 py-1.5 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:border-blue-500 dark:focus:border-orange-500 focus:outline-none"
          >
            {sevs.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
          Showing {filtered.length} total alerts ({unreadCount} unacknowledged)
        </span>
      </div>

      {/* Alert Timeline */}
      <Card className="p-5 border border-slate-200 dark:border-zinc-800">
        <SectionTitle title="Chronological Alert Feed" subtitle="Real-time automated warnings & clinical recommendations" />
        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState title="No alerts matching selected criteria" message="All monitored ICU parameters are operating within established bounds." />
          ) : (
            filtered.map((a) => {
              const Icon = CAT_ICON[a.category];
              const critical = a.severity === 'critical';
              return (
                <div
                  key={a.id}
                  className={`flex flex-col md:flex-row md:items-center gap-4 rounded-2xl border p-4 transition-all ${
                    critical
                      ? 'border-red-200 bg-red-50 text-red-950 dark:border-red-500/30 dark:bg-red-500/10 dark:text-zinc-100'
                      : 'border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60'
                  } ${a.acknowledged ? 'opacity-60' : ''}`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      critical
                        ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                        : a.severity === 'warning'
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-orange-500/20 dark:text-orange-400'
                    }`}
                  >
                    <Icon className="h-5.5 w-5.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/doctor/patient/${a.patientId}`} className="font-bold text-sm text-blue-600 dark:text-orange-400 hover:underline">
                        {patients.find((p) => p.id === a.patientId)?.name || a.patientId} <span className="font-mono text-xs text-slate-400 dark:text-zinc-500">({a.patientId})</span>
                      </Link>
                      <span className="text-xs text-slate-500 dark:text-zinc-400">· Bed {a.bed}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${severityBg[a.severity]}`}>
                        {labelForCategory(a.category)}
                      </span>
                      {a.acknowledged && (
                        <button
                          type="button"
                          onClick={() => acknowledgeAlert(a.id)}
                          className="rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1"
                          title="Click to re-trigger status de-escalation to Unstable, Stable, or Recovering"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Acknowledged (De-escalated)</span>
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-900 dark:text-zinc-100">{a.reason}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>{formatDateTime(a.time)} • {timeAgo(a.time)}</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">Deterioration Score: {a.riskScore}%</span>
                    </div>

                    <div className="mt-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Clinical Protocol Guidance</p>
                      <p className="mt-0.5 text-xs text-slate-700 dark:text-zinc-300">{a.recommendation}</p>
                    </div>
                  </div>

                  <div className="flex md:flex-col shrink-0 gap-2 justify-end">
                    <Button
                      size="sm"
                      variant={a.acknowledged ? "ghost" : "primary"}
                      onClick={() => acknowledgeAlert(a.id)}
                      className={!a.acknowledged ? "bg-blue-600 hover:bg-blue-700 text-white font-bold" : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-bold"}
                      title="Acknowledge alert & randomly step-down patient status (Unstable, Stable, Recovering)"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{a.acknowledged ? "De-escalate" : "Ack"}</span>
                    </Button>

                    <Link to={`/doctor/patient/${a.patientId}`}>
                      <Button size="sm" variant="default">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </Link>
                    {!a.acknowledged && (
                      <Button size="sm" variant="danger" onClick={() => handleEscalateWithFeedback(a.id, a.bed)}>
                        <ArrowUpCircle className="h-3.5 w-3.5" /> Escalate
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
