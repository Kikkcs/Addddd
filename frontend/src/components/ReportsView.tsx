import React, { useState } from 'react';
import {
  FileText, Calendar, Plus, Download, Mail, Clock, RefreshCw, CheckCircle,
  Sparkles, Filter, ChevronRight, FileSpreadsheet, Eye, Play
} from 'lucide-react';
import { savedReports } from '../data';
import { SavedReport } from '../types';

export default function ReportsView() {
  const [reportsList, setReportsList] = useState<SavedReport[]>(savedReports);

  // Custom builder states
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState<'Financial' | 'Logistics' | 'Sales' | 'AI Forecast'>('Financial');
  const [reportFreq, setReportFreq] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Ad-hoc'>('Weekly');
  const [building, setBuilding] = useState(false);
  const [buildSuccess, setBuildSuccess] = useState(false);

  const handleBuildReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportName.trim()) return;

    setBuilding(true);
    setTimeout(() => {
      const newReport: SavedReport = {
        id: `rep-${Date.now()}`,
        name: reportName,
        description: `Custom generated ${reportType.toLowerCase()} report consolidating cross-referenced metrics.`,
        createdOn: new Date().toISOString().split('T')[0],
        createdBy: 'Owner (Sumit)',
        type: reportType,
        frequency: reportFreq
      };

      setReportsList(prev => [newReport, ...prev]);
      setBuilding(false);
      setBuildSuccess(true);
      setReportName('');
      setTimeout(() => setBuildSuccess(false), 3500);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="reports-view-root">

      {/* Title Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5" id="reports-header">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Business Intelligence Reports</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generate deep executive reports cross-referencing logistical velocities against merchant revenue streams.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="reports-body-grid">

        {/* Left Side: Dynamic Report Builder */}
        <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]" id="report-builder-card">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Custom Ledger compiler
          </h3>

          {buildSuccess && (
            <div className="p-3 mb-4 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs flex items-center gap-2" id="build-success-alert">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Report compiled successfully and appended to saved archives ledger!</span>
            </div>
          )}

          <form onSubmit={handleBuildReport} className="space-y-4" id="report-builder-form">
            <div className="space-y-1.5" id="form-field-name">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold" htmlFor="report-name-input">Report File Name</label>
              <input
                id="report-name-input"
                type="text"
                required
                placeholder="e.g., Delhivery SLA Breach Matrix Q3"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4" id="form-row-selectors">
              <div className="space-y-1.5" id="form-field-type">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Data Scope</label>
                <select
                  id="report-type-select"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:outline-none"
                >
                  <option value="Financial">Financial (Shopify)</option>
                  <option value="Logistics">Logistics (Delhivery)</option>
                  <option value="Sales">Sales Catalog</option>
                  <option value="AI Forecast">AI RTO Forecast</option>
                </select>
              </div>

              <div className="space-y-1.5" id="form-field-freq">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Frequency</label>
                <select
                  id="report-freq-select"
                  value={reportFreq}
                  onChange={(e) => setReportFreq(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:outline-none"
                >
                  <option value="Ad-hoc">Ad-hoc (Single Build)</option>
                  <option value="Daily">Daily Auto-Mail</option>
                  <option value="Weekly">Weekly Auto-Mail</option>
                  <option value="Monthly">Monthly Auto-Mail</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 leading-normal" id="compiler-info-box">
              This action will request live webhook handshakes from Shopify API logs, cross-compile Delhivery regional tracking checkpoints, and run GoKwik machine-learning algorithms to audit overall RTO risks.
            </div>

            <button
              id="submit-build-report-btn"
              type="submit"
              disabled={building}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-indigo-100"
            >
              {building ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Cross-Compiling Ledger...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Compile Report Ledger</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Saved Reports ledger (2/3 width) */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] space-y-4" id="saved-reports-card">
          <div id="saved-reports-header">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Saved & Scheduled Reports Archives</h3>
            <p className="text-[10px] text-slate-400">Pre-computed audits and running automated subscriptions ledger</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800" id="reports-ledger-list">
            {reportsList.map((rep) => {
              let typeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
              if (rep.type === 'AI Forecast') typeColor = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400';
              if (rep.type === 'Logistics') typeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
              if (rep.type === 'Sales') typeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';

              return (
                <div id={`report-item-${rep.id}`} key={rep.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 px-2 rounded transition-colors">
                  <div className="space-y-1 overflow-hidden max-w-lg" id={`report-item-body-${rep.id}`}>
                    <div className="flex items-center gap-2" id={`report-item-badges-${rep.id}`}>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">{rep.name}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[8px] font-mono font-medium uppercase shrink-0 ${typeColor}`}>{rep.type}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal break-words">{rep.description}</p>
                    <p className="text-[9px] font-mono text-slate-400">
                      Created on: <strong>{rep.createdOn}</strong> by <strong>{rep.createdBy}</strong> • Frequency: <strong className="text-indigo-600 dark:text-indigo-400">{rep.frequency}</strong>
                    </p>
                  </div>

                  <button
                    id={`btn-download-report-${rep.id}`}
                    onClick={() => {
                      fetch(`http://localhost:5000/api/v1/reports/export?format=csv&range=Last%2030%20Days&type=${rep.type}`)
                        .then(res => res.blob())
                        .then(blob => {
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${rep.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        })
                        .catch(() => alert('Download failed. Please ensure the backend server is running.'));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] text-slate-600 font-semibold transition-all dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
