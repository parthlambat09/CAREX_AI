import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { DoctorSidebar } from './DoctorSidebar';
import { DoctorTopBar } from './DoctorTopBar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { CarexAIAssistant } from './CarexAIAssistant';

export function DoctorLayoutInner() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('carex_sidebar_collapsed');
    return saved === 'true';
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('carex_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        const target = e.target as HTMLElement | null;
        if (target) {
          const tagName = target.tagName;
          const isEditable = target.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
          if (isEditable) {
            const isInSearchModal = target.closest('[role="dialog"]') !== null;
            if (!isInSearchModal) {
              return;
            }
          }
        }

        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <DoctorSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw] h-full shadow-2xl">
            <DoctorSidebar
              collapsed={false}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DoctorTopBar
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black p-4 md:p-6 transition-colors">
          <div className="mx-auto max-w-[1600px] space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modals & Floating Assistants */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CarexAIAssistant />
    </div>
  );
}

export function DoctorLayout() {
  return <DoctorLayoutInner />;
}
