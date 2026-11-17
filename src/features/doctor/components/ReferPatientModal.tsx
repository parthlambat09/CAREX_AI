import React, { useState } from 'react';
import { Building2, X, AlertTriangle, Send } from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { Button } from '@/features/doctor/components/ui';
import type { Patient } from '@/types/doctor';

interface ReferPatientModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onReferred?: (destHospitalName: string) => void;
}

export const ReferPatientModal: React.FC<ReferPatientModalProps> = ({
  isOpen,
  patient,
  onClose,
  onReferred,
}) => {
  const { hospitals, activeHospitalId, referPatient } = useSimulation();

  const currentHospitalId = patient?.hospitalId || activeHospitalId;
  const availableDestinations = hospitals.filter((h) => h.id !== currentHospitalId);

  const [destHospitalId, setDestHospitalId] = useState(availableDestinations[0]?.id || '');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destHospitalId || !reason.trim()) return;

    setSubmitting(true);

    const targetHosp = hospitals.find((h) => h.id === destHospitalId);
    const destName = targetHosp ? targetHosp.name : destHospitalId;

    setTimeout(() => {
      referPatient(patient.id, destHospitalId, reason.trim());
      setSubmitting(false);
      if (onReferred) onReferred(destName);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 z-10 space-y-4 text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Refer / Escalate Patient
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Initiate inter-hospital transfer for <strong>{patient.name}</strong> ({patient.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-[11px] flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            Referral will update the patient's hospital linkage, append a formal transfer timeline entry, and broadcast an inter-hospital escalation alert.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-zinc-300">
              Destination Hospital
            </label>
            <select
              value={destHospitalId}
              onChange={(e) => setDestHospitalId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-amber-500"
            >
              {availableDestinations.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} — {h.location} ({h.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-zinc-300">
              Clinical Rationale / Referral Reason
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Escalate for ECMO support / Advanced cardiac surgical evaluation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 placeholder:text-slate-400"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={submitting || !reason.trim()}
              className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-black font-bold"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? 'Transferring...' : 'Confirm Referral'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
