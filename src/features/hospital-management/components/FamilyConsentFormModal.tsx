import React, { useState } from 'react';
import { FileText, ShieldCheck, CheckCircle2, User } from 'lucide-react';
import type { Patient } from '@/types/doctor';

interface FamilyConsentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  onConsentSigned: (consentData: any) => void;
}

export const FamilyConsentFormModal: React.FC<FamilyConsentFormModalProps> = ({
  isOpen,
  onClose,
  patient,
  onConsentSigned,
}) => {
  const [giverName, setGiverName] = useState('Sunita Bhat');
  const [relationship, setRelationship] = useState('Spouse');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('XXXX-XXXX-8921');
  const [agreedICUProcedures, setAgreedICUProcedures] = useState(true);
  const [agreedEmergencyMeds, setAgreedEmergencyMeds] = useState(true);
  const [agreedInvasiveLines, setAgreedInvasiveLines] = useState(true);
  const [agreedTelemetryAI, setAgreedTelemetryAI] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const consentRecord = {
      consentId: `CNS-${Date.now()}`,
      patientId: patient?.id || 'ICU-100',
      patientName: patient?.name || 'Vikram Bhat',
      bed: patient?.bed || 'Bed B10',
      giverName,
      relationship,
      phone,
      idProofType,
      idProofNumber,
      signedAt: new Date().toLocaleString(),
      termsAccepted: agreedICUProcedures && agreedEmergencyMeds && agreedInvasiveLines && agreedTelemetryAI,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onConsentSigned(consentRecord);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                ICU Admission & Family Consent Agreement
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Statutory Informed Consent for Critical Care & Emergency Interventions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* Patient Reference Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Admitting Patient:</span>
            <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
              {patient?.name || 'Vikram Bhat'} ({patient?.bed || 'Bed B10'})
            </p>
          </div>
          <div className="text-right">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Primary Diagnosis:</span>
            <p className="font-bold text-slate-700 dark:text-zinc-300">
              {patient?.diagnosis || 'Severe Sepsis w/ ARDS'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section: Next of Kin / Consent Giver Details */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              1. Consent Giver / Next of Kin Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Full Name of Consent Giver *
                </label>
                <input
                  type="text"
                  required
                  value={giverName}
                  onChange={(e) => setGiverName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Relationship to Patient *
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent / Guardian">Parent / Guardian</option>
                  <option value="Son / Daughter">Son / Daughter</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Legal Power of Attorney">Legal Power of Attorney</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  ID Verification (Aadhaar / Passport / DL) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={idProofType}
                    onChange={(e) => setIdProofType(e.target.value)}
                    className="w-1/3 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                  />
                  <input
                    type="text"
                    required
                    value={idProofNumber}
                    onChange={(e) => setIdProofNumber(e.target.value)}
                    className="w-2/3 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Medical Consent Clauses */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <h4 className="font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              2. ICU Procedures & Authorization Clauses
            </h4>

            <div className="space-y-2 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedICUProcedures}
                  onChange={(e) => setAgreedICUProcedures(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-zinc-300">
                  <strong>General ICU Admission:</strong> I authorize continuous ICU multi-parameter vital monitoring, nursing care, and physician evaluations.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedInvasiveLines}
                  onChange={(e) => setAgreedInvasiveLines(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-zinc-300">
                  <strong>Invasive Lines & Procedures:</strong> I consent to insertion of arterial lines, central venous catheters, and endotracheal intubation as medically warranted.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedEmergencyMeds}
                  onChange={(e) => setAgreedEmergencyMeds(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-zinc-300">
                  <strong>Emergency Resuscitation & Vasopressors:</strong> I authorize emergency administration of vasopressors, inotropes, blood transfusions, and ACLS protocol resuscitation.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTelemetryAI}
                  onChange={(e) => setAgreedTelemetryAI(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-zinc-300">
                  <strong>CAREX AI Early Warning Telemetry:</strong> I consent to non-invasive AI-assisted sepsis and clinical risk trajectory tracking for proactive escalation.
                </span>
              </label>
            </div>
          </div>

          {/* Acknowledgement Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              Timestamp: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !agreedICUProcedures}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording...' : 'Submit & Acknowledge Consent'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
