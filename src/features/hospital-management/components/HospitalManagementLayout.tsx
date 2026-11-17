import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HospitalManagementTopBar } from './HospitalManagementTopBar';
import { HospitalManagementSidebar } from './HospitalManagementSidebar';

export const HospitalManagementLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw] h-full bg-white dark:bg-zinc-950">
            <HospitalManagementSidebar />
          </div>
        </div>
      )}

      <HospitalManagementTopBar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex">
        <div className="hidden md:block shrink-0">
          <HospitalManagementSidebar />
        </div>
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
