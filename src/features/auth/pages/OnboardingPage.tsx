import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Heart, Settings, Info, Building2 } from 'lucide-react';
import { UserRole } from '@/types';
import { AuthLayout } from '../components/AuthLayout';

export const OnboardingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get current role from query parameter (default to doctor)
  const roleParam = searchParams.get('role') as UserRole;
  const currentRole: UserRole = (roleParam === 'nurse' || roleParam === 'family' || roleParam === 'patient' || roleParam === 'admin')
    ? (roleParam === 'patient' ? 'family' : roleParam)
    : 'doctor';

  const getRoleTitle = (r: UserRole) => {
    if (r === 'doctor') return 'Doctor';
    if (r === 'nurse') return 'Nurse';
    if (r === 'family' || r === 'patient') return 'Family Portal';
    return 'Hospital Management';
  };

  const getRoleColorClass = (r: UserRole) => {
    if (r === 'doctor') return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-orange-400 dark:border-orange-500/30 dark:bg-orange-500/10';
    if (r === 'nurse') return 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-400 dark:border-teal-500/30 dark:bg-teal-500/10';
    if (r === 'family' || r === 'patient') return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10';
    return 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:border-indigo-500/30 dark:bg-indigo-500/10';
  };

  return (
    <AuthLayout subtitle="User Onboarding Workspace">
      <div className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl relative space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-3 py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-orange-400 animate-ping" />
            <span>Profile Initiated</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            Welcome to CAREX, <span className="text-blue-600 dark:text-orange-500">{getRoleTitle(currentRole)}</span>.
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Your customized profile is ready. Let's configure your clinical parameters and workspace preferences.
          </p>
        </div>

        {/* Informative placeholder panel */}
        <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex gap-3 text-slate-700 dark:text-zinc-300">
            <Info className="w-5 h-5 text-blue-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">Interactive Setup Sandbox</p>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed mt-1">
                In the next development phase, you will walk through configuring security keys, registering patient IoT wearable IDs, setting up emergency contact escalations, and establishing profile permissions using Supabase DB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className={`p-3.5 border rounded-xl space-y-1 ${getRoleColorClass(currentRole)}`}>
              <p className="text-xs font-bold uppercase tracking-wider">Account Role</p>
              <p className="text-sm font-extrabold">{getRoleTitle(currentRole)}</p>
            </div>

            <div className="p-3.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 rounded-xl space-y-1 text-slate-600 dark:text-zinc-400">
              <p className="text-xs font-bold uppercase tracking-wider">Status</p>
              <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400">Onboarding Pending</p>
            </div>
          </div>
        </div>

        {/* Available Actions */}
        <div className="pt-2 space-y-3">
          {currentRole === 'doctor' && (
            <button
              onClick={() => navigate('/doctor')}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-black font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to ICU Command Center (Doctor Subsystem)</span>
            </button>
          )}

          {currentRole === 'nurse' && (
            <button
              onClick={() => navigate('/nurse')}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Bedside Nurse Station</span>
            </button>
          )}

          {currentRole === 'family' && (
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Heart className="w-4 h-4" />
              <span>Go to Family Recovery Portal</span>
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={() => navigate('/hospital-management')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              <span>Go to Hospital Management Command Center</span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Back to Role Selection</span>
            </button>

            <button
              onClick={() => navigate(`/login?role=${currentRole}`)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure Settings (Demo)</span>
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
