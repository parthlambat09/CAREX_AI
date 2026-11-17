import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  X, Send, Sparkles, Brain, Bot, User, Trash2, Copy, Check, Mic, MicOff
} from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';

const CONTEXT_PROMPTS: Record<string, string[]> = {
  '/doctor': [
    'Which patients need immediate ICU attention?',
    'Summarize current critical alerts and bed risks',
    'What is the overall ICU status right now?',
  ],
  '/doctor/monitoring': [
    'Which vital signs are abnormal across beds?',
    'Which patient has unstable SpO2 or MAP drift?',
    'List all patients with active telemetry drift',
  ],
  '/doctor/patients': [
    'Which patients have escalating AI risk scores?',
    'Filter critical patients requiring attending review',
    'Show patients admitted in the last 24 hours',
  ],
  '/doctor/nurses': [
    'Which nurses have available capacity for emergency intake?',
    'What is the current nurse-to-patient ratio?',
    'Summarize night shift nurse coverage',
  ],
  '/doctor/equipment': [
    'Are any mechanical ventilators currently in critical depletion?',
    'List life-support devices scheduled for biomedical calibration',
    'How many infusion pumps are available right now?',
  ],
  '/doctor/risk': [
    'Why is Patient P-001 risk score elevated?',
    'What key physiological factors drive the deterioration risk?',
    'Compare risk drift trajectories between ICU beds',
  ],
  '/doctor/alerts': [
    'Which alerts remain unacknowledged?',
    'What intervention protocols are recommended for critical hypoxia?',
    'Summarize alert frequency over the last hour',
  ],
  '/doctor/support': [
    'Recommend treatment protocols for Sepsis Alert',
    'What is the target dosage protocol for Norepinephrine titration?',
    'Check contraindications for Patient P-002',
  ],
  default: [
    'Summarize the current ICU clinical state',
    'Which patient requires urgent clinical review?',
    'What recommendations does CAREX AI have for this shift?',
  ],
};

export const CarexAIAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const location = useLocation();
  const { patients, alerts, activeHospital } = useSimulation();

  const prompts = CONTEXT_PROMPTS[location.pathname] ?? CONTEXT_PROMPTS.default;

  const criticalCount = patients.filter((p) => p.risk.overall >= 80).length;
  const highRiskCount = patients.filter((p) => p.risk.overall >= 65).length;
  const activeAlerts = alerts.filter((a) => !a.acknowledged).length;

  const generateAnswer = (q: string): string => {
    const text = q.toLowerCase();
    
    if (text.includes('immediate') || text.includes('critical') || text.includes('attention')) {
      const critPatients = patients.filter(p => p.risk.overall >= 65);
      if (critPatients.length === 0) return `All monitored ICU patients at ${activeHospital.name} are currently within stable ranges.`;
      const names = critPatients.map(p => `${p.name} (${p.bed}, Risk: ${p.risk.overall}%)`).join('; ');
      return `CAREX AI Alert for ${activeHospital.name}: There are currently ${criticalCount} critical state patients and ${highRiskCount} elevated risk patients requiring evaluation. Key cases: ${names}. Recommend reviewing MAP trends and arterial blood gases.`;
    }

    if (text.includes('nurse') || text.includes('ratio') || text.includes('staff')) {
      return `ICU Nursing Workload Analysis: Current unit ratio is within safe parameters (1:1.6). 7 nurses occupied with bedside assignments; 3 nurses available on standby for triage or trauma intake.`;
    }

    if (text.includes('equipment') || text.includes('ventilator') || text.includes('pump')) {
      return `ICU Biomedical Logistics: 6 Mechanical Ventilators ready for immediate connection (1 in reserve buffer). 14 Infusion Pumps available in Central Supply. Dialysis unit CRRT-1 operational.`;
    }

    if (text.includes('vital') || text.includes('abnormal') || text.includes('spo2') || text.includes('drift')) {
      const abnormal = patients.filter(p => p.vitals.heartRate > 110 || p.vitals.spo2 < 93 || p.vitals.systolic < 90);
      if (abnormal.length === 0) return "Telemetry analysis: Vitals across all beds are within normal physiological bounds.";
      const list = abnormal.map(p => `${p.name} (${p.bed}): HR ${p.vitals.heartRate} bpm, SpO2 ${p.vitals.spo2}%, BP ${p.vitals.systolic}/${p.vitals.diastolic}`).join(' | ');
      return `Telemetry Drift Detected: Abnormal vital signs identified on ${abnormal.length} patient(s): ${list}. Immediate bedside verification recommended.`;
    }

    if (text.includes('why') || text.includes('factor') || text.includes('risk score')) {
      const p = patients[0];
      return `Risk Factor Decomposition for ${p?.name || 'Bed 04'}: 1. Sustained tachycardic drift (+18% from baseline). 2. Respiratory rate instability (RR ${p?.vitals.respiratoryRate || 24}/min). 3. Arterial lactate elevation (3.4 mmol/L). CAREX predicts high probability of deterioration within 4 hours without fluid resuscitation.`;
    }

    if (text.includes('alert') || text.includes('unacknowledged') || text.includes('frequency')) {
      return `Current Alert State: ${activeAlerts} unacknowledged clinical alerts across ${activeHospital.shortName}. Highest priority: Desaturation alert on Bed 04 triggered recently. Escalation protocol active.`;
    }

    if (text.includes('protocol') || text.includes('sepsis') || text.includes('treatment') || text.includes('dosage')) {
      return `CAREX Decision Support Protocol: For Sepsis/Septic Shock risk, initiate 30 mL/kg crystalloid bolus within 3 hours. Order blood cultures prior to broad-spectrum antibiotic administration. Target MAP >= 65 mmHg.`;
    }

    return `CAREX ICU Intelligence Analysis: Monitoring ${patients.length} active beds at ${activeHospital.name}. Telemetry streams are updating smoothly with ${activeAlerts} unacknowledged alerts and ${criticalCount} critical status beds.`;
  };

  const handleSend = async (userQuery: string) => {
    if (!userQuery.trim()) return;
    setLoading(true);
    const qText = userQuery.trim();
    setQuery('');

    const contextPayload = {
      hospitalName: activeHospital.name,
      activeHospital,
      patients: patients.map((p) => ({
        id: p.id,
        name: p.name,
        bed: p.bed,
        status: p.status,
        diagnosis: p.diagnosis,
        vitals: p.vitals,
        risk: p.risk,
      })),
      activeAlertsCount: activeAlerts,
      currentRoute: location.pathname,
    };

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: qText, context: contextPayload }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          setHistory((prev) => [...prev, { q: qText, a: data.reply }]);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.debug('[CAREX-AI] Fetch to /api/chat fallback to local reasoning', err);
    }

    // Fallback if backend fetch fails or is offline
    setTimeout(() => {
      const ans = generateAnswer(qText);
      setHistory((prev) => [...prev, { q: qText, a: ans }]);
      setLoading(false);
    }, 400);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setHistory([]);
    setToastMessage('Conversation cleared.');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleToggleVoice = () => {
    // Check SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToastMessage('Voice dictation is not supported in this browser environment.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => {
        setIsListening(false);
        setToastMessage('Voice recognition error or permission denied.');
        setTimeout(() => setToastMessage(null), 3000);
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          handleSend(transcript);
        }
      };
      recognition.start();
    } catch {
      setIsListening(false);
      setToastMessage('Unable to access microphone.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 h-13 w-13 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white dark:text-black shadow-lg shadow-blue-600/25 dark:shadow-orange-500/25 z-40 flex items-center justify-center transition-transform hover:scale-105 group"
          aria-label="Open CAREX AI Copilot"
          title="CAREX AI Copilot"
        >
          <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-300 dark:bg-orange-300 animate-ping" />
        </button>
      )}

      {/* Floating Copilot Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col overflow-hidden max-h-[540px] animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center shadow-sm">
                <Brain className="h-4.5 w-4.5 text-white dark:text-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 tracking-tight">CAREX AI Copilot</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-orange-500/10 dark:text-orange-400 font-bold border border-blue-200 dark:border-orange-500/30">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">{activeHospital.shortName}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {history.length > 0 && (
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                  title="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Toast Message */}
          {toastMessage && (
            <div className="p-2 bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300 text-[11px] font-semibold text-center border-b border-teal-200 dark:border-teal-500/30">
              {toastMessage}
            </div>
          )}

          {/* Conversation Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {/* Suggested prompts when clean history */}
            {history.length === 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Suggested Contextual Queries
                </p>
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-orange-500/50 hover:bg-blue-50/50 dark:hover:bg-orange-500/5 transition duration-150 flex items-center justify-between group"
                  >
                    <span>{p}</span>
                    <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* History */}
            {history.map((item, idx) => (
              <div key={idx} className="space-y-2">
                {/* User Message */}
                <div className="flex justify-end gap-2">
                  <div className="max-w-[85%] rounded-2xl bg-blue-600 text-white dark:bg-orange-500 dark:text-black px-3.5 py-2.5 text-xs font-semibold shadow-xs">
                    {item.q}
                  </div>
                  <div className="h-6 w-6 rounded-full bg-blue-700 dark:bg-orange-600 flex items-center justify-center shrink-0 text-white dark:text-black text-[10px] font-bold">
                    <User className="h-3 w-3" />
                  </div>
                </div>

                {/* AI Answer */}
                <div className="flex items-start gap-2 group/ai">
                  <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 text-blue-600 dark:text-orange-400 text-[10px]">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="relative max-w-[88%] rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-xs leading-relaxed text-slate-800 dark:text-zinc-200">
                    <p>{item.a}</p>
                    <button
                      onClick={() => handleCopy(item.a, idx)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-orange-400">
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-orange-500 animate-ping" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Analyzing ICU telemetry & risk matrix...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 shrink-0 flex items-center gap-2">
            <button
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl border transition ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Dictate by voice'}
            >
              {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            </button>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(query)}
              placeholder={isListening ? 'Listening...' : 'Ask CAREX AI Copilot...'}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-orange-500 focus:outline-none"
            />
            <button
              onClick={() => handleSend(query)}
              disabled={loading || !query.trim()}
              className="h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white dark:text-black flex items-center justify-center shrink-0 disabled:opacity-40 transition font-bold"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
