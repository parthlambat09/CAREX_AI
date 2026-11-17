import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, UserPlus, Download, LogOut, CheckCircle2, Building2 } from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { Card, StatusBadge, RiskBadge, PageHeader, EmptyState, Button } from '@/features/doctor/components/ui';
import { AdmitPatientModal } from '@/features/doctor/components/AdmitPatientModal';
import { DischargePatientModal } from '@/features/doctor/components/DischargePatientModal';
import { ReferPatientModal } from '@/features/doctor/components/ReferPatientModal';
import type { Patient, PatientStatus } from '@/types/doctor';

export function PatientsPage() {
  const { patients, activeHospital, acknowledgeAlert } = useSimulation();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | PatientStatus>('all');
  
  // Modals state
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [dischargeTarget, setDischargeTarget] = useState<Patient | null>(null);
  const [referTarget, setReferTarget] = useState<Patient | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchQ =
        !q ||
        p.id.toLowerCase().includes(q.toLowerCase()) ||
        p.bed.toLowerCase().includes(q.toLowerCase()) ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.diagnosis.toLowerCase().includes(q.toLowerCase());
      const matchS = status === 'all' || p.status === status || p.status.toLowerCase() === status.toLowerCase();
      return matchQ && matchS;
    });
  }, [patients, q, status]);


  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Bed', 'Age', 'Sex', 'Diagnosis', 'AdmittedDays', 'RiskScore', 'Status', 'Hospital'];
    const rows = filtered.map((p) => [
      p.id,
      `"${p.name}"`,
      p.bed,
      p.age,
      p.sex,
      `"${p.diagnosis}"`,
      p.admittedDays,
      p.risk.overall,
      p.status,
      `"${activeHospital.name}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `carex_census_${activeHospital.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`Exported ${filtered.length} patient records to CSV format.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Patients Directory"
          description={`Comprehensive clinical census of all active patients admitted in ${activeHospital.name} Intensive Care Units.`}
          statusPill={{ label: `${patients.length} Active Patients`, variant: 'info' }}
        />

        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="default" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>

          <Button variant="primary" onClick={() => setIsAdmitModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            <span>Admit Patient</span>
          </Button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by name, ID (e.g. ICU-101), bed, or diagnosis..."
            className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 py-2 pl-10 pr-3 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['all', 'Critical', 'Unstable', 'Stable', 'Recovering'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s as any)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                status === s
                  ? 'bg-blue-600 text-white dark:bg-orange-500 dark:text-black shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

      </div>

      {/* Patient Table */}
      <Card className="overflow-hidden p-0 border border-slate-200 dark:border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold bg-slate-100 dark:bg-zinc-900">
                <th className="px-5 py-3.5">Patient Name</th>
                <th className="px-3 py-3.5">ID</th>
                <th className="px-3 py-3.5">Bed</th>
                <th className="px-3 py-3.5">Age / Sex</th>
                <th className="px-3 py-3.5">Primary Diagnosis</th>
                <th className="px-3 py-3.5">Admitted</th>
                <th className="px-3 py-3.5">AI Risk Score</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-0">
                    <EmptyState title="No matching patients found" message="Try relaxing your search filter criteria." />
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-zinc-100">
                      <Link to={`/doctor/patient/${p.id}`} className="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5 font-mono text-slate-500 dark:text-zinc-400">{p.id}</td>
                    <td className="px-3 py-3.5 font-mono font-semibold text-slate-700 dark:text-zinc-300">{p.bed}</td>
                    <td className="px-3 py-3.5 text-slate-600 dark:text-zinc-400">{p.age} yrs / {p.sex}</td>
                    <td className="px-3 py-3.5 text-slate-700 dark:text-zinc-300 font-medium">{p.diagnosis}</td>
                    <td className="px-3 py-3.5 font-mono text-slate-500 dark:text-zinc-400">{p.admittedDays} days</td>
                    <td className="px-3 py-3.5"><RiskBadge score={p.risk.overall} /></td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={p.status} />
                        {(p.status.toLowerCase() === 'critical' || p.risk.overall >= 75) && (
                          <button
                            onClick={() => {
                              acknowledgeAlert(p.id);
                              setToastMessage(`Acknowledged! ${p.name} status de-escalated from Critical.`);
                              setTimeout(() => setToastMessage(null), 3500);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs animate-pulse cursor-pointer flex items-center gap-1 shrink-0"
                            title="Click to ACK & randomly step-down status to Unstable, Stable, or Recovering"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>ACK</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(p.status.toLowerCase() === 'critical' || p.risk.overall >= 75) && (
                          <button
                            onClick={() => {
                              acknowledgeAlert(p.id);
                              setToastMessage(`Acknowledged alert for ${p.name}. Status de-escalated.`);
                              setTimeout(() => setToastMessage(null), 3500);
                            }}
                            className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] shadow-xs flex items-center gap-1 animate-pulse"
                            title="Acknowledge Alert & Step Down Status (Unstable, Stable, Recovering)"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>ACK</span>
                          </button>
                        )}

                        <Link
                          to={`/doctor/patient/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-orange-400 hover:underline"
                        >
                          View <ChevronRight className="h-3.5 w-3.5" />
                        </Link>

                        <button
                          onClick={() => setReferTarget(p)}
                          className="px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors flex items-center gap-1"
                          title="Refer / Escalate Patient to Another Hospital"
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold">Refer</span>
                        </button>

                        <button
                          onClick={() => setDischargeTarget(p)}
                          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-amber-600 hover:border-amber-300 dark:hover:text-amber-400 transition-colors"
                          title="Discharge Patient"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Admit Patient Modal */}
      <AdmitPatientModal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        onAdmitted={(name, bed) => {
          setToastMessage(`Patient ${name} admitted to Bed ${bed}. Bed count updated.`);
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />

      {/* Refer Patient Modal */}
      <ReferPatientModal
        isOpen={!!referTarget}
        patient={referTarget}
        onClose={() => setReferTarget(null)}
        onReferred={(destName) => {
          setToastMessage(`Patient ${referTarget?.name} referred to ${destName}. Transfer logged.`);
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />

      {/* Discharge Patient Modal */}
      <DischargePatientModal
        isOpen={!!dischargeTarget}
        patient={dischargeTarget}
        onClose={() => setDischargeTarget(null)}
        onDischarged={() => {
          setToastMessage(`Patient discharged successfully. Bed ready for sanitization.`);
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />
    </div>
  );
}
