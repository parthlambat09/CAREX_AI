import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CreditCard, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { UserRole } from '@/types';
import { AuthLayout } from '../components/AuthLayout';
import { RoleBadge } from '../components/RoleBadge';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get current role from query parameter (default to doctor)
  const roleParam = searchParams.get('role') as UserRole;
  const currentRole: UserRole = (roleParam === 'nurse' || roleParam === 'family' || roleParam === 'patient' || roleParam === 'admin')
    ? (roleParam === 'patient' ? 'family' : roleParam)
    : 'doctor';

  const [roleId, setRoleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoSuccess, setDemoSuccess] = useState<string | null>(null);

  const handleRoleChange = (newRole: UserRole) => {
    setSearchParams({ role: newRole });
    setError(null);
    setDemoSuccess(null);
    setRoleId('');
  };

  const getRoleIdLabel = (role: UserRole) => {
    if (role === 'doctor') return 'Doctor ID';
    if (role === 'nurse') return 'Nurse ID';
    if (role === 'family') return 'Patient ID';
    return 'Employee ID';
  };

  const getRoleIdPlaceholder = (role: UserRole) => {
    if (role === 'doctor') return 'DOC-1024';
    if (role === 'nurse') return 'NUR-2048';
    if (role === 'family') return 'PAT-3092';
    return 'EMP-5501';
  };

  const validate = (): boolean => {
    if (!roleId.trim()) {
      setError(`${getRoleIdLabel(currentRole)} is required.`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSuccess(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setDemoSuccess(
        `Account recovery link requested for ${getRoleIdLabel(currentRole)}: ${roleId.trim().toUpperCase()}. Instructions have been dispatched to your associated contact record.`
      );
    }, 600);
  };

  return (
    <AuthLayout subtitle="Secure Account Recovery">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative">
        {/* Role Selector Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <RoleBadge role={currentRole} onChangeRole={handleRoleChange} showSwitch />
          
          <Link
            to={`/login?role=${currentRole}`}
            className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Login</span>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            Account Recovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Enter your {getRoleIdLabel(currentRole)} to request account credentials recovery.
          </p>
        </div>

        {/* Demo Success Message */}
        {demoSuccess ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-orange-500/10 border border-blue-200 dark:border-orange-500/30 text-blue-900 dark:text-orange-300 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Recovery Dispatched</p>
                  <p className="mt-1 leading-relaxed text-slate-700 dark:text-zinc-300">{demoSuccess}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate(`/login?role=${currentRole}`)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-black font-bold transition-all text-sm flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Back to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* ID Field */}
            <div className="space-y-1.5">
              <label htmlFor="roleId" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                {getRoleIdLabel(currentRole)} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  id="roleId"
                  type="text"
                  value={roleId}
                  onChange={(e) => {
                    setRoleId(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={getRoleIdPlaceholder(currentRole)}
                  required
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border text-slate-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 ${
                    error ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
                  }`}
                />
              </div>
              {error && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-md flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-orange-500/50 ${
                isLoading
                  ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed border border-slate-300 dark:border-zinc-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-black shadow-sm'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white dark:border-zinc-600 dark:border-t-black rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Request Recovery</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back Link */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center">
          <Link
            to={`/login?role=${currentRole}`}
            className="inline-block text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:underline transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
