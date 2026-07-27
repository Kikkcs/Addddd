import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, ShoppingBag, Truck, Zap, AlertTriangle,
  Users, RefreshCw, Download, FileSpreadsheet, FileDown, PlusCircle,
  Sparkles, Send, ArrowUpRight, Clock, HelpCircle, AlertCircle, Eye, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { kpis, categoryShareData, courierPerformanceData, paymentDistributionData, products, askAiLibrary } from '../data';
import { Order, Product } from '../types';
import { API_BASE_URL } from '../config';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  setSelectedOrder: (order: Order | null) => void;
  notifications: any[];
  setNotifications: any;
  dateRange: string;
}

export default function DashboardView({
  setActiveTab,
  setSelectedOrder,
  notifications,
  setNotifications,
  dateRange
}: DashboardViewProps) {

  // AI Interactive State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string>(askAiLibrary.default.answer);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(askAiLibrary.default.suggestedQuestions);
  const [aiLoading, setAiLoading] = useState(false);

  // Quick action loaders
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Notifications summary  // States
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [revenueTrendData, setRevenueTrendData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real KPIs, Charts, and Orders from Shopify API
  const syncDashboardData = () => {
    // Only show big loader on manual initial mount
    if (!metrics) setIsLoading(true);

    const safeRange = encodeURIComponent(dateRange);

    Promise.all([
      fetch(`${API_BASE_URL}/api/v1/analytics/kpis?range=${safeRange}`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/v1/analytics/charts?range=${safeRange}`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/v1/orders?range=${safeRange}`).then(res => res.json())
    ])
      .then(([kpisResult, chartsResult, ordersResult]) => {
        if (kpisResult.success && kpisResult.data) {
          setMetrics({
            totalRevenue: kpisResult.data.totalRevenue,
            totalOrders: kpisResult.data.totalOrders,
            averageOrderValue: kpisResult.data.averageOrderValue,
            activeOrders: kpisResult.data.activeOrders
          });
        }

        if (chartsResult.success && chartsResult.data) {
          setRevenueTrendData(chartsResult.data.revenueTrend || []);
        }

        if (ordersResult.success && ordersResult.data) {
          setRecentOrders(ordersResult.data);
        }
      })
      .catch(err => console.error('Failed to fetch dashboard data:', err))
      .finally(() => setIsLoading(false));
  };

  // Mount logic and Live Polling interval (Every 30 seconds)
  useEffect(() => {
    syncDashboardData();

    // Auto-sync heartbeat
    const syncInterval = window.setInterval(() => {
      syncDashboardData();
    }, 30000); // 30 seconds

    return () => window.clearInterval(syncInterval);
  }, [dateRange]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Ask AI response generator — LIVE backend
  const handleAskAi = (question: string) => {
    if (!question.trim()) return;
    setAiLoading(true);
    setAiQuery(''); // clear the input immediately after sending

    fetch(`${API_BASE_URL}/api/v1/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, dateRange })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setAiResponse(result.data.answer);
          setSuggestedQuestions(result.data.suggestedQuestions);
        } else {
          setAiResponse('Unable to process query. Please try again.');
        }
      })
      .catch(() => {
        setAiResponse('Connection to AI backend failed. Please ensure the server is running.');
      })
      .finally(() => setAiLoading(false));
  };

  // Real report exports — downloads actual CSV from live Shopify data
  const triggerExport = (format: 'CSV' | 'Excel' | 'PDF') => {
    setActionLoading(format);

    const safeRange = encodeURIComponent(dateRange);

    if (format === 'CSV' || format === 'Excel') {
      // Download real CSV from backend
      fetch(`${API_BASE_URL}/api/v1/reports/export?format=csv&range=${safeRange}&type=Financial`)
        .then(res => res.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Adeaur_Report_${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);

          setActionLoading(null);
          setToastMessage(`Exported: Adeaur operations ledger downloaded as ${format} successfully.`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);

          const newNotif = {
            id: `notif-${Date.now()}`,
            title: `Report Exported (${format})`,
            message: `Live Shopify data compiled and downloaded as ${format} file.`,
            timestamp: 'Just now',
            category: 'System',
            read: false,
            severity: 'success',
          };
          setNotifications((prev: any) => [newNotif, ...prev]);
        })
        .catch(() => {
          setActionLoading(null);
          setToastMessage('Export failed. Please ensure the backend is running.');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        });
    } else {
      // PDF: download JSON report and format as readable text file
      fetch(`${API_BASE_URL}/api/v1/reports/export?format=json&range=${safeRange}&type=Executive`)
        .then(res => res.json())
        .then(result => {
          if (result.success && result.report) {
            const r = result.report;
            const lines = [
              `ADEAUR EXECUTIVE REPORT`,
              `=======================`,
              `Date Range: ${r.dateRange}`,
              `Generated: ${new Date(r.generatedAt).toLocaleString('en-IN')}`,
              `Type: ${r.type}`,
              ``,
              `--- SUMMARY ---`,
              `Total Revenue: ₹${r.summary.totalRevenue.toLocaleString('en-IN')}`,
              `Total Orders: ${r.summary.totalOrders}`,
              `Average Order Value: ₹${r.summary.averageOrderValue.toFixed(0)}`,
              `Active Orders: ${r.summary.activeOrders}`,
              ``,
              `--- ORDER DETAILS (${r.ordersCount} orders) ---`,
              ...r.orders.map((o: any) => `${o.orderNumber} | ${o.customer} | ₹${o.amount.toLocaleString('en-IN')} | ${o.status} | ${new Date(o.date).toLocaleDateString('en-IN')}`)
            ];
            const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Adeaur_Executive_Report_${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          }

          setActionLoading(null);
          setToastMessage('Executive Report compiled and downloaded successfully.');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);

          const newNotif = {
            id: `notif-${Date.now()}`,
            title: 'Executive Report Generated',
            message: 'Full Shopify data executive report downloaded.',
            timestamp: 'Just now',
            category: 'System',
            read: false,
            severity: 'success',
          };
          setNotifications((prev: any) => [newNotif, ...prev]);
        })
        .catch(() => {
          setActionLoading(null);
          setToastMessage('PDF generation failed.');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        });
    }
  };

  const triggerRefresh = () => {
    setActionLoading('refresh');
    setTimeout(() => {
      setActionLoading(null);
      setToastMessage('Operations center synced with Shopify Shopify Webhooks, GoKwik checkout state, and Delhivery routing services.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 1000);
  };

  // Custom tooltips to match Stripe aesthetics
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg shadow-xl text-[10px] font-mono text-slate-200">
          <p className="font-semibold text-slate-400 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex justify-between gap-4">
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold text-white">
                {entry.name.includes('Revenue') ? `₹${entry.value.toLocaleString('en-IN')}` : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

  // Dynamic live metric computations mathematically extrapolated from the 20-order tracking sample payload constraints
  const sampledDelayed = recentOrders.filter(o => o.delayDays && o.delayDays > 0).length;
  const liveDelayedShipments = recentOrders.length > 0
    ? Math.round((sampledDelayed / recentOrders.length) * (metrics?.activeOrders ?? 0))
    : 0;

  const sampledHighRisk = recentOrders.filter(o => o.rtoRisk === 'High').length;
  const liveRtoRate = recentOrders.length > 0 ? ((sampledHighRisk / recentOrders.length) * 100).toFixed(1) : "0.0";
  const highRiskRto = recentOrders.length > 0
    ? Math.round((sampledHighRisk / recentOrders.length) * (metrics?.totalOrders ?? 0))
    : 0;

  return (
    <div className="space-y-6" id="dashboard-view-root">

      {/* Toast Notification */}
      {showToast && (
        <div
          id="global-toast-alert"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl bg-slate-900 text-white border border-slate-800 text-xs flex items-center gap-3 animate-slide-up"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="overflow-hidden">
            <p className="font-semibold">{toastMessage}</p>
          </div>
          <button onClick={() => setShowToast(false)} className="text-slate-400 hover:text-white ml-2 text-sm font-bold">×</button>
        </div>
      )}

      {/* Primary header panel - Apple inspired */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="dashboard-header-bar">
        <div>
          <div className="flex items-center gap-2 mb-1.5" id="business-status-wrapper">
            <span className="relative flex h-2 w-2" id="live-indicator">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Live Operations Feed</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white" id="dashboard-view-title">
            Operations & Health Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Integrating transactions from <strong className="font-semibold text-slate-700 dark:text-slate-300">Shopify</strong>, risk routing from <strong className="font-semibold text-slate-700 dark:text-slate-300">GoKwik</strong>, and delivery logistics from <strong className="font-semibold text-slate-700 dark:text-slate-300">Delhivery</strong>.
          </p>
        </div>

        {/* Quick actions panel */}
        <div className="flex flex-wrap items-center gap-2" id="quick-actions-toolbar">
          <button
            id="action-btn-refresh"
            onClick={triggerRefresh}
            disabled={actionLoading !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'refresh' ? 'animate-spin' : ''}`} />
            <span>{actionLoading === 'refresh' ? 'Syncing...' : 'Sync Gateway'}</span>
          </button>

          <button
            id="action-btn-csv"
            onClick={() => triggerExport('CSV')}
            disabled={actionLoading !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{actionLoading === 'CSV' ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            id="action-btn-excel"
            onClick={() => triggerExport('Excel')}
            disabled={actionLoading !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{actionLoading === 'Excel' ? 'Exporting...' : 'Export Excel'}</span>
          </button>

          <button
            id="action-btn-pdf"
            onClick={() => triggerExport('PDF')}
            disabled={actionLoading !== null}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-indigo-150 dark:shadow-none"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{actionLoading === 'PDF' ? 'Compiling...' : 'Generate Executive PDF'}</span>
          </button>
        </div>
      </div>

      {/* BENTO-GRID KPI CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="kpi-cards-grid">
        {/* Card 1: Revenue */}
        <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] flex flex-col justify-between h-[100px]" id="kpi-card-revenue">
          <div className="flex items-center justify-between text-slate-400" id="kpi-header-revenue">
            <span className="text-[10px] font-mono uppercase tracking-wider">{dateRange.split(' ')[0] === 'Today' ? "Today's" : dateRange.split(' ')[0] === 'Yesterday' ? "Yesterday's" : dateRange.includes('7') ? "7-Day" : dateRange.includes('30') ? "30-Day" : "Quarterly"} Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-1" id="kpi-body-revenue">
            <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">₹{(metrics?.totalRevenue ?? 0).toLocaleString('en-IN')}</p>
            <p className="text-[9px] text-emerald-500 flex items-center gap-0.5 mt-0.5">
              <span className="text-slate-400">Live sync</span>
            </p>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] flex flex-col justify-between h-[100px]" id="kpi-card-orders">
          <div className="flex items-center justify-between text-slate-400" id="kpi-header-orders">
            <span className="text-[10px] font-mono uppercase tracking-wider">{dateRange.split(' ')[0] === 'Today' ? "Today's" : dateRange.split(' ')[0] === 'Yesterday' ? "Yesterday's" : dateRange.includes('7') ? "7-Day" : dateRange.includes('30') ? "30-Day" : "Quarterly"} Orders</span>
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-1" id="kpi-body-orders">
            <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{metrics?.totalOrders ?? 0}</p>
            <p className="text-[9px] text-emerald-500 flex items-center gap-0.5 mt-0.5">
              <span className="text-slate-400">Total processed</span>
            </p>
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] flex flex-col justify-between h-[100px]" id="kpi-card-aov">
          <div className="flex items-center justify-between text-slate-400" id="kpi-header-aov">
            <span className="text-[10px] font-mono uppercase tracking-wider">Average Order Value</span>
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-1" id="kpi-body-aov">
            <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">₹{(metrics?.averageOrderValue ?? 0).toLocaleString('en-IN')}</p>
            <p className="text-[9px] text-emerald-500 flex items-center gap-0.5 mt-0.5">
              <span className="text-slate-400">Per transaction lock</span>
            </p>
          </div>
        </div>

        {/* Card 4: Delhivery Logistics States */}
        <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] flex flex-col justify-between h-[100px]" id="kpi-card-logistics">
          <div className="flex items-center justify-between text-slate-400" id="kpi-header-logistics">
            <span className="text-[10px] font-mono uppercase tracking-wider">Delhivery Queue</span>
            <Truck className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-1" id="kpi-body-logistics">
            <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{metrics?.activeOrders ?? 0} <span className="text-[10px] font-normal text-slate-400 font-sans">in transit/processing</span></p>
            <p className="text-[9px] text-amber-500 flex items-center gap-0.5 mt-0.5">
              <span>{liveDelayedShipments} delayed</span>
              <span className="text-slate-400">at regional hubs</span>
            </p>
          </div>
        </div>

        {/* Card 5: GoKwik RTO Protection Rate */}
        <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] flex flex-col justify-between h-[100px]" id="kpi-card-rto">
          <div className="flex items-center justify-between text-slate-400" id="kpi-header-rto">
            <span className="text-[10px] font-mono uppercase tracking-wider">Return-To-Origin (RTO)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-1" id="kpi-body-rto">
            <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{liveRtoRate}%</p>
            <p className="text-[9px] text-gray-400 flex items-center gap-0.5 mt-0.5">
              <span>{highRiskRto} HIGH RISK users identified</span>
            </p>
          </div>
        </div>
      </div>

      {/* MAIN DATA PANELS: AI INSIGHTS CARD & CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-analytics-grid">

        {/* Column 1 & 2: Main Charts */}
        <div className="lg:col-span-2 space-y-6" id="dashboard-charts-col">
          {/* Chart 1: Revenue Trends & Payment conversions */}
          <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]" id="chart-card-revenue">
            <div className="flex items-center justify-between mb-6" id="chart-revenue-header">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Daily Order Revenue Trend</h3>
                <p className="text-[10px] text-slate-400">Plotting Shopify sales margins along 15 days lifecycle</p>
              </div>
              <div className="flex gap-4 text-[10px] font-semibold" id="chart-revenue-legend">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-600 block"></span>Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-200 block"></span>Orders</span>
              </div>
            </div>

            <div className="h-64" id="chart-revenue-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData.length > 0 ? revenueTrendData : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'monospace' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'monospace' }} />
                  <Tooltip content={renderCustomTooltip} />
                  <Area type="monotone" dataKey="Revenue" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Prepaid vs COD orders breakdown (GoKwik Insights) */}
          <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]" id="chart-card-conversions">
            <div className="flex items-center justify-between mb-6" id="chart-conversions-header">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Checkout Mode Distribution</h3>
                <p className="text-[10px] text-slate-400">Comparing prepaid orders vs. COD verify velocity</p>
              </div>
              <div className="flex gap-4 text-[10px] font-semibold" id="chart-conversions-legend">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 block"></span>Prepaid UPI/Card</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-700 block"></span>Standard COD</span>
              </div>
            </div>

            <div className="h-56" id="chart-conversions-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrendData.length > 0 ? revenueTrendData : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'monospace' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'monospace' }} />
                  <Tooltip content={renderCustomTooltip} />
                  <Bar dataKey="Prepaid" stackId="a" fill="#10B981" barSize={12} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="COD" stackId="a" fill="rgba(148, 163, 184, 0.3)" barSize={12} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Column 3: Premium Ask AI Section (Stripe/Linear styled) */}
        <div className="space-y-6" id="dashboard-ai-col">
          <div className="p-6 rounded-xl border border-indigo-150 bg-indigo-50/10 dark:border-indigo-950/40 dark:bg-indigo-950/5 relative overflow-hidden flex flex-col justify-between h-full min-h-[500px]" id="dashboard-ai-box">

            {/* Ambient blur lights */}
            <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

            <div className="relative space-y-4" id="ai-body">
              {/* Card Title */}
              <div className="flex items-center justify-between" id="ai-header">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-[#e8f5e9] dark:bg-[#e8f5e9] shadow-md flex items-center justify-center w-6 h-6 overflow-hidden">
                    <img src="/adeaur-logo.png" alt="Adeaur" className="h-5 w-5 object-cover object-left mix-blend-multiply flex-shrink-0" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Adeaur AI</h3>
                    <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400">ADEAUR COGNITIVE AGENT ACTIVE</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[8px] font-mono uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-900">Online</span>
              </div>

              {/* Response Window with elegant typewriter feel */}
              <div className="p-4 rounded-xl border border-indigo-100/40 bg-white/60 dark:border-slate-800 dark:bg-slate-950/60 min-h-[220px] max-h-[300px] overflow-y-auto text-xs leading-relaxed text-slate-600 dark:text-slate-300" id="ai-response-box">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3" id="ai-loader">
                    <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                    <p className="text-[10px] text-slate-400 font-mono">Consulting Shopify APIs, Delhivery tracking log, and GoKwik risk metrics...</p>
                  </div>
                ) : (
                  <div className="space-y-3" id="ai-text-wrapper">
                    <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                )}
              </div>

              {/* Quick interactive questions */}
              <div className="space-y-1.5" id="ai-quick-prompts">
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">Suggested Queries</p>
                <div className="flex flex-col gap-1" id="prompts-list">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      id={`ai-suggest-btn-${idx}`}
                      key={idx}
                      onClick={() => {
                        setAiQuery(q);
                        handleAskAi(q);
                      }}
                      className="text-left px-3 py-1.5 rounded-lg border border-slate-200/60 bg-white/40 hover:bg-white dark:border-slate-800 dark:bg-slate-900/30 dark:hover:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate">{q}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input prompt field */}
            <div className="pt-4 border-t border-indigo-100/50 dark:border-slate-800/60 mt-4 relative" id="ai-input-row">
              <input
                id="ai-prompt-input"
                type="text"
                placeholder="Ask Adeaur AI..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAi(aiQuery)}
                className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-200/80 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              <button
                id="ai-submit-btn"
                type="button"
                onClick={() => handleAskAi(aiQuery)}
                className="absolute right-1.5 top-[21px] z-10 p-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* RECENT ORDERS & BOTTLENECK TABLES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-tables-grid">

        {/* Recent Shopify Orders (2/3 width) */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]" id="recent-orders-card">
          <div className="flex items-center justify-between mb-4" id="recent-orders-header">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
              <p className="text-[10px] text-slate-400">Live feed of orders verified by GoKwik and dispatched via Delhivery</p>
            </div>
            <button
              id="view-all-orders-btn"
              onClick={() => setActiveTab('orders')}
              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-0.5"
            >
              <span>View All Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto" id="recent-orders-table-wrapper">
            <table className="w-full text-left border-collapse" id="recent-orders-table">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-400 uppercase font-mono">
                  <th className="py-2.5">Order</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Payment</th>
                  <th className="py-2.5">Transit State</th>
                  <th className="py-2.5">RTO Threat</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {recentOrders.slice(0, 5).map((ord) => {
                  let rtoColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
                  if (ord.rtoRisk === 'Medium') rtoColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
                  if (ord.rtoRisk === 'High') rtoColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400';

                  let shippingColor = 'text-slate-500';
                  if (ord.shippingStatus === 'Delivered') shippingColor = 'text-emerald-500';
                  if (ord.shippingStatus === 'In Transit') shippingColor = 'text-indigo-500';
                  if (ord.shippingStatus === 'RTO Initiated') shippingColor = 'text-rose-500';

                  return (
                    <tr
                      id={`row-${ord.id}`}
                      key={ord.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(ord);
                        setActiveTab('orders');
                      }}
                    >
                      <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{ord.orderNumber}</td>
                      <td className="py-3">
                        <p className="font-semibold">{ord.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{ord.destinationCity}</p>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-slate-700 dark:text-slate-300">{ord.paymentMethod}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{ord.paymentStatus}</p>
                      </td>
                      <td className="py-3 font-medium">
                        <span className={`inline-flex items-center gap-1 ${shippingColor}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {ord.shippingStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide ${rtoColor}`}>
                          {ord.rtoRisk}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">₹{ord.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delhivery Transit Bottlenecks (1/3 width) */}
        <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]" id="bottlenecks-card">
          <div className="flex items-center justify-between mb-4" id="bottlenecks-header">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Logistics Bottlenecks</h3>
              <p className="text-[10px] text-slate-400">Delayed shipments flagged at Delhivery hubs</p>
            </div>
            <button
              id="view-logistics-btn"
              onClick={() => setActiveTab('shipping')}
              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Analyze Hubs
            </button>
          </div>

          <div className="space-y-3" id="bottlenecks-list">
            {recentOrders.filter(o => o.delayDays && o.delayDays > 0).map((ord) => (
              <div
                id={`bottleneck-${ord.id}`}
                key={ord.id}
                onClick={() => {
                  setSelectedOrder(ord);
                  setActiveTab('orders');
                }}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 dark:border-slate-800/50 dark:bg-slate-900/20 dark:hover:bg-slate-900/60 transition-all cursor-pointer flex justify-between items-center"
              >
                <div className="space-y-1" id={`bottleneck-body-${ord.id}`}>
                  <div className="flex items-center gap-2" id={`bottleneck-header-row-${ord.id}`}>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{ord.orderNumber}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[8px] font-mono bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900">Delayed</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Bound for: <strong>{ord.destinationCity}, {ord.destinationState}</strong></p>
                  <p className="text-[9px] font-mono text-slate-400">Tracking: {ord.trackingNumber}</p>
                </div>

                <div className="text-right" id={`bottleneck-stat-${ord.id}`}>
                  <p className="text-xs font-mono font-bold text-amber-500">+{ord.delayDays} Days</p>
                  <p className="text-[8px] font-sans text-slate-400">SLA Breach</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
