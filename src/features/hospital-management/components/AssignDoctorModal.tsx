import React, { useState } from 'react';
import { Stethoscope, UserCheck } from 'lucide-react';
import { DOCTORS } from '@/mock/doctors';
import type { Patient } from '@/types/doctor';

interface AssignDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  onDoctorAssigned: (patientId: string, doctorName: string, doctorId: string) => void;
}

export const AssignDoctorModal: React.FC<AssignDoctorModalProps> = ({
  isOpen,
  onClose,
  patient,
  onDoctorAssigned,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(DOCTORS[0]?.id || '1');
  const [urgencyNote, setUrgencyNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = DOCTORS.find((d) => d.id === selectedDocId) || DOCTORS[0];
    onDoctorAssigned(patient?.id || 'ICU-100', doc.name, doc.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Assign / Reassign Attending Doctor
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* Patient Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Patient:</span>
            <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
              {patient?.name || 'Vikram Bhat'} ({patient?.bed || 'Bed B10'})
            </p>
          </div>
          <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
            {patient?.id || 'ICU-100'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-2">
              Select Attending Specialist / Intensivist *
            </label>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {DOCTORS.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                        {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-zinc-100">{doc.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {doc.specialty} • {doc.hospitalId.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        Available
                      </span>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        {doc.roleTitle.split('•')[0]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Assignment Note / Clinical Handoff Directive
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Assigned for primary sepsis protocol management and emergency intubation supervision."
              value={urgencyNote}
              onChange={(e) => setUrgencyNote(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Confirm Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
