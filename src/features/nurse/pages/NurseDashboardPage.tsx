import React, { useState, useMemo } from 'react';
import {
  ClipboardList, CheckCircle2, Circle, Clock, Plus,
  Activity, User, FileText
} from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { ICU_NURSES, Nurse } from '@/features/doctor/mock/nurses';
import { filterPatientsForNurse, getNurseAssignedPatientIds } from '@/features/nurse/mock/assignments';
import { INITIAL_NURSE_TASKS, NurseTask, TaskPriority, TaskCategory } from '@/features/nurse/mock/tasks';
import { NURSE_CARE_TIMELINES, CareTimelineItem, getTimelineForPatient } from '@/features/nurse/mock/timeline';
import { NurseTopBar } from '@/features/nurse/components/NurseTopBar';
import type { Patient } from '@/types/doctor';

import { useAuth } from '@/features/auth/context/AuthContext';

export const NurseDashboardPage: React.FC = () => {
  const { patients: allPatients, activeHospital, addPatientObservation, acknowledgeAlert } = useSimulation();

  let defaultNurseId = 'NUR-2048';
  try {
    const auth = useAuth();
    if (auth.user && auth.user.role === 'nurse' && auth.user.id) {
      defaultNurseId = auth.user.id;
    }
  } catch {
    // fallback
  }
  
  // Active Nurse
  const [selectedNurseId] = useState<string>(defaultNurseId);
  const activeNurse: Nurse = useMemo(() => {
    return ICU_NURSES.find((n) => n.id.toUpperCase() === selectedNurseId.toUpperCase()) || ICU_NURSES[0];
  }, [selectedNurseId]);

  // Scoped Patients for this Nurse only
  const assignedPatients = useMemo(() => {
    return filterPatientsForNurse(activeNurse.id, allPatients);
  }, [activeNurse.id, allPatients]);

  // Selected Patient for Deep-Dive Timeline & Bedside Context
  const [selectedPatientId, setSelectedPatientId] = useState<string>('P-001');

  // Active Selected Patient across Nurse Department
  const activeScopedPatient: Patient | undefined = useMemo(() => {
    return allPatients.find((p) => p.id === selectedPatientId) || assignedPatients[0] || allPatients[0];
  }, [selectedPatientId, assignedPatients, allPatients]);


  // Tasks State
  const [tasks, setTasks] = useState<NurseTask[]>(INITIAL_NURSE_TASKS);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TaskCategory>('all');

  // Timelines State
  const [timelines, setTimelines] = useState<Record<string, CareTimelineItem[]>>(NURSE_CARE_TIMELINES);

  // Add Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPatientId, setNewTaskPatientId] = useState(assignedPatients[0]?.id || 'ICU-100');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('medication');
  const [newTaskDueTime, setNewTaskDueTime] = useState('12:00 PM');

  // Add Note Modal State
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDesc, setNewNoteDesc] = useState('');
  const [newNoteType, setNewNoteType] = useState<CareTimelineItem['type']>('nurse_note');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Tasks (Strictly for this nurse's assigned patients)
  const scopedTasks = useMemo(() => {
    const assignedIds = new Set(getNurseAssignedPatientIds(activeNurse.id));
    return tasks.filter((t) => {
      const matchPatient = assignedIds.has(t.patientId);
      const matchStatus =
        taskFilter === 'all' ? true : taskFilter === 'completed' ? t.completed : !t.completed;
      const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
      return matchPatient && matchStatus && matchCat;
    });
  }, [tasks, activeNurse.id, taskFilter, categoryFilter]);

  const toggleTaskCompleted = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const next = !t.completed;
          showToast(next ? `Task completed: ${t.title}` : `Task reopened: ${t.title}`);
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const targetPatient = assignedPatients.find((p) => p.id === newTaskPatientId) || assignedPatients[0];

    const newTask: NurseTask = {
      id: `TASK-${Date.now()}`,
      patientId: targetPatient.id,
      bed: targetPatient.bed,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Scheduled bedside nursing procedure.',
      dueTime: newTaskDueTime || '12:00 PM',
      priority: newTaskPriority,
      category: newTaskCategory,
      completed: false,
      assignedNurseId: activeNurse.id,
    };

    setTasks((prev) => [newTask, ...prev]);
    setIsAddTaskModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    showToast(`New bedside task created for ${targetPatient.name} (${targetPatient.bed}).`);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !activeScopedPatient) return;

    const newEv: CareTimelineItem = {
      id: `EV-${Date.now()}`,
      patientId: activeScopedPatient.id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: newNoteType,
      title: newNoteTitle.trim(),
      description: newNoteDesc.trim() || 'Bedside care note documented.',
      performedBy: activeNurse.name,
    };

    setTimelines((prev) => ({
      ...prev,
      [activeScopedPatient.id]: [newEv, ...(prev[activeScopedPatient.id] || [])],
    }));

    // Synchronize care note globally to SimulationContext
    addPatientObservation(
      activeScopedPatient.id,
      newNoteTitle.trim(),
      newNoteDesc.trim() || 'Bedside care note documented.',
      activeNurse.name
    );

    setIsAddNoteModalOpen(false);
    setNewNoteTitle('');
    setNewNoteDesc('');
    showToast(`Care note logged for ${activeScopedPatient.name}.`);
  };

  const activeTimeline = useMemo(() => {
    if (!activeScopedPatient) return [];
    const localList = timelines[activeScopedPatient.id] || getTimelineForPatient(activeScopedPatient.id) || [];
    const globalList = (activeScopedPatient.timeline || []).map((ev) => ({
      id: ev.id,
      patientId: activeScopedPatient.id,
      time: new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'nurse_note' as const,
      title: ev.title,
      description: ev.description,
      performedBy: 'AIIMS Clinical Team',
    }));
    return [...localList, ...globalList];
  }, [activeScopedPatient, timelines]);

  const completedCount = scopedTasks.filter((t) => t.completed).length;
  const pendingCount = scopedTasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Nurse Top Navigation Bar */}
      <NurseTopBar activeNurse={activeNurse} assignedCount={assignedPatients.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Active Nurse Roster & Scoping Banner */}
        <div className="rounded-2xl border border-teal-200 dark:border-teal-500/30 bg-teal-50/70 dark:bg-teal-500/10 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300">
                Active Nurse Shift Station
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {activeNurse.name}
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              {activeNurse.role} • {activeNurse.ward} at <span className="font-bold">{activeHospital.name}</span>
            </p>
          </div>

          {/* Patient Selection Dropdown */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-right">
              <p className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                Select Patient
              </p>
              <select
                value={activeScopedPatient?.id || selectedPatientId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedPatientId(newId);
                  const pMatch = allPatients.find((p) => p.id === newId);
                  if (pMatch) {
                    showToast(`Active patient set to ${pMatch.name} (Bed ${pMatch.bed})`);
                  }
                }}
                className="mt-0.5 rounded-xl border border-teal-300 dark:border-teal-500/40 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer shadow-xs"
              >
                {allPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}, Bed {p.bed}) — Risk {p.risk.overall}%
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-black font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bedside Task</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-teal-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Assigned Patients Summary Row (Strictly Scoped) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                Your Assigned Patients ({assignedPatients.length} Beds)
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              Data scoped strictly to active nurse ID ({activeNurse.id})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedPatients.map((p) => {
              const isSelected = activeScopedPatient?.id === p.id;
              const isCritical = p.status === 'Critical' || p.status === 'critical' || p.risk.overall >= 75;
              const isUnstable = p.status === 'Unstable' || p.status === 'elevated';

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-teal-500 bg-white dark:bg-zinc-900 shadow-lg ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {p.bed}
                      </span>
                      <span className="font-mono text-xs text-slate-400 dark:text-zinc-500">
                        {p.id}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isCritical
                          ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                          : isUnstable
                          ? 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400'
                          : p.status === 'caution'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>


                  <div className="mt-3 space-y-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {p.diagnosis} • {p.age}y/{p.sex}
                    </p>
                  </div>

                  {/* Vitals Ribbon */}
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-center">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase">HR</span>
                      <p className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">{p.vitals.heartRate}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase">SpO2</span>
                      <p className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">{p.vitals.spo2}%</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase">BP</span>
                      <p className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">{p.vitals.systolic}/{p.vitals.diastolic}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase">AI Risk</span>
                      <p className={`font-mono text-xs font-bold ${p.risk.overall >= 70 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {p.risk.overall}%
                      </p>
                    </div>
                  </div>

                  {(p.status.toLowerCase() === 'critical' || p.risk.overall >= 75) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        acknowledgeAlert(p.id);
                      }}
                      className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 animate-pulse"
                      title="Acknowledge Vital Alarm & Randomly Step-Down Status (Unstable, Stable, Recovering)"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACK & Step-Down Status</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main 2-Column Section: To-Do List (Left) & Patient Care Timeline (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Bedside To-Do List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md p-5 sm:p-6 space-y-4">
              
              {/* Header & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Assigned Patients' To-Do List
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {pendingCount} pending task{pendingCount !== 1 ? 's' : ''} • {completedCount} completed
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-800 p-0.5 text-xs font-semibold">
                    <button
                      onClick={() => setTaskFilter('all')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        taskFilter === 'all'
                          ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      All ({scopedTasks.length})
                    </button>
                    <button
                      onClick={() => setTaskFilter('pending')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        taskFilter === 'pending'
                          ? 'bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setTaskFilter('completed')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        taskFilter === 'completed'
                          ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      Done
                    </button>
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="p-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="medication">Medication</option>
                    <option value="vitals">Vitals</option>
                    <option value="assessment">Assessment</option>
                    <option value="hygiene">Hygiene</option>
                    <option value="lab">Lab Draw</option>
                  </select>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {scopedTasks.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">All tasks completed!</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      No pending bedside tasks for your assigned patients.
                    </p>
                  </div>
                ) : (
                  scopedTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTaskCompleted(t.id)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all duration-150 flex items-start gap-3.5 group ${
                        t.completed
                          ? 'bg-slate-50/70 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800/80 opacity-70'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-teal-400 shadow-xs'
                      }`}
                    >
                      {/* Checkbox Icon */}
                      <button
                        type="button"
                        className="mt-0.5 text-slate-400 dark:text-zinc-500 group-hover:text-teal-600 transition-colors"
                      >
                        {t.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-zinc-600" />
                        )}
                      </button>

                      {/* Task Info */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                              {t.bed} ({t.patientId})
                            </span>

                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                t.priority === 'high'
                                  ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                  : t.priority === 'medium'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                  : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                            <Clock className="w-3 h-3" />
                            <span>Due {t.dueTime}</span>
                          </div>
                        </div>

                        <p
                          className={`text-sm font-bold text-slate-900 dark:text-white ${
                            t.completed ? 'line-through text-slate-400 dark:text-zinc-500' : ''
                          }`}
                        >
                          {t.title}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Patient Activity Timeline (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md p-5 sm:p-6 space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Care Activity Timeline
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Showing: <span className="font-bold text-teal-600 dark:text-teal-400">{activeScopedPatient?.name}</span> ({activeScopedPatient?.bed})
                  </p>
                </div>

                <button
                  onClick={() => setIsAddNoteModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Note</span>
                </button>
              </div>

              {/* Patient Timeline Flow */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
                {activeTimeline.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-zinc-400">No care events documented yet.</p>
                ) : (
                  activeTimeline.map((ev) => (
                    <div key={ev.id} className="relative space-y-1">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 bg-teal-600 dark:bg-teal-400 ring-2 ring-teal-500/20" />

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                          {ev.time}
                        </span>
                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-semibold">
                          {ev.type.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {ev.title}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {ev.description}
                      </p>

                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 pt-0.5 italic">
                        By {ev.performedBy}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Add Bedside Task */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">New Bedside Task</h3>
              </div>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Target Patient (Assigned Beds Only)
                </label>
                <select
                  value={newTaskPatientId}
                  onChange={(e) => setNewTaskPatientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                >
                  {assignedPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.bed} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Administer IV Antibiotic piggyback"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Clinical Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Dosage instructions, route, verification parameters..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                  >
                    <option value="medication">Medication</option>
                    <option value="vitals">Vitals</option>
                    <option value="assessment">Assessment</option>
                    <option value="hygiene">Hygiene</option>
                    <option value="lab">Lab Draw</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Due Time</label>
                  <input
                    type="text"
                    value={newTaskDueTime}
                    onChange={(e) => setNewTaskDueTime(e.target.value)}
                    placeholder="e.g. 02:00 PM"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Care Note */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Document Care Note — {activeScopedPatient?.name}
                </h3>
              </div>
              <button
                onClick={() => setIsAddNoteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Entry Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Endotracheal Suctioning & Vitals Verification"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Care Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe patient response, vitals drift, medication tolerance..."
                  value={newNoteDesc}
                  onChange={(e) => setNewNoteDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Event Type</label>
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                >
                  <option value="nurse_note">Nursing Assessment / Observation</option>
                  <option value="medication">Medication Administration</option>
                  <option value="vitals">Telemetry / Vitals Check</option>
                  <option value="procedure">Bedside Procedure</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Append to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
