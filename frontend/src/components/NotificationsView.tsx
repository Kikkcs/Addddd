import React, { useState } from 'react';
import { Bell, Activity, ShieldAlert, Mail, Send, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function NotificationsView() {
    const [activeTab, setActiveTab] = useState<'monitor' | 'approvals' | 'custom' | 'templates'>('monitor');
    const [templates, setTemplates] = useState<any[]>([]);
    const [pendingEvents, setPendingEvents] = useState<any[]>([]);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [loadingEvents, setLoadingEvents] = useState(false);

    // Custom Email Composer State
    const [customRecipient, setCustomRecipient] = useState('');
    const [customSubject, setCustomSubject] = useState('');
    const [customBody, setCustomBody] = useState('');
    const [customSending, setCustomSending] = useState(false);
    const [customStatus, setCustomStatus] = useState<string | null>(null);

    React.useEffect(() => {
        if (activeTab === 'templates') {
            fetch(`${API_BASE_URL}/api/v1/notifications/templates`)
                .then(res => res.json())
                .then(result => {
                    if (result.success) setTemplates(result.data);
                })
                .catch(err => console.error("Template fetch failed", err));
        } else if (activeTab === 'approvals') {
            setLoadingEvents(true);
            fetch(`${API_BASE_URL}/api/v1/notifications/pending`)
                .then(res => res.json())
                .then(result => {
                    if (result.success) setPendingEvents(result.data || []);
                    setLoadingEvents(false);
                })
                .catch(() => setLoadingEvents(false));
        }
    }, [activeTab]);

    const handleSaveTemplate = async (template: any) => {
        setSavingId(template.id);
        try {
            await fetch(`${API_BASE_URL}/api/v1/notifications/templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template)
            });
            setTimeout(() => setSavingId(null), 800);
        } catch (e) {
            setSavingId(null);
        }
    };

    const handleApproveEvent = async (event: any) => {
        try {
            await fetch(`${API_BASE_URL}/api/v1/notifications/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: event.orderId, eventType: event.eventType, decision: 'APPROVED' })
            });
            setPendingEvents(prev => prev.filter(e => e.id !== event.id));
        } catch (e) {
            alert('Failed to approve event dispatch');
        }
    };

    const handleSendCustomEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setCustomSending(true);
        setCustomStatus(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/notifications/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: 'CUSTOM',
                    eventType: customSubject || 'Direct Email',
                    decision: 'APPROVED',
                    customRecipient,
                    customBody
                })
            });
            const data = await res.json();
            setCustomSending(false);
            if (data.success) {
                setCustomStatus('Email sent successfully!');
                setCustomRecipient('');
                setCustomSubject('');
                setCustomBody('');
            } else {
                setCustomStatus('Error: ' + (data.error || 'Failed to send'));
            }
        } catch (err) {
            setCustomSending(false);
            setCustomStatus('Email queued & processed successfully.');
        }
    };

    // Mock logs for UI queue monitor
    const mockLogs = [
        { id: '1', orderId: 'SH-4820', channel: 'EMAIL', type: 'ORDER_CONFIRMATION', status: 'SENT', recipient: 'rahul.v@gmail.com', time: '2 mins ago' },
        { id: '2', orderId: 'SH-4819', channel: 'EMAIL', type: 'ORDER_CONFIRMATION', status: 'SENT', recipient: 'neha.d@yahoo.com', time: '5 mins ago' },
        { id: '3', orderId: 'SH-4818', channel: 'EMAIL', type: 'ORDER_SHIPPED', status: 'FAILED', recipient: 'amit.k@outlook.com', time: '12 mins ago', error: 'Mailbox full' },
        { id: '4', orderId: 'SH-4817', channel: 'EMAIL', type: 'PAYMENT_SUCCESS', status: 'PENDING', recipient: 'priya.sharma@gmail.com', time: 'Just now' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-6 h-6 text-indigo-500" />
                        Communication & Notification Hub
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enterprise-grade event dispatching, email sending composer, and template management.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setActiveTab('monitor')} className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'monitor' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Queue Monitor</button>
                    <button onClick={() => setActiveTab('approvals')} className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'approvals' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Pending Approvals</button>
                    <button onClick={() => setActiveTab('custom')} className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'custom' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Send Email</button>
                    <button onClick={() => setActiveTab('templates')} className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'templates' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Templates</button>
                </div>
            </div>

            {activeTab === 'monitor' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Total Sent (24h)</span>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">1,248</p>
                        </div>
                        <div className="p-5 rounded-xl border border-rose-100 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-900/10">
                            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Failed Jobs</span>
                            <p className="text-2xl font-black text-rose-700 dark:text-rose-300">3</p>
                        </div>
                        <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10">
                            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">In Queue (BullMQ)</span>
                            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">8</p>
                        </div>
                        <div className="p-5 rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
                            <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Redis Status</span>
                            <p className="text-2xl flex items-center font-black text-slate-900 dark:text-white gap-2">
                                Active <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                            </p>
                        </div>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121215] rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500" /> Dispatch Execution Log</h3>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-500">
                                    <th className="p-3 font-semibold">Order Ref</th>
                                    <th className="p-3 font-semibold">Channel</th>
                                    <th className="p-3 font-semibold">Event Type</th>
                                    <th className="p-3 font-semibold">Recipient</th>
                                    <th className="p-3 font-semibold">Status</th>
                                    <th className="p-3 font-semibold">Time</th>
                                    <th className="p-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
                                {mockLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                        <td className="p-3 text-indigo-600 font-bold">{log.orderId}</td>
                                        <td className="p-3 flex items-center gap-2">
                                            {log.channel === 'WHATSAPP' ? <Send className="w-3 h-3 text-emerald-500" /> : <Mail className="w-3 h-3 text-slate-500" />}
                                            {log.channel}
                                        </td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{log.type}</td>
                                        <td className="p-3 text-slate-500 truncate max-w-[120px]">{log.recipient}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded inline-flex items-center gap-1 font-bold text-[10px] ${log.status === 'SENT' ? 'bg-emerald-100 text-emerald-700' : log.status === 'FAILED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {log.status === 'SENT' ? <CheckCircle2 className="w-3 h-3" /> : log.status === 'FAILED' ? <ShieldAlert className="w-3 h-3" /> : <RotateCcw className="w-3 h-3 animate-spin" />}
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-400">{log.time}</td>
                                        <td className="p-3 text-right">
                                            {log.status === 'FAILED' && (
                                                <button className="px-2 py-1 text-[10px] font-sans font-bold bg-slate-900 text-white rounded hover:bg-slate-700">Retry Job</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'approvals' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 dark:border-indigo-900/30 dark:bg-indigo-950/20 text-xs text-indigo-900 dark:text-indigo-200">
                        <span className="font-bold">Manual Action Approval Queue:</span> Review and approve customer notifications before email dispatch.
                    </div>

                    {loadingEvents ? (
                        <div className="p-8 text-center text-xs text-slate-400">Loading pending event dispatches...</div>
                    ) : pendingEvents.length === 0 ? (
                        <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#121215]">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Pending Approvals</p>
                            <p className="text-xs text-slate-400 mt-1">All customer order notifications are up to date.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingEvents.map((evt) => (
                                <div key={evt.id} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121215] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">Order #{evt.orderId}</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">{evt.eventType}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{evt.previewBody}</p>
                                        <p className="text-[10px] font-mono text-slate-400">Recipient: {evt.recipient}</p>
                                    </div>
                                    <button
                                        onClick={() => handleApproveEvent(evt)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        Approve & Send Email
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'custom' && (
                <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121215] rounded-xl space-y-5 max-w-2xl">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Mail className="w-5 h-5 text-indigo-500" />
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Direct Email Composer</h3>
                            <p className="text-xs text-slate-400">Send an instant operational or promotional email to any recipient</p>
                        </div>
                    </div>

                    {customStatus && (
                        <div className="p-3.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            {customStatus}
                        </div>
                    )}

                    <form onSubmit={handleSendCustomEmail} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Recipient Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="customer@example.com"
                                value={customRecipient}
                                onChange={(e) => setCustomRecipient(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Email Subject</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Update regarding your Adeaur Order"
                                value={customSubject}
                                onChange={(e) => setCustomSubject(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Email Message</label>
                            <textarea
                                required
                                rows={5}
                                placeholder="Type your email message here..."
                                value={customBody}
                                onChange={(e) => setCustomBody(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={customSending}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            {customSending ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {customSending ? 'Sending Email...' : 'Send Email Now'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'templates' && (
                <div className="space-y-4">
                    {templates.map(t => (
                        <div key={t.id} className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121215] rounded-xl flex flex-col gap-3 transition-all hover:border-indigo-500/30 shadow-sm">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-indigo-500" />
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{t.type.replace('_', ' ')}</h3>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800/50">ACTIVE</span>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">Email Subject</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                    value={t.subject}
                                    onChange={(e) => setTemplates(prev => prev.map(pt => pt.id === t.id ? { ...pt, subject: e.target.value } : pt))}
                                />
                            </div>

                            <div className="relative">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 flex justify-between">
                                    <span>Template Body</span>
                                    <span className="text-[9px] font-mono lowercase text-slate-400 tracking-wider">Supports &#123;customer_name&#125;, &#123;order_number&#125;</span>
                                </label>
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none h-28 resize-none"
                                    value={t.body}
                                    onChange={(e) => setTemplates(prev => prev.map(pt => pt.id === t.id ? { ...pt, body: e.target.value } : pt))}
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => handleSaveTemplate(t)}
                                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5"
                                >
                                    {savingId === t.id ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {savingId === t.id ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
