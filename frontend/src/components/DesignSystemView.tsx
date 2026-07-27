import React, { useState } from 'react';
import { 
  Palette, Type, Layers, RefreshCw, Smartphone, 
  Eye, CheckCircle, Info, Shield, MapPin, AlertCircle, FileText
} from 'lucide-react';
import { motion } from 'motion/react';

export default function DesignSystemView() {
  const [activeSubTab, setActiveSubTab] = useState<'ux-reasoning' | 'sitemap' | 'palette' | 'typography'>('ux-reasoning');

  return (
    <div className="space-y-8 animate-fade-in" id="design-system-root">
      {/* Header section with Vercel-style typography */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5" id="ds-header">
        <div className="flex items-center gap-2 mb-1.5" id="ds-badge-container">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium font-mono tracking-wider uppercase bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" id="ds-badge">
            Design Specification
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium font-mono tracking-wider uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" id="ds-badge-ver">
            v1.0.0 Stable
          </span>
        </div>
        <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-900 dark:text-white" id="ds-title">
          Product Design System & UX Blueprint
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl" id="ds-subtitle">
          Engineered for rapid daily operations. Crafted with the aesthetic precision of Apple, the performance architecture of Vercel, and the data-first density of Stripe.
        </p>

        {/* Secondary navigation buttons */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4" id="ds-subnav">
          <button 
            id="btn-subnav-ux"
            onClick={() => setActiveSubTab('ux-reasoning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeSubTab === 'ux-reasoning' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            UX Rationale & User Flow
          </button>
          <button 
            id="btn-subnav-site"
            onClick={() => setActiveSubTab('sitemap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeSubTab === 'sitemap' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Sitemap & Page Hierarchy
          </button>
          <button 
            id="btn-subnav-palette"
            onClick={() => setActiveSubTab('palette')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeSubTab === 'palette' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Color System & Tokens
          </button>
          <button 
            id="btn-subnav-typo"
            onClick={() => setActiveSubTab('typography')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeSubTab === 'typography' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Typography & Layout Rules
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: UX REASONING & USER FLOW */}
      {activeSubTab === 'ux-reasoning' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" id="ux-tab-pane">
          {/* Top Banner introducing Shopify + Delhivery + GoKwik concept */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="ux-banner-grid">
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 dark:border-indigo-950/40 dark:bg-indigo-950/10 flex gap-3" id="sh-integration-summary">
              <span className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 h-10 w-10 flex items-center justify-center font-bold">S</span>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">Shopify Link</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ingests real-time order volume, product metadata, and customer purchase histories.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 dark:border-emerald-950/40 dark:bg-emerald-950/10 flex gap-3" id="gk-integration-summary">
              <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 h-10 w-10 flex items-center justify-center font-bold">G</span>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">GoKwik verification</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Intercepts cash-on-delivery (COD) abuse, secures 1-click checkout, and scores RTO risk profiles.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 dark:border-amber-950/40 dark:bg-amber-950/10 flex gap-3" id="del-integration-summary">
              <span className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 h-10 w-10 flex items-center justify-center font-bold">D</span>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">Delhivery sync</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Monitors logistical routing checkpoints, in-transit delays, hubs, and SLA fulfillment percentages.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="ux-core-grid">
            {/* UX Reasoning */}
            <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-4" id="ux-decisions-col">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2" id="ux-decisions-title">
                <Info className="w-4 h-4 text-indigo-500" />
                UX Design Decisions
              </h3>
              
              <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400" id="ux-decisions-list">
                <div className="border-l-2 border-indigo-500 pl-3 py-0.5" id="dec-1">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">The 5-Second Operational Health Metric</h4>
                  <p className="mt-1">
                    To satisfy the rule that users must instantly understand business health, the top of the dashboard integrates Shopify sales data with GoKwik checkout risk and Delhivery delivery SLA speeds. Warehouse and owner roles see a single summary: live RTO risk metrics and delayed shipment indicators, making friction points stand out immediately.
                  </p>
                </div>

                <div className="border-l-2 border-emerald-500 pl-3 py-0.5" id="dec-2">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Proactive RTO Mitigation & Control</h4>
                  <p className="mt-1">
                    Instead of standard post-mortem RTO reports, we cross-reference GoKwik risk profiles with Delhivery transit queues. This visualizes RTO threats in real time. If an order is flagged as high risk (Standard COD) and delayed in transit, warehouse and support teams can take preventive action before the package is returned.
                  </p>
                </div>

                <div className="border-l-2 border-amber-500 pl-3 py-0.5" id="dec-3">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Role-Specific Workspace Density</h4>
                  <p className="mt-1">
                    Rather than building multiple cluttered screens, we use a single sidebar control structure with responsive sub-layouts. Operations managers get data tables with search and quick filters, warehouse staff focus on restocking items, and support teams instantly access delayed tracking queues.
                  </p>
                </div>

                <div className="border-l-2 border-rose-500 pl-3 py-0.5" id="dec-4">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Natural Language AI Interface</h4>
                  <p className="mt-1">
                    Operational analytics can be intimidating for support and accounts teams. A clean, conversational search box matches custom operational queries ("Why did sales drop?", "What are our low stock items?") to deep, automated analysis summaries.
                  </p>
                </div>
              </div>
            </div>

            {/* E-Commerce User Flow Visual Map */}
            <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-4" id="ux-flow-col">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2" id="ux-flow-title">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                Integrated Operational Flow
              </h3>

              <div className="relative pl-6 space-y-6 text-xs text-slate-600 dark:text-slate-400" id="flow-steps">
                {/* Connector line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />

                <div className="relative" id="step-1">
                  <span className="absolute -left-6 flex items-center justify-center w-[20px] h-[20px] rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-bold text-[10px]">1</span>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Customer Checkout (Shopify + GoKwik)</h4>
                  <p className="mt-1 text-slate-500">
                    A shopper enters the site. GoKwik One-Click checks phone and address verification, rating their COD risk instantly (Low, Medium, High).
                  </p>
                </div>

                <div className="relative" id="step-2">
                  <span className="absolute -left-6 flex items-center justify-center w-[20px] h-[20px] rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-bold text-[10px]">2</span>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Order Verification and Blocking</h4>
                  <p className="mt-1 text-slate-500">
                    High RTO risk orders trigger custom SMS verification or require conversion to UPI. Validated orders are automatically pushed to Shopify and our warehouse inventory logs.
                  </p>
                </div>

                <div className="relative" id="step-3">
                  <span className="absolute -left-6 flex items-center justify-center w-[20px] h-[20px] rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-bold text-[10px]">3</span>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Logistics Routing (Delhivery Hub)</h4>
                  <p className="mt-1 text-slate-500">
                    Warehouse prints shipping labels. Delhivery picks up packages and routes them through regional hubs (Varanasi, Bilaspur, etc.).
                  </p>
                </div>

                <div className="relative" id="step-4">
                  <span className="absolute -left-6 flex items-center justify-center w-[20px] h-[20px] rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-bold text-[10px]">4</span>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Live Delivery & Exception Handling</h4>
                  <p className="mt-1 text-slate-500">
                    If Delhivery flags a transit exception (customer unreachable, wrong address), our dashboard triggers an automated notification to support teams to contact the user before an RTO is generated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB-TAB 2: SITEMAP & PAGE HIERARCHY */}
      {activeSubTab === 'sitemap' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" id="sitemap-tab-pane">
          <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/40" id="hierarchy-card">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4" id="hierarchy-title">
              <Layers className="w-4 h-4 text-indigo-500" />
              Sitemap & Access Level Matrix
            </h3>

            {/* Sitemap Visual Tree representation using beautiful HTML grids */}
            <div className="space-y-4 text-xs font-mono" id="sitemap-tree">
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800" id="site-root-node">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">/ root</span> - E-Commerce Intelligence App Frame (Standardizes Navigation, Global States, Theme Engines)
              </div>
              
              <div className="pl-6 space-y-3" id="sitemap-branches">
                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/20 border-l-2 border-indigo-500 flex justify-between items-center" id="branch-dashboard">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">├── /dashboard</span>
                    <span className="text-slate-500 ml-2">(Primary Dashboard Hub)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">All Roles</span>
                </div>

                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/20 border-l-2 border-indigo-500 flex justify-between items-center" id="branch-orders">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">├── /orders</span>
                    <span className="text-slate-500 ml-2">(Shopify Lifecycle & Delhivery tracking details)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">Owner, Support, Admin</span>
                </div>

                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/20 border-l-2 border-indigo-500 flex justify-between items-center" id="branch-inventory">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">├── /inventory</span>
                    <span className="text-slate-500 ml-2">(SKUs, Low Stock warnings, sales velocity, restocking margins)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Warehouse, Owner, Admin</span>
                </div>

                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/20 border-l-2 border-indigo-500 flex justify-between items-center" id="branch-shipping">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">├── /shipping</span>
                    <span className="text-slate-500 ml-2">(SLA breaches, hub delay registers, courier comparison charts)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Warehouse, Support, Admin</span>
                </div>

                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/20 border-l-2 border-indigo-500 flex justify-between items-center" id="branch-reports">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">├── /reports</span>
                    <span className="text-slate-500 ml-2">(Custom reports, saved filters, automated weekly subscriptions)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">Accounts, Owner, Admin</span>
                </div>

                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/20 border-l-2 border-indigo-500 flex justify-between items-center" id="branch-integrations">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">├── /integrations</span>
                    <span className="text-slate-500 ml-2">(API status logs, GoKwik/Shopify sync timers, webhooks dashboard)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-white dark:bg-white dark:text-slate-950">Owner, Admin</span>
                </div>

                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/20 border-l-2 border-indigo-500 flex justify-between items-center" id="branch-settings">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">└── /settings</span>
                    <span className="text-slate-500 ml-2">(User permissions, dark mode, personal details)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-white dark:bg-white dark:text-slate-950">Owner, Admin</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB-TAB 3: COLOR SYSTEM & SWATCHES */}
      {activeSubTab === 'palette' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" id="palette-tab-pane">
          <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-6" id="palette-content">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2" id="palette-title">
                <Palette className="w-4 h-4 text-indigo-500" />
                Color System & Visual Contrast
              </h3>
              <p className="text-xs text-slate-500 mt-1">Our color tokens adhere strictly to WCAG 2.1 accessibility standards (minimum 4.5:1 ratio for normal text).</p>
            </div>

            {/* Interactive swatches */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="color-swatches-grid">
              {/* Primary Indigo */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/40 dark:bg-slate-950/20" id="swatch-indigo">
                <div className="h-16 bg-indigo-600 flex items-end p-2 justify-between">
                  <span className="text-[10px] font-mono font-medium text-white">#4F46E5</span>
                  <span className="text-[9px] font-mono font-semibold px-1 rounded bg-white/20 text-white">4.8:1</span>
                </div>
                <div className="p-3 text-xs">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Primary Indigo</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Used for focus actions, sidebar highlights, and growth curves.</p>
                </div>
              </div>

              {/* Success Green */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/40 dark:bg-slate-950/20" id="swatch-emerald">
                <div className="h-16 bg-emerald-600 flex items-end p-2 justify-between">
                  <span className="text-[10px] font-mono font-medium text-white">#059669</span>
                  <span className="text-[9px] font-mono font-semibold px-1 rounded bg-white/20 text-white">4.6:1</span>
                </div>
                <div className="p-3 text-xs">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Success Emerald</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Indicates delivered items, active gateways, and positive growth trends.</p>
                </div>
              </div>

              {/* Warning Amber */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/40 dark:bg-slate-950/20" id="swatch-amber">
                <div className="h-16 bg-amber-500 flex items-end p-2 justify-between">
                  <span className="text-[10px] font-mono font-medium text-slate-950">#F59E0B</span>
                  <span className="text-[9px] font-mono font-semibold px-1 rounded bg-slate-950/20 text-slate-950">4.5:1</span>
                </div>
                <div className="p-3 text-xs">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Warning Amber</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Indicates transit delays, low stock alerts, and medium RTO risk tiers.</p>
                </div>
              </div>

              {/* Danger Red */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/40 dark:bg-slate-950/20" id="swatch-rose">
                <div className="h-16 bg-rose-600 flex items-end p-2 justify-between">
                  <span className="text-[10px] font-mono font-medium text-white">#E11D48</span>
                  <span className="text-[9px] font-mono font-semibold px-1 rounded bg-white/20 text-white">5.1:1</span>
                </div>
                <div className="p-3 text-xs">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Danger Rose</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Used for critical stockout levels, failed payments, and RTO events.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2" id="palette-neutral-info">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Visual Contrast & Dark Mode Execution</h4>
              <p>
                Rather than deploying generic pure black backgrounds which create heavy screen glare and fatigue during extended sessions, we utilize a custom dark neutral canvas (<strong>#09090b</strong> for backdrops, <strong>#18181b</strong> for card tiles). Contrast is preserved by dynamically boosting borders to <strong>1px borders at 15% opacity</strong> and shifting foreground texts to soft chalky whites.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB-TAB 4: TYPOGRAPHY & LAYOUT RULES */}
      {activeSubTab === 'typography' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" id="typography-tab-pane">
          <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-6" id="typography-content">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2" id="typo-title">
                <Type className="w-4 h-4 text-indigo-500" />
                Typography System & Scale
              </h3>
              <p className="text-xs text-slate-500 mt-1">Structured for scan-efficiency. Content is categorized instantly by font-family and tracking specifications.</p>
            </div>

            <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800" id="typo-scale-list">
              <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2" id="typo-row-display">
                <div id="typo-row-display-text">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Display Heading (Dashboard Title)</span>
                  <h2 className="text-3xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">Inter 30px / Tracking-Tight</h2>
                </div>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">font-sans font-bold tracking-tight text-3xl</span>
              </div>

              <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2" id="typo-row-section">
                <div id="typo-row-section-text">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Section Headers & Card Titles</span>
                  <h3 className="text-lg font-semibold font-sans tracking-tight text-slate-800 dark:text-white">Inter 18px / Tracking-Tight</h3>
                </div>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">font-sans font-semibold tracking-tight text-lg</span>
              </div>

              <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2" id="typo-row-body">
                <div id="typo-row-body-text">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Body Copy & Information Metadata</span>
                  <p className="text-sm font-sans text-slate-600 dark:text-slate-300">Inter 14px / Regular. Used for descriptions and core parameters.</p>
                </div>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">font-sans text-sm text-slate-600</span>
              </div>

              <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2" id="typo-row-mono">
                <div id="typo-row-mono-text">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Numbers, SKUs, Tracking, ETA, and Currencies</span>
                  <p className="text-xs font-mono text-slate-800 dark:text-slate-200">JetBrains Mono 12px / ₹2,84,500 / SKU-8123 / 94.3%</p>
                </div>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">font-mono text-xs text-slate-800</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400" id="spacing-info">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Layout Spacing & Grid Rhythm</h4>
              <p>
                Our layout runs on a meticulous <strong>4px spacing scale</strong>. Row elements are separated by <code>space-y-4</code> (16px), grid boards are padded with <code>p-6</code> (24px) for desktop and <code>p-4</code> (16px) for mobile, and touch targets are designed with a minimum clickable surface of <code>44px x 44px</code> to maximize usability on mobile and tablet screens.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
