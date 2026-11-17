import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Activity } from 'lucide-react';
import { statusBg, statusDot } from '@/features/doctor/utils/format';
import type { PatientStatus } from '@/types/doctor';

/* --- PAGE HEADER --- */
export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  statusPill?: { label: string; variant?: 'stable' | 'warning' | 'critical' | 'info' };
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, statusPill, actions }: PageHeaderProps) {
  const pillColors = {
    stable: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
    warning: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
    critical: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
    info: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
  };

  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-200 dark:border-zinc-800 pb-5">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="h-3 w-3 text-slate-400 dark:text-zinc-600" />}
                {b.href ? (
                  <Link to={b.href} className="hover:text-blue-600 dark:hover:text-orange-400 transition-colors font-medium">
                    {b.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            {title}
          </h1>
          {statusPill && (
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${pillColors[statusPill.variant || 'info']}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {statusPill.label}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-zinc-400 max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/* --- CARDS & PANELS --- */
export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 p-5 transition-all duration-200 ${
        hover ? 'hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* --- STAT / KPI CARD --- */
export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  status?: 'stable' | 'monitoring' | 'caution' | 'elevated' | 'warning' | 'critical';
  icon?: React.ElementType;
  className?: string;
}

export function StatCard({
  title,
  value,
  unit,
  subtitle,
  trend,
  trendDirection = 'neutral',
  status = 'stable',
  icon: Icon,
  className = '',
}: StatCardProps) {
  const statusBorders = {
    stable: 'border-l-4 border-l-emerald-500',
    monitoring: 'border-l-4 border-l-blue-500 dark:border-l-orange-500',
    caution: 'border-l-4 border-l-amber-500',
    elevated: 'border-l-4 border-l-orange-500',
    warning: 'border-l-4 border-l-amber-500',
    critical: 'border-l-4 border-l-red-500',
  };

  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-slate-500 dark:text-zinc-400',
  };

  return (
    <Card className={`relative overflow-hidden ${statusBorders[status]} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
              {value}
            </span>
            {unit && <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 dark:bg-orange-500/10 dark:text-orange-500 dark:border-orange-500/20">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-zinc-800/80 pt-2">
          {subtitle && <span className="text-slate-500 dark:text-zinc-400">{subtitle}</span>}
          {trend && (
            <span className={`font-semibold flex items-center gap-0.5 ${trendColors[trendDirection]}`}>
              {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : ''} {trend}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

/* --- STATUS BADGES --- */
export function StatusBadge({ status }: { status: PatientStatus | string }) {
  const normalized = status.toLowerCase() as PatientStatus;
  const isKnown = normalized in statusBg;

  if (isKnown) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBg[normalized]}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[normalized]} ${normalized === 'critical' ? 'animate-pulse' : ''}`} />
        {status}
      </span>
    );
  }

  // Fallback for custom statuses
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 text-slate-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 px-2.5 py-0.5 text-xs font-semibold capitalize">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-zinc-500" />
      {status}
    </span>
  );
}

export function RiskBadge({ score }: { score: number }) {
  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  const cls =
    level === 'high'
      ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
      : level === 'medium'
      ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30';
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs font-bold tabular-nums ${cls}`}>
      {score}%
    </span>
  );
}

/* --- REUSABLE TOGGLE COMPONENT --- */
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled = false }: ToggleProps) {
  return (
    <label className={`flex items-center justify-between gap-4 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-semibold text-slate-900 dark:text-zinc-200">{label}</span>}
          {description && <span className="text-[11px] text-slate-500 dark:text-zinc-400">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-500 ${
          checked ? 'bg-blue-600 dark:bg-orange-500' : 'bg-slate-300 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

/* --- BUTTON --- */
export function Button({
  children,
  onClick,
  variant = 'default',
  size = 'sm',
  className = '',
  disabled = false,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'default' | 'primary' | 'danger' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  const variants = {
    default: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:border-zinc-700',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-black font-semibold shadow-sm',
    secondary: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:border-zinc-700 font-semibold',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 dark:border-red-500/30 font-semibold',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function PatientLink({ id, name }: { id: string; name?: string }) {
  return (
    <Link to={`/doctor/patient/${id}`} className="text-blue-600 hover:text-blue-700 dark:text-orange-400 dark:hover:text-orange-300 hover:underline font-semibold text-xs transition-colors">
      {name || id}
    </Link>
  );
}

/* --- EMPTY & LOADING STATES --- */
export function EmptyState({
  title = 'No records found',
  message,
  action,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="py-12 px-4 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/50">
      <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-3">
        <Activity className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{title}</h3>
      {message && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ message = 'Loading ICU intelligence...' }: { message?: string }) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 dark:border-orange-500 border-t-transparent" />
      <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400 font-medium">{message}</p>
    </div>
  );
}
