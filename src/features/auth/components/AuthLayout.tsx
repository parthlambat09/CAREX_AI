import React from 'react';
import { Activity, ShieldCheck, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-black dark:text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white dark:selection:bg-orange-500 dark:selection:text-black relative">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-blue-600 dark:bg-orange-500 rounded-xl shadow-md shadow-blue-600/20 dark:shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <Activity className="h-6 w-6 text-white dark:text-black animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-wider text-blue-600 dark:text-orange-500">
                CAREX
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-orange-500" />
              Safety Intelligence Platform
            </span>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Role Selection</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center justify-center relative z-10">
        {/* Header Tag */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-orange-500 animate-ping" />
            <span>AI-Powered Healthcare & ICU Safety Intelligence</span>
          </div>

          {subtitle && (
            <p className="text-sm text-slate-600 dark:text-zinc-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Demo Mode Notice */}
        <div className="max-w-md w-full mb-6">
          <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-zinc-800 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-700 dark:text-zinc-300 shadow-sm">
            <Info className="w-4 h-4 text-blue-600 dark:text-orange-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-zinc-100">Frontend UI Phase:</span> Interactive validation & simulated state. Backend connection to Supabase will follow in the authentication phase.
            </div>
          </div>
        </div>

        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800/80 py-4 bg-white dark:bg-zinc-950 text-center text-xs text-slate-500 dark:text-zinc-500 relative z-10">
        <p>CAREX — AI-Powered Healthcare & ICU Safety Intelligence Platform Prototype</p>
      </footer>
    </div>
  );
};
