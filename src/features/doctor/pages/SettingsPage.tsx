import { useState, useEffect } from 'react';
import { Brain, User, Moon, Sun, Save, RotateCcw, CheckCircle2, X } from 'lucide-react';
import { Card, SectionTitle, Button, PageHeader, Toggle } from '@/features/doctor/components/ui';
import { useTheme } from '@/features/doctor/context/ThemeContext';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { activeHospital, activeDoctor } = useSimulation();
  const navigate = useNavigate();

  // Profile State
  const [profileName, setProfileName] = useState(activeDoctor.name);
  const [profileRole, setProfileRole] = useState(activeDoctor.specialty);
  const [profileEmail, setProfileEmail] = useState(activeDoctor.email);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    setProfileName(activeDoctor.name);
    setProfileRole(activeDoctor.specialty);
    setProfileEmail(activeDoctor.email);
  }, [activeDoctor]);

  // Preference State
  const [compactMode, setCompactMode] = useState<boolean>(() => {
    return localStorage.getItem('carex_compact_mode') === 'true';
  });

  const [soundAlerts, setSoundAlerts] = useState<boolean>(() => {
    return localStorage.getItem('carex_audio_alerts') !== 'false';
  });

  const [aiRecs, setAiRecs] = useState<boolean>(() => {
    return localStorage.getItem('carex_ai_recommendations') !== 'false';
  });

  const [simMode, setSimMode] = useState<boolean>(() => {
    return localStorage.getItem('carex_sim_mode') !== 'false';
  });

  // Threshold State
  const [criticalThreshold, setCriticalThreshold] = useState<number>(() => {
    return Number(localStorage.getItem('carex_crit_threshold')) || 80;
  });
  const [warningThreshold, setWarningThreshold] = useState<number>(() => {
    return Number(localStorage.getItem('carex_warn_threshold')) || 50;
  });
  const [stableThreshold, setStableThreshold] = useState<number>(() => {
    return Number(localStorage.getItem('carex_stable_threshold')) || 25;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('carex_compact_mode', String(compactMode));
    localStorage.setItem('carex_audio_alerts', String(soundAlerts));
    localStorage.setItem('carex_ai_recommendations', String(aiRecs));
    localStorage.setItem('carex_sim_mode', String(simMode));
  }, [compactMode, soundAlerts, aiRecs, simMode]);

  const handleSaveSettings = () => {
    localStorage.setItem('carex_profile_name', profileName);
    localStorage.setItem('carex_profile_role', profileRole);
    localStorage.setItem('carex_profile_email', profileEmail);
    localStorage.setItem('carex_crit_threshold', String(criticalThreshold));
    localStorage.setItem('carex_warn_threshold', String(warningThreshold));
    localStorage.setItem('carex_stable_threshold', String(stableThreshold));

    setToastMessage('System settings and clinical thresholds saved successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetDefaults = () => {
    setCriticalThreshold(80);
    setWarningThreshold(50);
    setStableThreshold(25);
    setCompactMode(false);
    setSoundAlerts(true);
    setAiRecs(true);
    setSimMode(true);

    setToastMessage('Reset all configuration parameters to default ICU hospital protocols.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="CAREX System Settings"
          description={`Configure display preferences, clinical threshold parameters, AI copilot recommendation modes, and simulation feeds for ${activeHospital.name}.`}
          statusPill={{ label: 'System Configuration Synced', variant: 'info' }}
        />

        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="default" onClick={handleResetDefaults}>
            <RotateCcw className="h-4 w-4" />
            <span>Reset Defaults</span>
          </Button>

          <Button variant="primary" onClick={handleSaveSettings}>
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Clinician Profile */}
        <Card className="p-5 border border-slate-200 dark:border-zinc-800">
          <SectionTitle title="Clinician Profile" subtitle="Attending Intensivist credentials & hospital unit" />
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white dark:bg-orange-500 dark:text-black text-lg font-bold shadow-md shadow-blue-600/20 dark:shadow-orange-500/20 shrink-0">
              {profileName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">{profileName}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{profileRole}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{activeHospital.name}</p>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <Button size="sm" variant="default" onClick={() => setIsEditProfileOpen(true)}>
              <User className="h-3.5 w-3.5" /> Edit Profile
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate('/select-role')}>
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Display & Interactive Preferences */}
        <Card className="p-5 border border-slate-200 dark:border-zinc-800">
          <SectionTitle title="Interface Preferences" subtitle="Customize theme, audio alerts, and display density" />
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-4 w-4 text-orange-400" /> : <Sun className="h-4 w-4 text-slate-700" />}
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">Appearance Theme</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Current: {theme === 'dark' ? 'Dark Tactical Mode (Orange Accent)' : 'Light Clinical Mode (Teal/Blue Accent)'}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="default" onClick={toggleTheme}>
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60">
              <Toggle
                checked={compactMode}
                onChange={setCompactMode}
                label="Compact Table & Grid Density"
                description="Reduce padding and row height across ICU monitoring telemetry grids."
              />
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60">
              <Toggle
                checked={soundAlerts}
                onChange={setSoundAlerts}
                label="Audible Alert Chimes"
                description="Play high-priority audio chime on critical telemetry alerts."
              />
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60">
              <Toggle
                checked={aiRecs}
                onChange={setAiRecs}
                label="AI Decision Copilot Hints"
                description="Display AI-suggested protocol recommendations on patient details."
              />
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60">
              <Toggle
                checked={simMode}
                onChange={setSimMode}
                label="Telemetry Simulation Mode"
                description="Generate synthetic real-time vitals and drift waveforms."
              />
            </div>
          </div>
        </Card>

        {/* AI Model Status */}
        <Card className="p-5 border border-slate-200 dark:border-zinc-800">
          <SectionTitle title="AI Model Architecture Status" subtitle="Deployed clinical intelligence models" />
          <div className="mt-4 space-y-3">
            {[
              { name: 'Deterioration Index Engine v4.2', status: 'Active (Online)', icon: Brain },
              { name: 'Sepsis Early Warning Model', status: 'Active (Online)', icon: Brain },
              { name: 'Cardiac Arrest Predictor', status: 'Active (Online)', icon: Brain },
              { name: 'Respiratory Failure Model', status: 'Active (Online)', icon: Brain },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60 p-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-orange-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{m.name}</span>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold">
                    {m.status}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Alert Thresholds (Interactive Sliders) */}
        <Card className="p-5 border border-slate-200 dark:border-zinc-800">
          <SectionTitle title="Clinical Threshold Configuration" subtitle="Fine-tune risk score alert boundaries" />
          <div className="mt-4 space-y-5">
            {/* Critical Threshold Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-red-700 dark:text-red-400">Critical Deterioration Boundary</span>
                <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{criticalThreshold}%</span>
              </div>
              <input
                type="range"
                min="65"
                max="95"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full mt-2 accent-red-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Patients exceeding this score trigger immediate Red-tier command alerts.
              </p>
            </div>

            {/* Warning Threshold Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-700 dark:text-amber-400">Caution / Elevated Care Threshold</span>
                <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{warningThreshold}%</span>
              </div>
              <input
                type="range"
                min="35"
                max="65"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="w-full mt-2 accent-amber-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Scores between {warningThreshold}% and {criticalThreshold}% flag caution and increased nurse check frequencies.
              </p>
            </div>

            {/* Stable Bounds Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-700 dark:text-emerald-400">Stable Baseline Upper Bound</span>
                <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{stableThreshold}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={stableThreshold}
                onChange={(e) => setStableThreshold(Number(e.target.value))}
                className="w-full mt-2 accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Scores below {stableThreshold}% designate fully stable post-operative trajectory.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0" onClick={() => setIsEditProfileOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Edit Clinician Credentials</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Clinician Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Clinical Specialty / Title</label>
                <input
                  type="text"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Staff Email</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <Button variant="ghost" onClick={() => setIsEditProfileOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    localStorage.setItem('carex_profile_name', profileName);
                    localStorage.setItem('carex_profile_role', profileRole);
                    localStorage.setItem('carex_profile_email', profileEmail);
                    setIsEditProfileOpen(false);
                    setToastMessage('Clinician credentials updated.');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                >
                  Save Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
