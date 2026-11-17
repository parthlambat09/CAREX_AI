export interface InvoiceLineItem {
  id: string;
  description: string;
  category: 'icu_bed' | 'equipment' | 'medication' | 'diagnostics' | 'consultation' | 'nursing';
  quantity: number;
  rate: number;
  amount: number;
}

export interface PatientInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  bed: string;
  admissionDate: string;
  dischargeDate?: string;
  attendingDoctor: string;
  items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'processing';
  paymentMode?: 'Insurance (TPA)' | 'Cash / UPI' | 'Corporate Credit' | 'Pending';
  insuranceProvider?: string;
  insuranceClaimNumber?: string;
  generatedDate: string;
}

export const INITIAL_INVOICES: PatientInvoice[] = [
  {
    id: 'INV-1001',
    invoiceNumber: 'CRX-2026-8801',
    patientId: 'ICU-100',
    patientName: 'Vikram Bhat',
    bed: 'Bed B10',
    admissionDate: '2026-03-01',
    attendingDoctor: 'Dr. Rajesh Sharma, MD, FCCM',
    items: [
      { id: '1', description: 'ICU High-Dependency Bed Charges (4 Days)', category: 'icu_bed', quantity: 4, rate: 12000, amount: 48000 },
      { id: '2', description: 'Mechanical Ventilator & High-Flow O2 Delivery', category: 'equipment', quantity: 4, rate: 6500, amount: 26000 },
      { id: '3', description: 'Critical Care Infusion Pumps & Telemetry Monitoring', category: 'equipment', quantity: 4, rate: 2500, amount: 10000 },
      { id: '4', description: 'IV Norepinephrine, Meropenem & Electrolyte Infusions', category: 'medication', quantity: 1, rate: 18450, amount: 18450 },
      { id: '5', description: 'Serial Arterial Blood Gas (ABG) & Sepsis Panel Labs', category: 'diagnostics', quantity: 6, rate: 1500, amount: 9000 },
      { id: '6', description: 'Intensivist Specialist Daily Evaluation & Rounds', category: 'consultation', quantity: 4, rate: 3000, amount: 12000 },
      { id: '7', description: '24/7 1:1 ICU Nursing & Respiratory Care', category: 'nursing', quantity: 4, rate: 2000, amount: 8000 },
    ],
    subtotal: 131450,
    tax: 6572,
    discount: 0,
    totalAmount: 138022,
    status: 'pending',
    paymentMode: 'Insurance (TPA)',
    insuranceProvider: 'Star Health & Allied Insurance',
    insuranceClaimNumber: 'CLM-SH-992140',
    generatedDate: '2026-03-04',
  },
  {
    id: 'INV-1002',
    invoiceNumber: 'CRX-2026-8802',
    patientId: 'ICU-101',
    patientName: 'Sai Chawla',
    bed: 'Bed B7',
    admissionDate: '2026-03-02',
    attendingDoctor: 'Dr. Anita Desai, MBBS, MD',
    items: [
      { id: '1', description: 'ICU Level 2 Bed Charges (3 Days)', category: 'icu_bed', quantity: 3, rate: 10000, amount: 30000 },
      { id: '2', description: 'Continuous Cardiac Telemetry & ECG Monitoring', category: 'equipment', quantity: 3, rate: 2000, amount: 6000 },
      { id: '3', description: 'Post-Cardiac Catheterization Medications & Antiplatelets', category: 'medication', quantity: 1, rate: 9200, amount: 9200 },
      { id: '4', description: 'Cardiology Specialist Consultations', category: 'consultation', quantity: 3, rate: 2500, amount: 7500 },
      { id: '5', description: 'Specialized Nursing Care', category: 'nursing', quantity: 3, rate: 1800, amount: 5400 },
    ],
    subtotal: 58100,
    tax: 2905,
    discount: 2000,
    totalAmount: 59005,
    status: 'paid',
    paymentMode: 'Cash / UPI',
    generatedDate: '2026-03-04',
  },
  {
    id: 'INV-1003',
    invoiceNumber: 'CRX-2026-8803',
    patientId: 'ICU-102',
    patientName: 'Robert Phillips',
    bed: 'Bed A3',
    admissionDate: '2026-03-03',
    attendingDoctor: 'Dr. Rajesh Sharma, MD, FCCM',
    items: [
      { id: '1', description: 'ICU Step-down Bed Charges (2 Days)', category: 'icu_bed', quantity: 2, rate: 9000, amount: 18000 },
      { id: '2', description: 'Broad-Spectrum IV Antibiotics & Fluids', category: 'medication', quantity: 1, rate: 6400, amount: 6400 },
      { id: '3', description: 'Complete Metabolic Panel & Blood Cultures', category: 'diagnostics', quantity: 2, rate: 1800, amount: 3600 },
      { id: '4', description: 'Critical Care Consultation', category: 'consultation', quantity: 2, rate: 2500, amount: 5000 },
      { id: '5', description: 'Nursing Support', category: 'nursing', quantity: 2, rate: 1500, amount: 3000 },
    ],
    subtotal: 36000,
    tax: 1800,
    discount: 0,
    totalAmount: 37800,
    status: 'processing',
    paymentMode: 'Insurance (TPA)',
    insuranceProvider: 'HDFC ERGO General Insurance',
    insuranceClaimNumber: 'CLM-HD-441029',
    generatedDate: '2026-03-04',
  },
];
