import React, { useState, useEffect } from 'react';
import {
  Plus, AlertTriangle, ArrowDownRight, Package, RefreshCw, Sparkles,
  Search, CheckCircle, ShoppingBag, BarChart3, AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { inventoryTrendData } from '../data';
import { Product } from '../types';
import { API_BASE_URL } from '../config';

export default function InventoryView() {
  const [skuCatalog, setSkuCatalog] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/products`)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setSkuCatalog(result.data);
        }
      })
      .catch(err => console.error('Failed to fetch live products:', err));
  }, []);

  // Simulated PO triggers
  const [poLoading, setPoLoading] = useState<string | null>(null);
  const [poSuccess, setPoSuccess] = useState<string | null>(null);

  const handleRestockPo = (sku: string) => {
    setPoLoading(sku);
    setTimeout(() => {
      // Simulate restocking catalog
      setSkuCatalog(prev => prev.map(p => {
        if (p.sku === sku) {
          return { ...p, stock: p.stock + 100, status: 'In Stock' };
        }
        return p;
      }));
      setPoLoading(null);
      setPoSuccess(sku);
      setTimeout(() => setPoSuccess(null), 3500);
    }, 1200);
  };

  const filteredCatalog = skuCatalog.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Low Stock' && p.stock <= p.threshold && p.stock > 0) ||
      (statusFilter === 'OutOfStock' && p.stock === 0) ||
      (statusFilter === 'In Stock' && p.stock > p.threshold);
    return matchesSearch && matchesStatus;
  });

  const lowStockCount = skuCatalog.filter(p => p.stock <= p.threshold).length;

  return (
    <div className="space-y-6 animate-fade-in" id="inventory-view-root">

      {/* Title block */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5" id="inventory-header">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">SKU Catalog & Replenishment</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit Shopify stock levels, cross-reference sales velocities, and compile reorder Purchase Orders (POs).</p>
      </div>

      {/* TOP SUMMARY FLAGS - Low Stock Warn */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/20 dark:border-rose-950/40 dark:bg-rose-950/10 flex items-start gap-3" id="low-stock-banner">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1" id="low-stock-banner-body">
            <h4 className="text-xs font-bold text-slate-900 dark:text-rose-400">Critical Reorder Threshold Slipped</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              We detected <strong className="font-semibold text-rose-600 dark:text-rose-400">{lowStockCount} items</strong> breaching safety margins based on high sales velocity in the last 30 days. Stockouts predicted in 12-36 hours.
            </p>
          </div>
        </div>
      )}

      {/* RECHARTS INVENTORY TRENDS GRAPH */}
      <div className="grid grid-cols-1 gap-6" id="inventory-charts-grid">
        <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]" id="inventory-trend-card">
          <div className="flex items-center justify-between mb-6" id="inventory-trend-header">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">6-Month Stock Trend (Shopify Feed)</h3>
              <p className="text-[10px] text-slate-400 font-sans">Visualizing aggregate storage capacities vs. active warning alerts</p>
            </div>
            <div className="flex gap-4 text-[10px] font-semibold" id="inventory-trend-legend">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-600 block"></span>In-Stock Units</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500 block"></span>Warnings Active</span>
            </div>
          </div>

          <div className="h-56" id="inventory-trend-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inventoryTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'monospace' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ fontSize: '10px', background: '#0f172a', border: 'none', borderRadius: '6px', color: '#fff' }} />
                <Line type="monotone" dataKey="InStock" name="In-Stock" stroke="#4F46E5" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="LowStock" name="Warnings" stroke="#F43F5E" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] flex flex-col sm:flex-row justify-between gap-4 items-center" id="inventory-filters">
        <div className="relative w-full sm:w-80" id="inventory-search-wrapper">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="inventory-search-input"
            type="text"
            placeholder="Search catalog by product name, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 transition-all"
          />
        </div>

        <div className="flex items-center gap-2" id="inventory-filter-select-wrapper">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Status</span>
          <select
            id="inventory-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Stocks</option>
            <option value="In Stock">In Stock Only</option>
            <option value="Low Stock">Low Stock Warning</option>
            <option value="OutOfStock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* SKU INVENTORY CATALOG TABLE */}
      <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]" id="catalog-card">
        <div className="overflow-x-auto" id="catalog-table-wrapper">
          <table className="w-full text-left border-collapse" id="inventory-catalog-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-400 uppercase font-mono">
                <th className="py-3">SKU Identifier</th>
                <th className="py-3">Product Title</th>
                <th className="py-3">Category</th>
                <th className="py-3 text-right">Shopify Retail (INR)</th>
                <th className="py-3 text-right">Available Storage</th>
                <th className="py-3 text-right">Reorder safety</th>
                <th className="py-3 text-right">30-Day Velocity</th>
                <th className="py-3 text-right">Action PO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredCatalog.map((prod) => {
                const isOutOfStock = prod.stock === 0;
                const isLowStock = prod.stock <= prod.threshold && prod.stock > 0;

                let stockColor = 'text-slate-950 dark:text-white font-semibold';
                let alertBadge = null;

                if (isOutOfStock) {
                  stockColor = 'text-rose-600 dark:text-rose-400 font-bold';
                  alertBadge = <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 text-[8px] font-bold font-mono">STOCKOUT</span>;
                } else if (isLowStock) {
                  stockColor = 'text-amber-500 dark:text-amber-400 font-bold';
                  alertBadge = <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-[8px] font-bold font-mono">LOW SAFETY</span>;
                }

                return (
                  <tr id={`prod-row-${prod.id}`} key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 font-mono font-bold text-slate-900 dark:text-white">{prod.sku}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2" id={`prod-title-col-${prod.id}`}>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{prod.name}</span>
                        {alertBadge}
                      </div>
                    </td>
                    <td className="py-4 text-slate-500">{prod.category}</td>
                    <td className="py-4 text-right font-mono font-semibold">₹{prod.price.toLocaleString('en-IN')}</td>
                    <td className="py-4 text-right font-mono font-semibold">
                      <span className={stockColor}>{prod.stock} Units</span>
                    </td>
                    <td className="py-4 text-right font-mono text-slate-400">{prod.threshold} Units</td>
                    <td className="py-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">{prod.sales30Days} Orders</td>
                    <td className="py-4 text-right">
                      {poSuccess === prod.sku ? (
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center justify-end gap-1" id={`po-success-${prod.sku}`}>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>PO Submitted (+100)</span>
                        </span>
                      ) : (
                        <button
                          id={`btn-reorder-${prod.sku.toLowerCase()}`}
                          disabled={poLoading !== null}
                          onClick={() => handleRestockPo(prod.sku)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${isOutOfStock || isLowStock
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                            : 'border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                            }`}
                        >
                          {poLoading === prod.sku ? 'Submitting PO...' : 'Reorder +100'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
