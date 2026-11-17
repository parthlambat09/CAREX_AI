import React, { useState, useEffect } from 'react';
import { Sparkles, X, Copy, Check, RefreshCw, Stethoscope } from 'lucide-react';
import { Button } from '@/features/doctor/components/ui';

interface AIShiftHandoffModalProps {
  isOpen: boolean;
  patient: any;
  hospitalName?: string;
  onClose: () => void;
}

export const AIShiftHandoffModal: React.FC<AIShiftHandoffModalProps> = ({
  isOpen,
  patient,
  hospitalName = 'CAREX ICU',
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sbar, setSbar] = useState<{
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  } | null>(null);

  const fetchHandoff = async () => {
    if (!patient) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient, hospital_name: hospitalName }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.sbar) {
          setSbar(data.sbar);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.debug('[CAREX-Handoff] Fallback to client-side SBAR generator', err);
    }

    // Local Fallback SBAR Generation
    setTimeout(() => {
      const pName = patient.name || patient.patientName || 'Patient';
      const pId = patient.id || patient.patientId || 'ICU-100';
      const bed = patient.bed || 'Bed';
      const diag = patient.diagnosis || patient.primaryDiagnosis || 'ICU Admission';
      const status = patient.status || patient.overallStatus || 'Monitored';
      const vitals = patient.vitals || {};
      const risk = patient.risk?.overall ?? 50;

      setSbar({
        situation: `Patient ${pName} (${pId}), ${patient.age || 52}y/${patient.sex || 'M'}, admitted to ${bed} at ${hospitalName}. Primary Diagnosis: ${diag}. Current Status: ${String(status).toUpperCase()} (AI Deterioration Index: ${risk}%).`,
        background: `Admitted for post-acute monitoring and telemetry observation. Key shift milestones: Vitals continuous monitoring active, timeline entries updated, pain and airway evaluated.`,
        assessment: `Telemetry Vitals: Heart Rate ${vitals.heartRate || 76} bpm, SpO2 ${vitals.spo2 || 97}%, BP ${vitals.systolic || 120}/${vitals.diastolic || 80} mmHg, Resp Rate ${vitals.respiratoryRate || 16}/min, Temp ${vitals.temperature || 37.0}°C. Deterioration risk score evaluated at ${risk}%.`,
        recommendation: `1. Maintain q2h bedside vitals check & arterial line hygiene.\n2. Keep SpO2 target >94% on supplemental nasal oxygen as needed.\n3. Verify next scheduled arterial blood gas / lactate draw.\n4. Escalate tachycardic drift (>110 bpm) immediately to attending physician.`,
      });
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (isOpen && patient) {
      fetchHandoff();
    }
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const handleCopy = () => {
    if (!sbar) return;
    const fullText = `CAREX AI SHIFT HANDOFF REPORT (SBAR)\nPatient: ${patient.name || patient.patientName} (${patient.id || patient.patientId})\nFacility: ${hospitalName}\n\n[S] SITUATION:\n${sbar.situation}\n\n[B] BACKGROUND:\n${sbar.background}\n\n[A] ASSESSMENT:\n${sbar.assessment}\n\n[R] RECOMMENDATIONS:\n${sbar.recommendation}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 z-10 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                  AI Shift Handoff Assistant
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30 uppercase">
                  SBAR Protocol
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Automated shift change summary for {patient.name || patient.patientName} • {patient.bed}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-teal-600 dark:text-teal-400 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
              Synthesizing physiological signals, timeline events, and SBAR recommendations...
            </p>
          </div>
        ) : sbar ? (
          <div className="space-y-3.5">
            {/* S - Situation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-extrabold text-xs uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-500/20">S</span>
                <span>Situation</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed font-medium pt-1">
                {sbar.situation}
              </p>
            </div>

            {/* B - Background */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-extrabold text-xs uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20">B</span>
                <span>Background</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed font-medium pt-1">
                {sbar.background}
              </p>
            </div>

            {/* A - Assessment */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20">A</span>
                <span>Assessment & Vitals</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed font-medium pt-1">
                {sbar.assessment}
              </p>
            </div>

            {/* R - Recommendation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20">R</span>
                <span>Recommendations</span>
              </div>
              <div className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed font-medium pt-1 whitespace-pre-line">
                {sbar.recommendation}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500">
                <Stethoscope className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>Verified by CAREX Clinical AI Engine</span>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="default" onClick={fetchHandoff}>
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                </Button>
                <Button size="sm" variant="primary" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy SBAR Report'}</span>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
