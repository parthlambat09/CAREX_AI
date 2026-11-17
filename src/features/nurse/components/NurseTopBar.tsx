import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Building2, UserCheck, HeartPulse, Clock } from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { useTheme } from '@/features/doctor/context/ThemeContext';
import { Nurse } from '@/features/doctor/mock/nurses';

interface NurseTopBarProps {
  activeNurse: Nurse;
  assignedCount: number;
}

export const NurseTopBar: React.FC<NurseTopBarProps> = ({ activeNurse, assignedCount }) => {
  const { activeHospital } = useSimulation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Brand & Nurse Identity */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 dark:bg-teal-500 text-white dark:text-black shadow-md shadow-teal-600/20 shrink-0">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-wider text-teal-600 dark:text-teal-400">
              CAREX
            </span>
            <span className="text-[10px] px-1.5 py-0.5 font-bold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30 rounded-full">
              AIIMS Nurse Station
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 -mt-0.5 font-medium truncate">
            AIIMS Hospital Bedside Care & Task Intelligence
          </p>
        </div>
      </div>

      {/* Center Controls & Hospital Selector */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Hospital Facility Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200">
          <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{activeHospital.shortName} ({activeHospital.location})</span>
        </div>

        {/* Shift Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>{activeNurse.shift}</span>
        </div>

        {/* Assigned Scoped Count */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300">
          <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{assignedCount} Assigned Beds</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Nurse Profile Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <div className="w-6 h-6 rounded-lg bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
            {activeNurse.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-tight">
              {activeNurse.name.split(',')[0]}
            </p>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold leading-tight">
              {activeNurse.ward.split('(')[0]}
            </p>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>

        {/* Sign Out Button */}
        <button
          onClick={() => navigate('/login?role=nurse')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 transition-colors"
          title="Sign out of Nurse Portal"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
