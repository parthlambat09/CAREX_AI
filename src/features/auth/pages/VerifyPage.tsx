import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MailOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/types';
import { AuthLayout } from '../components/AuthLayout';
import { RoleBadge } from '../components/RoleBadge';

export const VerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get current role from query parameter (default to doctor)
  const roleParam = searchParams.get('role') as UserRole;
  const currentRole: UserRole = (roleParam === 'patient' || roleParam === 'admin') ? roleParam : 'doctor';

  const getRoleTitle = (r: UserRole) => {
    if (r === 'doctor') return 'Doctor';
    if (r === 'patient') return 'Patient';
    return 'Hospital Admin';
  };

  return (
    <AuthLayout subtitle="Account Verification Pipeline">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative space-y-6">
        {/* Role Badge Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <RoleBadge role={currentRole} />
          
          <Link
            to={`/login?role=${currentRole}`}
            className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Login</span>
          </Link>
        </div>

        {/* Verification Icon Box */}
        <div className="flex justify-center py-2">
          <div className="relative">
            <div className="relative w-16 h-16 rounded-2xl bg-blue-50 dark:bg-orange-500/10 border border-blue-200 dark:border-orange-500/30 text-blue-600 dark:text-orange-400 flex items-center justify-center shadow-md">
              <MailOpen className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            A confirmation request is pending for your <strong className="text-slate-900 dark:text-zinc-100">{getRoleTitle(currentRole)}</strong> account.
          </p>
        </div>

        {/* Informative Placeholder Notice */}
        <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex gap-2.5 text-slate-700 dark:text-zinc-300">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">Future Integration Phase</p>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed mt-1">
                Account verification tokens, SMTP email deliveries, and professional credentials checking (such as state medical board registry checks) will be fully connected to Supabase and validation microservices in the next phase.
              </p>
            </div>
          </div>
        </div>

        {/* Simulated Actions */}
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => navigate(`/onboarding?role=${currentRole}`)}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-black font-bold transition-all text-sm flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Proceed to Onboarding (Demo)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => alert('Simulated check complete: In a live system, this button calls the database/Auth SDK to check if email confirmation is complete.')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold transition-all text-sm"
          >
            Verify Later / Refresh Status
          </button>
        </div>

        {/* Secondary Info */}
        <p className="text-[10px] text-center text-slate-400 dark:text-zinc-500">
          Didn't receive any mock link? Email delivery pipelines are disabled in the frontend UI phase.
        </p>
      </div>
    </AuthLayout>
  );
};
