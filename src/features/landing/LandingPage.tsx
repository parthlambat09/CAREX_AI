import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ShieldCheck, HeartPulse, Brain, Stethoscope,
  Sun, Moon, CheckCircle2, BellRing, Sparkles, Building2
} from 'lucide-react';
import { useTheme } from '@/features/doctor/context/ThemeContext';
import { ECGWaveform } from '@/features/doctor/components/ECGWaveform';
import { HOSPITALS } from '@/mock/hospitals';

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [selectedHospital, setSelectedHospital] = useState(() => {
    try {
      return localStorage.getItem('carex_selected_hospital') || HOSPITALS[0].id;
    } catch {
      return HOSPITALS[0].id;
    }
  });

  const handleHospitalChange = (id: string) => {
    setSelectedHospital(id);
    try {
      localStorage.setItem('carex_selected_hospital', id);
    } catch (e) {
      console.error('Failed to persist hospital selection', e);
    }
  };

  const [simHeartRate, setSimHeartRate] = useState(78);
  const [simSpo2, setSimSpo2] = useState(97);
  const [simRisk, setSimRisk] = useState(24);

  // Subtle live vitals drift on landing demo
  useEffect(() => {
    const timer = setInterval(() => {
      setSimHeartRate((prev) => Math.max(68, Math.min(92, prev + Math.round((Math.random() - 0.5) * 3))));
      setSimSpo2((prev) => Math.max(94, Math.min(99, prev + Math.round((Math.random() - 0.48) * 1))));
      setSimRisk((prev) => Math.max(18, Math.min(35, prev + Math.round((Math.random() - 0.5) * 2))));
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const currentHosp = HOSPITALS.find((h) => h.id === selectedHospital) || HOSPITALS[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-200 selection:bg-teal-500 selection:text-white">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 dark:bg-teal-500 shadow-md shadow-teal-600/20 text-white transition-transform group-hover:scale-105">
              <HeartPulse className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  CAREX
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30">
                  ICU Intelligence
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 -mt-0.5">Clinical Safety Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-zinc-300">
            <a href="#features" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              How It Works
            </a>
            <a href="#about" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              About
            </a>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Hospital Selector Dropdown Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
              <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <select
                value={selectedHospital}
                onChange={(e) => handleHospitalChange(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-zinc-300 font-semibold focus:outline-none cursor-pointer"
                title="Active Healthcare Facility"
              >
                {HOSPITALS.map((h) => (
                  <option key={h.id} value={h.id} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200">
                    {h.shortName} ({h.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>

            {/* Sign In Button */}
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/80 dark:border-zinc-800/80">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/10 dark:bg-teal-500/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-500/10 dark:bg-orange-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
                <span>Next-Gen ICU Telemetry & Safety Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                AI That Watches <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-teal-200 bg-clip-text text-transparent">
                  Every Heartbeat
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                CAREX does not only predict risk. It continuously evaluates multi-parameter physiological telemetry, detects silent organ deterioration hours before crisis, and ensures the care process actively responds.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/select-role"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-black font-bold text-sm shadow-xl shadow-teal-600/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <ShieldCheck className="w-4 h-4 text-white dark:text-black group-hover:scale-110 transition-transform" />
                  <span>Select Portal (Doctor / Nurse / Family / Hospital Management)</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Sub-Second Telemetry Ingestion</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Explainable TreeSHAP AI Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Multi-Hospital Capacity Engine</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Vitals & Deterioration Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 transition-all">
                
                {/* Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        Live Vitals — Bed 7
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                      James Anderson • 64M • Post-Cardiac Surgery
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Telemetry Nominal
                  </span>
                </div>

                {/* Animated ECG Waveform Strip */}
                <div className="mt-4 rounded-2xl bg-slate-950 dark:bg-black p-3.5 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Activity className="w-3.5 h-3.5" />
                      Lead II • Real-Time Stream
                    </span>
                    <span>25 mm/s • 10 mm/mV</span>
                  </div>
                  <ECGWaveform color="#10b981" height={70} speed={1.1} />
                </div>

                {/* Core Vitals 3-Column Readout */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="rounded-2xl p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Heart Rate
                    </span>
                    <p className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      {simHeartRate}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">bpm · Regular</span>
                  </div>

                  <div className="rounded-2xl p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Oxygen SpO2
                    </span>
                    <p className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      {simSpo2}%
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">2L Nasal Cannula</span>
                  </div>

                  <div className="rounded-2xl p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Resp Rate
                    </span>
                    <p className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      18
                    </p>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">/min · Spontaneous</span>
                  </div>
                </div>

                {/* AI Deterioration Risk Banner */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-500/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                        AI Deterioration Risk
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-400">
                      4-Hour Forecasting Horizon
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                      {simRisk}%
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Low Deterioration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-zinc-950/50 border-b border-slate-200/80 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Intelligence Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for Critical ICU Seconds
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">
              Moving ICU teams from retrospective alarms to proactive clinical trajectory monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-teal-500/40 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 flex items-center justify-center shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Sub-Second Telemetry Drift</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
                Live multi-lead ECG waveform canvas rendering alongside real-time arterial blood pressure, continuous SpO2, and respiratory dynamics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-teal-500/40 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center shadow-sm">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Silent Deterioration Predictors</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
                Machine learning models analyze subtle inter-vital correlation drift to flag early sepsis onset and respiratory failure up to 6 hours before decompensation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-teal-500/40 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center shadow-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Hospital Operations Command</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
                Multi-facility bed allocation, ICU ventilator readiness tracking, and real-time nursing staff occupied-vs-idle workload balance.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-teal-500/40 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 flex items-center justify-center shadow-sm">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Decision Support & Safety Gaps</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
                Polypharmacy drug-drug interaction matrix and care-gap monitors that confirm vital warnings are followed by timely clinical escalation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-b border-slate-200/80 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Clinical Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              From Bedside Telemetry to Life-Saving Action
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
              <span className="text-4xl font-black text-teal-500/20 font-mono">01</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Continuous Stream Ingestion</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Connects to bedside multi-parameter monitors via high-throughput WebSocket protocols, streaming heart rate, arterial pressures, oxygenation, and temperature without lag.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
              <span className="text-4xl font-black text-teal-500/20 font-mono">02</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Deterioration Scoring</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Advanced LightGBM and TreeSHAP explainability algorithms score organ system risk in real time, decomposing complex signals into transparent clinical factor weights.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
              <span className="text-4xl font-black text-teal-500/20 font-mono">03</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Escalation & Care Gap Audit</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Automatically alerts the attending intensivist and assigned nurse while tracking whether the clinical team takes timely action before physiological boundaries are breached.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About & Disclaimer Section */}
      <section id="about" className="py-20 bg-slate-100/60 dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-teal-600 text-white dark:bg-teal-500 dark:text-black">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            About CAREX ICU Safety Intelligence
          </h2>

          <blockquote className="text-base sm:text-lg italic text-slate-700 dark:text-zinc-300 font-medium">
            "CAREX does not only predict risk. It monitors whether the care process is responding to that risk."
          </blockquote>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            CAREX is an educational clinical simulation platform designed for critical care research and hospital operational workflows. It synthesizes physiological telemetry, predictive algorithms, equipment logistics, and staff distribution into a unified command dashboard.
          </p>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-left text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              Educational & Research Simulation Disclaimer:
            </p>
            <p className="text-slate-600 dark:text-zinc-400">
              CAREX is NOT a certified medical device and is intended solely for simulation, education, and research prototypes. It does not diagnose disease or replace physician judgment.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-black text-xs text-slate-500 dark:text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="font-bold text-slate-800 dark:text-zinc-200">CAREX ICU Intelligence</span>
            <span>• Active Facility: {currentHosp.name}</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/select-role" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Role Portals
            </Link>
            <Link to="/doctor" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Doctor Command Center
            </Link>
            <Link to="/patient/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Patient Portal
            </Link>
            <Link to="/login" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
