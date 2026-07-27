import React, { useState } from 'react';
import { 
  Zap, CheckCircle, RefreshCw, Layers, Box, Terminal, Play, Save, 
  ExternalLink, Key, ShieldCheck, AlertCircle, Sparkles, X, Plus
} from 'lucide-react';
import { integrations } from '../data';
import { Integration } from '../types';

export default function IntegrationsView() {
  const [integrationsList, setIntegrationsList] = useState<Integration[]>(integrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  
  // Credentials edit form states
  const [apiKey, setApiKey] = useState('**************************************');
  const [apiSecret, setApiSecret] = useState('**************************************');
  const [webhookUrl, setWebhookUrl] = useState('https://luxuryfits.co/api/v1/handshake');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync animation loader
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleManualSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      setIntegrationsList(prev => prev.map(int => int.id === id ? { ...int, lastSync: 'Just now', status: 'Connected' } : int));
    }, 1500);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSelectedIntegration(null);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="integrations-view-root">
      
      {/* Title Block */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5" id="integrations-header">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">API Integrations & Sync</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage secure API handshakes, monitor webhook listeners, and configure unified e-commerce data streams.</p>
      </div>

      {/* CORE ACTIVE INTEGRATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="integrations-cards-grid">
        {integrationsList.map((int) => {
          const isConnected = int.status === 'Connected';
          const isSyncing = syncingId === int.id;

          return (
            <div 
              id={`int-card-${int.id}`}
              key={int.id} 
              className="p-5 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] flex flex-col justify-between h-[220px] hover:border-indigo-100 dark:hover:border-slate-700 hover:shadow-sm transition-all"
            >
              <div className="space-y-3" id={`int-card-body-${int.id}`}>
                {/* Card Top */}
                <div className="flex items-start justify-between" id={`int-card-header-${int.id}`}>
                  <div className="flex items-center gap-3" id={`int-logo-title-${int.id}`}>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">
                      {int.provider[0]}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{int.name}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">{int.provider}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                    isConnected ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {isConnected ? 'Active' : 'Offline'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-3">{int.description}</p>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/40 pt-3" id={`int-card-actions-${int.id}`}>
                <span className="text-[9px] font-mono text-slate-400">Last sync: {int.lastSync}</span>
                
                <div className="flex gap-2" id={`int-btn-row-${int.id}`}>
                  <button
                    id={`btn-configure-int-${int.id}`}
                    onClick={() => setSelectedIntegration(int)}
                    className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[10px] text-slate-600 font-semibold transition-all dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    Configure Keys
                  </button>
                  {isConnected && (
                    <button
                      id={`btn-sync-int-${int.id}`}
                      disabled={isSyncing}
                      onClick={() => handleManualSync(int.id)}
                      className="px-2.5 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* WEBHOOK LISTENERS LOG TABLE */}
      <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] space-y-4" id="webhooks-log-card">
        <div id="webhooks-log-header">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500" />
            Active Webhook Event Stream
          </h3>
          <p className="text-[10px] text-slate-400">Handshake listeners polling real-time payload updates from connected systems</p>
        </div>

        <div className="overflow-x-auto" id="webhooks-table-wrapper">
          <table className="w-full text-left border-collapse" id="webhooks-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-400 uppercase font-mono">
                <th className="py-2.5">Gateway Scope</th>
                <th className="py-2.5">Endpoint Listener</th>
                <th className="py-2.5">Subscribed Event Trigger</th>
                <th className="py-2.5 text-right">HTTP Handshake Response</th>
                <th className="py-2.5 text-right">Status Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">Shopify API</td>
                <td className="py-3 text-slate-500">/api/v1/shopify/orders-create</td>
                <td className="py-3 text-slate-500">orders/create (Order Placed)</td>
                <td className="py-3 text-right text-emerald-500">200 OK • Payload Parsed</td>
                <td className="py-3 text-right font-bold text-emerald-500">200</td>
              </tr>
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">GoKwik verification</td>
                <td className="py-3 text-slate-500">/api/v1/gokwik/checkout-verify</td>
                <td className="py-3 text-slate-500">checkout/verify (RTO Prediction)</td>
                <td className="py-3 text-right text-emerald-500">200 OK • Risk Scored</td>
                <td className="py-3 text-right font-bold text-emerald-500">200</td>
              </tr>
              <tr className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">Delhivery Unified</td>
                <td className="py-3 text-slate-500">/api/v1/delhivery/tracking-sync</td>
                <td className="py-3 text-slate-500">tracking/update (Transit Event)</td>
                <td className="py-3 text-right text-emerald-500">200 OK • Hub Logged</td>
                <td className="py-3 text-right font-bold text-emerald-500">200</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SETUP CREDENTIALS DRAWER DIALOG (Mock layout) */}
      {selectedIntegration && (
        <>
          <div className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[2px]" onClick={() => setSelectedIntegration(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#111113] border border-slate-200 dark:border-slate-800 rounded-xl p-6 z-50 shadow-2xl animate-scale-up" id="credentials-dialog">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4" id="dialog-header">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-indigo-500" />
                Configure: {selectedIntegration.name}
              </h3>
              <button onClick={() => setSelectedIntegration(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            {saveSuccess ? (
              <div className="p-4 text-center space-y-3" id="dialog-success">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold">API Handshake Success!</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">External credentials validated and secure token generated. Sync status set to Active.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveCredentials} className="space-y-4" id="dialog-form">
                <div className="space-y-1.5" id="field-api-key">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Production API Client Key</label>
                  <input
                    id="dialog-api-key-input"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  />
                </div>

                <div className="space-y-1.5" id="field-api-secret">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Client Private Secret Token</label>
                  <input
                    id="dialog-api-secret-input"
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  />
                </div>

                <div className="space-y-1.5" id="field-webhook-url">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Unified Webhook Handshake Target</label>
                  <input
                    id="dialog-webhook-input"
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  />
                </div>

                <button
                  id="dialog-save-credentials-btn"
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Gateway Token...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Verify and Connect Handshake</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </>
      )}

    </div>
  );
}
