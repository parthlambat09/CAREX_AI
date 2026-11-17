import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, TrendingDown, Minus, ChevronRight, Filter } from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { Card, StatusBadge, PageHeader, RiskBadge } from '@/features/doctor/components/ui';
import { riskLevel } from '@/features/doctor/utils/format';
import type { RiskLevel } from '@/types/doctor';

export function RiskPredictionPage() {
  const { patients } = useSimulation();
  const [predType, setPredType] = useState<'overall' | 'sepsis' | 'cardiacArrest' | 'respiratoryFailure' | 'mortality'>('overall');
  const [level, setLevel] = useState<'all' | RiskLevel>('all');

  const ranked = useMemo(() => {
    let list = [...patients].sort((a, b) => b.risk[predType] - a.risk[predType]);
    if (level !== 'all') {
      list = list.filter((p) => riskLevel(p.risk[predType]) === level);
    }
    return list;
  }, [patients, predType, level]);

  const predTypes = [
    { id: 'overall', label: 'Overall Index' },
    { id: 'sepsis', label: 'Sepsis Risk' },
    { id: 'cardiacArrest', label: 'Cardiac Arrest' },
    { id: 'respiratoryFailure', label: 'Resp. Failure' },
    { id: 'mortality', label: 'Mortality Risk' },
  ] as const;

  const levels = [
    { id: 'all', label: 'All Risk Levels' },
    { id: 'high', label: 'High Risk (>=70%)' },
    { id: 'medium', label: 'Medium Risk (40-69%)' },
    { id: 'low', label: 'Low Risk (<40%)' },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="AI Deterioration Risk Intelligence"
        description="Machine learning predictive models ranking patient deterioration probability, sepsis onset, and respiratory failure markers."
        statusPill={{ label: 'Predictive Models Online', variant: 'info' }}
      />

      {/* Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-blue-600 dark:text-orange-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Model Focus:</span>
          <div className="flex flex-wrap gap-1.5">
            {predTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setPredType(t.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  predType === t.id
                    ? 'bg-blue-600 text-white dark:bg-orange-500 dark:text-black shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as 'all' | RiskLevel)}
          className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:border-blue-500 dark:focus:border-orange-500 focus:outline-none"
        >
          {levels.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Patient Risk Card List */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {ranked.map((p, idx) => {
          const score = p.risk[predType];
          const lvl = riskLevel(score);
          return (
            <Link key={p.id} to={`/doctor/patient/${p.id}`}>
              <Card hover className="p-5 border border-slate-200 dark:border-zinc-800">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-xs ${
                      lvl === 'high'
                        ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                        : lvl === 'medium'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                    }`}
                  >
                    #{idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">{p.name}</span>
                        <span className="font-mono text-xs text-slate-500 dark:text-zinc-400">Bed {p.bed}</span>
                        <StatusBadge status={p.status} />
                      </div>

                      <div className="flex items-center gap-2">
                        <RiskBadge score={score} />
                        {p.risk.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                        ) : p.risk.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Minus className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{p.diagnosis}</p>

                    {/* Risk breakdown mini-bars */}
                    <div className="mt-3 grid grid-cols-5 gap-2 border-t border-slate-100 dark:border-zinc-800 pt-3">
                      {([
                        ['Overall', p.risk.overall],
                        ['Sepsis', p.risk.sepsis],
                        ['Cardiac', p.risk.cardiacArrest],
                        ['Resp', p.risk.respiratoryFailure],
                        ['Mort', p.risk.mortality],
                      ] as const).map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-zinc-500">{label}</p>
                          <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                            <div
                              className={`h-full rounded-full ${
                                val >= 70 ? 'bg-red-500' : val >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${val}%` }}
                            />
                          </div>
                          <p className="mt-0.5 font-mono text-[9px] font-semibold text-slate-600 dark:text-zinc-400">{val}%</p>
                        </div>
                      ))}
                    </div>

                    {/* Contributing factors */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mr-1">Factors:</span>
                      {p.factors.slice(0, 3).map((f) => (
                        <span
                          key={f.label}
                          className="rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 px-2 py-0.5 text-[10px] text-slate-700 dark:text-zinc-300 font-medium"
                        >
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 dark:text-zinc-500 self-center" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-500">
        <Brain className="h-3.5 w-3.5 text-blue-600 dark:text-orange-500" /> CAREX AI outputs provide clinical decision support and do not replace attending physician judgment.
      </p>
    </div>
  );
}
