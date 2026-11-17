import React, { useState, useMemo } from 'react';
import {
  CheckCircle2, Printer, ShieldCheck,
  Receipt, Check
} from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { INITIAL_INVOICES } from '../mock/billing';
import type { Patient } from '@/types/doctor';

export const DischargeDetailsPage: React.FC = () => {
  const { patients, dischargePatient } = useSimulation();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[50]?.id || 'P-051');


  const activePatient: Patient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [selectedPatientId, patients]);

  // Associated Bill
  const activeInvoice = useMemo(() => {
    return INITIAL_INVOICES.find((i) => i.patientId === activePatient.id) || INITIAL_INVOICES[0];
  }, [activePatient.id]);

  // Checklists
  const [clearedClinical, setClearedClinical] = useState(true);
  const [clearedPharmacy, setClearedPharmacy] = useState(true);
  const [clearedBilling, setClearedBilling] = useState(activeInvoice.status === 'paid');
  const [clearedNursing, setClearedNursing] = useState(true);

  // Form Details
  const [dischargeCondition, setDischargeCondition] = useState('Stable & Hemodynamically Normalized');
  const [dischargeMedications, setDischargeMedications] = useState(
    '1. Tab Clopidogrel 75mg OD x 30 days\n2. Tab Atorvastatin 40mg HS\n3. Tab Metoprolol Succinate 25mg OD\n4. Tab Pantoprazole 40mg OD AC'
  );
  const [followUpDate, setFollowUpDate] = useState('2026-03-12 (Cardiology OPD - Room 204)');
  const [dietaryAdvice, setDietaryAdvice] = useState('Low sodium, cardiac diabetic diet. Restrict fluid to 1.5L/day.');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAuthorizeDischarge = () => {
    if (!clearedBilling) {
      showToast('Warning: Billing clearance required prior to final discharge authorization.');
      return;
    }
    dischargePatient(activePatient.id, `Discharged: ${dischargeCondition}. Follow-up: ${followUpDate}`);
    showToast(`Discharge paperwork authorized & registered globally for ${activePatient.name}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              ICU Discharge Details & Paperwork Automation
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Auto-generate comprehensive clinical discharge summaries, medication orders, and linked billing settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.bed} ({p.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Discharge Card / Paperwork */}
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md p-6 sm:p-8 space-y-6">
        {/* Document Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              CAREX Official Discharge Paperwork
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              Clinical Discharge Summary & Certificate
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Document Ref: <span className="font-mono font-bold">DSC-2026-{activePatient.id}</span> • Admission Date: 2026-03-01
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                showToast('Generating official PDF discharge certificate...');
                window.print();
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 hover:bg-slate-100"
            >
              <Printer className="w-4 h-4" />
              <span>Print Summary</span>
            </button>
          </div>
        </div>

        {/* Patient Demographic & Vitals Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Patient Full Name</span>
            <p className="font-black text-sm text-slate-900 dark:text-white">{activePatient.name}</p>
            <p className="text-[11px] text-slate-500">{activePatient.age}y / {activePatient.sex} • {activePatient.id}</p>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Primary Diagnosis</span>
            <p className="font-bold text-slate-900 dark:text-zinc-100">{activePatient.diagnosis}</p>
            <p className="text-[11px] text-slate-500">ICD-10 Categorized</p>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Discharge Vitals</span>
            <p className="font-mono font-bold text-slate-900 dark:text-zinc-100">
              BP {activePatient.vitals.systolic}/{activePatient.vitals.diastolic} • HR {activePatient.vitals.heartRate}
            </p>
            <p className="font-mono text-[11px] text-slate-500">SpO2 {activePatient.vitals.spo2}% • Temp 37.0°C</p>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Attending Physician</span>
            <p className="font-bold text-slate-900 dark:text-zinc-100">Dr. Rajesh Sharma, MD, FCCM</p>
            <p className="text-[11px] text-slate-500">Critical Care Specialist</p>
          </div>
        </div>

        {/* 4 Multi-Department Clearance Checklists */}
        <div className="space-y-3">
          <h3 className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Multi-Department Discharge Clearance Matrix
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <label className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={clearedClinical}
                onChange={(e) => setClearedClinical(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">1. Clinical Clearance</p>
                <p className="text-[10px] text-slate-500">Physician signed off on stable telemetry trajectory</p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={clearedPharmacy}
                onChange={(e) => setClearedPharmacy(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">2. Pharmacy Discharge Box</p>
                <p className="text-[10px] text-slate-500">Home medications dispensed and labeled</p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={clearedBilling}
                onChange={(e) => setClearedBilling(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">3. Billing & TPA Settlement</p>
                <p className="text-[10px] text-slate-500">
                  {activeInvoice ? `Bill: ₹${activeInvoice.totalAmount.toLocaleString('en-IN')} (${activeInvoice.status})` : 'Invoice Settled'}
                </p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={clearedNursing}
                onChange={(e) => setClearedNursing(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">4. Nursing Handover</p>
                <p className="text-[10px] text-slate-500">Lines removed, family briefed on wound care</p>
              </div>
            </label>
          </div>
        </div>

        {/* Editable Discharge Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Discharge Medications & Regimen
            </label>
            <textarea
              rows={4}
              value={dischargeMedications}
              onChange={(e) => setDischargeMedications(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Dietary Advice & Restrictions
            </label>
            <textarea
              rows={4}
              value={dietaryAdvice}
              onChange={(e) => setDietaryAdvice(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Follow-Up OPD Appointment Schedule
            </label>
            <input
              type="text"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Condition on Discharge
            </label>
            <input
              type="text"
              value={dischargeCondition}
              onChange={(e) => setDischargeCondition(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
            />
          </div>
        </div>

        {/* Linked Bill Confirmation Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Linked Auto-Generated Hospital Bill: {activeInvoice?.invoiceNumber || 'CRX-2026-8801'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Total Settlement: ₹{(activeInvoice?.totalAmount || 59005).toLocaleString('en-IN')} • Payment Status: <strong className="uppercase">{activeInvoice?.status || 'PAID'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleAuthorizeDischarge}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-600/20 text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Authorize Official Discharge</span>
          </button>
        </div>
      </div>
    </div>
  );
};
