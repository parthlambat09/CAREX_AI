export type EquipmentCategory =
  | 'ventilator'
  | 'monitor'
  | 'infusion'
  | 'defibrillator'
  | 'dialysis'
  | 'airway';

export type EquipmentStatus = 'available' | 'low' | 'critical';

export interface ICUItem {
  id: string;
  name: string;
  model: string;
  category: EquipmentCategory;
  total: number;
  available: number;
  inUse: number;
  maintenance: number;
  status: EquipmentStatus;
  location: string;
  assignedBeds: string[];
  batteryPercent: number;
  lastInspected: string;
  nextCalibration: string;
}

export const ICU_EQUIPMENT: ICUItem[] = [
  {
    id: 'EQ-VENT-01',
    name: 'Mechanical Invasive Ventilator',
    model: 'Hamilton-G5 Intensive Care',
    category: 'ventilator',
    total: 18,
    available: 3,
    inUse: 14,
    maintenance: 1,
    status: 'low',
    location: 'Central ICU Clean Utility / Pod B',
    assignedBeds: ['A1', 'A3', 'A4', 'B2', 'B5', 'B7', 'C1', 'C3'],
    batteryPercent: 98,
    lastInspected: '2026-08-28',
    nextCalibration: '2026-11-28',
  },
  {
    id: 'EQ-VENT-02',
    name: 'High-Flow Nasal Cannula / Non-Invasive',
    model: 'Airvo 2 Optiflow Humidifier',
    category: 'ventilator',
    total: 12,
    available: 5,
    inUse: 6,
    maintenance: 1,
    status: 'available',
    location: 'Respiratory Therapy Storage Alcove',
    assignedBeds: ['A2', 'A6', 'B8', 'C4'],
    batteryPercent: 100,
    lastInspected: '2026-08-24',
    nextCalibration: '2026-11-24',
  },
  {
    id: 'EQ-MON-01',
    name: 'Multi-Parameter Telemetry Monitor',
    model: 'Philips IntelliVue MX800',
    category: 'monitor',
    total: 24,
    available: 4,
    inUse: 19,
    maintenance: 1,
    status: 'available',
    location: 'Integrated Bedside Mounts All Pods',
    assignedBeds: ['A1-A12', 'B1-B8'],
    batteryPercent: 95,
    lastInspected: '2026-08-15',
    nextCalibration: '2026-12-15',
  },
  {
    id: 'EQ-MON-02',
    name: 'Continuous Cardiac Output Monitor',
    model: 'Edwards EV1000 Clinical Platform',
    category: 'monitor',
    total: 8,
    available: 1,
    inUse: 6,
    maintenance: 1,
    status: 'critical',
    location: 'Cardiovascular Specialty Bay 4',
    assignedBeds: ['A1', 'A3', 'B7'],
    batteryPercent: 88,
    lastInspected: '2026-08-20',
    nextCalibration: '2026-10-20',
  },
  {
    id: 'EQ-INF-01',
    name: 'Smart Infusion Pump Quad-Channel',
    model: 'BD Alaris 8015 System',
    category: 'infusion',
    total: 42,
    available: 9,
    inUse: 30,
    maintenance: 3,
    status: 'available',
    location: 'Pharmacy Clean Depot East',
    assignedBeds: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B5', 'B7', 'C1'],
    batteryPercent: 92,
    lastInspected: '2026-08-30',
    nextCalibration: '2026-11-30',
  },
  {
    id: 'EQ-INF-02',
    name: 'Target-Controlled Syringe Driver',
    model: 'Fresenius Kabi Injectomat TIVA',
    category: 'infusion',
    total: 20,
    available: 3,
    inUse: 16,
    maintenance: 1,
    status: 'low',
    location: 'Sedation Cart Alcove Pod A',
    assignedBeds: ['A1', 'A4', 'B2', 'C1'],
    batteryPercent: 96,
    lastInspected: '2026-08-26',
    nextCalibration: '2026-11-26',
  },
  {
    id: 'EQ-DEF-01',
    name: 'Biphasic Defibrillator / Pacer',
    model: 'ZOLL R Series Plus ALS',
    category: 'defibrillator',
    total: 6,
    available: 5,
    inUse: 0,
    maintenance: 1,
    status: 'available',
    location: 'Crash Carts 1 through 4 & Trauma Alcove',
    assignedBeds: ['Rapid Response Standby'],
    batteryPercent: 100,
    lastInspected: '2026-09-01',
    nextCalibration: '2026-10-01',
  },
  {
    id: 'EQ-CRRT-01',
    name: 'Continuous Renal Replacement Therapy (CRRT)',
    model: 'Baxter Prismaflex System v8.0',
    category: 'dialysis',
    total: 6,
    available: 1,
    inUse: 5,
    maintenance: 0,
    status: 'critical',
    location: 'Nephrology ICU Suite Room 12',
    assignedBeds: ['A3', 'B2', 'B5', 'C3'],
    batteryPercent: 94,
    lastInspected: '2026-08-19',
    nextCalibration: '2026-11-19',
  },
  {
    id: 'EQ-AIR-01',
    name: 'Video Laryngoscope & Difficult Airway Cart',
    model: 'GlideScope Core 15 HD',
    category: 'airway',
    total: 5,
    available: 4,
    inUse: 1,
    maintenance: 0,
    status: 'available',
    location: 'Emergency Airway Station Pod C',
    assignedBeds: ['Trauma Bay 1 Standby'],
    batteryPercent: 100,
    lastInspected: '2026-08-29',
    nextCalibration: '2026-11-29',
  },
];
