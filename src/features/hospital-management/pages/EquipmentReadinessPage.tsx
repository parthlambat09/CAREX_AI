import React, { useState, useMemo } from 'react';
import {
  Cpu, CheckCircle2, Search, Plus, RefreshCw
} from 'lucide-react';
import { ICU_EQUIPMENT, ICUItem, EquipmentCategory, EquipmentStatus } from '@/features/doctor/mock/equipment';
import { useSimulation } from '@/features/doctor/context/SimulationContext';

export const EquipmentReadinessPage: React.FC = () => {
  const { activeHospital } = useSimulation();
  const [equipmentList, setEquipmentList] = useState<ICUItem[]>(ICU_EQUIPMENT);
  const [selectedCategory, setSelectedCategory] = useState<'all' | EquipmentCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | EquipmentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalDevices = equipmentList.reduce((acc, item) => acc + item.total, 0);
    const availableDevices = equipmentList.reduce((acc, item) => acc + item.available, 0);
    const inUseDevices = equipmentList.reduce((acc, item) => acc + item.inUse, 0);
    const maintenanceDevices = equipmentList.reduce((acc, item) => acc + item.maintenance, 0);
    const criticalCount = equipmentList.filter((item) => item.status === 'critical').length;
    return {
      totalDevices,
      availableDevices,
      inUseDevices,
      maintenanceDevices,
      criticalCount,
      availabilityPercent: Math.round((availableDevices / totalDevices) * 100),
    };
  }, [equipmentList]);

  // Filtered Equipment
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchQuery =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchQuery;
    });
  }, [equipmentList, selectedCategory, selectedStatus, searchQuery]);

  const handleRequestDevice = (item: ICUItem) => {
    if (item.available <= 0) {
      setActionNotice(`Warning: No ${item.name} currently available. Device allocation queue active.`);
      setTimeout(() => setActionNotice(null), 3000);
      return;
    }

    setEquipmentList((prev) =>
      prev.map((i) => {
        if (i.id === item.id) {
          const newAvail = i.available - 1;
          const newInUse = i.inUse + 1;
          const newStatus: EquipmentStatus = newAvail === 0 ? 'critical' : newAvail <= 2 ? 'low' : 'available';
          return {
            ...i,
            available: newAvail,
            inUse: newInUse,
            status: newStatus,
          };
        }
        return i;
      })
    );

    setActionNotice(`Allocated 1x ${item.name} (${item.model}) to ICU Bed.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleReturnDevice = (item: ICUItem) => {
    if (item.inUse <= 0) return;

    setEquipmentList((prev) =>
      prev.map((i) => {
        if (i.id === item.id) {
          const newAvail = i.available + 1;
          const newInUse = i.inUse - 1;
          const newStatus: EquipmentStatus = newAvail === 0 ? 'critical' : newAvail <= 2 ? 'low' : 'available';
          return {
            ...i,
            available: newAvail,
            inUse: newInUse,
            status: newStatus,
          };
        }
        return i;
      })
    );

    setActionNotice(`Device returned & sanitized: 1x ${item.name}.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Action Toast Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              ICU Equipment Readiness & Biomedical Assets
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Real-time life-support device availability, calibration tracking, and rapid bedside allocation for <strong className="text-slate-700 dark:text-zinc-300">{activeHospital.name}</strong>.
          </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Devices</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.totalDevices}</p>
          <p className="text-[10px] text-slate-500">Tracked Biomedical Inventory</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Ready & Available</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{summary.availableDevices}</p>
          <p className="text-[10px] text-slate-500">{summary.availabilityPercent}% Fleet Availability</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">In Active Use</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{summary.inUseDevices}</p>
          <p className="text-[10px] text-slate-500">Connected to Admitted Patients</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Maintenance & Sterilization</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{summary.maintenanceDevices}</p>
          <p className="text-[10px] text-slate-500">Biomedical Calibration Queue</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equipment name, model, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="ventilator">Ventilators</option>
            <option value="monitor">Monitors & Telemetry</option>
            <option value="infusion">Infusion Pumps</option>
            <option value="defibrillator">Defibrillators & Resuscitation</option>
            <option value="dialysis">Dialysis / CRRT</option>
            <option value="airway">Airway & Suction</option>
            <option value="imaging">Point-of-Care Imaging</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="low">Low Stock</option>
            <option value="critical">Critical / None Available</option>
          </select>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredEquipment.map((item) => {
          const availPercent = Math.round((item.available / item.total) * 100);
          const isCritical = item.status === 'critical';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                isCritical
                  ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-500/30'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xs hover:border-indigo-400'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                      {item.category} • {item.id}
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-0.5">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Model: {item.model}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        : item.status === 'low'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                        : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-zinc-400">Availability</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {item.available} / {item.total} Units
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        availPercent > 50
                          ? 'bg-emerald-500'
                          : availPercent > 20
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${availPercent}%` }}
                    />
                  </div>
                </div>

                {/* Details Ribbon */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Location</span>
                    <p className="font-medium text-slate-800 dark:text-zinc-200">{item.location}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Battery Health</span>
                    <p className="font-medium text-slate-800 dark:text-zinc-200">{item.batteryPercent}%</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Last Inspected</span>
                    <p className="font-mono text-slate-600 dark:text-zinc-400">{item.lastInspected}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Next Calibration</span>
                    <p className="font-mono text-slate-600 dark:text-zinc-400">{item.nextCalibration}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  onClick={() => handleRequestDevice(item)}
                  disabled={item.available <= 0}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Allocate</span>
                </button>

                <button
                  onClick={() => handleReturnDevice(item)}
                  disabled={item.inUse <= 0}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-slate-700 dark:text-zinc-300 font-bold text-xs transition-all flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Return</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
