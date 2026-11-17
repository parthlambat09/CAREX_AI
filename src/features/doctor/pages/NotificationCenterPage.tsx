import { useEffect, useState } from 'react';
import {
  Send, Brain, Gauge, Bell, Users, Check, Clock, Smartphone, Mail, MessageSquare,
  Monitor, Download, AlertTriangle, CheckCircle2, X
} from 'lucide-react';
import { Card, SectionTitle, Button, PageHeader, Toggle } from '@/features/doctor/components/ui';
import { api } from '@/features/doctor/services/api';
import type { NotificationChannel } from '@/types/doctor';

const FLOW = [
  { icon: Brain, label: 'AI Detection', desc: 'Models detect deterioration pattern', color: 'text-blue-600 dark:text-orange-400 bg-blue-50 dark:bg-orange-500/10' },
  { icon: Gauge, label: 'Risk Evaluation', desc: 'Score computed & threshold checked', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
  { icon: Bell, label: 'Alert Engine', desc: 'Alert generated & categorized', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10' },
  { icon: Send, label: 'Notification', desc: 'Routed to enabled channels', color: 'text-blue-600 dark:text-orange-400 bg-blue-50 dark:bg-orange-500/10' },
  { icon: Users, label: 'Care Team', desc: 'On-call clinician receives & reviews', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
];

const CHANNEL_ICON: Record<string, typeof Bell> = {
  dashboard: Monitor,
  mobile: Smartphone,
  whatsapp: MessageSquare,
  email: Mail,
};

interface LogEntry {
  channel: string;
  patient: string;
  status: 'delivered' | 'pending';
  time: string;
}

const INITIAL_DELIVERY_LOG: LogEntry[] = [
  { channel: 'dashboard', patient: 'P-001 (Bed 04)', status: 'delivered', time: '2m ago' },
  { channel: 'mobile', patient: 'P-001 (Bed 04)', status: 'delivered', time: '2m ago' },
  { channel: 'email', patient: 'P-002 (Bed 07)', status: 'delivered', time: '8m ago' },
  { channel: 'dashboard', patient: 'P-003 (Bed 12)', status: 'delivered', time: '14m ago' },
  { channel: 'mobile', patient: 'P-004 (Bed 02)', status: 'pending', time: 'just now' },
];

export function NotificationCenterPage() {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [deliveryLog, setDeliveryLog] = useState<LogEntry[]>(INITIAL_DELIVERY_LOG);
  const [sending, setSending] = useState<string | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState('All ICU Staff on Duty');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getNotificationChannels().then(setChannels);
  }, []);

  function toggle(id: string) {
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
    const target = channels.find((c) => c.id === id);
    setToastMessage(`Channel ${target?.name} ${target?.enabled ? 'disabled' : 'enabled'}.`);
    setTimeout(() => setToastMessage(null), 3000);
  }

  async function sendTest(channel: string) {
    setSending(channel);
    await api.sendNotification('P-001', channel);
    
    // Add to delivery log
    setDeliveryLog((prev) => [
      {
        channel,
        patient: 'Simulated Test Alert',
        status: 'delivered',
        time: 'Just now',
      },
      ...prev,
    ]);

    setSending(null);
    setToastMessage(`Test dispatch packet sent to ${channel.toUpperCase()}.`);
    setTimeout(() => setToastMessage(null), 3000);
  }

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setDeliveryLog((prev) => [
      {
        channel: 'mobile',
        patient: `BROADCAST: ${broadcastTarget}`,
        status: 'delivered',
        time: 'Just now',
      },
      ...prev,
    ]);

    setToastMessage(`Emergency broadcast dispatched to ${broadcastTarget}.`);
    setBroadcastMessage('');
    setIsBroadcastModalOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportLogs = () => {
    const headers = ['Channel', 'Patient/Target', 'Status', 'Timestamp'];
    const rows = deliveryLog.map((d) => [d.channel, `"${d.patient}"`, d.status, `"${d.time}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `carex_delivery_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Notification delivery audit log exported.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Notification Center & Escalation Dispatch"
          description="Configure automated dispatch channels, test clinical SMS/push delivery, and audit system notification flow."
          statusPill={{ label: 'Dispatch Engine Active', variant: 'info' }}
        />

        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="default" onClick={handleExportLogs}>
            <Download className="h-4 w-4" />
            <span>Export Logs</span>
          </Button>

          <Button variant="primary" onClick={() => setIsBroadcastModalOpen(true)}>
            <Send className="h-4 w-4" />
            <span>Send Broadcast Alert</span>
          </Button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Flow Diagram */}
      <Card className="p-5 border border-slate-200 dark:border-zinc-800">
        <SectionTitle title="Notification Pipeline Architecture" subtitle="Sub-second event detection to care team dispatch" />
        <div className="mt-6 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          {FLOW.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-3 lg:flex-1">
                <div className="flex flex-1 flex-col items-center text-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-900 dark:text-zinc-100">{step.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">{step.desc}</p>
                </div>
                {i < FLOW.length - 1 && (
                  <div className="hidden shrink-0 items-center lg:flex">
                    <div className="h-px w-8 bg-slate-300 dark:bg-zinc-800" />
                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-orange-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Channels & Delivery Log Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5 border border-slate-200 dark:border-zinc-800">
          <SectionTitle title="Configured Dispatch Channels" subtitle="Toggle live delivery endpoints" />
          <div className="mt-4 space-y-3">
            {channels.map((c) => {
              const Icon = CHANNEL_ICON[c.id] ?? Bell;
              return (
                <div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60 p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${c.enabled ? 'bg-blue-50 text-blue-600 dark:bg-orange-500/10 dark:text-orange-400' : 'bg-slate-200 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{c.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{c.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Toggle checked={c.enabled} onChange={() => toggle(c.id)} />
                    <Button size="sm" variant="ghost" onClick={() => sendTest(c.id)} disabled={sending === c.id}>
                      {sending === c.id ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Delivery Audit Log */}
        <Card className="p-5 border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between pb-2">
            <SectionTitle title="Live Delivery Audit Log" subtitle="Recent notification dispatch events" />
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {deliveryLog.length} Records
            </span>
          </div>

          <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto">
            {deliveryLog.map((d, i) => {
              const Icon = CHANNEL_ICON[d.channel] ?? Bell;
              const delivered = d.status === 'delivered';
              return (
                <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-orange-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{d.patient} • <span className="capitalize">{d.channel}</span></p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500">{d.time}</p>
                    </div>
                  </div>

                  {delivered ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold">
                      <Check className="h-3 w-3" /> Delivered
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400 px-2.5 py-0.5 text-[10px] font-bold animate-pulse">
                      <Clock className="h-3 w-3" /> Dispatching
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Broadcast Alert Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0" onClick={() => setIsBroadcastModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Send ICU Broadcast Alert</h3>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Recipient Group</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option>All ICU Staff on Duty</option>
                  <option>Rapid Response Team</option>
                  <option>Attending Intensivists Only</option>
                  <option>Nursing Shift Supervisors</option>
                  <option>Biomedical Engineering Dispatch</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Alert Priority & Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Mass trauma intake arriving in 10 mins. Prepare Beds A1-A3 and reserve mechanical ventilators."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <Button variant="ghost" type="button" onClick={() => setIsBroadcastModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" type="submit">
                  <Send className="h-3.5 w-3.5" />
                  Dispatch High-Priority Broadcast
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
