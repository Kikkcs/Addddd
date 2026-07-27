import React from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Inbox, Truck,
  BarChart3, FileText, Bell, Zap, UserCheck, Settings,
  HelpCircle, ChevronLeft, ChevronRight, Layers, LogOut
} from 'lucide-react';
import { Order, Notification, Product } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  notifications: Notification[];
  lowStockCount: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarExpanded,
  setSidebarExpanded,
  notifications,
  lowStockCount
}: SidebarProps) {

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Inbox, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-rose-500 text-white' },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="sidebar-container"
      className={`fixed top-0 left-0 z-30 h-screen border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-[#0c0c0e] flex flex-col justify-between transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-16'
        }`}
    >
      {/* Brand & Logo section */}
      <div id="sidebar-top-section">
        <div className="flex items-center justify-between p-4 border-b border-slate-150 dark:border-slate-800 h-16" id="sidebar-logo-container">
          <div className="flex items-center gap-3 overflow-hidden" id="logo-text-wrapper">
            <div className="flex flex-shrink-0 items-center justify-center transition-all duration-300 rounded bg-[#e8f5e9] dark:bg-[#e8f5e9] px-2 py-1" id="brand-logo">
              <img
                src="/adeaur-logo.png"
                alt="Adeaur"
                className={`object-contain transition-all mix-blend-multiply ${sidebarExpanded ? 'h-7' : 'h-6 w-6 object-cover object-left'}`}
              />
            </div>
          </div>

          {/* Collapse/Expand toggle button */}
          <button
            id="sidebar-toggle-btn"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            {sidebarExpanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Primary navigation menus */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]" id="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`nav-item-${item.id}`}
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/40'
                  }`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white'
                  }`} />
                {sidebarExpanded ? (
                  <span className="truncate">{item.label}</span>
                ) : (
                  <div className="absolute left-14 px-2 py-1 rounded bg-slate-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-md" id={`tooltip-${item.id}`}>
                    {item.label}
                  </div>
                )}
                {item.badge !== undefined && sidebarExpanded && (
                  <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${item.badgeColor}`} id={`badge-${item.id}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer view controls (Profile / Design System Showcase) */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1" id="sidebar-footer">

        {/* Special highlighted Design System tab */}
        <button
          id="nav-item-design-system"
          onClick={() => setActiveTab('design-system')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative border ${activeTab === 'design-system'
            ? 'bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white'
            : 'border-indigo-100 bg-indigo-50/20 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-950/30 dark:bg-indigo-950/5 dark:text-indigo-400 dark:hover:bg-indigo-950/20'
            }`}
        >
          <Layers className="w-4 h-4 shrink-0 animate-pulse" />
          {sidebarExpanded ? (
            <span className="font-semibold truncate">Design System Specs</span>
          ) : (
            <div className="absolute left-14 px-2 py-1 rounded bg-indigo-600 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-md" id="tooltip-design-system">
              Design Specs
            </div>
          )}
        </button>

        {/* User profile section at the very bottom */}
        {sidebarExpanded ? (
          <div className="flex items-center gap-3 p-2 mt-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800/60" id="user-profile-widget">
            <div className="w-8 h-8 rounded-full bg-slate-950 text-white dark:bg-slate-800 text-xs font-bold flex items-center justify-center shrink-0" id="user-avatar-sm">
              SM
            </div>
            <div className="overflow-hidden" id="user-info-text">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Sumit Mehra</p>
              <p className="text-[10px] text-slate-500 truncate">sumit@adeaur.com</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-2 mt-2" id="user-profile-avatar-only">
            <div className="w-8 h-8 rounded-full bg-slate-950 text-white dark:bg-slate-800 text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-all" id="user-avatar-collapsed">
              SM
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
