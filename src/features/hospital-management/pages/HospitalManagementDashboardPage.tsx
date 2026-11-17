import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Stethoscope, Cpu,
  Ambulance, FileText, Receipt, CheckCircle2,
  Plus, Bed
} from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { ICU_NURSES } from '@/features/doctor/mock/nurses';
import { DOCTORS } from '@/mock/doctors';
import { ICU_EQUIPMENT } from '@/features/doctor/mock/equipment';
import { FamilyConsentFormModal } from '../components/FamilyConsentFormModal';
import { AssignDoctorModal } from '../components/AssignDoctorModal';
import type { Patient } from '@/types/doctor';

export const HospitalManagementDashboardPage: React.FC = () => {
  const { patients, activeHospital } = useSimulation();
  const navigate = useNavigate();

  // Modals state
  const [selectedPatientForConsent, setSelectedPatientForConsent] = useState<Patient | undefined>(undefined);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  const [selectedPatientForDoctor, setSelectedPatientForDoctor] = useState<Patient | undefined>(undefined);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  // Local Doctor Assignments override map (patientId -> doctorName)
  const [doctorAssignments, setDoctorAssignments] = useState<Record<string, string>>({
    'ICU-100': 'Dr. Rajesh Sharma, MD, FCCM',
    'ICU-101': 'Dr. Anita Desai, MBBS, MD',
    'ICU-102': 'Dr. Rajesh Sharma, MD, FCCM',
    'ICU-103': 'Dr. Vikram Sethi, MD, DM',
  });

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPIs Calculations
  const totalNursesCount = ICU_NURSES.length;
  const totalDoctorsCount = DOCTORS.length;

  const totalEquipmentCount = useMemo(() => {
    return ICU_EQUIPMENT.reduce((acc, curr) => acc + curr.total, 0);
  }, []);

  const availableEquipmentCount = useMemo(() => {
    return ICU_EQUIPMENT.reduce((acc, curr) => acc + curr.available, 0);
  }, []);

  const totalBeds = 60;
  const occupiedBeds = patients.length;
  const occupancyPercentage = Math.round((occupiedBeds / totalBeds) * 100);


  const handleConsentSigned = (consentData: any) => {
    showToast(`Informed consent recorded for ${consentData.patientName} (${consentData.giverName}).`);
  };

  const handleDoctorAssigned = (patientId: string, doctorName: string) => {
    setDoctorAssignments((prev) => ({ ...prev, [patientId]: doctorName }));
    const p = patients.find((pat) => pat.id === patientId);
    showToast(`Assigned ${doctorName} as attending physician for ${p?.name || patientId}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-400">
              Operations & Command Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Hospital Management Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Facility: <strong className="text-slate-700 dark:text-zinc-300">{activeHospital.name}</strong> • {activeHospital.location}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setSelectedPatientForConsent(patients[0]);
              setIsConsentModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Admission Consent</span>
          </button>

          <button
            onClick={() => navigate('/hospital-management/patient-records')}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Log Patient Record</span>
          </button>
        </div>
      </div>

      {/* Ambulance Emergency Helpline Banner */}
      <div className="rounded-3xl border border-red-200 dark:border-red-500/30 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent dark:from-red-950/40 dark:via-red-900/20 dark:to-transparent p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30 shrink-0">
            <Ambulance className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-400">
                24x7 India Emergency Ambulance Dispatch Hotline
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              National Emergency Ambulance: <a href="tel:108" className="text-red-600 hover:underline">108</a>
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Non-Emergency Medical Transport: <a href="tel:102" className="text-red-600 font-bold hover:underline">102</a> • ICU Emergency Reception: <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">+91 11 2659 8888</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <a
            href="tel:108"
            className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-600/20 transition-colors"
          >
            Call 108 Emergency
          </a>
          <a
            href="tel:102"
            className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-500/40 bg-white dark:bg-zinc-900 text-red-700 dark:text-red-300 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            Call 102 Transport
          </a>
        </div>
      </div>

      {/* 4 Core Hospital Management KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* KPI 1: Total Nurses */}
        <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Nurses</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totalNursesCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 ml-2 font-medium">
              Active on Roster
            </span>
          </div>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold pt-1 border-t border-slate-100 dark:border-zinc-800/80">
            All 3 Shifts Fully Staffed (1:2 ICU Ratio)
          </p>
        </div>

        {/* KPI 2: Total Doctors */}
        <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Doctors</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totalDoctorsCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 ml-2 font-medium">
              Attending / On Call
            </span>
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold pt-1 border-t border-slate-100 dark:border-zinc-800/80">
            Intensivists & Multi-Specialists
          </p>
        </div>

        {/* KPI 3: Total Equipment */}
        <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">ICU Equipment</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {availableEquipmentCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 ml-2 font-medium">
              / {totalEquipmentCount} Available
            </span>
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold pt-1 border-t border-slate-100 dark:border-zinc-800/80">
            {totalEquipmentCount - availableEquipmentCount} devices currently in live patient use
          </p>
        </div>

        {/* KPI 4: ICU Bed Occupancy */}
        <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Bed Occupancy</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {occupiedBeds}/{totalBeds}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 ml-2 font-medium">
              ({occupancyPercentage}%)
            </span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-1 border-t border-slate-100 dark:border-zinc-800/80">
            {totalBeds - occupiedBeds} ICU Beds Available for Admission
          </p>
        </div>
      </div>

      {/* Active Bed Roster & Doctor Assignment Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              ICU Bed Roster, Doctor Assignments & Consent Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Live operational view of admitted ICU patients and medical staff assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/hospital-management/billing')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Billing Overview</span>
            </button>
            <button
              onClick={() => navigate('/hospital-management/discharge')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Discharge Portal</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Bed / Patient</th>
                <th className="py-3 px-3">Age/Sex & Diagnosis</th>
                <th className="py-3 px-3">Attending Doctor</th>
                <th className="py-3 px-3">Vitals / AI Risk</th>
                <th className="py-3 px-3">Consent Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
              {patients.map((p) => {
                const assignedDoctor = doctorAssignments[p.id] || 'Dr. Rajesh Sharma, MD, FCCM';
                const isCritical = p.status === 'Critical' || p.status === 'critical' || p.risk.overall >= 75;


                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-[11px]">
                          {p.bed}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{p.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <p className="text-slate-800 dark:text-zinc-200 font-semibold">{p.diagnosis}</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">{p.age}y • {p.sex}</p>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate max-w-[180px]">
                          {assignedDoctor}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span>HR {p.vitals.heartRate}</span>
                        <span className="text-slate-300">|</span>
                        <span>SpO2 {p.vitals.spo2}%</span>
                        <span className="text-slate-300">|</span>
                        <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}>
                          Risk {p.risk.overall}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Signed
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedPatientForDoctor(p);
                            setIsDoctorModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-bold text-slate-700 dark:text-zinc-300"
                        >
                          Reassign Doctor
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatientForConsent(p);
                            setIsConsentModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-[11px] font-bold hover:bg-indigo-100"
                        >
                          Consent Form
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <FamilyConsentFormModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        patient={selectedPatientForConsent}
        onConsentSigned={handleConsentSigned}
      />

      <AssignDoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        patient={selectedPatientForDoctor}
        onDoctorAssigned={handleDoctorAssigned}
      />
    </div>
  );
};
