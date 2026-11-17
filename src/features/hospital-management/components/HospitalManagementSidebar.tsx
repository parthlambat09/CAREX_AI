import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, FileText, CheckCircle2,
  Cpu, Ambulance
} from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Overview & KPIs',
    path: '/hospital-management',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Patient Records & Vitals',
    path: '/hospital-management/patient-records',
    icon: FileText,
  },
  {
    label: 'Billing & Invoices',
    path: '/hospital-management/billing',
    icon: Receipt,
  },
  {
    label: 'Discharge Details',
    path: '/hospital-management/discharge',
    icon: CheckCircle2,
  },
  {
    label: 'Equipment Readiness',
    path: '/hospital-management/equipment',
    icon: Cpu,
  },
];

export const HospitalManagementSidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] p-4 transition-colors">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
            Hospital Management
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 dark:bg-indigo-500 dark:text-black'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Emergency Quick Box */}
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-bold">
            <Ambulance className="w-4 h-4" />
            <span>Emergency Ambulance</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
            India 24x7 Ambulance Helpline:
          </p>
          <div className="flex items-center gap-2 pt-1 font-mono font-bold text-red-700 dark:text-red-400">
            <a href="tel:108" className="px-2 py-1 bg-white dark:bg-zinc-900 rounded-lg border border-red-300 hover:underline">
              ☎ 108 (EMS)
            </a>
            <a href="tel:102" className="px-2 py-1 bg-white dark:bg-zinc-900 rounded-lg border border-red-300 hover:underline">
              ☎ 102 (Transport)
            </a>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
        <div className="flex items-center justify-between font-bold">
          <span>CAREX Central DB</span>
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
          </span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-zinc-500">
          Sync Engine v2.4 • ISO 27001 HIPAA Compliant
        </p>
      </div>
    </aside>
  );
};
