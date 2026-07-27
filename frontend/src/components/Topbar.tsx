import React, { useState, useEffect } from 'react';
import {
  Search, Bell, Sun, Moon, Calendar, ChevronDown,
  Check, Store, Clock, RefreshCw, X, AlertCircle, Info, Inbox, CheckCircle2
} from 'lucide-react';
import { Notification, User } from '../types';
import { API_BASE_URL } from '../config';

interface TopbarProps {
  activeTab: string;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  selectedDateRange: string;
  setSelectedDateRange: (range: string) => void;
  onSearchQueryChange?: (query: string) => void;
}

export default function Topbar({
  activeTab,
  notifications,
  setNotifications,
  isDarkMode,
  setIsDarkMode,
  selectedCompany,
  setSelectedCompany,
  selectedDateRange,
  setSelectedDateRange,
  onSearchQueryChange
}: TopbarProps) {

  const [showNotifications, setShowNotifications] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  // Dynamically fetch pending approvals strictly when opening the panel
  useEffect(() => {
    if (showNotifications) {
      fetch(`${API_BASE_URL}/api/v1/notifications/pending`)
        .then(res => res.json())
        .then(result => {
          if (result.success && result.pending) {
            setPendingApprovals(result.pending);
          }
        })
        .catch(err => console.error('Failed to sync manual approvals loop', err));
    }
  }, [showNotifications]);

  const handleManualAction = async (approvalId: string, orderId: string, eventType: string, decision: 'SEND_EMAIL' | 'REJECT', recipientEmail: string, payload: string) => {
    // Optimistically remove from UI
    setPendingApprovals(prev => prev.filter(p => p.id !== approvalId));

    try {
      await fetch(`${API_BASE_URL}/api/v1/notifications/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, eventType, decision, recipient: recipientEmail, payload })
      });
    } catch (err) {
      console.error('Failed to map manual notification state');
    }
  };

  const companies = ['Adeaur Personalised Dashboard'];
  const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDateStr = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const dateRanges = [`Today (${todayDateStr})`, `Yesterday (${yesterdayDateStr})`, 'Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'This Quarter', 'All Time'];

  const unreadCount = notifications.filter(n => !n.read).length + pendingApprovals.length;

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Mark single notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Delete notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchVal(query);
    if (onSearchQueryChange) {
      onSearchQueryChange(query);
    }
  };

  return (
    <header
      id="topbar-container"
      className="sticky top-0 right-0 z-20 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-100 dark:bg-[#0c0c0e] dark:border-slate-800"
    >
      {/* Left side: Tab title and Breadcrumb or Company Selector */}
      <div className="flex items-center gap-4" id="topbar-left">
        <div className="relative" id="company-selector-wrapper">
          <button
            id="company-selector-btn"
            onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200 text-xs font-semibold transition-all"
          >
            <Store className="w-3.5 h-3.5 text-indigo-500" />
            <span>{selectedCompany}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showCompanyDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowCompanyDropdown(false)} />
              <div className="absolute left-0 mt-1 w-52 rounded-lg border border-slate-150 bg-white shadow-lg dark:bg-[#121215] dark:border-slate-800 z-20 py-1" id="company-dropdown">
                <p className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">Select Entity</p>
                {companies.map((c) => (
                  <button
                    id={`company-option-${c.replace(/\s+/g, '-').toLowerCase()}`}
                    key={c}
                    onClick={() => {
                      setSelectedCompany(c);
                      setShowCompanyDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <span>{c}</span>
                    {selectedCompany === c && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Dynamic Section Indicator */}
        <div className="hidden sm:flex items-center text-xs text-slate-400" id="section-indicator">
          <span className="mx-1">/</span>
          <span className="capitalize font-medium text-slate-600 dark:text-slate-400">{activeTab === 'design-system' ? 'Design Specs' : activeTab}</span>
        </div>
      </div>

      {/* Right side: Search, Period filter, Notifications, Theme toggle */}
      <div className="flex items-center gap-3" id="topbar-right">

        {/* Search input field */}
        <div className="relative hidden md:block w-64" id="search-input-wrapper">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search orders, products..."
            value={searchVal}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-mono text-slate-400 dark:border-slate-700 dark:bg-slate-800" id="search-kbd">
            ⌘K
          </kbd>
        </div>

        {/* Date / Period Filter Selector */}
        <div className="relative" id="date-selector-wrapper">
          <button
            id="date-filter-btn"
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 text-xs font-medium transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{selectedDateRange}</span>
            <span className="sm:hidden">Date</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDateDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDateDropdown(false)} />
              <div className="absolute right-0 mt-1 w-52 rounded-lg border border-slate-150 bg-white shadow-lg dark:bg-[#121215] dark:border-slate-800 z-20 py-1" id="date-dropdown">
                <p className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">Date Range</p>
                {dateRanges.map((range) => (
                  <button
                    id={`date-option-${range.replace(/\s+/g, '-').toLowerCase()}`}
                    key={range}
                    onClick={() => {
                      setSelectedDateRange(range);
                      setShowDateDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <span>{range}</span>
                    {selectedDateRange === range && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme switcher button */}
        <button
          id="theme-toggle-btn"
          onClick={toggleDarkMode}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white transition-all"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Notifications center popover bell button */}
        <div className="relative" id="notifications-popover-wrapper">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-mono font-bold text-white ring-2 ring-white dark:ring-[#0c0c0e]" id="topbar-unread-badge">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div
                className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-200/50 bg-white/70 shadow-2xl backdrop-blur-xl dark:bg-slate-950/60 dark:border-slate-800/80 z-20 overflow-hidden transform transition-all duration-200 origin-top-right animate-in fade-in slide-in-from-top-4"
                style={{ animationDuration: '300ms' }}
                id="notifications-panel"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md" id="notif-panel-header">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Alerts & Status Logs</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{unreadCount} active warnings and errors</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      id="notif-mark-all-read"
                      onClick={markAllAsRead}
                      className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto" id="notif-panel-list">
                  {/* PENDING APPROVAL QUEUE (HIGHEST PRIORITY) */}
                  {pendingApprovals.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 transition-all duration-200 bg-amber-50/60 dark:bg-amber-900/10 border-l-4 border-amber-500 flex flex-col gap-2"
                    >
                      <div className="flex gap-3">
                        <div className="p-1.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-amber-500 bg-amber-100 dark:bg-amber-950/40">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 pr-4 overflow-hidden w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-900 dark:text-rose-400 uppercase tracking-wider">ACTION REQUIRED</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[8px] font-mono font-medium bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">{p.eventType}</span>
                          </div>
                          <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">{p.orderNumber} - {p.customerName}</p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 italic">"{p.messagePreview}"</p>
                        </div>
                      </div>

                      {/* Manual Routing Approvals */}
                      <div className="flex items-center gap-2 mt-2 w-full justify-end">
                        <button
                          onClick={() => handleManualAction(p.id, p.orderId, p.eventType, 'REJECT', p.recipientEmail, p.messagePreview)}
                          className="px-2.5 py-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 text-[9px] font-semibold transition-all"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleManualAction(p.id, p.orderId, p.eventType, 'SEND_EMAIL', p.recipientEmail, p.messagePreview)}
                          className="px-2.5 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-[9px] font-bold transition-all shadow-sm shadow-indigo-600/30"
                        >
                          Approve Email
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* STANDARD SYSTEM LOGS */}
                  {notifications.length === 0 && pendingApprovals.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2" id="notif-empty">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <span>All systems operational! No alerts.</span>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      let iconColor = 'text-blue-500 bg-blue-50 dark:bg-blue-950/40';
                      if (n.severity === 'error') iconColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/40';
                      if (n.severity === 'warning') iconColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/40';
                      if (n.severity === 'success') iconColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';

                      return (
                        <div
                          id={`notif-item-${n.id}`}
                          key={n.id}
                          className={`p-3.5 transition-all duration-200 relative flex gap-3 hover:translate-x-1 ${n.read ? 'bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/30' : 'bg-indigo-50/40 hover:bg-indigo-50/70 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20'}`}
                        >
                          <div className={`p-1.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`} id={`notif-icon-${n.id}`}>
                            {n.severity === 'error' && <AlertCircle className="w-4 h-4" />}
                            {n.severity === 'warning' && <AlertCircle className="w-4 h-4" />}
                            {n.severity === 'success' && <CheckCircle2 className="w-4 h-4" />}
                            {n.severity === 'info' && <Info className="w-4 h-4" />}
                          </div>

                          <div className="space-y-0.5 pr-4 overflow-hidden" id={`notif-text-${n.id}`}>
                            <div className="flex items-center gap-1.5" id={`notif-title-row-${n.id}`}>
                              <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                              <span className="px-1.5 py-0.2 rounded-full text-[8px] font-mono font-medium uppercase bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{n.category}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal break-words">{n.message}</p>
                            <span className="text-[9px] font-mono text-slate-400 block pt-0.5">{n.timestamp}</span>
                          </div>

                          {/* Action icons */}
                          <div className="absolute right-2 top-3 flex items-center gap-1" id={`notif-actions-${n.id}`}>
                            {!n.read && (
                              <button
                                id={`notif-read-btn-${n.id}`}
                                onClick={() => markAsRead(n.id)}
                                className="p-1 rounded text-slate-300 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400"
                                title="Mark read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              id={`notif-remove-btn-${n.id}`}
                              onClick={() => removeNotification(n.id)}
                              className="p-1 rounded text-slate-300 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
                              title="Delete alert"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
