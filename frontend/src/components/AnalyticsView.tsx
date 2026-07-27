import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config';
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';

interface AnalyticsViewProps {
    COLORS: string[];
    renderPieTooltip: any;
    paymentDistributionData: any[];
    dateRange: string;
}

interface CategoryData {
    name: string;
    value: number;
}

export default function AnalyticsView({ COLORS, renderPieTooltip, paymentDistributionData, dateRange }: AnalyticsViewProps) {
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);

    const syncAnalyticsData = () => {
        if (!metrics) setLoading(true);

        const safeRange = encodeURIComponent(dateRange);

        Promise.all([
            fetch(`${API_BASE_URL}/api/v1/products`).then(r => r.json()),
            fetch(`${API_BASE_URL}/api/v1/analytics/kpis?range=${safeRange}`).then(r => r.json())
        ])
            .then(([productsResult, kpisResult]) => {
                // Build category distribution from live products
                if (productsResult.success && productsResult.data) {
                    const catMap: Record<string, number> = {};
                    productsResult.data.forEach((p: any) => {
                        const cat = p.product_type || p.productType || 'Uncategorized';
                        const price = parseFloat(p.variants?.[0]?.price || '0');
                        const qty = p.variants?.[0]?.inventory_quantity || 0;
                        catMap[cat] = (catMap[cat] || 0) + (price * Math.max(qty, 1));
                    });

                    let sorted = Object.entries(catMap)
                        .map(([name, value]) => ({ name: name || 'Other', value: Math.round(value) }))
                        .sort((a, b) => b.value - a.value);

                    setCategoryData(sorted.slice(0, 6));
                }

                if (kpisResult.success && kpisResult.data) {
                    setMetrics(kpisResult.data);
                }
            })
            .catch(err => console.error('Analytics data fetch failed:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        syncAnalyticsData();

        const syncInterval = window.setInterval(() => {
            syncAnalyticsData();
        }, 30000);

        return () => window.clearInterval(syncInterval);
    }, [dateRange]);

    const prepaidPercent = metrics ? ((metrics.totalOrders > 0 ? ((metrics.totalOrders - (metrics.activeOrders || 0)) / metrics.totalOrders) * 100 : 0)).toFixed(1) : '—';

    return (
        <div className="space-y-6 animate-fade-in" id="analytics-view-root">
            {/* Analytics Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5" id="analytics-header">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Deeper Analytics & Shares</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cross-reference payment modes, courier SLA breach schedules, and Shopify product categories — all from live data.</p>
            </div>

            {/* Analytics Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="analytics-kpis">
                <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Revenue (30 Days)</span>
                    <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                        {metrics ? `₹${metrics.totalRevenue.toLocaleString('en-IN')}` : '—'}
                    </p>
                    <p className="text-[9px] text-emerald-500 mt-0.5">Live from Shopify</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Fulfillment Rate</span>
                    <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{prepaidPercent}%</p>
                    <p className="text-[9px] text-indigo-500 mt-0.5">Fulfilled vs total orders</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Active Product Categories</span>
                    <p className="text-xl font-bold font-mono text-emerald-500 mt-1">{categoryData.length}</p>
                    <p className="text-[9px] text-emerald-500 mt-0.5">Distinct product types in Shopify</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                    <span className="ml-3 text-xs text-slate-400">Loading live analytics data...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="analytics-charts">
                    {/* Chart 1: Payments Share */}
                    <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]">
                        <div className="mb-4">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">GoKwik Checkout Mode & Payout Shares</h3>
                            <p className="text-[10px] text-slate-400">Distribution of prepaid UPI checkouts vs. COD verifications</p>
                        </div>
                        <div className="h-60 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="w-full sm:w-1/2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip content={renderPieTooltip} />
                                        <Pie
                                            data={paymentDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {paymentDistributionData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full sm:w-1/2 space-y-2 font-mono text-[10px]" id="pie-legend">
                                {paymentDistributionData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-1">
                                        <span className="flex items-center gap-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                                            <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                            {item.name}
                                        </span>
                                        <span className="font-bold text-slate-950 dark:text-slate-50">₹{item.value.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chart 2: LIVE Product Category Distribution */}
                    <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215]">
                        <div className="mb-4">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Shopify Product Category Revenue</h3>
                            <p className="text-[10px] text-slate-400">Live product type revenue breakdown from your Adeaur catalog</p>
                        </div>
                        <div className="h-60 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="w-full sm:w-1/2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip content={renderPieTooltip} />
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {categoryData.map((_entry, index) => (
                                                <Cell key={`cell-cat-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full sm:w-1/2 space-y-2 font-mono text-[10px]">
                                {categoryData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-1">
                                        <span className="flex items-center gap-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                                            <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                            {item.name}
                                        </span>
                                        <span className="font-bold text-slate-950 dark:text-slate-50">₹{item.value.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                                {categoryData.length === 0 && (
                                    <p className="text-slate-400 text-[10px]">No product categories found in Shopify.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
