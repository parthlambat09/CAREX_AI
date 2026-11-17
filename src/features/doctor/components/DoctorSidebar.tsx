import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Users, Brain, Bell, Stethoscope,
  BarChart3, Send, Settings, HeartPulse, ChevronLeft, ChevronRight,
  UserCheck
} from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';

interface DoctorSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  badgeKey?: string;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/doctor', label: 'Command Center', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'CLINICAL',
    items: [
      { to: '/doctor/monitoring', label: 'Live Telemetry', icon: Activity },
      { to: '/doctor/patients', label: 'Patients', icon: Users },
      { to: '/doctor/nurses', label: 'Nursing Staff', icon: UserCheck },
      { to: '/doctor/risk', label: 'AI Risk Prediction', icon: Brain },
      { to: '/doctor/alerts', label: 'Alerts & Escalation', icon: Bell, badgeKey: 'alerts' },
      { to: '/doctor/support', label: 'Decision Support', icon: Stethoscope },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { to: '/doctor/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/doctor/notifications', label: 'Notifications', icon: Send },
      { to: '/doctor/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function DoctorSidebar({ collapsed = false, onToggleCollapse, onCloseMobile }: DoctorSidebarProps) {
  const { alerts } = useSimulation();
  const location = useLocation();
  const activeAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <aside
      className={`flex flex-col border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 shrink-0 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`flex h-16 items-center border-b border-slate-200 dark:border-zinc-800 shrink-0 ${
          collapsed ? 'justify-center px-0' : 'justify-between px-4'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 dark:bg-orange-500 shadow-md shadow-blue-600/20 dark:shadow-orange-500/20 shrink-0">
            <HeartPulse className="h-5 w-5 text-white dark:text-black" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-wider text-blue-600 dark:text-orange-500">
                  CAREX
                </span>
                <span className="text-[10px] px-1.5 py-0.5 font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30 rounded">
                  AIIMS ICU
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">AIIMS Hospital Command Center</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-4 px-2 py-4 overflow-y-auto scrollbar-hide">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 select-none">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isAlertNav = item.badgeKey === 'alerts';
                const badge = isAlertNav && activeAlerts > 0 ? activeAlerts : null;
                const isActive = item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive: linkActive }) =>
                      `relative flex items-center h-10 text-xs font-medium rounded-xl transition-all duration-150 ${
                        collapsed ? 'justify-center px-0 mx-1' : 'px-3 mx-1'
                      } ${
                        linkActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-orange-500/10 dark:text-orange-500 font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`
                    }
                  >
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-blue-600 dark:bg-orange-500" />
                    )}
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-orange-500' : 'text-slate-400 dark:text-zinc-500'}`} />
                    {!collapsed && <span className="flex-1 ml-3 truncate">{item.label}</span>}
                    {!collapsed && badge !== null && (
                      <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                        {badge}
                      </span>
                    )}
                    {collapsed && badge !== null && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-slate-200 dark:border-zinc-800 p-2 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center gap-2 w-full h-9 rounded-xl text-xs font-medium text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100 transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
