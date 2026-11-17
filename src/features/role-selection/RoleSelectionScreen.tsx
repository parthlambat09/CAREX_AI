import React, { useState } from 'react';
import { Activity, ShieldCheck, ArrowRight, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROLE_OPTIONS, RoleOption } from './roles';
import { RoleCard } from './RoleCard';

export const RoleSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [showContinueModal, setShowContinueModal] = useState<boolean>(false);

  const handleRoleSelect = (role: RoleOption) => {
    setSelectedRole(role);
    setShowContinueModal(false);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setShowContinueModal(false);
  };

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/login?role=${selectedRole.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-black dark:text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white dark:selection:bg-orange-500 dark:selection:text-black relative">
      {/* Top Branding Header */}
      <header className="border-b border-slate-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 dark:bg-orange-500 rounded-xl shadow-md shadow-blue-600/20 dark:shadow-orange-500/20">
              <Activity className="h-6 w-6 text-white dark:text-black animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-wider text-blue-600 dark:text-orange-500">
                CAREX
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-orange-500" />
              Safety Intelligence Platform
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-between relative z-10">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-orange-500 animate-ping" />
            <span>AI-Powered Healthcare & ICU Safety Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
            WHO ARE YOU?
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Select your role to access your customized healthcare workflow & safety intelligence dashboard.
          </p>
        </div>

        {/* 4 Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full mb-12">
          {ROLE_OPTIONS.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={selectedRole?.id === role.id}
              onSelect={handleRoleSelect}
            />
          ))}
        </div>

        {/* Selected Role Action Bar / State Box */}
        {selectedRole && (
          <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 rounded-2xl border border-blue-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-slate-800 dark:text-zinc-200">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-orange-500/20 dark:text-orange-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Selected Role</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-zinc-100">You selected {selectedRole.title}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={handleBack}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleContinue}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-black text-sm font-bold shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Continue Confirmation Modal */}
        {showContinueModal && selectedRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="max-w-md w-full rounded-2xl p-6 sm:p-8 border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-6 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 dark:bg-orange-500/20 dark:border-orange-500/30 dark:text-orange-400 flex items-center justify-center mx-auto">
                <Info className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Next Phase Pending</h3>
                <p className="text-slate-600 dark:text-zinc-300 font-medium text-sm sm:text-base leading-relaxed bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  Authentication will be connected in the next phase.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleBack}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-sm font-bold transition-all duration-200 border border-slate-200 dark:border-zinc-700"
                >
                  Back to Role Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800/80 py-4 bg-white dark:bg-zinc-950 text-center text-xs text-slate-500 dark:text-zinc-500 relative z-10">
        <p>CAREX — AI-Powered Healthcare & ICU Safety Intelligence Platform Prototype</p>
      </footer>
    </div>
  );
};
