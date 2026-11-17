import React, { useState } from 'react';
import { X, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { Button } from './ui';
import type { Patient } from '@/types/doctor';

interface DischargePatientModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onDischarged?: () => void;
}

export const DischargePatientModal: React.FC<DischargePatientModalProps> = ({
  isOpen,
  patient,
  onClose,
  onDischarged,
}) => {
  const { dischargePatient } = useSimulation();
  const [disposition, setDisposition] = useState('Step-Down / Intermediate Care Unit');
  const [notes, setNotes] = useState('Hemodynamically stabilized. Vitals within safe margins for transfer.');
  const [discharged, setDischarged] = useState(false);

  if (!isOpen || !patient) return null;

  const handleConfirm = () => {
    const summary = `Discharged to ${disposition}. Summary: ${notes}`;
    dischargePatient(patient.id, summary);
    setDischarged(true);

    setTimeout(() => {
      setDischarged(false);
      onClose();
      if (onDischarged) onDischarged();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Discharge Patient</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Bed {patient.bed} • {patient.name} ({patient.id})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {discharged ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Discharge Processed Successfully</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-0.5">
                  Bed {patient.bed} has been marked ready for sanitation and reuse.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="font-bold">Clinical Transfer Confirmation:</span>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    This will remove {patient.name} from active ICU bed occupancy and record a discharge event in the clinical timeline.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Discharge Disposition / Destination
                </label>
                <select
                  value={disposition}
                  onChange={(e) => setDisposition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 dark:focus:border-orange-500"
                >
                  <option>Step-Down / Intermediate Care Unit</option>
                  <option>General Medical-Surgical Ward</option>
                  <option>Cardiac Telemetry Floor</option>
                  <option>Home / Outpatient Rehabilitation</option>
                  <option>Transfer to Specialized Facility</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Attending Physician Discharge Note
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-orange-500"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleConfirm}>
                  <LogOut className="h-4 w-4" />
                  Confirm Discharge
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
