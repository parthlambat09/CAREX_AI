import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Sun, Moon, LogOut, ShieldCheck, Ambulance, Menu } from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { useTheme } from '@/features/doctor/context/ThemeContext';

import { useAuth } from '@/features/auth/context/AuthContext';

interface HospitalManagementTopBarProps {
  onToggleMobileMenu?: () => void;
}

export const HospitalManagementTopBar: React.FC<HospitalManagementTopBarProps> = ({ onToggleMobileMenu }) => {
  const { activeHospital } = useSimulation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  let adminName = 'Admin Operations';
  try {
    const auth = useAuth();
    if (auth.user && auth.user.role === 'admin') {
      adminName = auth.user.record?.name || auth.user.id;
    }
  } catch {
    // fallback
  }

  return (
    <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Brand & Module */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-wider text-indigo-600 dark:text-indigo-400">
              CAREX
            </span>
            <span className="text-[10px] px-1.5 py-0.5 font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30 rounded-full">
              AIIMS Management
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 -mt-0.5 font-medium truncate">
            AIIMS Hospital Operations, Billing & Infrastructure
          </p>
        </div>
      </div>

      {/* Center Controls & Ambulance Helpline */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Hospital Facility Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200">
          <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{activeHospital.shortName} ({activeHospital.location})</span>
        </div>

        {/* India Emergency Ambulance Helpline Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold">
          <Ambulance className="w-4 h-4 animate-bounce" />
          <span>Ambulance Helpline:</span>
          <a
            href="tel:108"
            className="font-black underline hover:text-red-900 dark:hover:text-red-300"
            title="National Emergency Ambulance (108)"
          >
            108
          </a>
          <span className="text-red-300 dark:text-red-700">|</span>
          <a
            href="tel:102"
            className="font-bold underline hover:text-red-900 dark:hover:text-red-300"
            title="Non-Emergency Medical Transport (102)"
          >
            102
          </a>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Admin Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{adminName}</span>
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

        {/* Sign Out */}
        <button
          onClick={() => navigate('/login?role=admin')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 transition-colors"
          title="Sign out of Hospital Management"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
