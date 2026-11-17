import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Bell, LayoutDashboard, Activity, Brain, Stethoscope, BarChart3, Settings, ArrowRight, UserCheck, Cpu, HeartPulse } from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { StatusBadge } from './ui';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SYSTEM_PAGES = [
  { label: 'Command Center (Dashboard)', path: '/doctor', icon: LayoutDashboard, category: 'Page' },
  { label: 'Real-Time Monitoring Wall', path: '/doctor/monitoring', icon: Activity, category: 'Page' },
  { label: 'Patient Directory & Census', path: '/doctor/patients', icon: User, category: 'Page' },
  { label: 'Nursing Staff Roster & Allocation', path: '/doctor/nurses', icon: UserCheck, category: 'Page' },
  { label: 'ICU Equipment Readiness', path: '/doctor/equipment', icon: Cpu, category: 'Page' },
  { label: 'AI Risk Prediction & SHAP Analysis', path: '/doctor/risk', icon: Brain, category: 'Page' },
  { label: 'Alerts & Clinical Escalation', path: '/doctor/alerts', icon: Bell, category: 'Page' },
  { label: 'Clinical Decision Support', path: '/doctor/support', icon: Stethoscope, category: 'Page' },
  { label: 'Analytics & Incident Reports', path: '/doctor/analytics', icon: BarChart3, category: 'Page' },
  { label: 'Patient & Family Recovery Portal', path: '/patient/dashboard', icon: HeartPulse, category: 'Portal' },
  { label: 'System Settings', path: '/doctor/settings', icon: Settings, category: 'Page' },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { patients, alerts } = useSimulation();
  const [query, setQuery] = useState('');

  // Handle global shortcut (Ctrl+K / Cmd+K) and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Filter Patients
  const filteredPatients = q
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.bed.toLowerCase().includes(q) ||
          p.diagnosis.toLowerCase().includes(q)
      )
    : patients.slice(0, 4);

  // Filter Alerts
  const filteredAlerts = q
    ? alerts.filter(
        (a) =>
          a.patientId.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q) ||
          a.bed.toLowerCase().includes(q)
      )
    : alerts.slice(0, 3);

  // Filter Pages
  const filteredPages = q
    ? SYSTEM_PAGES.filter((p) => p.label.toLowerCase().includes(q))
    : SYSTEM_PAGES;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <Search className="h-5 w-5 text-slate-400 dark:text-zinc-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search CAREX ICU patients, beds, alerts, pages..."
            className="flex-1 bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="text-[10px] px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 font-mono bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Patients Section */}
          {filteredPatients.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                ICU Patients ({filteredPatients.length})
              </p>
              <div className="space-y-1 mt-1">
                {filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleNavigate(`/doctor/patient/${p.id}`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-left transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-orange-500/10 dark:text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                        <User className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{p.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono border border-slate-200 dark:border-zinc-700">
                            {p.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                          Bed: <strong className="text-slate-700 dark:text-zinc-300">{p.bed}</strong> • {p.diagnosis}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={p.status} />
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-orange-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Alerts Section */}
          {filteredAlerts.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                ICU Alerts ({filteredAlerts.length})
              </p>
              <div className="space-y-1 mt-1">
                {filteredAlerts.map((a) => {
                  const pName = patients.find((p) => p.id === a.patientId)?.name || a.patientId;
                  return (
                    <button
                      key={a.id}
                      onClick={() => handleNavigate('/doctor/alerts')}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-left transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${a.severity === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{pName} (Bed {a.bed})</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{a.reason}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-orange-400 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pages Section */}
          {filteredPages.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Navigation & Features
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                {filteredPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.path}
                      onClick={() => handleNavigate(page.path)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-left transition-colors group"
                    >
                      <Icon className="h-4 w-4 text-blue-600 dark:text-orange-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-zinc-100 truncate">
                        {page.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty Search Result */}
          {q && filteredPatients.length === 0 && filteredAlerts.length === 0 && filteredPages.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
              <p className="text-sm font-medium">No ICU records matching "{query}"</p>
              <p className="text-xs mt-1">Try searching for a patient name, bed number (e.g. Bed 04), or alert keyword.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between bg-slate-50 dark:bg-zinc-950 shrink-0">
          <span>Search CAREX Clinical Intelligence</span>
          <span>Press <strong>ESC</strong> to close</span>
        </div>
      </div>
    </div>
  );
};
