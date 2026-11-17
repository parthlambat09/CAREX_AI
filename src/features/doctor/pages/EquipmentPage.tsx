import { useState, useMemo } from 'react';
import {
  Cpu, Activity, CheckCircle2, Wrench, Search, Zap
} from 'lucide-react';
import { Card, PageHeader, Button } from '@/features/doctor/components/ui';
import { ICU_EQUIPMENT, ICUItem, EquipmentCategory, EquipmentStatus } from '@/features/doctor/mock/equipment';
import { useSimulation } from '@/features/doctor/context/SimulationContext';

export function EquipmentPage() {
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
          return { ...i, available: newAvail, inUse: newInUse, status: newStatus };
        }
        return i;
      })
    );

    setActionNotice(`Allocated 1x ${item.name} to Bedside Service. Central logistics dispatched.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleFlagMaintenance = (item: ICUItem) => {
    if (item.available <= 0) {
      setActionNotice(`Cannot mark unavailable device for maintenance immediately.`);
      setTimeout(() => setActionNotice(null), 3000);
      return;
    }

    setEquipmentList((prev) =>
      prev.map((i) => {
        if (i.id === item.id) {
          const newAvail = i.available - 1;
          const newMaint = i.maintenance + 1;
          const newStatus: EquipmentStatus = newAvail <= 1 ? 'critical' : newAvail <= 3 ? 'low' : 'available';
          return { ...i, available: newAvail, maintenance: newMaint, status: newStatus };
        }
        return i;
      })
    );

    setActionNotice(`Flagged 1x ${item.name} for Biomedical Engineering calibration inspection.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const statusStyles: Record<EquipmentStatus, { badge: string; border: string; text: string }> = {
    available: {
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
      border: 'border-l-4 border-l-emerald-500',
      text: 'Available for Bedside',
    },
    low: {
      badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
      border: 'border-l-4 border-l-amber-500',
      text: 'Low Reserve Warning',
    },
    critical: {
      badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 animate-pulse',
      border: 'border-l-4 border-l-red-500',
      text: 'Critical Depletion',
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="ICU Equipment Availability & Readiness"
        description={`Real-time telemetry on mechanical ventilators, infusion pumps, monitors, and life-support assets across ${activeHospital.name}.`}
        statusPill={{
          label: `${summary.availableDevices} Units Ready`,
          variant: summary.criticalCount > 0 ? 'warning' : 'stable',
        }}
      />

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-teal-50 text-teal-900 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Card className="p-4 border-l-4 border-l-teal-500 border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total ICU Fleet</p>
              <p className="mt-1 text-2xl md:text-3xl font-black text-slate-900 dark:text-zinc-100 font-mono">
                {summary.totalDevices}
              </p>
              <span className="text-xs text-slate-500 dark:text-zinc-400">Registered biomedical assets</span>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Available Immediately</p>
              <p className="mt-1 text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {summary.availableDevices}
              </p>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                {summary.availabilityPercent}% fleet ready
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 dark:border-l-orange-500 border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">In Active Bedside Use</p>
              <p className="mt-1 text-2xl md:text-3xl font-black text-blue-600 dark:text-orange-400 font-mono">
                {summary.inUseDevices}
              </p>
              <span className="text-xs text-slate-500 dark:text-zinc-400">Connected to patients</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-orange-500/10 dark:text-orange-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 border border-slate-200 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Maintenance / Sterile Hold</p>
              <p className="mt-1 text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {summary.maintenanceDevices}
              </p>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Biomed recalibration</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment by name, model, or location..."
            className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 py-2 pl-10 pr-3 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:outline-none"
          >
            <option value="all">All Device Categories</option>
            <option value="ventilator">Ventilators & Airway</option>
            <option value="monitor">Telemetry & Monitors</option>
            <option value="infusion">Infusion & Syringe Pumps</option>
            <option value="defibrillator">Defibrillators / ALS</option>
            <option value="dialysis">Dialysis / CRRT</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:outline-none"
          >
            <option value="all">All Availability Statuses</option>
            <option value="available">Available (Sufficient Reserve)</option>
            <option value="low">Low Reserve</option>
            <option value="critical">Critical Depletion (&le; 1 Unit)</option>
          </select>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((item) => {
          const styling = statusStyles[item.status];
          const availableRatio = item.total > 0 ? Math.round((item.available / item.total) * 100) : 0;
          return (
            <Card
              key={item.id}
              className={`p-5 border border-slate-200 dark:border-zinc-800 ${styling.border} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase">{item.id}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{item.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{item.model}</p>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase shrink-0 ${styling.badge}`}>
                  {item.status}
                </span>
              </div>

              {/* Counts Bar */}
              <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800/80 text-center">
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-zinc-500">Available</p>
                  <p className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">{item.available}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-zinc-500">In Use</p>
                  <p className="font-mono text-lg font-black text-blue-600 dark:text-orange-400">{item.inUse}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-zinc-500">Total</p>
                  <p className="font-mono text-lg font-black text-slate-900 dark:text-zinc-100">{item.total}</p>
                </div>
              </div>

              {/* Availability Progress Bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                  <span>Readiness Ratio</span>
                  <span className="font-mono font-bold">{availableRatio}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === 'critical' ? 'bg-red-500' : item.status === 'low' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${availableRatio}%` }}
                  />
                </div>
              </div>

              {/* Location & Battery */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-xs space-y-1 text-slate-500 dark:text-zinc-400">
                <p className="truncate">
                  <strong className="text-slate-700 dark:text-zinc-300">Location:</strong> {item.location}
                </p>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Battery State: <strong className="text-slate-700 dark:text-zinc-300 font-mono">{item.batteryPercent}%</strong></span>
                  <span>Insp: <strong className="text-slate-700 dark:text-zinc-300 font-mono">{item.lastInspected}</strong></span>
                </div>
              </div>

              {/* Interactive Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <Button size="sm" variant="default" onClick={() => handleFlagMaintenance(item)}>
                  <Wrench className="h-3 w-3" /> Service
                </Button>
                <Button size="sm" variant="primary" onClick={() => handleRequestDevice(item)}>
                  Request Allocation
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
