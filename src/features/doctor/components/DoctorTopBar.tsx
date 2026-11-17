import { useEffect, useState, useRef } from 'react';
import { Search, Bell, ChevronDown, Wifi, Menu, Sun, Moon, Settings, LogOut, Building2 } from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { useTheme } from '@/features/doctor/context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface DoctorTopBarProps {
  onToggleMobileSidebar?: () => void;
  onOpenSearch?: () => void;
}

export function DoctorTopBar({ onToggleMobileSidebar, onOpenSearch }: DoctorTopBarProps) {
  const { alerts, patients, acknowledgeAlert, activeHospital, activeDoctor } = useSimulation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [now, setNow] = useState(new Date());
  const [unit, setUnit] = useState('ICU — General');
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.acknowledged);
  const activeAlertsCount = unreadAlerts.length;
  const criticalCount = patients.filter((p) => p.status.toLowerCase() === 'critical').length;

  return (
    <header className="flex h-16 items-center gap-3 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 md:px-6 sticky top-0 z-20 transition-colors">
      {/* Left section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Hospital Facility Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-zinc-100">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-orange-400 shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-none">AIIMS Hospital ({activeHospital.name})</span>
        </div>
      </div>

      {/* Center status pill */}
      <div className="hidden xl:flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5">
        <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">Telemetry Stream Nominal</span>
        <span className="mx-1 h-3 w-px bg-slate-200 dark:bg-zinc-700" />
        <button
          onClick={() => navigate('/doctor/monitoring')}
          className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline"
        >
          {criticalCount} Critical Patients
        </button>
      </div>

      {/* Right controls */}
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {/* Time display */}
        <div className="hidden 2xl:block text-right">
          <p className="font-mono text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
            {now.toLocaleTimeString('en-US', { hour12: false })}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400">
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* Unit Selector */}
        <div className="relative hidden sm:block">
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="appearance-none rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 py-1.5 pl-3 pr-8 text-xs text-slate-700 dark:text-zinc-200 font-medium focus:border-blue-500 dark:focus:border-orange-500 focus:outline-none transition"
          >
            <option>ICU — General</option>
            <option>ICU — Cardiac</option>
            <option>ICU — Neuro</option>
            <option>ICU — Surgical</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
        </div>

        {/* Global Search Button Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:border-slate-300 dark:hover:border-zinc-700 transition"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search CAREX...</span>
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-orange-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-50 p-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2.5 mb-2 px-1">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Active Alerts ({activeAlertsCount})</span>
                <button
                  onClick={() => navigate('/doctor/alerts')}
                  className="text-[11px] font-semibold text-blue-600 dark:text-orange-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {unreadAlerts.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">No active alerts requiring attention.</p>
                ) : (
                  unreadAlerts.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700/60 transition text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-zinc-200">
                          {patients.find((p) => p.id === a.patientId)?.name || a.patientId} ({a.bed})
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{a.reason}</p>
                      </div>
                      <button
                        onClick={() => acknowledgeAlert(a.id)}
                        className="text-[10px] font-semibold text-blue-600 dark:text-orange-400 hover:underline shrink-0 ml-2"
                        title="Acknowledge"
                      >
                        Ack
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 py-1 pl-1 pr-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 dark:bg-orange-500 text-xs font-bold text-white dark:text-black shadow-xs">
              {activeDoctor.avatarInitials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-tight">{activeDoctor.shortName}</p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate max-w-[110px]">{activeDoctor.specialty.split(' ')[0]}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-50 p-2 animate-fade-in text-xs">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-zinc-800 mb-1">
                <p className="font-bold text-slate-900 dark:text-zinc-100">{activeDoctor.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">{activeDoctor.email}</p>
              </div>

              <button
                onClick={() => { setShowProfileMenu(false); navigate('/doctor/settings'); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-left transition"
              >
                <Settings className="h-4 w-4 text-blue-600 dark:text-orange-500" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => { setShowProfileMenu(false); navigate('/login'); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-left transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
