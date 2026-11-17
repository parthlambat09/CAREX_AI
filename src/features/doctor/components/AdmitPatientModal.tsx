import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2, BedDouble } from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { Button } from './ui';

interface AdmitPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmitted?: (patientName: string, bed: string) => void;
}

export const AdmitPatientModal: React.FC<AdmitPatientModalProps> = ({
  isOpen,
  onClose,
  onAdmitted,
}) => {
  const { admitPatient, activeHospital, patients } = useSimulation();

  const [name, setName] = useState('');
  const [age, setAge] = useState('58');
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [bed, setBed] = useState('A5');
  const [diagnosis, setDiagnosis] = useState('');
  const [admittingDoctor, setAdmittingDoctor] = useState('Dr. R. Okafor');
  const [initialAcuity, setInitialAcuity] = useState<'stable' | 'warning' | 'critical'>('warning');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Find existing occupied beds
  const occupiedBeds = patients.map((p) => p.bed.toUpperCase());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Patient full name is required.');
      return;
    }
    if (!diagnosis.trim()) {
      setError('Primary admission diagnosis is required.');
      return;
    }
    if (!bed.trim()) {
      setError('ICU Bed assignment is required.');
      return;
    }

    if (occupiedBeds.includes(bed.trim().toUpperCase())) {
      setError(`Bed ${bed.trim().toUpperCase()} is already occupied. Please select an available bed.`);
      return;
    }

    const initialRisk = initialAcuity === 'critical' ? 82 : initialAcuity === 'warning' ? 52 : 22;

    const newPat = admitPatient({
      name: name.trim(),
      age: parseInt(age, 10) || 50,
      sex,
      bed: bed.trim().toUpperCase(),
      diagnosis: diagnosis.trim(),
      admittingDoctor: admittingDoctor.trim(),
      initialRisk,
      hospitalId: activeHospital.id,
    });

    setSuccessMsg(`Patient ${newPat.name} successfully admitted to Bed ${newPat.bed}!`);
    if (onAdmitted) onAdmitted(newPat.name, newPat.bed);

    setTimeout(() => {
      setName('');
      setDiagnosis('');
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-orange-500/10 dark:text-orange-400 flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Admit Patient to ICU</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {activeHospital.shortName} • Critical Care Census
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

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-zinc-300">
              Patient Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Walter White"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-orange-500"
            />
          </div>

          {/* Grid: Age, Sex, Bed Number */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">Age</label>
              <input
                type="number"
                min="18"
                max="105"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 dark:focus:border-orange-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'M' | 'F')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 dark:focus:border-orange-500"
              >
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                Bed Assignment <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. A5, B4, C2"
                value={bed}
                onChange={(e) => setBed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 dark:focus:border-orange-500 font-mono uppercase"
              />
            </div>
          </div>

          {/* Primary Diagnosis */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-zinc-300">
              Primary Admission Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Septic Shock secondary to pneumonia"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-orange-500"
            />
          </div>

          {/* Admitting Doctor & Initial Acuity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">Attending Physician</label>
              <input
                type="text"
                value={admittingDoctor}
                onChange={(e) => setAdmittingDoctor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 dark:focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">Initial Acuity Level</label>
              <select
                value={initialAcuity}
                onChange={(e) => setInitialAcuity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 dark:focus:border-orange-500"
              >
                <option value="stable">Stable / Post-Op Recovery (Low Risk)</option>
                <option value="warning">Elevated Care / Warning (Medium Risk)</option>
                <option value="critical">Critical State / Sepsis Risk (High Risk)</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Admit Patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
