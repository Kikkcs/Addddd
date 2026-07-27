import React, { useState, useEffect } from 'react';
import {
  Users, Key, ShieldCheck, Mail, Bell, RefreshCw, Plus,
  Trash2, User, Eye, EyeOff, Save, CheckCircle2, Lock, Link
} from 'lucide-react';
import { User as UserType } from '../types';
import { API_BASE_URL } from '../config';

export default function SettingsView() {
  const [usersList, setUsersList] = useState<UserType[]>([]);

  // Custom states
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Owner' | 'Admin' | 'Sales' | 'Warehouse' | 'Accounts' | 'Support'>('Support');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [savingKeys, setSavingKeys] = useState(false);
  const [saveKeysSuccess, setSaveKeysSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setUsersList(data.data);
        }
      })
      .catch(console.error);
  }, []);

  // Toggle API key view
  const toggleKeyVisible = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Live Register New Member
  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    setInviteError('');
    setInviteSuccess(false);

    const emailParts = inviteEmail.split('@');
    const nameStr = emailParts[0].split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, name: nameStr, role: inviteRole }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        const newUser: UserType = {
          id: data.user.id,
          name: data.user.name || nameStr || 'New Member',
          email: inviteEmail,
          role: inviteRole as any,
          avatar: nameStr.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2) || 'NM',
          status: 'Active'
        };

        setUsersList(prev => [...prev, newUser]);
        if (data.inviteLink) {
          setGeneratedLink(data.inviteLink);
        }
        setInviteEmail('');
        setInviteSuccess(true);
      } else {
        setInviteError(data.message || 'Error occurred registering user.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setInviteError("Request timed out. Server taking longer than expected.");
      } else {
        setInviteError("Failed to connect to backend server.");
      }
    } finally {
      clearTimeout(timeoutId);
      setInviteLoading(false);
    }
  };

  const handleSaveKeys = () => {
    setSavingKeys(true);
    setTimeout(() => {
      setSavingKeys(false);
      setSaveKeysSuccess(true);
      setTimeout(() => setSaveKeysSuccess(false), 3000);
    }, 1200);
  };

  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const handleCopyUserLink = async (userEmail: string, userId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/invite-link?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success && data.inviteLink) {
        await navigator.clipboard.writeText(data.inviteLink);
        setCopiedUserId(userId);
        setTimeout(() => setCopiedUserId(null), 2500);
      } else {
        alert("Failed to generate setup link.");
      }
    } catch {
      alert("Error generating setup link.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="settings-view-root">

      {/* Header Block */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5" id="settings-header">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace Settings & Roles</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure staff permission matrices, manage secure API credentials, and toggle channel notification routes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-grid">

        {/* Left Columns (2/3 width) - Staff Directory and Permissions Matrix */}
        <div className="lg:col-span-2 space-y-6" id="settings-main-col">

          {/* Section 1: Staff Directory & Invite */}
          <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] space-y-6" id="staff-directory-card">
            <div className="flex items-center justify-between" id="staff-header">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Internal Staff Directory & Roles
                </h3>
                <p className="text-[10px] text-slate-400">Manage operational roles and workspace access permissions</p>
              </div>
            </div>

            {inviteError && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-medium" id="invite-error-alert">
                {inviteError}
              </div>
            )}

            {inviteSuccess && (
              <div className="p-3.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs space-y-1.5" id="invite-success-alert">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Invitation dispatched! Invited member can now set up their custom password.</span>
                </div>
                {generatedLink && (
                  <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/50 dark:border-emerald-800/50">
                    <span className="text-[10px] font-mono text-slate-500">Change Password Link:</span>
                    <input
                      readOnly
                      value={generatedLink}
                      className="flex-1 bg-white dark:bg-slate-900 px-2 py-1 rounded text-[10px] font-mono border border-emerald-300 dark:border-emerald-800"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(generatedLink)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Invite Form */}
            <form onSubmit={handleInviteUser} className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800" id="invite-form">
              <div className="flex-1 space-y-1" id="invite-field-email">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Email Address</span>
                <input
                  id="invite-email-input"
                  type="email"
                  required
                  placeholder="e.g., kishan.ops@luxuryfits.co"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="w-full sm:w-40 space-y-1" id="invite-field-role">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Workspace Role</span>
                <select
                  id="invite-role-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 text-xs bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Sales">Sales Team</option>
                  <option value="Warehouse">Warehouse Ops</option>
                  <option value="Accounts">Accounts Team</option>
                  <option value="Support">Support Agent</option>
                </select>
              </div>

              <button
                id="btn-invite-staff"
                type="submit"
                disabled={inviteLoading}
                className="self-end px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {inviteLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Sending Invite...
                  </>
                ) : 'Invite Member'}
              </button>
            </form>

            {/* Users list */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800" id="users-ledger-list">
              {usersList.map((user) => (
                <div id={`user-item-${user.id}`} key={user.id} className="py-3 flex items-center justify-between gap-3 px-2 rounded hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                  <div className="flex items-center gap-3" id={`user-item-body-${user.id}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5" id={`user-item-actions-${user.id}`}>
                    <button
                      type="button"
                      onClick={() => handleCopyUserLink(user.email, user.id)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                      title="Copy Change Password Link for this staff member"
                    >
                      <Link className="w-3 h-3 text-indigo-500" />
                      {copiedUserId === user.id ? 'Copied Link!' : 'Change Password'}
                    </button>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                      {user.role}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Role Access Permissions Matrix */}
          <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] space-y-4" id="permissions-matrix-card">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Role Permission mapping
            </h3>
            <p className="text-[10px] text-slate-400">Cross-referencing functional system rights with specific roles</p>

            <div className="overflow-x-auto font-sans text-[11px]" id="matrix-table-wrapper">
              <table className="w-full text-left border-collapse" id="permissions-table">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-semibold text-slate-400 uppercase font-mono">
                    <th className="py-2">System Right</th>
                    <th className="py-2 text-center">Owner</th>
                    <th className="py-2 text-center">Admin</th>
                    <th className="py-2 text-center">Warehouse</th>
                    <th className="py-2 text-center">Accounts</th>
                    <th className="py-2 text-center">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">Modify API Credentials</td>
                    <td className="text-center text-emerald-500">✔</td>
                    <td className="text-center text-emerald-500">✔</td>
                    <td className="text-center text-slate-300">-</td>
                    <td className="text-center text-slate-300">-</td>
                    <td className="text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">Submit Restock POs</td>
                    <td className="text-center text-emerald-500">✔</td>
                    <td className="text-center text-emerald-500">✔</td>
                    <td className="text-center text-emerald-500">✔</td>
                    <td className="text-center text-slate-300">-</td>
                    <td className="text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">Override Courier Schedules</td>
                    <td className="text-center text-emerald-500">✔</td>
                    <td className="text-center text-emerald-500">✔</td>
                    <td className="text-center text-slate-300">-</td>
                    <td className="text-center text-slate-300">-</td>
                    <td className="text-center text-emerald-500">✔</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">Export Financial Logs</td>
                    <td className="text-center text-emerald-500">✔</td>
                    <td className="text-center text-emerald-500">✔</td>
                    <td className="text-center text-slate-300">-</td>
                    <td className="text-center text-emerald-500">✔</td>
                    <td className="text-center text-slate-300">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) - API Keys and System Notifications */}
        <div className="space-y-6" id="settings-sidebar-col">

          {/* API Keys Wallet */}
          <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] space-y-4" id="api-keys-card">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-500" />
                Workspace API Keys
              </h3>
              <p className="text-[10px] text-slate-400">Tokens used for Shopify, Delhivery and GoKwik integrations</p>
            </div>

            {saveKeysSuccess && (
              <div className="p-2.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-medium flex items-center gap-1.5" id="save-keys-alert">
                <CheckCircle2 className="w-4 h-4" />
                <span>Workspace API keys rotated successfully!</span>
              </div>
            )}

            <div className="space-y-3 font-mono text-[10px]" id="keys-list">
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 space-y-1.5" id="key-shopify">
                <div className="flex items-center justify-between" id="key-shopify-header">
                  <span className="font-bold font-sans text-slate-700 dark:text-slate-300">SHOPIFY_API_KEY</span>
                  <button onClick={() => toggleKeyVisible('shopify')} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-sans font-semibold cursor-pointer">
                    {showKeys['shopify'] ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <p className="text-slate-500 break-all">{showKeys['shopify'] ? 'shp_mock_9a23b18c5e0f92d47f12e8432a9010bb' : '••••••••••••••••••••••••••••••••'}</p>
              </div>

              <div className="p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 space-y-1.5" id="key-delhivery">
                <div className="flex items-center justify-between" id="key-delhivery-header">
                  <span className="font-bold font-sans text-slate-700 dark:text-slate-300">DELHIVERY_TOKEN</span>
                  <button onClick={() => toggleKeyVisible('delhivery')} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-sans font-semibold cursor-pointer">
                    {showKeys['delhivery'] ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <p className="text-slate-500 break-all">{showKeys['delhivery'] ? 'dlv_9024_auth_key_b9281a17c205' : '••••••••••••••••••••••••••••••••'}</p>
              </div>

              <div className="p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 space-y-1.5" id="key-gokwik">
                <div className="flex items-center justify-between" id="key-gokwik-header">
                  <span className="font-bold font-sans text-slate-700 dark:text-slate-300">GOKWIK_MERCHANT_SECRET</span>
                  <button onClick={() => toggleKeyVisible('gokwik')} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-sans font-semibold cursor-pointer">
                    {showKeys['gokwik'] ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <p className="text-slate-500 break-all">{showKeys['gokwik'] ? 'gkw_9281b30cc71d47910ff9c1a0aa91' : '••••••••••••••••••••••••••••••••'}</p>
              </div>
            </div>

            <button
              id="btn-rotate-keys"
              disabled={savingKeys}
              onClick={handleSaveKeys}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${savingKeys ? 'animate-spin' : ''}`} />
              <span>{savingKeys ? 'Rotating Keys...' : 'Rotate API Keys'}</span>
            </button>
          </div>

          {/* Channel Notification preferences */}
          <div className="p-6 rounded-xl border border-slate-100 bg-white dark:border-slate-800/80 dark:bg-[#121215] space-y-4" id="notif-channels-card">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                Alert Routing preferences
              </h3>
              <p className="text-[10px] text-slate-400">Choose trigger events sent to Slack/Email channels</p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300" id="notif-channels-list">
              <label className="flex items-center gap-3 cursor-pointer" id="lbl-toggle-stock">
                <input id="toggle-stock-alerts" type="checkbox" defaultChecked className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                <div id="text-toggle-stock">
                  <p className="font-semibold text-slate-950 dark:text-white">Low Stock Warnings</p>
                  <p className="text-[10px] text-slate-400 leading-normal">Alert warehouse via Slack when safety buffers slip.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer" id="lbl-toggle-delhivery">
                <input id="toggle-delhivery-alerts" type="checkbox" defaultChecked className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                <div id="text-toggle-delhivery">
                  <p className="font-semibold text-slate-950 dark:text-white">Delhivery Hub Delay Alarms</p>
                  <p className="text-[10px] text-slate-400 leading-normal">Alert support team when shipments halt &gt; 24 hrs.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer" id="lbl-toggle-rto">
                <input id="toggle-rto-alerts" type="checkbox" defaultChecked className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                <div id="text-toggle-rto">
                  <p className="font-semibold text-slate-950 dark:text-white">GoKwik RTO Block events</p>
                  <p className="text-[10px] text-slate-400 leading-normal">Send transactional receipts when high risk COD is blocked.</p>
                </div>
              </label>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
