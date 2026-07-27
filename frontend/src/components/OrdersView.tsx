import React, { useState, useEffect } from 'react';
import {
  Search, Filter, ShoppingBag, Truck, Check, AlertTriangle, ArrowLeft,
  MapPin, Calendar, Clock, Phone, Mail, User, ShieldCheck, RefreshCw, X,
  ExternalLink, ChevronRight, AlertCircle, Sparkles, Send
} from 'lucide-react';
import { Order } from '../types';

interface OrdersViewProps {
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  searchQuery: string;
  dateRange: string;
}

export default function OrdersView({
  selectedOrder,
  setSelectedOrder,
  searchQuery,
  dateRange
}: OrdersViewProps) {

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch true live orders from our Backend API connected to Shopify
  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:5000/api/v1/orders?range=${encodeURIComponent(dateRange)}`)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          const liveOrders = result.data.map((o: any) => ({
            id: o.id,
            orderNumber: String(o.orderNumber).startsWith('#') ? o.orderNumber : `#${o.orderNumber}`,
            customerName: o.customerName,
            customerEmail: o.customerEmail || 'synced.buyer@adeaur.com',
            date: o.date,
            amount: o.amount,
            status: 'Paid',
            paymentMethod: o.paymentMethod || 'Shopify / GoKwik',
            paymentStatus: o.paymentStatus || 'Paid',
            shippingStatus: o.shippingStatus || 'Processing',
            itemsCount: o.itemsCount || 1,
            courier: 'Delhivery',
            trackingNumber: o.trackingNumber || 'Processing',
            destinationCity: o.destinationCity || 'Unknown',
            destinationState: o.destinationState || '',
            rtoRisk: o.rtoRisk || 'Low',
            delayDays: o.delayDays || 0
          }));
          setOrders(liveOrders);
        }
      })
      .catch(err => console.error('Failed to fetch store orders:', err))
      .finally(() => setIsLoading(false));
  }, [dateRange]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [reallocating, setReallocating] = useState(false);
  const [reallocateSuccess, setReallocateSuccess] = useState(false);

  // Sync with global topbar search
  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  // Filters logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.destinationCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || o.shippingStatus === statusFilter;
    const matchesRisk = riskFilter === 'All' || o.rtoRisk === riskFilter;
    const matchesPayment = paymentFilter === 'All' || o.paymentMethod.includes(paymentFilter);

    return matchesSearch && matchesStatus && matchesRisk && matchesPayment;
  });

  // Reallocate Courier simulation
  const handleCourierReallocate = (id: string, newCourier: 'BlueDart' | 'Delhivery') => {
    setReallocating(true);
    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, courier: newCourier, trackingNumber: newCourier === 'BlueDart' ? `BD${Math.floor(10000000 + Math.random() * 90000000)}` : `DEL${Math.floor(10000000 + Math.random() * 90000000)}` } : o));

      // Update selected order view
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({
          ...selectedOrder,
          courier: newCourier,
          trackingNumber: newCourier === 'BlueDart' ? `BD${Math.floor(10000000 + Math.random() * 90000000)}` : `DEL${Math.floor(10000000 + Math.random() * 90000000)}`
        });
      }

      setReallocating(false);
      setReallocateSuccess(true);
      setTimeout(() => setReallocateSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="relative space-y-6" id="orders-view-root">

      {/* Title block */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5" id="orders-header">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Transaction Ledger & routing</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit Shopify checkout details, intercept COD RTO failures, and override carrier schedules.</p>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] flex flex-col md:flex-row justify-between gap-4 items-center" id="filter-panel">
        {/* Search inline */}
        <div className="relative w-full md:w-80" id="search-inline-wrapper">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="orders-search-input"
            type="text"
            placeholder="Filter order #, buyer, tracking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 transition-all"
          />
        </div>

        {/* Action drop selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end" id="filter-dropdowns">
          {/* Shipping filter */}
          <div className="flex items-center gap-1.5" id="filter-shipping-wrapper">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Transit</span>
            <select
              id="status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="RTO Initiated">RTO Initiated</option>
            </select>
          </div>

          {/* GoKwik Risk Filter */}
          <div className="flex items-center gap-1.5" id="filter-risk-wrapper">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">RTO Risk</span>
            <select
              id="risk-filter-select"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Risk Tiers</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          {/* Checkout Provider Filter */}
          <div className="flex items-center gap-1.5" id="filter-payment-wrapper">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Gateway</span>
            <select
              id="payment-filter-select"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Payments</option>
              <option value="GoKwik">GoKwik</option>
              <option value="Standard COD">Standard COD</option>
              <option value="Card">Cards/Prepaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* ORDERS LIST DATA-TABLE */}
      <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]" id="ledger-table-card">
        <div className="overflow-x-auto" id="ledger-table-wrapper">
          <table className="w-full text-left border-collapse" id="orders-ledger-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-400 uppercase font-mono">
                <th className="py-3">Order #</th>
                <th className="py-3">Customer Profile</th>
                <th className="py-3">Gateway & Method</th>
                <th className="py-3">Carrier / Tracking</th>
                <th className="py-3">Transit State</th>
                <th className="py-3">GoKwik RTO Score</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No orders match your active search filters. Try clearing constraints.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  let rtoColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
                  if (ord.rtoRisk === 'Medium') rtoColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
                  if (ord.rtoRisk === 'High') rtoColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400';

                  let shippingColor = 'text-slate-500';
                  if (ord.shippingStatus === 'Delivered') shippingColor = 'text-emerald-500';
                  if (ord.shippingStatus === 'In Transit') shippingColor = 'text-indigo-500';
                  if (ord.shippingStatus === 'RTO Initiated') shippingColor = 'text-rose-500';
                  if (ord.shippingStatus === 'Cancelled') shippingColor = 'text-slate-400 line-through';

                  return (
                    <tr
                      id={`ledger-row-${ord.id}`}
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${selectedOrder?.id === ord.id ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
                    >
                      <td className="py-3.5 font-mono font-bold text-slate-900 dark:text-white">{ord.orderNumber}</td>
                      <td className="py-3.5">
                        <p className="font-semibold">{ord.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{ord.destinationCity}, {ord.destinationState}</p>
                      </td>
                      <td className="py-3.5">
                        <p className="font-medium text-slate-700 dark:text-slate-300">{ord.paymentMethod}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{ord.paymentStatus}</p>
                      </td>
                      <td className="py-3.5">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{ord.courier}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-wider">{ord.trackingNumber}</p>
                      </td>
                      <td className="py-3.5 font-semibold">
                        <span className={`inline-flex items-center gap-1 ${shippingColor}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {ord.shippingStatus}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide ${rtoColor}`}>
                          {ord.rtoRisk}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">₹{ord.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL SIDE-DRAWER POPUP (Stripe / Apple aesthetic) */}
      {selectedOrder && (
        <>
          {/* Backdrop blur */}
          <div
            id="drawer-backdrop"
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[2px] transition-all"
          />

          <div
            id="drawer-panel"
            className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-white dark:bg-[#111113] border-l border-slate-200 dark:border-slate-800 z-50 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left p-6"
          >
            {/* Drawer Header */}
            <div className="space-y-4" id="drawer-header-section">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4" id="drawer-top-row">
                <div id="drawer-title-wrapper">
                  <div className="flex items-center gap-2" id="drawer-order-badge-row">
                    <span className="text-xs font-mono font-bold text-slate-400">Shopify Ledger</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-mono font-bold text-[10px]">{selectedOrder.orderNumber}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedOrder.customerName}</h2>
                </div>
                <button
                  id="drawer-close-btn"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Order quick statistics cards */}
              <div className="grid grid-cols-3 gap-3 text-xs" id="drawer-stats-grid">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40" id="stat-card-drawer-amt">
                  <span className="text-[9px] font-mono uppercase text-slate-400">Total Value</span>
                  <p className="font-bold font-mono text-slate-900 dark:text-white mt-1">₹{selectedOrder.amount.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40" id="stat-card-drawer-items">
                  <span className="text-[9px] font-mono uppercase text-slate-400">Cart size</span>
                  <p className="font-bold font-mono text-slate-900 dark:text-white mt-1">{selectedOrder.itemsCount} Items</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40" id="stat-card-drawer-date">
                  <span className="text-[9px] font-mono uppercase text-slate-400">Synced Date</span>
                  <p className="font-bold font-mono text-[10px] text-slate-900 dark:text-white mt-1">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Customer contact logs */}
              <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/10 space-y-3" id="customer-identity-card">
                <h4 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  Buyer Identity Logs
                </h4>
                <div className="space-y-2 text-xs" id="customer-logs-list">
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedOrder.customerEmail}</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91 98765 09182</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedOrder.destinationCity}, {selectedOrder.destinationState}</span>
                  </p>
                </div>
              </div>

              {/* GoKwik Risk Profiler */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/10 dark:border-indigo-950/20 dark:bg-indigo-950/5 space-y-2.5" id="gokwik-risk-panel">
                <div className="flex items-center justify-between" id="gokwik-risk-header">
                  <h4 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    GoKwik RTO Risk Audit
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold ${selectedOrder.rtoRisk === 'Low' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    selectedOrder.rtoRisk === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                      'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}>
                    {selectedOrder.rtoRisk} Risk Tier
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed" id="gokwik-risk-body">
                  {selectedOrder.rtoRisk === 'Low' ? (
                    <p>GoKwik Risk Engine reports a high-converting customer profile. User checkout verification was secured via <strong>1-click UPI profile match</strong>. Low historical cancellations recorded across delivery networks.</p>
                  ) : selectedOrder.rtoRisk === 'Medium' ? (
                    <p>GoKwik COD Verify triggered on this transaction. Customer verified checkout via <strong>automated SMS OTP code</strong>, but delivery location is flagged as a high-congestion hub with mild historical delivery failure rates.</p>
                  ) : (
                    <p className="text-rose-700 dark:text-rose-400 font-medium">Standard COD check failed. GoKwik algorithms recorded multiple cancellations (3+ in last 30 days) under this phone identity. Delivery address contains partial fields with high Return-to-Origin risk.</p>
                  )}
                </div>
              </div>

              {/* Delhivery Live Timeline Tracker */}
              <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/10 space-y-4" id="delhivery-timeline-panel">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2" id="delhivery-timeline-header">
                  <h4 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-indigo-500" />
                    Delhivery Logistics Timeline
                  </h4>
                  <span className="text-[9px] font-mono text-slate-400">{selectedOrder.courier} : {selectedOrder.trackingNumber}</span>
                </div>

                {/* Timeline points */}
                <div className="relative pl-5 space-y-5 text-xs text-slate-600 dark:text-slate-400" id="delhivery-timeline-steps">
                  {/* Connector line */}
                  <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-slate-150 dark:bg-slate-800" />

                  {/* Step 1 */}
                  <div className="relative" id="timeline-step-pickup">
                    <span className="absolute -left-[19px] h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950" />
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Package Picked Up from Warehouse</p>
                    <p className="text-[10px] text-slate-400">LuxuryFits Gurugram Hub, Haryana • Jul 16, 2026</p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative" id="timeline-step-gateway">
                    <span className={`absolute -left-[19px] h-2.5 w-2.5 rounded-full ring-4 ${selectedOrder.shippingStatus === 'Pending' ? 'bg-slate-300 ring-slate-100' : 'bg-emerald-500 ring-emerald-50 dark:ring-emerald-950'}`} />
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Arrived at Delhivery Bilaspur Gateway</p>
                    <p className="text-[10px] text-slate-400">Primary Sorting Center, Haryana • Jul 16, 2026</p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative" id="timeline-step-transit">
                    <span className={`absolute -left-[19px] h-2.5 w-2.5 rounded-full ring-4 ${selectedOrder.delayDays ? 'bg-amber-500 ring-amber-50 dark:ring-amber-950' :
                      selectedOrder.shippingStatus === 'Pending' || selectedOrder.shippingStatus === 'In Transit' ? 'bg-indigo-500 ring-indigo-50 dark:ring-indigo-950' :
                        'bg-emerald-500 ring-emerald-50 dark:ring-emerald-950'
                      }`} />
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Transit Processing Checkpoint</p>
                    {selectedOrder.delayDays ? (
                      <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Delayed at Varanasi Hub (Adverse Weather SLA Breach)
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400">Regional Distribution Hub • Today</p>
                    )}
                  </div>

                  {/* Step 4 */}
                  <div className="relative" id="timeline-step-out">
                    <span className={`absolute -left-[19px] h-2.5 w-2.5 rounded-full ring-4 ${selectedOrder.shippingStatus === 'Delivered' ? 'bg-emerald-500 ring-emerald-50 dark:ring-emerald-950' :
                      selectedOrder.shippingStatus === 'Out for Delivery' ? 'bg-indigo-500 ring-indigo-50 dark:ring-indigo-950' :
                        'bg-slate-300 ring-slate-100'
                      }`} />
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Out For Delivery</p>
                    <p className="text-[10px] text-slate-400">Destination Hub: {selectedOrder.destinationCity} • Just now</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action panel in Side-Drawer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 space-y-3" id="drawer-action-controls">
              {reallocateSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs flex items-center gap-2" id="reallocate-success-alert">
                  <Check className="w-4 h-4" />
                  <span>Logistics updated: Courier reallocated and new routing key assigned.</span>
                </div>
              )}

              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">Emergency Logistics Override</p>

              <div className="grid grid-cols-2 gap-3" id="override-actions-grid">
                {selectedOrder.courier !== 'BlueDart' ? (
                  <button
                    id="btn-override-bluedart"
                    disabled={reallocating}
                    onClick={() => handleCourierReallocate(selectedOrder.id, 'BlueDart')}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 font-semibold transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${reallocating ? 'animate-spin' : ''}`} />
                    <span>Reroute to BlueDart</span>
                  </button>
                ) : (
                  <button
                    id="btn-override-delhivery"
                    disabled={reallocating}
                    onClick={() => handleCourierReallocate(selectedOrder.id, 'Delhivery')}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 font-semibold transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${reallocating ? 'animate-spin' : ''}`} />
                    <span>Reroute to Delhivery</span>
                  </button>
                )}

                <button
                  id="btn-contact-buyer"
                  onClick={() => alert(`Initiating priority Email/SMS ping via GoKwik verification link to customer: ${selectedOrder.customerName} for address validation.`)}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Contact Buyer</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
