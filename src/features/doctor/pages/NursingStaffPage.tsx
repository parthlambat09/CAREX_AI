import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, UserX, Clock, Phone,
  Plus, Check, ChevronRight, MessageSquare, Shield, Sparkles
} from 'lucide-react';
import { Card, PageHeader, Button } from '@/features/doctor/components/ui';
import { ICU_NURSES, Nurse, NurseStatus, NurseShift } from '@/features/doctor/mock/nurses';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { AIShiftHandoffModal } from '@/features/doctor/components/AIShiftHandoffModal';

export function NursingStaffPage() {
  const { patients, activeHospital } = useSimulation();
  const [nurses, setNurses] = useState<Nurse[]>(ICU_NURSES);
  const [statusFilter, setStatusFilter] = useState<'all' | NurseStatus>('all');
  const [shiftFilter, setShiftFilter] = useState<'all' | NurseShift>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reassignment & Handoff Modal State
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [handoffPatient, setHandoffPatient] = useState<any | null>(null);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalStaff = nurses.length;
    const occupiedCount = nurses.filter((n) => n.status === 'occupied').length;
    const idleCount = nurses.filter((n) => n.status === 'idle').length;
    const totalAllocatedPatients = nurses.reduce((sum, n) => sum + n.assignedPatients.length, 0);
    const ratio = occupiedCount > 0 ? (totalAllocatedPatients / occupiedCount).toFixed(1) : '1:1';

    return {
      totalStaff,
      occupiedCount,
      idleCount,
      totalAllocatedPatients,
      ratio: `1:${ratio}`,
    };
  }, [nurses]);

  // Filtered Nurse List
  const filteredNurses = useMemo(() => {
    return nurses.filter((n) => {
      const matchStatus = statusFilter === 'all' || n.status === statusFilter;
      const matchShift = shiftFilter === 'all' || n.shift === shiftFilter;
      const matchSearch =
        !searchQuery ||
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.assignedPatients.some((p) => p.patientName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchShift && matchSearch;
    });
  }, [nurses, statusFilter, shiftFilter, searchQuery]);

  const handleOpenAssignModal = (nurse: Nurse) => {
    setSelectedNurse(nurse);
    setSelectedPatientId(patients[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedNurse || !selectedPatientId) return;
    const targetPatient = patients.find((p) => p.id === selectedPatientId);
    if (!targetPatient) return;

    // Add patient to nurse and mark nurse as occupied
    setNurses((prev) =>
      prev.map((n) => {
        if (n.id === selectedNurse.id) {
          const alreadyAssigned = n.assignedPatients.some((p) => p.patientId === targetPatient.id);
          if (alreadyAssigned) return n;

          const updatedPatients = [
            ...n.assignedPatients,
            {
              patientId: targetPatient.id,
              patientName: targetPatient.name,
              bed: targetPatient.bed,
              diagnosis: targetPatient.diagnosis,
              riskScore: targetPatient.risk.overall,
              status: targetPatient.status,
            },
          ];
          return {
            ...n,
            status: 'occupied' as NurseStatus,
            assignedPatients: updatedPatients,
          };
        }
        return n;
      })
    );

    setAlertNotice(`Assigned ${targetPatient.name} (Bed ${targetPatient.bed}) to ${selectedNurse.name}. Shift roster updated.`);
    setIsAssignModalOpen(false);
    setTimeout(() => setAlertNotice(null), 3500);
  };

  const handlePageNurse = (nurse: Nurse) => {
    setAlertNotice(`Dispatched high-priority mobile pager tone to ${nurse.name} (${nurse.pager}).`);
    setTimeout(() => setAlertNotice(null), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="ICU Nursing Staff Roster & Patient Allocations"
        description={`Active bedside nurse workload distributions, occupied vs available status, and real-time patient assignments for ${activeHospital.name}.`}
        statusPill={{
          label: `${summary.occupiedCount} Occupied • ${summary.idleCount} Available`,
          variant: 'info',
        }}
      />

      {/* Alert / Notification Feedback */}
      {alertNotice && (
        <div className="p-4 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-blue-600 dark:text-orange-400 shrink-0" />
            <span className="font-semibold">{alertNotice}</span>
          </div>
          <button onClick={() => setAlertNotice(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Executive Workload KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {/* Total Roster */}
        <Card className="p-4 border-l-4 border-l-blue-600 dark:border-l-orange-500 border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Staff on Duty</p>
              <p className="mt-1 text-2xl md:text-3xl font-black text-slate-900 dark:text-zinc-100 font-mono">
                {summary.totalStaff}
              </p>
              <span className="text-xs text-slate-500 dark:text-zinc-400">Active shift coverage</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-orange-500/10 dark:text-orange-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Occupied Nurses */}
        <Card className="p-4 border-l-4 border-l-amber-500 border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Occupied Nurses</p>
              <p className="mt-1 text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {summary.occupiedCount}
              </p>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                Actively assigned to &ge; 1 patient
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Idle / Available Nurses */}
        <Card className="p-4 border-l-4 border-l-emerald-500 border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Idle / Available Nurses</p>
              <p className="mt-1 text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {summary.idleCount}
              </p>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Unassigned / Standby for triage
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <UserX className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Nurse-to-Patient Ratio */}
        <Card className="p-4 border-l-4 border-l-teal-500 border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Nurse-to-Patient Ratio</p>
              <p className="mt-1 text-2xl md:text-3xl font-black text-teal-600 dark:text-teal-400 font-mono">
                {summary.ratio}
              </p>
              <span className="text-xs text-slate-500 dark:text-zinc-400">Safe ICU acuity standard &le; 1:2</span>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
              <Shield className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white dark:bg-orange-500 dark:text-black shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            All Staff ({nurses.length})
          </button>
          <button
            onClick={() => setStatusFilter('occupied')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'occupied'
                ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-black shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            Occupied ({summary.occupiedCount})
          </button>
          <button
            onClick={() => setStatusFilter('idle')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'idle'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            Idle / Available ({summary.idleCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:outline-none"
          >
            <option value="all">All Shifts</option>
            <option value="Day (07:00 - 19:00)">Day Shift (07:00 - 19:00)</option>
            <option value="Night (19:00 - 07:00)">Night Shift (19:00 - 07:00)</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nurse, ward, or patient..."
            className="w-48 sm:w-64 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-orange-500"
          />
        </div>
      </div>

      {/* Unified Nursing Staff Section: Nurse Cards with Patient Allocations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNurses.map((nurse) => {
          const isOccupied = nurse.status === 'occupied';
          return (
            <Card
              key={nurse.id}
              className={`p-5 border border-slate-200 dark:border-zinc-800 transition-all hover:shadow-md ${
                isOccupied
                  ? 'border-l-4 border-l-amber-500'
                  : 'border-l-4 border-l-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10'
              }`}
            >
              {/* Nurse Profile Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm shrink-0 ${
                      isOccupied
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                    }`}
                  >
                    {nurse.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{nurse.name}</h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        {nurse.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{nurse.role}</p>
                  </div>
                </div>

                {/* Status Pill */}
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase shrink-0 ${
                    isOccupied
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                  }`}
                >
                  {isOccupied ? `Occupied (${nurse.assignedPatients.length} Patients)` : 'Idle / Available'}
                </span>
              </div>

              {/* Nurse Operational Details */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{nurse.shift}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pager: <strong className="text-slate-800 dark:text-zinc-200 font-mono">{nurse.pager}</strong></span>
                </div>
                <div className="col-span-2 text-[11px] text-slate-500 dark:text-zinc-400">
                  <span>Unit: <strong>{nurse.ward}</strong> • Exp: {nurse.experienceYears}y</span>
                </div>
              </div>

              {/* Patient Allocation Section */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Allocated Patients ({nurse.assignedPatients.length})
                  </span>
                  {nurse.assignedPatients.length === 0 && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Ready for Intake
                    </span>
                  )}
                </div>

                {nurse.assignedPatients.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400 dark:text-zinc-500">
                    No active patients assigned. Ready to take next bed or emergency admission.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {nurse.assignedPatients.map((p) => (
                      <div
                        key={p.patientId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/doctor/patient/${p.patientId}`}
                              className="font-bold text-slate-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-orange-400 transition-colors truncate"
                            >
                              {p.patientName}
                            </Link>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                              Bed {p.bed}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">{p.diagnosis}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button
                            onClick={() => {
                              const fullP = patients.find((pat) => pat.id === p.patientId) || p;
                              setHandoffPatient(fullP);
                            }}
                            className="px-2 py-1 rounded-lg border border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-bold flex items-center gap-1 hover:bg-teal-100 transition"
                            title="Generate AI SBAR Shift Handoff Summary"
                          >
                            <Sparkles className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                            <span>Handoff</span>
                          </button>

                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                              p.status === 'critical'
                                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                : p.status === 'elevated'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                                : p.status === 'caution'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                            }`}
                          >
                            Risk {p.riskScore}%
                          </span>
                          <Link to={`/doctor/patient/${p.patientId}`}>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <Button size="sm" variant="ghost" onClick={() => handlePageNurse(nurse)}>
                  <MessageSquare className="h-3.5 w-3.5" /> Page {nurse.pager}
                </Button>

                <Button size="sm" variant="default" onClick={() => handleOpenAssignModal(nurse)}>
                  <Plus className="h-3.5 w-3.5" /> Assign Patient
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* AI Shift Handoff Modal */}
      <AIShiftHandoffModal
        isOpen={!!handoffPatient}
        patient={handoffPatient}
        hospitalName={activeHospital.name}
        onClose={() => setHandoffPatient(null)}
      />

      {/* Patient Assignment Modal */}
      {isAssignModalOpen && selectedNurse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0" onClick={() => setIsAssignModalOpen(false)} />

          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 z-10 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Assign Patient to {selectedNurse.name}
            </h3>
            <p className="text-slate-500 dark:text-zinc-400">
              Select an admitted patient to allocate to this nurse's primary care queue.
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">Select ICU Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Bed {p.bed} ({p.diagnosis})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmAssign}>
                Confirm Allocation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
