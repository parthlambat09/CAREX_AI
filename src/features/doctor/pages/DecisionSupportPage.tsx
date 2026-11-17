import { useState, useRef, useEffect } from 'react';
import {
  Pill, Lightbulb, Brain, Send, AlertTriangle, Check, Info, Sparkles,
} from 'lucide-react';
import { Card, SectionTitle, Button, PageHeader } from '@/features/doctor/components/ui';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const MEDICATIONS = [
  'Norepinephrine', 'Furosemide', 'Midazolam', 'Insulin (regular)',
  'Ceftriaxone', 'Heparin', 'Propofol', 'Fentanyl', 'Vancomycin', 'Amiodarone',
];

const INTERACTIONS: Record<string, { partner: string; severity: 'critical' | 'warning'; note: string }[]> = {
  Amiodarone: [{ partner: 'Heparin', severity: 'warning', note: 'Additive QTc prolongation risk — monitor ECG.' }],
  Fentanyl: [{ partner: 'Midazolam', severity: 'warning', note: 'Enhanced respiratory depression — titrate carefully.' }, { partner: 'Propofol', severity: 'warning', note: 'Synergistic sedation — reduce dose.' }],
  Vancomycin: [{ partner: 'Furosemide', severity: 'critical', note: 'Increased nephrotoxicity — monitor renal function closely.' }],
  Heparin: [{ partner: 'Ceftriaxone', severity: 'warning', note: 'Potential bleeding risk — monitor coagulation.' }],
  Propofol: [{ partner: 'Midazolam', severity: 'warning', note: 'Synergistic CNS depression — reduce dose.' }],
  'Insulin (regular)': [{ partner: 'Furosemide', severity: 'warning', note: 'May affect glucose control — monitor blood glucose.' }],
};

export function DecisionSupportPage() {
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [chat, setChat] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'I am the CAREX Clinical Intelligence assistant. I analyze telemetry drift, recommend clinical protocols, and evaluate drug interactions for attending review. Ask me anything or select an example prompt below.' },
  ]);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); }, [chat]);

  const interactions = selectedMeds.flatMap((m) =>
    (INTERACTIONS[m] || [])
      .filter((i) => selectedMeds.includes(i.partner))
      .map((i) => ({ ...i, med: m }))
  );

  function toggleMed(m: string) {
    setSelectedMeds((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  }

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    const reply = generateReply(q);
    setChat((c) => [...c, { role: 'user', content: q }, { role: 'assistant', content: reply }]);
    setInput('');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Clinical Decision Support System"
        description="Evidence-based protocol suggestions, pharmacological interaction matrix, and conversational ICU AI assistant."
        statusPill={{ label: 'Protocols v4.2 Active', variant: 'info' }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Treatment Protocol Support */}
        <Card className="p-5 border border-slate-200 dark:border-zinc-800">
          <SectionTitle title="Treatment Protocol Support" subtitle="Automated guidance based on clinical parameters" />
          <div className="mt-4 space-y-3">
            {[
              { title: 'Fluid Resuscitation Protocol', body: 'Patient shows signs of decreased perfusion. Consider evaluating fluid responsiveness with passive leg raise or dynamic pulse pressure variation.', level: 'warning' },
              { title: 'Vasopressor Titration Strategy', body: 'MAP trending below 65 mmHg. Norepinephrine dose may require adjustment per institutional ICU protocol.', level: 'critical' },
              { title: 'Lung-Protective Ventilation Strategy', body: 'SpO2 declining on current PEEP setting. Consider ARDS-Net ventilation strategy and assess for proning candidacy.', level: 'warning' },
              { title: 'Glycemic Control Protocol', body: 'Blood glucose variability noted over 8 hours. Consider insulin infusion protocol adjustment per sliding scale.', level: 'info' },
            ].map((s) => (
              <div key={s.title} className="rounded-xl border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60 p-3.5">
                <div className="flex items-center gap-2">
                  {s.level === 'critical' ? (
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                  ) : s.level === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600 dark:text-orange-400 shrink-0" />
                  )}
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{s.title}</p>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Drug Interaction Checker */}
        <Card className="p-5 border border-slate-200 dark:border-zinc-800">
          <SectionTitle title="Pharmacological Interaction Matrix" subtitle="Select active medications to analyze polypharmacy risk" />
          <div className="mt-4 flex flex-wrap gap-1.5">
            {MEDICATIONS.map((m) => (
              <button
                key={m}
                onClick={() => toggleMed(m)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedMeds.includes(m)
                    ? 'bg-blue-600 text-white dark:bg-orange-500 dark:text-black font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2.5">
            {selectedMeds.length < 2 && (
              <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">Select two or more medications to run live interaction matrix.</p>
            )}
            {interactions.length === 0 && selectedMeds.length >= 2 && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 p-3">
                <Check className="h-4 w-4" />
                <p className="text-xs font-bold">No critical adverse interactions detected among selected compounds.</p>
              </div>
            )}
            {interactions.map((i, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-3 ${
                  i.severity === 'critical' ? 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10' : 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Pill className={`h-4 w-4 ${i.severity === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{i.med} + {i.partner}</p>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      i.severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' : 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
                    }`}
                  >
                    {i.severity}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-700 dark:text-zinc-300">{i.note}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ICU Care Suggestions */}
        <Card className="p-5 border border-slate-200 dark:border-zinc-800">
          <SectionTitle title="Attending Physician Checklists" subtitle="Shift handover & round guidance" />
          <div className="mt-4 space-y-2.5">
            {[
              'Initiate sepsis bundle within 1 hour — blood cultures, lactate, broad-spectrum antibiotics, and 30mL/kg crystalloid.',
              'Consider arterial line placement for continuous BP monitoring given hemodynamic instability.',
              'Assess delirium risk using CAM-ICU; implement early mobility protocol when stable.',
              'Review DVT prophylaxis status; verify dosing for renal function.',
              'Evaluate nutrition pathway — consider enteral feeding within 24-48h if no contraindication.',
              'Schedule family meeting to discuss goals of care and prognosis.',
            ].map((s, i) => (
              <div key={i} className="flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60 p-3">
                <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-xs text-slate-700 dark:text-zinc-300">{s}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Medical Copilot Chat */}
        <Card className="flex flex-col p-0 overflow-hidden border border-slate-200 dark:border-zinc-800">
          <div className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-5 py-3.5">
            <SectionTitle title="CAREX Intelligence Copilot" subtitle="Clinical decision support chat assistant" />
          </div>
          <div ref={chatRef} className="flex-1 space-y-3 overflow-y-auto p-4 max-h-[360px]">
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white font-bold dark:bg-orange-500 dark:text-black'
                        : 'bg-slate-200 text-blue-600 dark:bg-zinc-800 dark:text-orange-400'
                    }`}
                  >
                    {m.role === 'user' ? 'Dr' : <Sparkles className="h-3.5 w-3.5" />}
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white dark:bg-orange-500 dark:text-black font-medium'
                        : 'bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 dark:border-zinc-800 p-3 bg-slate-50 dark:bg-zinc-950">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {['Why is Bed 04 high risk?', 'Summarize recent changes.', 'Show risk factors.', 'What changed in the last 6h?'].map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                >
                  {q}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask clinical copilot..."
                className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-orange-500 focus:outline-none"
              />
              <Button onClick={() => send(input)} variant="primary" size="md">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-500">
        <Brain className="h-3.5 w-3.5 text-blue-600 dark:text-orange-500" /> CAREX AI outputs provide clinical decision support and do not replace attending physician judgment.
      </p>
    </div>
  );
}

function generateReply(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes('high risk') || lower.includes('why') || lower.includes('bed 04')) {
    return 'Bed 04 (P-001) is flagged high-risk primarily due to three converging signals: heart rate has risen above 110 bpm over the last 4 hours, SpO2 has dropped below 92%, and respiratory rate is trending above 24/min. Additionally, recent labs show elevated lactate (3.2 mmol/L). The AI model weights these together into a 92% deterioration probability.';
  }
  if (lower.includes('summar') || lower.includes('recent')) {
    return 'Summary of recent changes (last 6 hours): Heart rate increased from 96 to 122 bpm. SpO2 decreased from 96% to 91%. Respiratory rate rose from 18 to 28/min. Blood pressure is labile (160/95 → 145/88). Temperature climbed to 38.7°C. Two alerts were generated: one for abnormal vitals and one for critical deterioration.';
  }
  if (lower.includes('factor')) {
    return 'Top contributing risk factors, ranked by model contribution: (1) Increasing heart rate — 24%, (2) Decreasing SpO2 — 19%, (3) Increasing respiratory rate — 17%, (4) Abnormal blood pressure — 13%, (5) Recent abnormal lab values — 11%, (6) Temperature deviation — 8%.';
  }
  if (lower.includes('6h') || lower.includes('6 hours') || lower.includes('changed')) {
    return 'In the last 6 hours the patient deteriorated from "warning" to "critical" status. Key changes: HR +26 bpm, SpO2 -5%, RR +10/min, MAP dropped below 65 mmHg briefly. The AI risk score rose from 68% to 92%. Two alerts were auto-generated.';
  }
  return 'I can assist with queries regarding telemetry trends, risk factor explainability, drug interaction protocols, or ICU escalation pathways.';
}
