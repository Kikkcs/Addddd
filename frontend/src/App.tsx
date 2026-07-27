import React, { useState, useEffect } from 'react';
import {
  BarChart3, PieChart as PieIcon, Wallet, ShoppingBag, Truck, Zap,
  TrendingUp, RefreshCw, AlertTriangle, ArrowUpRight, Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

// Component Imports
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import OrdersView from './components/OrdersView';
import InventoryView from './components/InventoryView';
import ShippingView from './components/ShippingView';
import ReportsView from './components/ReportsView';
import IntegrationsView from './components/IntegrationsView';
import SettingsView from './components/SettingsView';
import DesignSystemView from './components/DesignSystemView';
import AnalyticsView from './components/AnalyticsView';
import NotificationsView from './components/NotificationsView';
import LoginView from './components/LoginView';

// Data and Type Imports
import { categoryShareData, courierPerformanceData, paymentDistributionData } from './data';
import { Order, Notification } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Search query state (propagated from topbar to orders table)
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Order for side-drawer details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Synced state arrays
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Real inventory array, initialized empty
  const [inventory, setInventory] = useState<any[]>([]);

  // Calculate low stock dynamically across the array
  const lowStockCount = inventory.filter(p => p.stock <= p.threshold).length;

  const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const [selectedCompany, setSelectedCompany] = useState('Adeaur Personalised Dashboard');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 6 Months');

  // Handle mobile screen responsiveness on initial mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarExpanded(false);
      } else {
        setSidebarExpanded(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // trigger once on start
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

  // Custom Pie Tooltip
  const renderPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg shadow-xl text-[10px] font-mono text-slate-200">
          <p className="font-semibold text-white">{payload[0].name}</p>
          <p className="text-slate-400 mt-1 flex justify-between gap-4">
            <span>Share:</span>
            <span className="font-bold text-indigo-400">₹{payload[0].value.toLocaleString('en-IN')}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!isAuthenticated) {
    return <LoginView setAuth={setIsAuthenticated} />;
  }

  return (
    <div className={`min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-slate-950 dark:text-slate-50 transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>

      {/* Left Collapsible Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        notifications={notifications}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Layout Block (Paddings adjusted dynamically per sidebar scale) */}
      <div
        id="main-app-shell"
        className={`min-h-screen flex flex-col transition-all duration-300 ${sidebarExpanded ? 'pl-64' : 'pl-16'
          }`}
      >
        {/* Global Controls Top bar */}
        <Topbar
          activeTab={activeTab}
          notifications={notifications}
          setNotifications={setNotifications}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          selectedDateRange={selectedDateRange}
          setSelectedDateRange={setSelectedDateRange}
          onSearchQueryChange={setSearchQuery}
        />

        {/* Scrollable View Container with delicate grid background effect */}
        <main className="flex-1 p-6 md:p-8 bg-grid dark:bg-grid overflow-y-auto" id="view-renderer-canvas">

          {/* Active View Router */}
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              setSelectedOrder={setSelectedOrder}
              notifications={notifications}
              setNotifications={setNotifications}
              dateRange={selectedDateRange}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              searchQuery={searchQuery}
              dateRange={selectedDateRange}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView />
          )}

          {activeTab === 'shipping' && (
            <ShippingView dateRange={selectedDateRange} />
          )}

          {/* DENSE ANALYTICS VIEW */}
          {activeTab === 'analytics' && (
            <AnalyticsView
              COLORS={COLORS}
              renderPieTooltip={renderPieTooltip}
              paymentDistributionData={paymentDistributionData}
              dateRange={selectedDateRange}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsView />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}

          {activeTab === 'design-system' && (
            <DesignSystemView />
          )}

        </main>
      </div>
    </div>
  );
}
