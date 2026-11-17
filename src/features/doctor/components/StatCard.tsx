import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({
  label,
  value,
  unit,
  icon,
  accent = 'blue',
  trend,
  trendLabel,
  sublabel,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  accent?: 'blue' | 'red' | 'orange' | 'green' | 'teal';
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  sublabel?: string;
}) {
  const accents = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20',
    teal: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20',
    red: 'text-red-600 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-500/20 dark:border-red-500/30',
    orange: 'text-amber-600 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-500/20 dark:border-amber-500/30',
    green: 'text-emerald-600 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/20 dark:border-emerald-500/30',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition duration-200">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${accents[accent] || accents.blue}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <p className="font-mono text-2xl font-bold text-slate-900 dark:text-zinc-100">{value}</p>
        {unit && <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">{unit}</span>}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        {trend && trend !== 'stable' && (
          <span className={`inline-flex items-center text-xs font-semibold ${trend === 'up' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
          </span>
        )}
        {trendLabel && <span className="text-xs text-slate-500 dark:text-zinc-400">{trendLabel}</span>}
      </div>
      {sublabel && <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">{sublabel}</p>}
    </div>
  );
}
