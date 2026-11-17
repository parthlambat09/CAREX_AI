import React, { useState } from 'react';
import {
  Receipt, Plus, CheckCircle2,
  Printer, Search, Eye
} from 'lucide-react';
import { useSimulation } from '@/features/doctor/context/SimulationContext';
import { INITIAL_INVOICES, PatientInvoice } from '../mock/billing';

export const BillingInvoicesPage: React.FC = () => {
  const { patients } = useSimulation();
  const [invoices, setInvoices] = useState<PatientInvoice[]>(INITIAL_INVOICES);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'processing'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Invoice for Detailed Inspection
  const [selectedInvoice, setSelectedInvoice] = useState<PatientInvoice | null>(null);

  // New Bill Modal
  const [isNewBillModalOpen, setIsNewBillModalOpen] = useState(false);
  const [billPatientId, setBillPatientId] = useState(patients[0]?.id || 'P-001');

  const [billDays, setBillDays] = useState(3);
  const [billVentilator, setBillVentilator] = useState(true);
  const [billInsurance, setBillInsurance] = useState('HDFC ERGO TPA');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchSearch =
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.bed.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalBilled = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPending = invoices.filter((i) => i.status !== 'paid').reduce((acc, curr) => acc + curr.totalAmount, 0);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const p = patients.find((pat) => pat.id === billPatientId) || patients[0];

    const bedRate = 12000;
    const ventRate = billVentilator ? 6500 : 0;
    const medsRate = 15000;
    const sub = (bedRate + ventRate) * billDays + medsRate + 12000;
    const tax = Math.round(sub * 0.05);

    const newInv: PatientInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `CRX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: p.id,
      patientName: p.name,
      bed: p.bed,
      admissionDate: new Date().toISOString().split('T')[0],
      attendingDoctor: 'Dr. Rajesh Sharma, MD, FCCM',
      items: [
        { id: '1', description: `ICU Level-3 Bed Charges (${billDays} Days)`, category: 'icu_bed', quantity: billDays, rate: bedRate, amount: bedRate * billDays },
        ...(billVentilator ? [{ id: '2', description: `Mechanical Ventilation Support (${billDays} Days)`, category: 'equipment' as const, quantity: billDays, rate: 6500, amount: 6500 * billDays }] : []),
        { id: '3', description: 'Continuous Infusions & Critical Care Medications', category: 'medication', quantity: 1, rate: medsRate, amount: medsRate },
        { id: '4', description: 'Intensivist Specialist Evaluation & Care Coordination', category: 'consultation', quantity: billDays, rate: 3000, amount: 3000 * billDays },
      ],
      subtotal: sub,
      tax: tax,
      discount: 0,
      totalAmount: sub + tax,
      status: 'pending',
      paymentMode: 'Insurance (TPA)',
      insuranceProvider: billInsurance,
      insuranceClaimNumber: `CLM-${Math.floor(100000 + Math.random() * 900000)}`,
      generatedDate: new Date().toISOString().split('T')[0],
    };

    setInvoices((prev) => [newInv, ...prev]);
    setIsNewBillModalOpen(false);
    showToast(`Generated invoice ${newInv.invoiceNumber} for ${p.name} (₹${(sub + tax).toLocaleString('en-IN')}).`);
  };

  const handleMarkAsPaid = (invId: string) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invId ? { ...i, status: 'paid', paymentMode: 'Cash / UPI' } : i))
    );
    if (selectedInvoice && selectedInvoice.id === invId) {
      setSelectedInvoice((prev) => (prev ? { ...prev, status: 'paid', paymentMode: 'Cash / UPI' } : null));
    }
    showToast('Payment settled and recorded in hospital ledger.');
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
            <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Billing & Invoices Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            ICU bed tariffs, ventilator charges, diagnostics, specialist consultations, and TPA insurance claims in INR (₹).
          </p>
        </div>

        <button
          onClick={() => setIsNewBillModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Invoice</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Billed (Cumulative)</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1">
            <span>₹{totalBilled.toLocaleString('en-IN')}</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400">{invoices.length} total hospital invoices</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Collected / Paid</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span>₹{totalPaid.toLocaleString('en-IN')}</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400">Settled via UPI / TPA / Cash</p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending / Processing</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span>₹{totalPending.toLocaleString('en-IN')}</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400">Under TPA claim pre-authorization</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, patient or bed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none"
          />
        </div>

        {/* Filter */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-800 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            All ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1 rounded-lg transition-all ${
              statusFilter === 'paid'
                ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-lg transition-all ${
              statusFilter === 'pending'
                ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 font-extrabold uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-zinc-900/50">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient & Bed</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4">Total Amount (INR)</th>
                <th className="py-3 px-4">Payment / TPA Mode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {inv.invoiceNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{inv.patientName}</p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">{inv.bed} ({inv.patientId})</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-zinc-400">
                    {inv.admissionDate}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="text-slate-800 dark:text-zinc-200 font-semibold">{inv.paymentMode}</p>
                    {inv.insuranceProvider && (
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-[150px]">
                        {inv.insuranceProvider}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                          : inv.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-[11px] flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(inv.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detailed Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Invoice {selectedInvoice.invoiceNumber}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Patient: {selectedInvoice.patientName} ({selectedInvoice.bed})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <h4 className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">
                Itemized ICU Billing Breakdown
              </h4>
              <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Service / Item</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
                    {selectedInvoice.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2 px-3 text-slate-800 dark:text-zinc-200">{it.description}</td>
                        <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">₹{it.rate.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">₹{it.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>GST (5% Hospital Surcharge):</span>
                  <span className="font-mono">₹{selectedInvoice.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <span>Total Amount Due:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    ₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] font-mono text-slate-400">
                Claim: {selectedInvoice.insuranceClaimNumber || 'Direct Payment'}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    showToast('Printing invoice statement...');
                    window.print();
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                {selectedInvoice.status !== 'paid' && (
                  <button
                    onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Mark as Settled
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate New Bill Modal */}
      {isNewBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Generate Hospital Bill</h3>
              </div>
              <button
                onClick={() => setIsNewBillModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Admitted Patient *</label>
                <select
                  value={billPatientId}
                  onChange={(e) => setBillPatientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.bed} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">ICU Stay Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={billDays}
                    onChange={(e) => setBillDays(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Insurance / TPA Provider</label>
                  <input
                    type="text"
                    value={billInsurance}
                    onChange={(e) => setBillInsurance(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billVentilator}
                    onChange={(e) => setBillVentilator(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-700 dark:text-zinc-300">
                    Include Mechanical Ventilator & High-Flow O2 Tariff (₹6,500/day)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewBillModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Generate & Register Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
