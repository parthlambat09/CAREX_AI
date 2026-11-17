import type { PatientStatus, RiskLevel, AlertSeverity } from '@/types/doctor';

export const statusColor: Record<PatientStatus, string> = {
  Critical: 'text-red-600 dark:text-red-400',
  Unstable: 'text-orange-600 dark:text-orange-400',
  Elevated: 'text-orange-600 dark:text-orange-400',
  Stable: 'text-emerald-600 dark:text-emerald-400',
  Recovering: 'text-teal-600 dark:text-teal-400',
  critical: 'text-red-600 dark:text-red-400',
  elevated: 'text-orange-600 dark:text-orange-400',
  caution: 'text-amber-600 dark:text-amber-400',
  stable: 'text-emerald-600 dark:text-emerald-400',
};

export const statusBg: Record<PatientStatus, string> = {
  Critical: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
  Unstable: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
  Elevated: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
  Stable: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
  Recovering: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/30',
  critical: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
  caution: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  elevated: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
  stable: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
};

export const statusDot: Record<PatientStatus, string> = {
  Critical: 'bg-red-500 dark:bg-red-400',
  Unstable: 'bg-orange-500 dark:bg-orange-400',
  Elevated: 'bg-orange-500 dark:bg-orange-400',
  Stable: 'bg-emerald-500 dark:bg-emerald-400',
  Recovering: 'bg-teal-500 dark:bg-teal-400',
  critical: 'bg-red-500 dark:bg-red-400',
  caution: 'bg-amber-500 dark:bg-amber-400',
  elevated: 'bg-orange-500 dark:bg-orange-400',
  stable: 'bg-emerald-500 dark:bg-emerald-400',
};

export function riskLevel(score: number): RiskLevel {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export const riskColor: Record<RiskLevel, string> = {
  low: 'text-emerald-600 dark:text-emerald-400',
  medium: 'text-amber-600 dark:text-amber-400',
  high: 'text-red-600 dark:text-red-400',
};

export const riskBg: Record<RiskLevel, string> = {
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
  medium: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  high: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
};

export const severityBg: Record<AlertSeverity, string> = {
  info: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
  warning: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  critical: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
};

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m ago`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
