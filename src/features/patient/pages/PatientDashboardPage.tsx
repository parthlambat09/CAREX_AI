import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, TrendingUp, CheckCircle2, ShieldCheck, Sun, Moon,
  LogOut, Clock, Sparkles, User, Calendar,
  HeartPulse, Info, Bot, Send, X, UserCheck, AlertTriangle, Building2, Plus, Globe
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { PATIENT_RECOVERY_PROFILES, DailyRecoveryMetric } from '@/features/patient/mock/recovery';
import { CURRENT_FAMILY_ACCOUNT } from '@/features/patient/mock/family';
import { HOSPITALS } from '@/mock/hospitals';
import { useTheme } from '@/features/doctor/context/ThemeContext';
import { FAMILY_TRANSLATIONS, FamilyLanguage } from '@/features/patient/utils/familyTranslations';

import { useAuth } from '@/features/auth/context/AuthContext';
import { FAMILY_ACCOUNTS } from '@/features/patient/mock/family';

interface HourlyDoctorUpdate {
  id: string;
  timestamp: string;
  createdAt: number;
  revealAt: number;
  text: string;
  doctorName: string;
}

import { useSimulation } from '@/features/doctor/context/SimulationContext';

export function PatientDashboardPage() {
  const { allPatients } = useSimulation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [lang, setLang] = useState<FamilyLanguage>(() => {
    try {
      return (localStorage.getItem('carex_family_language') as FamilyLanguage) || 'en';
    } catch {
      return 'en';
    }
  });

  const handleLanguageChange = (newLang: FamilyLanguage) => {
    setLang(newLang);
    try {
      localStorage.setItem('carex_family_language', newLang);
    } catch {
      // fallback
    }
  };

  const t = FAMILY_TRANSLATIONS[lang] || FAMILY_TRANSLATIONS.en;

  let activeFamilyAccount = CURRENT_FAMILY_ACCOUNT;
  try {
    const auth = useAuth();
    if (auth.user && auth.user.role === 'family' && auth.user.id) {
      const match = FAMILY_ACCOUNTS.find(
        (f) => f.linkedPatientId.toUpperCase() === auth.user!.id.toUpperCase() || f.id.toUpperCase() === auth.user!.id.toUpperCase()
      );
      if (match) activeFamilyAccount = match;
      else if (auth.user.record) activeFamilyAccount = auth.user.record;
    }
  } catch {
    // fallback
  }

  // Scoped / Selected linked family patient from 60 uniform patients
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    activeFamilyAccount.linkedPatientId && allPatients.some((p) => p.id === activeFamilyAccount.linkedPatientId)
      ? activeFamilyAccount.linkedPatientId
      : 'P-001'
  );

  const simPatient = useMemo(() => {
    return allPatients.find((p) => p.id === selectedPatientId) || allPatients[0];
  }, [allPatients, selectedPatientId]);

  const baseRecoveryProfile = PATIENT_RECOVERY_PROFILES.find((p) => p.patientId === selectedPatientId) || PATIENT_RECOVERY_PROFILES[0];

  const patient = useMemo(() => {
    if (!simPatient) return baseRecoveryProfile;
    return {
      ...baseRecoveryProfile,
      patientId: simPatient.id,
      patientName: simPatient.name,
      bed: simPatient.bed,
      hospital: 'All India Institute of Medical Sciences (AIIMS)',
      primaryDiagnosis: simPatient.diagnosis,
      attendingPhysician: simPatient.admittingDoctor || 'Dr. Rajesh Sharma, MD (AIIMS New Delhi)',
      overallStatus: simPatient.status,
      headlineSummary: `${simPatient.name} is undergoing specialized critical telemetry care at AIIMS Hospital.`,
      reassuringNote: `Continuous telemetry stream shows HR ${simPatient.vitals.heartRate} bpm, BP ${simPatient.vitals.systolic}/${simPatient.vitals.diastolic} mmHg, and SpO2 ${simPatient.vitals.spo2}%. AI risk evaluation: ${simPatient.risk.overall}%.`,
    };
  }, [simPatient, baseRecoveryProfile]);

  const todayIndex = patient.dailyMetrics.findIndex((d) => d.label.includes('Today')) !== -1
    ? patient.dailyMetrics.findIndex((d) => d.label.includes('Today'))
    : patient.dailyMetrics.length - 1;

  const [selectedDayState, setSelectedDay] = useState<DailyRecoveryMetric>(patient.dailyMetrics[todayIndex] || patient.dailyMetrics[0]);

  const selectedDay = useMemo(() => {
    if (!simPatient) return selectedDayState;
    return {
      ...selectedDayState,
      vitalStability: Math.min(99, Math.max(30, Math.round(100 - (simPatient.risk.overall * 0.4)))),
      deteriorationRisk: simPatient.risk.overall,
    };
  }, [selectedDayState, simPatient]);


  // Hourly Doctor Updates Queue state
  const [hourlyUpdates, setHourlyUpdates] = useState<HourlyDoctorUpdate[]>(() => [
    {
      id: 'upd-init-1',
      timestamp: '1 hour ago',
      createdAt: Date.now() - 3600000,
      revealAt: Date.now() - 3600000,
      text: `Update from ${patient.attendingPhysician}: Routine hourly check concluded. Physiological parameters and oxygenation remain stable under automated telemetry supervision.`,
      doctorName: patient.attendingPhysician,
    },
  ]);

  // Generate a new hourly update (with 60-min delay, unless forced for dev testing)
  const generateHourlyUpdate = (forceReveal = false) => {
    const snippets = [
      'Telemetry stream confirms steady vital parameters. Heart rhythm is regular and arterial line pressures are stable.',
      'Serum lactate and electrolyte levels reviewed on hourly draw. Fluid balance and renal perfusion are in target range.',
      'Patient resting comfortably post-rehabilitation trial. SpO2 saturation holding well without acute hypoxia drift.',
      'Bedside nursing check completed. Vasopressor requirement remains zero and neurological responsiveness is normal.',
    ];
    const textSnippet = snippets[Math.floor(Math.random() * snippets.length)];
    const now = Date.now();
    const newUpdate: HourlyDoctorUpdate = {
      id: `upd-${now}-${Math.floor(Math.random() * 1000)}`,
      timestamp: forceReveal ? 'Just now (Instant Test Update)' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now,
      revealAt: forceReveal ? now : now + 3600000, // 60 minutes delay
      text: `Update from ${patient.attendingPhysician}: ${textSnippet}`,
      doctorName: patient.attendingPhysician,
    };
    setHourlyUpdates((prev) => [newUpdate, ...prev]);
  };

  // Hourly Interval Timer (3,600,000 ms = 1 hour)
  useEffect(() => {
    const timer = setInterval(() => {
      generateHourlyUpdate(false);
    }, 3600000);
    return () => clearInterval(timer);
  }, [patient.attendingPhysician]);

  // Visible revealed updates (where revealAt <= Date.now())
  const visibleUpdates = useMemo(() => {
    const now = Date.now();
    return hourlyUpdates.filter((u) => u.revealAt <= now);
  }, [hourlyUpdates]);

  // Hospital Transfer Recommendation Logic (when deteriorationRisk >= 65)
  const isDeteriorationHigh = selectedDay.deteriorationRisk >= 65;
  const recommendedHospitals = useMemo(() => {
    if (!isDeteriorationHigh) return [];
    const diag = (patient.primaryDiagnosis || '').toLowerCase();
    return HOSPITALS.filter((h) => {
      const isCurrent = h.name.toLowerCase().includes(patient.hospital.toLowerCase()) || patient.hospital.toLowerCase().includes(h.shortName.toLowerCase());
      const hasBeds = h.icuBeds > h.activePatientsCount;
      const matchesSpecialty = h.units.some((u) => {
        const uLow = u.toLowerCase();
        if (diag.includes('cardiac') || diag.includes('cabg') || diag.includes('valve')) return uLow.includes('cardiac');
        if (diag.includes('neuro') || diag.includes('stroke') || diag.includes('intracranial')) return uLow.includes('neuro');
        if (diag.includes('respiratory') || diag.includes('pneumonia') || diag.includes('ards')) return uLow.includes('respiratory');
        if (diag.includes('trauma') || diag.includes('fracture')) return uLow.includes('trauma');
        return uLow.includes('general');
      });
      return !isCurrent && hasBeds && matchesSpecialty;
    }).slice(0, 2);
  }, [isDeteriorationHigh, patient.primaryDiagnosis, patient.hospital]);

  // Sync selectedDay when patient changes
  useEffect(() => {
    const idx = patient.dailyMetrics.findIndex((d) => d.label.includes('Today')) !== -1
      ? patient.dailyMetrics.findIndex((d) => d.label.includes('Today'))
      : patient.dailyMetrics.length - 1;
    setSelectedDay(patient.dailyMetrics[idx] || patient.dailyMetrics[0]);
  }, [patient]);

  // Patient Assistant Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);

  const handlePatientChatSend = async (qText: string) => {
    if (!qText.trim()) return;
    setChatLoading(true);
    const queryStr = qText.trim();
    setChatQuery('');
    setChatHistory((prev) => [...prev, { q: queryStr, a: '' }]);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryStr,
          context: {
            patientId: patient.patientId,
            patientName: patient.patientName,
            hospital: patient.hospital,
            bed: patient.bed,
            overallStatus: patient.overallStatus,
            attendingPhysician: patient.attendingPhysician,
            mode: 'family_friendly',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].a = data.reply || 'Vitals and recovery metrics are being continuously monitored.';
          return updated;
        });
      } else {
        throw new Error('API query failed');
      }
    } catch {
      setChatHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].a =
          `Dr. Sharma and the ICU care team note that ${patient.patientName}'s overall status is currently ${patient.overallStatus}. Blood pressure and oxygen levels are holding well under automated telemetry supervision.`;
        return updated;
      });
    } finally {
      setChatLoading(false);
    }
  };

  const tipStyle = {
    background: theme === 'dark' ? '#18181b' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#27272a' : '#e2e8f0'}`,
    borderRadius: '12px',
    fontSize: '12px',
    color: theme === 'dark' ? '#f4f4f5' : '#0f172a',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  };

  const currentRecoveryScore = selectedDay.recoveryScore ?? selectedDay.projectedScore ?? 74;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Family Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 dark:bg-teal-500 text-white dark:text-black shadow-md shadow-teal-600/20">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white">CAREX</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30">
                  {t.familyPortal}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 -mt-0.5">
                {patient.hospital}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">


            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <select
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value as FamilyLanguage)}
                className="bg-transparent text-slate-800 dark:text-zinc-200 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>


            {/* Scoped Linked Family Account Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300">
              <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>
                {activeFamilyAccount.name} ({activeFamilyAccount.relationship}) • {t.viewing} <strong className="text-teal-600 dark:text-teal-400">{patient.patientName}</strong> ({activeFamilyAccount.roomBed})
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>

            {/* Sign Out */}
            <button
              onClick={() => navigate('/login?role=family')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.signOut}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Family Portal Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Reassuring Headline Banner */}
        <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-transparent border border-teal-200/80 dark:border-teal-500/30 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{t.dailyRecoverySummary}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {patient.headlineSummary}
              </h1>

              <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                {patient.reassuringNote}
              </p>
            </div>

            {/* Patient Header Badges */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md shrink-0 text-xs space-y-1.5 w-full md:w-auto">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{patient.patientName}</span>
                <span className="font-mono text-[10px] text-slate-400">({patient.patientId})</span>
              </div>
              <p className="text-slate-500 dark:text-zinc-400 font-medium">
                {t.location}: <strong className="text-slate-800 dark:text-zinc-200">{patient.bed}</strong>
              </p>
              <p className="text-slate-500 dark:text-zinc-400">
                {t.attendingPhysician}: <strong className="text-slate-800 dark:text-zinc-200">{patient.attendingPhysician}</strong>
              </p>
              <p className="text-slate-500 dark:text-zinc-400">
                {t.primaryNurse}: <strong className="text-slate-800 dark:text-zinc-200">{patient.primaryNurse}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* 4 Supporting Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recovery Score */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {t.overallRecoveryIndex}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-black text-teal-600 dark:text-teal-400">
                {currentRecoveryScore}%
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t.steady}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {t.recoveryIndexDescription}
            </p>
          </div>

          {/* Vitals Stability */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {t.vitalsStability}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {selectedDay.vitalStability}%
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t.normalRange}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {t.vitalsStabilityDescription}
            </p>
          </div>

          {/* Mobility Level */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {t.mobilityRehab}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-black text-blue-600 dark:text-teal-300">
                {selectedDay.mobilityScore} / 100
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {patient.currentMobilityLevel}
            </p>
          </div>

          {/* Deterioration Risk Falling */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {t.complicationRisk}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {selectedDay.deteriorationRisk}%
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t.targetRange}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {t.complicationRiskDescription}
            </p>
          </div>
        </div>

        {/* Automatic Hospital Recommendation on Patient Deterioration (CHANGE 4) */}
        {isDeteriorationHigh && (
          <div className="rounded-3xl p-6 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent dark:from-red-950/40 dark:via-amber-950/20 dark:to-transparent border border-red-300 dark:border-red-500/40 shadow-md space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200 dark:border-red-500/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 text-white dark:bg-red-500 dark:text-black shadow-md shrink-0">
                  <AlertTriangle className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-red-950 dark:text-red-300">{t.recommendedHospitalTransfer}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30">
                      {t.highRiskAlert} ({selectedDay.deteriorationRisk}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 mt-0.5">
                    {t.transferRationale}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {recommendedHospitals.map((h) => (
                <div key={h.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{h.name}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {h.icuBeds - h.activePatientsCount} {t.icuBedsOpen}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {t.location}: <strong className="text-slate-800 dark:text-zinc-200">{h.location}</strong> • Type: {h.type}
                  </p>

                  <div className="text-xs text-slate-600 dark:text-zinc-300 pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <strong>{t.matchingSpecialtyUnits}:</strong> {h.units.filter(u => u.toLowerCase().includes('cardiac') || u.toLowerCase().includes('general') || u.toLowerCase().includes('respiratory') || u.toLowerCase().includes('neuro') || u.toLowerCase().includes('trauma')).join(', ')}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 dark:text-zinc-400 italic text-right">
              {t.educationalDisclaimer}
            </p>
          </div>
        )}

        {/* Primary Chart: Historical Recovery Trend & Forecasted Projected Trajectory */}
        <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{t.recoveryTrajectoryTitle}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t.recoveryTrajectorySubtitle}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-semibold">
                <span className="w-3 h-1 bg-teal-600 dark:bg-teal-400 rounded-full" />
                {t.recordedProgress}
              </span>
              <span className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400 font-semibold">
                <span className="w-3 h-1 border-t-2 border-dashed border-blue-500 dark:border-blue-400" />
                {t.forecastedPathway}
              </span>
            </div>
          </div>

          {/* Combined Recharts Chart */}
          <div className="h-72 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patient.dailyMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={tipStyle} />
                
                {/* Historical Area */}
                <Area
                  type="monotone"
                  dataKey="recoveryScore"
                  name={t.recordedProgress}
                  stroke="#0d9488"
                  strokeWidth={3}
                  fill="url(#recGrad)"
                  connectNulls={false}
                />

                {/* Projected Trajectory Line */}
                <Line
                  type="monotone"
                  dataKey="projectedScore"
                  name={t.forecastedPathway}
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dual Secondary Charts: Vitals Stability + Risk Reduction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vitals Stability Index */}
          <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.vitalsStabilityTitle}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {t.vitalsStabilitySubtitle}
              </p>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patient.dailyMetrics}>
                  <defs>
                    <linearGradient id="stabGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[30, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={28} unit="%" />
                  <Tooltip contentStyle={tipStyle} />
                  <Area type="monotone" dataKey="vitalStability" name="Stability %" stroke="#10b981" strokeWidth={2.5} fill="url(#stabGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deterioration Risk Falling Curve */}
          <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{t.complicationRiskTitle}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {t.complicationRiskSubtitle}
              </p>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patient.dailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 90]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={28} unit="%" />
                  <Tooltip contentStyle={tipStyle} />
                  <Line type="monotone" dataKey="deteriorationRisk" name="Risk %" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Milestone Tracker & Daily Clinical Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Clinical Notes Selection */}
          <div className="lg:col-span-2 rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{t.dailyProgressLogTitle}</span>
            </h3>

            {/* Horizontal Day Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {patient.dailyMetrics.map((d) => (
                <button
                  key={d.dayNumber}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedDay.dayNumber === d.dayNumber
                      ? 'bg-teal-600 text-white dark:bg-teal-500 dark:text-black border-teal-600 dark:border-teal-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Selected Day Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedDay.label} — {selectedDay.date}
                  </span>
                  {selectedDay.isProjected && (
                    <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                      {t.forecastedClinicalGoal}
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  Recovery: {selectedDay.recoveryScore ?? selectedDay.projectedScore}%
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
                {selectedDay.clinicalNote}
              </p>

              {/* Milestones for the day */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {t.milestonesHighlighted}
                </span>
                <div className="space-y-1">
                  {selectedDay.milestonesReached.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hourly Doctor Progress Log Stream (CHANGE 5) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  {t.hourlyDoctorFeedTitle}
                </span>

                {/* Dev-Only Instant Test Update Button */}
                {import.meta.env.DEV && (
                  <button
                    type="button"
                    onClick={() => generateHourlyUpdate(true)}
                    className="px-2.5 py-1 rounded-xl bg-teal-600 text-white dark:bg-teal-500 dark:text-black text-[10px] font-extrabold flex items-center gap-1 hover:bg-teal-700 transition"
                    title="Dev mode override: immediately generate and reveal a 1-hour delayed update"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t.generateTestUpdate}</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {visibleUpdates.map((u) => (
                  <div key={u.id} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-teal-700 dark:text-teal-400">{u.doctorName}</span>
                      <span className="font-mono text-slate-400 dark:text-zinc-500">{u.timestamp}</span>
                    </div>
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {u.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Care Team & Visiting Info Card */}
          <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{t.nextStepsVisitingTitle}</span>
            </h3>

            {/* Next Step */}
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-500/20 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                {t.nextAnticipatedStep}
              </span>
              <p className="font-semibold text-teal-950 dark:text-teal-200">
                {patient.nextAnticipatedStep}
              </p>
            </div>

            {/* Visiting Hours */}
            <div className="space-y-1">
              <span className="font-bold text-slate-800 dark:text-zinc-200">{t.icuVisitingHours}</span>
              <p className="text-slate-600 dark:text-zinc-400">{patient.visitingHours}</p>
            </div>

            {/* Care Team Liaison */}
            <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <span className="font-bold text-slate-800 dark:text-zinc-200">{t.careLiaisonPhone}</span>
              <p className="text-slate-600 dark:text-zinc-400">{patient.familyLiaisonContact}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.liaisonInstruction}
              </p>
            </div>

            {/* Non-clinical Educational Note */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
              <span>
                {t.plainLanguageDisclaimer}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Lightweight Patient / Family AI Assistant Trigger */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 h-13 w-13 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25 z-40 flex items-center justify-center transition-transform hover:scale-105 group"
          title="Ask CAREX Recovery Assistant"
        >
          <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}

      {/* Lightweight Floating Patient Assistant Panel */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col overflow-hidden max-h-[500px] animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t.askAssistant}</span>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">{t.askingAbout} {patient.patientName}</p>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {chatHistory.length === 0 && (
              <div className="space-y-2 text-center py-4">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Ask any question about <strong>{patient.patientName}</strong>'s recovery, visiting hours, or clinical steps!
                </p>
                <div className="space-y-1.5 pt-2">
                  {[
                    `What is ${patient.patientName}'s current recovery status?`,
                    `When are ICU visiting hours at ${patient.hospital.split(' ')[0]}?`,
                    `What is the next step in recovery?`,
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handlePatientChatSend(prompt)}
                      className="w-full text-left text-[11px] px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-teal-600 text-white px-3.5 py-2 text-xs font-semibold">
                    {item.q}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-teal-600 text-[10px]">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="max-w-[88%] rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/80 px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-200 leading-relaxed">
                    {item.a}
                  </div>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 px-3 py-2 text-teal-600">
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-ping" />
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">{t.thinking}</span>
              </div>
            )}
          </div>

          {/* Disclaimer & Input */}
          <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 shrink-0 space-y-2">
            <p className="text-[9px] text-slate-400 dark:text-zinc-500 text-center">
              {t.chatDisclaimer}
            </p>
            <div className="flex items-center gap-2">
              <input
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePatientChatSend(chatQuery)}
                placeholder={t.chatPlaceholder}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={() => handlePatientChatSend(chatQuery)}
                disabled={chatLoading || !chatQuery.trim()}
                className="h-8 w-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shrink-0 disabled:opacity-40 font-bold"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
