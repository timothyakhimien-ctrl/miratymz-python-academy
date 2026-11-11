'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Lock,
  User,
  LogOut,
  Settings,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  ExternalLink,
  Save,
  CreditCard,
  Building,
  Eye,
  MessageCircle,
  TrendingUp,
  RefreshCw,
  Trash2,
  FileText,
} from 'lucide-react';
import { formatNaira } from '@/lib/utils';

export default function AdminPage() {
  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Tab: 'registrations' | 'settings'
  const [activeTab, setActiveTab] = useState<'registrations' | 'settings'>('registrations');

  // Registrations Data State
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    declined: 0,
    totalRevenue: 0,
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Settings State
  const [bankSettings, setBankSettings] = useState({
    bankName: 'OPay / PalmPay',
    accountNumber: '8100000000',
    accountName: 'MiraTymz Programming Academy',
    unibenFee: 5950,
    generalFee: 10000,
    whatsappGroupLink: 'https://chat.whatsapp.com/invite/miratymz-python-vip',
    supportPhone: '+234 810 000 0000',
    courseGuideUrl: '',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialUploading, setMaterialUploading] = useState(false);

  // Selected Receipt Modal
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);

  // Check existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('miratymz_admin_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (token) {
      fetchRegistrations();
      fetchSettings();
    }
  }, [token, statusFilter]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('miratymz_admin_token', data.token);
      setToken(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid username or password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('miratymz_admin_token');
    setToken(null);
  };

  // Fetch registrations
  const fetchRegistrations = async () => {
    if (!token) return;
    setDataLoading(true);

    try {
      const url = `/api/admin/registrations?status=${statusFilter}&search=${encodeURIComponent(
        searchTerm
      )}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRegistrations(data.registrations || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        setBankSettings({
          bankName: data.settings.bank_name || 'OPay / PalmPay',
          accountNumber: data.settings.account_number || '8100000000',
          accountName: data.settings.account_name || 'MiraTymz Programming Academy',
          unibenFee: data.settings.uniben_fee || 5950,
          generalFee: data.settings.general_fee || 10000,
          whatsappGroupLink: data.settings.whatsapp_group_link || '',
          supportPhone: data.settings.support_phone || '',
          courseGuideUrl: data.settings.course_guide_url || '',
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSettingsLoading(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bankSettings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      showToast('Settings & Bank Account details updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Error updating settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Upload Course Guide PDF
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialFile || !token) return;
    setMaterialUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', materialFile);

      const res = await fetch('/api/admin/material', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload PDF');

      setBankSettings((prev) => ({ ...prev, courseGuideUrl: data.url }));
      showToast('Course Guide PDF uploaded & live for paid students!');
      setMaterialFile(null);
    } catch (err: any) {
      alert(err.message || 'Error uploading material');
    } finally {
      setMaterialUploading(false);
    }
  };

  // Action on registration (Approve / Added to VIP / Decline)
  const handleAction = async (trackingId: string, action: 'approve' | 'added_to_vip' | 'decline') => {
    if (!token) return;
    let reason = '';
    if (action === 'decline') {
      const promptReason = prompt(
        'Please enter the reason for declining (e.g. "Receipt blurred or transfer unconfirmed"):',
        'Proof of payment could not be validated with bank records.'
      );
      if (promptReason === null) return; // cancelled
      reason = promptReason;
    }

    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackingId, action, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      showToast(data.message || `Registration ${trackingId} updated.`);
      fetchRegistrations();
    } catch (err: any) {
      alert(err.message || 'Error performing action');
    }
  };

  // ================================================================
  // 1. LOGIN SCREEN (IF UNAUTHENTICATED)
  // ================================================================
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-900">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6 text-white">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-brand-900 border border-brand-700 text-brand-400 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              MiraTymz Staff Admin
            </h1>
            <p className="text-xs text-slate-400">
              Encrypted portal for payment verification &amp; bank configuration.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="miraadmin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-600 bg-slate-900/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-600 bg-slate-900/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-brand-700 hover:bg-brand-600 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? <span>Verifying Credentials...</span> : <span>Access Control Panel</span>}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400 block">
              Default access: <code>miraadmin</code> / <code>miratymz2026</code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // ================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-900 text-white border border-brand-500/40 text-xs font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-brand-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-900 text-brand-400 flex items-center justify-center font-black">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                MiraTymz Admissions Administration
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage bank account credentials, review transaction receipts, and admit paid students.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <Link
            href="/"
            target="_blank"
            className="text-xs text-slate-600 hover:text-brand-700 font-bold flex items-center gap-1"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase block">Total Signups</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total}</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-blue-800 font-bold uppercase block">Under Review</span>
          <span className="text-2xl font-black text-blue-900 mt-1 block">{stats.underReview}</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-amber-800 font-bold uppercase block">Pending Transfer</span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">{stats.pending}</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-emerald-800 font-bold uppercase block">Approved</span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">{stats.approved}</span>
        </div>

        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-red-800 font-bold uppercase block">Declined</span>
          <span className="text-2xl font-black text-red-900 mt-1 block">{stats.declined}</span>
        </div>

        <div className="bg-brand-950 text-white p-4 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs text-gold-400 font-bold uppercase block">Total Revenue</span>
          <span className="text-lg sm:text-xl font-black text-white mt-1 block">
            {formatNaira(stats.totalRevenue)}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 ${
            activeTab === 'registrations'
              ? 'border-brand-800 text-brand-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Registrations &amp; Receipts</span>
          {stats.underReview > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              {stats.underReview} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 ${
            activeTab === 'settings'
              ? 'border-brand-800 text-brand-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Bank &amp; Academy Configuration</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: REGISTRATIONS MANAGEMENT TABLE                         */}
      {/* ============================================================ */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'Under Review', label: `Under Review (${stats.underReview})` },
                { id: 'Pending', label: `Pending (${stats.pending})` },
                { id: 'Approved', label: `Approved (${stats.approved})` },
                { id: 'Declined', label: `Declined (${stats.declined})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                    statusFilter === pill.id
                      ? 'bg-brand-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-2 w-full md:w-80">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search name, phone, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchRegistrations()}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
              <button
                onClick={fetchRegistrations}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Student Details</th>
                    <th className="py-3.5 px-4">Category &amp; Institution</th>
                    <th className="py-3.5 px-4">Tuition Fee</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Proof of Payment</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        {dataLoading ? 'Loading records...' : 'No registrations found matching this filter.'}
                      </td>
                    </tr>
                  ) : (
                    registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{reg.full_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{reg.tracking_id}</div>
                          <div className="text-[11px] text-slate-500">{reg.email}</div>
                          <div className="text-[11px] font-semibold text-brand-700 flex items-center gap-1 mt-0.5">
                            <span>{reg.phone}</span>
                            <a
                              href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline inline-flex items-center text-[10px]"
                            >
                              (Chat WhatsApp)
                            </a>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full uppercase ${
                              reg.category === 'uniben'
                                ? 'bg-brand-100 text-brand-900'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {reg.category === 'uniben' ? 'UNIBEN 30% Off' : 'General'}
                          </span>
                          <div className="font-semibold text-slate-800 text-[11px] mt-1">
                            {reg.institution}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {reg.department} &bull; {reg.level}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                          {formatNaira(reg.amount)}
                        </td>

                        <td className="py-3.5 px-4">
                          {reg.status === 'Added to VIP Group' && (
                            <span className="bg-emerald-100 text-emerald-950 font-black text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>In VIP Group</span>
                            </span>
                          )}
                          {reg.status === 'Approved' && (
                            <span className="bg-emerald-100 text-emerald-900 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Approved</span>
                            </span>
                          )}
                          {reg.status === 'Under Review' && (
                            <span className="bg-blue-100 text-blue-900 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-blue-700" />
                              <span>Under Review</span>
                            </span>
                          )}
                          {reg.status === 'Pending' && (
                            <span className="bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                              <span>Pending</span>
                            </span>
                          )}
                          {reg.status === 'Declined' && (
                            <span className="bg-red-100 text-red-900 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                              <XCircle className="w-3.5 h-3.5 text-red-700" />
                              <span>Declined</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 space-y-1">
                          {reg.receipt_url ? (
                            <button
                              onClick={() => setActiveReceiptUrl(reg.receipt_url)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Payment Receipt</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic block">No receipt</span>
                          )}

                          {reg.declined_reason && reg.declined_reason.includes('UNIBEN Clearance Slip:') && (
                            <a
                              href={reg.declined_reason.replace('UNIBEN Clearance Slip: ', '')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-700 hover:text-gold-900 bg-gold-50 hover:bg-gold-100 px-2.5 py-1 rounded-lg border border-gold-200 transition block w-max"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Clearance Slip</span>
                            </a>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {reg.status === 'Approved' && (
                            <button
                              onClick={() => handleAction(reg.tracking_id, 'added_to_vip')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg shadow-sm transition"
                              title="Mark as joined the VIP WhatsApp group"
                            >
                              Mark Added to VIP
                            </button>
                          )}

                          {reg.status !== 'Approved' && reg.status !== 'Added to VIP Group' && (
                            <button
                              onClick={() => handleAction(reg.tracking_id, 'approve')}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition"
                              title="Confirm payment and grant class admission"
                            >
                              Approve
                            </button>
                          )}

                          {reg.status !== 'Declined' && (
                            <button
                              onClick={() => handleAction(reg.tracking_id, 'decline')}
                              className="bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition"
                              title="Mark as invalid or declined"
                            >
                              Decline
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: BANK & ACADEMY SETTINGS FORM                           */}
      {/* ============================================================ */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl"
        >
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-700" />
              <span>Receiving Bank Account Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              These details are dynamically presented to students on the payment checkout page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bank Name *
              </label>
              <input
                type="text"
                required
                value={bankSettings.bankName}
                onChange={(e) => setBankSettings({ ...bankSettings, bankName: e.target.value })}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Account Number *
              </label>
              <input
                type="text"
                required
                value={bankSettings.accountNumber}
                onChange={(e) => setBankSettings({ ...bankSettings, accountNumber: e.target.value })}
                className="w-full px-3 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Account Name *
              </label>
              <input
                type="text"
                required
                value={bankSettings.accountName}
                onChange={(e) => setBankSettings({ ...bankSettings, accountName: e.target.value })}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">
              Tuition Fee Structure (in ₦ Naira)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Override course fee rates if promotions change.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  UNIBEN Discounted Fee (₦)
                </label>
                <input
                  type="number"
                  value={bankSettings.unibenFee}
                  onChange={(e) => setBankSettings({ ...bankSettings, unibenFee: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  General Registration Fee (₦)
                </label>
                <input
                  type="number"
                  value={bankSettings.generalFee}
                  onChange={(e) => setBankSettings({ ...bankSettings, generalFee: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">
              Admin Contact &amp; Course Materials
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Configure your direct admin phone number (students will message this on WhatsApp with their name &amp; tracking ID upon approval) and upload course PDF materials.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Admin WhatsApp Contact Number *
                </label>
                <input
                  type="text"
                  required
                  value={bankSettings.supportPhone}
                  onChange={(e) => setBankSettings({ ...bankSettings, supportPhone: e.target.value })}
                  placeholder="e.g. +234 812 345 6789"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  VIP Group Invite Link (Optional backup)
                </label>
                <input
                  type="url"
                  value={bankSettings.whatsappGroupLink}
                  onChange={(e) => setBankSettings({ ...bankSettings, whatsappGroupLink: e.target.value })}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={settingsLoading}
              className="bg-brand-800 hover:bg-brand-900 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{settingsLoading ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Course Material Upload Section under settings */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 max-w-3xl mt-6">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600" />
              <span>Paid Student Complimentary Course Material (PDF)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload the complete course guide or lecture manual. Approved paid students can open and download this directly from their status screen.
            </p>
          </div>

          {bankSettings.courseGuideUrl && (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Current Active PDF: <strong>Course Guide Loaded in Supabase Storage</strong></span>
              </div>
              <a
                href={bankSettings.courseGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-800 underline hover:text-emerald-950"
              >
                Preview File &rarr;
              </a>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files && setMaterialFile(e.target.files[0])}
              className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-800 hover:file:bg-brand-100 cursor-pointer w-full"
            />
            <button
              type="button"
              onClick={handleUploadMaterial}
              disabled={!materialFile || materialUploading}
              className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-brand-950 font-black text-xs px-5 py-2.5 rounded-xl transition shadow disabled:opacity-50 whitespace-nowrap"
            >
              {materialUploading ? 'Uploading to Supabase...' : 'Upload PDF Material'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* RECEIPT INSPECTION MODAL                                     */}
      {/* ============================================================ */}
      {activeReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900">
                Transaction Proof Receipt
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={activeReceiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Size</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setActiveReceiptUrl(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-100 flex-1 min-h-[300px]">
              {activeReceiptUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe src={activeReceiptUrl} className="w-full h-[500px] border-0 rounded-xl" title="Receipt PDF" />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={activeReceiptUrl}
                  alt="Receipt"
                  className="max-h-[600px] max-w-full object-contain rounded-xl shadow"
                />
              )}
            </div>

            <div className="p-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setActiveReceiptUrl(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
