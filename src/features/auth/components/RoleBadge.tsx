import React from 'react';
import { Stethoscope, ClipboardList, HeartPulse, Building2, LucideIcon, ArrowUpDown } from 'lucide-react';
import { UserRole } from '@/types';

interface RoleBadgeProps {
  role: UserRole;
  onChangeRole?: (role: UserRole) => void;
  showSwitch?: boolean;
}

const ROLE_CONFIG: Record<string, { title: string; icon: LucideIcon; color: string; bg: string; border: string }> = {
  doctor: {
    title: 'Doctor',
    icon: Stethoscope,
    color: 'text-blue-600 dark:text-orange-400',
    bg: 'bg-blue-50 dark:bg-orange-500/10',
    border: 'border-blue-200 dark:border-orange-500/30',
  },
  nurse: {
    title: 'Nurse',
    icon: ClipboardList,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    border: 'border-teal-200 dark:border-teal-500/30',
  },
  family: {
    title: 'Family Portal',
    icon: HeartPulse,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/30',
  },
  patient: {
    title: 'Family Portal',
    icon: HeartPulse,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/30',
  },
  admin: {
    title: 'Hospital Management',
    icon: Building2,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-200 dark:border-indigo-500/30',
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, onChangeRole, showSwitch = false }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.doctor;
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide ${config.bg} ${config.border} ${config.color}`}
      >
        <Icon className="w-4 h-4" />
        <span>Selected Role: {config.title}</span>
      </div>

      {showSwitch && onChangeRole && (
        <div className="relative group">
          <button
            type="button"
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-300 transition-colors"
            title="Switch Role"
            aria-label="Switch Role"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl shadow-xl py-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
            <p className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Switch Role Context</p>
            <button
              type="button"
              onClick={() => onChangeRole('doctor')}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 ${role === 'doctor' ? 'text-blue-600 dark:text-orange-400 font-bold' : 'text-slate-700 dark:text-zinc-300'}`}
            >
              <Stethoscope className="w-3.5 h-3.5" /> Doctor
            </button>
            <button
              type="button"
              onClick={() => onChangeRole('nurse')}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 ${role === 'nurse' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-700 dark:text-zinc-300'}`}
            >
              <ClipboardList className="w-3.5 h-3.5" /> Nurse
            </button>
            <button
              type="button"
              onClick={() => onChangeRole('family')}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 ${(role === 'family' || role === 'patient') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-zinc-300'}`}
            >
              <HeartPulse className="w-3.5 h-3.5" /> Family Portal
            </button>
            <button
              type="button"
              onClick={() => onChangeRole('admin')}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 ${role === 'admin' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-zinc-300'}`}
            >
              <Building2 className="w-3.5 h-3.5" /> Hospital Management
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


