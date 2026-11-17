import React, { useState } from 'react';
import {
  FileText, Plus, CheckCircle2, Activity,
  Search
} from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { INITIAL_CLINICAL_RECORDS, ClinicalRecordEntry } from '../mock/records';

export const PatientRecordsPage: React.FC = () => {
  const { patients, updatePatient, addPatientObservation } = useSimulation();
  const [records, setRecords] = useState<ClinicalRecordEntry[]>(INITIAL_CLINICAL_RECORDS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Record Form State
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [formPatientId, setFormPatientId] = useState(patients[0]?.id || 'P-001');

  const [bpSystolic, setBpSystolic] = useState(120);
  const [bpDiastolic, setBpDiastolic] = useState(80);
  const [rr, setRr] = useState(20);
  const [spo2, setSpo2] = useState(98);
  const [temp, setTemp] = useState(37.0);
  const [weight, setWeight] = useState(70.0);
  const [glucose, setGlucose] = useState(110);
  const [gcs, setGcs] = useState(15);
  const [urineOutput, setUrineOutput] = useState(45);
  const [recordedBy, setRecordedBy] = useState('Staff Nurse on Duty');
  const [notes, setNotes] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRecords = records.filter((r) => {
    const matchPatient = selectedPatientId === 'all' || r.patientId === selectedPatientId;
    const matchSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clinicalNotes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPatient && matchSearch;
  });

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const p = patients.find((pat) => pat.id === formPatientId) || patients[0];

    const newRecord: ClinicalRecordEntry = {
      id: `REC-${Date.now()}`,
      patientId: p.id,
      patientName: p.name,
      bed: p.bed,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recordedBy: recordedBy.trim() || 'Attending Clinical Staff',
      bloodPressureSystolic: bpSystolic,
      bloodPressureDiastolic: bpDiastolic,
      respiratoryRate: rr,
      spo2: spo2,
      temperature: temp,
      weightKg: weight,
      bloodGlucoseMgDl: glucose,
      gcsScore: gcs,
      urineOutputMlHr: urineOutput,
      clinicalNotes: notes.trim() || 'Routine ICU telemetry observation logged.',
    };

    // Update global state in SimulationContext
    updatePatient(p.id, {
      vitals: {
        heartRate: p.vitals.heartRate,
        spo2: spo2,
        respiratoryRate: rr,
        systolic: bpSystolic,
        diastolic: bpDiastolic,
        temperature: temp,
      },
    });

    addPatientObservation(
      p.id,
      'Clinical Parameters & Telemetry Logged',
      notes.trim() || `Vitals logged: BP ${bpSystolic}/${bpDiastolic}, RR ${rr}, SpO2 ${spo2}%, Temp ${temp}°C.`,
      recordedBy.trim() || 'Attending Clinical Staff'
    );

    setRecords((prev) => [newRecord, ...prev]);
    setIsAddRecordModalOpen(false);
    setNotes('');
    showToast(`Clinical parameters logged globally for ${p.name} (${p.bed}).`);
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Patient Clinical Records & Vitals Log
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Structured admission telemetry, multi-parameter vital logs (BP, RR, SpO2, Temp, Weight), and clinical notes.
          </p>
        </div>

        <button
          onClick={() => setIsAddRecordModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient Record</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, bed, or clinical notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Patients ({records.length} records)</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.bed})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Records Feed */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-zinc-300 text-sm">No clinical records found</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Click "Add Patient Record" to log new telemetry data.</p>
          </div>
        ) : (
          filteredRecords.map((r) => (
            <div
              key={r.id}
              className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {r.patientName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {r.bed} • Patient ID: <span className="font-mono font-bold">{r.patientId}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {r.timestamp}
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Logged by: {r.recordedBy}
                  </p>
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Blood Pressure</span>
                  <p className="font-mono text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {r.bloodPressureSystolic}/{r.bloodPressureDiastolic} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Resp Rate</span>
                  <p className="font-mono text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {r.respiratoryRate} <span className="text-[10px] font-normal text-slate-400">/min</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">SpO2</span>
                  <p className="font-mono text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {r.spo2}%
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Temperature</span>
                  <p className="font-mono text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {r.temperature}°C
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Weight</span>
                  <p className="font-mono text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {r.weightKg} <span className="text-[10px] font-normal text-slate-400">kg</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Blood Glucose</span>
                  <p className="font-mono text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {r.bloodGlucoseMgDl} <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">GCS / Output</span>
                  <p className="font-mono text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {r.gcsScore}/15 • {r.urineOutputMlHr}ml
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl text-xs text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800/80">
                <span className="font-bold text-slate-900 dark:text-zinc-100">Clinical Observation: </span>
                {r.clinicalNotes}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Patient Record Modal */}
      {isAddRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Patient Clinical Record</h3>
              </div>
              <button
                onClick={() => setIsAddRecordModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Target Patient *</label>
                <select
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.bed} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">BP Systolic (mmHg)</label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(parseInt(e.target.value) || 120)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">BP Diastolic (mmHg)</label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(parseInt(e.target.value) || 80)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Resp Rate (/min)</label>
                  <input
                    type="number"
                    value={rr}
                    onChange={(e) => setRr(parseInt(e.target.value) || 20)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(parseInt(e.target.value) || 98)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(parseFloat(e.target.value) || 37.0)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 70)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={glucose}
                    onChange={(e) => setGlucose(parseInt(e.target.value) || 100)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">GCS (3-15)</label>
                  <input
                    type="number"
                    min={3}
                    max={15}
                    value={gcs}
                    onChange={(e) => setGcs(parseInt(e.target.value) || 15)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Urine Output (mL/hr)</label>
                  <input
                    type="number"
                    value={urineOutput}
                    onChange={(e) => setUrineOutput(parseInt(e.target.value) || 45)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-mono text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Recorded By Staff Name *</label>
                <input
                  type="text"
                  required
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Clinical Observation Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Patient stable post-extubation. Hemodynamics maintained with low dose inotropes."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Clinical Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
