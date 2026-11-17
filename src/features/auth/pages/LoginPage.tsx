import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, Shield, CreditCard } from 'lucide-react';
import { UserRole } from '@/types';
import { AuthLayout } from '../components/AuthLayout';
import { RoleBadge } from '../components/RoleBadge';
import { useAuth } from '../context/AuthContext';
import { DOCTORS } from '@/mock/doctors';
import { ICU_NURSES } from '@/features/doctor/mock/nurses';
import { FAMILY_ACCOUNTS } from '@/features/patient/mock/family';
import { HOSPITAL_EMPLOYEES } from '@/features/hospital-management/mock/employees';

export const LoginPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Get current role from query parameter (default to doctor)
  const roleParam = searchParams.get('role') as UserRole;
  const currentRole: UserRole = (roleParam === 'nurse' || roleParam === 'family' || roleParam === 'patient' || roleParam === 'admin') 
    ? (roleParam === 'patient' ? 'family' : roleParam) 
    : 'doctor';

  const [idValue, setIdValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoSuccess, setDemoSuccess] = useState<string | null>(null);

  const handleRoleChange = (newRole: UserRole) => {
    setSearchParams({ role: newRole });
    setError(null);
    setDemoSuccess(null);
    setIdValue('');
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

  const getRoleTitle = (r: UserRole) => {
    if (r === 'doctor') return 'Doctor';
    if (r === 'nurse') return 'Nurse';
    if (r === 'family') return 'Family Portal';
    return 'Hospital Management';
  };

  const validateCredential = (role: UserRole, inputId: string): { valid: boolean; record?: any; errorMsg?: string } => {
    const clean = inputId.trim().toUpperCase();
    if (!clean) {
      return { valid: false, errorMsg: `${getRoleIdLabel(role)} is required.` };
    }

    if (role === 'doctor') {
      const doc = DOCTORS.find((d) => d.id.toUpperCase() === clean);
      if (doc) return { valid: true, record: doc };
      return { valid: false, errorMsg: 'Doctor ID not recognized.' };
    }

    if (role === 'nurse') {
      const nurse = ICU_NURSES.find((n) => n.id.toUpperCase() === clean);
      if (nurse) return { valid: true, record: nurse };
      return { valid: false, errorMsg: 'Nurse ID not recognized.' };
    }

    if (role === 'family') {
      const fam = FAMILY_ACCOUNTS.find(
        (f) => f.linkedPatientId.toUpperCase() === clean || f.id.toUpperCase() === clean
      );
      if (fam) return { valid: true, record: fam };
      return { valid: false, errorMsg: 'Patient ID not recognized.' };
    }

    if (role === 'admin') {
      const emp = HOSPITAL_EMPLOYEES.find((e) => e.empId.toUpperCase() === clean);
      if (emp) return { valid: true, record: emp };
      return { valid: false, errorMsg: 'Employee ID not recognized.' };
    }

    return { valid: false, errorMsg: 'Invalid credential.' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSuccess(null);
    setError(null);

    const res = validateCredential(currentRole, idValue);
    if (!res.valid) {
      setError(res.errorMsg || 'Invalid ID');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      login(currentRole, idValue.trim().toUpperCase(), res.record);

      if (currentRole === 'nurse') {
        navigate('/nurse');
      } else if (currentRole === 'family') {
        navigate('/patient/dashboard');
      } else if (currentRole === 'admin') {
        navigate('/hospital-management');
      } else {
        navigate('/doctor');
      }
    }, 400);
  };

  return (
    <AuthLayout subtitle="Secure Frontend Sign-In Portal">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative">
        {/* Role Selector Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <RoleBadge role={currentRole} onChangeRole={handleRoleChange} showSwitch />
          
          <Link
            to="/select-role"
            className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch Role</span>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            Sign in as <span className="text-blue-600 dark:text-orange-500">{getRoleTitle(currentRole)}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Enter your {getRoleIdLabel(currentRole)} to access your CAREX dashboard.
          </p>
        </div>

        {/* Demo Success / Information Callout */}
        {demoSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-orange-500/10 border border-blue-200 dark:border-orange-500/30 text-blue-900 dark:text-orange-300 text-xs space-y-3 animate-in fade-in duration-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Validation Successful</p>
                <p className="mt-1 leading-relaxed text-slate-700 dark:text-zinc-300">{demoSuccess}</p>
              </div>
            </div>
            
            <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-blue-200 dark:border-orange-500/20">
              <button
                type="button"
                onClick={() => navigate(`/onboarding?role=${currentRole}`)}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-600 text-white dark:bg-orange-500 dark:text-black font-bold hover:bg-blue-700 dark:hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Onboarding Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {currentRole === 'doctor' && (
                <button
                  type="button"
                  onClick={() => navigate('/doctor')}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-blue-700 dark:text-orange-400 font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-orange-400" />
                  <span>Doctor Dashboard</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Role-Specific Identifier Field */}
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
                value={idValue}
                onChange={(e) => {
                  setIdValue(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={getRoleIdPlaceholder(currentRole)}
                required
                aria-invalid={!!error}
                aria-describedby={error ? 'id-error' : undefined}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border text-slate-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 ${
                  error
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
                }`}
              />
            </div>
            {error && (
              <div id="id-error" className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-0.5">
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
                <span>Validating Credential...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Signup / Switch Link */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center space-y-2">
          {currentRole === 'admin' ? (
            <div className="text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">Hospital Admin Notice:</span> Public signup is disabled for Admin. Contact system admin or{' '}
              <Link to="/signup?role=admin" className="text-blue-600 dark:text-orange-400 hover:underline font-semibold">
                view details
              </Link>.
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Don't have an account?{' '}
              <Link
                to={`/signup?role=${currentRole}`}
                className="text-blue-600 dark:text-orange-400 hover:text-blue-700 dark:hover:text-orange-300 font-bold hover:underline transition-colors"
              >
                Create account
              </Link>
            </p>
          )}

          <div>
            <Link
              to="/"
              className="inline-block text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 font-medium transition-colors pt-2"
            >
              ← Back to Role Selection
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
