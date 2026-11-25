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
  Timer,
  Flame,
  Sparkles,
  Zap,
  School as SchoolIcon,
  RotateCcw,
  Plus,
  KeyRound,
  Check,
  Copy,
  LayoutDashboard,
  GraduationCap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { formatNaira } from '@/lib/utils';

interface SchoolData {
  id: string;
  name: string;
  address: string;
  area: string;
  accessCode: string;
  paymentMethod: 'bank_transfer' | 'school_office' | 'pending';
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  paymentInstructions?: string;
  isEnabled: boolean;
  hasPaymentConfigured: boolean;
}

export default function AdminPage() {
  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [dashboardError, setDashboardError] = useState('');

  // Active Tab: 'overview' | 'registrations' | 'schools' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'schools' | 'settings'>('registrations');

  // Registrations Data State
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    archived: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    declined: 0,
    unibenCount: 0,
    schoolCount: 0,
    generalCount: 0,
    totalRevenue: 0,
    expectedRevenue: 0,
    underReviewPotential: 0,
    verifiedPaymentsCount: 0,
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Schools State
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolData | null>(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);

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

  // Promotional Urgency & Countdown Offer State
  const [promoSettings, setPromoSettings] = useState({
    enabled: true,
    unibenDiscountFee: 5950,
    unibenNormalFee: 8500,
    generalDiscountFee: 10000,
    generalNormalFee: 15000,
    limitedOfferSlots: 7,
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialUploading, setMaterialUploading] = useState(false);

  // Dual-Document Modal Viewer State
  const [docModal, setDocModal] = useState<{
    receiptUrl?: string | null;
    admissionLetterUrl?: string | null;
    studentName?: string;
    trackingId?: string;
    activeTab: 'receipt' | 'admission';
  } | null>(null);

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
      fetchSchools();
    }
  }, [token, statusFilter, categoryFilter]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAuthExpired = (customMsg?: string) => {
    localStorage.removeItem('miratymz_admin_token');
    setToken(null);
    setAuthError(customMsg || 'Your admin session has expired or is invalid. Please sign in again.');
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
    setDashboardError('');

    try {
      const url = `/api/admin/registrations?status=${encodeURIComponent(statusFilter)}&category=${encodeURIComponent(
        categoryFilter
      )}&search=${encodeURIComponent(searchTerm)}&_t=${Date.now()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setDashboardError(data.error || 'Failed to load student registrations.');
        return;
      }
      setRegistrations(data.registrations || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error('Error fetching registrations:', err);
      setDashboardError('Network error while connecting to database. Please tap Retry.');
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch schools
  const fetchSchools = async () => {
    if (!token) return;
    setSchoolsLoading(true);
    try {
      const res = await fetch(`/api/admin/schools?_t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setDashboardError(data.error || 'Failed to load schools directory.');
        return;
      }
      if (data.schools) {
        setSchools(data.schools);
      }
    } catch (err) {
      console.error('Error fetching schools:', err);
    } finally {
      setSchoolsLoading(false);
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
      if (res.ok && data.promoSettings) {
        setPromoSettings(data.promoSettings);
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
        body: JSON.stringify({
          ...bankSettings,
          promoSettings,
        }),
      });

      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      showToast('Settings, Promotional Offer & Countdown updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Error updating settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Save / Update School
  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool || !token) return;

    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'save',
          school: editingSchool,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save school');

      showToast(data.message || 'School saved successfully!');
      setShowSchoolModal(false);
      setEditingSchool(null);
      await fetchSchools();
    } catch (err: any) {
      alert(err.message || 'Error saving school');
    }
  };

  // Toggle School Active / Disabled
  const handleToggleSchool = async (schoolId: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'toggle',
          schoolId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle school status');
      showToast(data.message || 'School status updated.');
      await fetchSchools();
    } catch (err: any) {
      alert(err.message || 'Error toggling school status');
    }
  };

  // Delete School
  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to remove "${schoolName}" from the school directory?`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'delete',
          schoolId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete school');
      showToast(data.message || 'School removed from directory.');
      await fetchSchools();
    } catch (err: any) {
      alert(err.message || 'Error deleting school');
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

      setBankSettings((prev) => ({
        ...prev,
        courseGuideUrl: `${data.url}?_t=${Date.now()}`,
      }));
      showToast('Course Guide PDF uploaded & published live across all pages!');
      setMaterialFile(null);
    } catch (err: any) {
      alert(err.message || 'Error uploading material');
    } finally {
      setMaterialUploading(false);
    }
  };

  // Action on registration (Approve / Added to VIP / Decline / Archive / Restore / Permanent Delete)
  const handleAction = async (
    trackingId: string,
    action: 'approve' | 'added_to_vip' | 'decline' | 'delete' | 'restore' | 'permanent_delete',
    regObj?: any
  ) => {
    if (!token) return;
    let reason = '';
    let verifiedAmount: number | undefined = undefined;
    let paymentReference = '';

    if (action === 'approve') {
      const defaultAmt = regObj?.amount || 5950;
      const amtPrompt = prompt(
        `Enter verified payment amount received for ${trackingId} in Naira (leave as ${defaultAmt} if exact):`,
        String(defaultAmt)
      );
      if (amtPrompt !== null) {
        verifiedAmount = Number(amtPrompt) || defaultAmt;
      }
      const refPrompt = prompt(
        `Optional: Enter bank payment reference / transaction session ID for ${trackingId}:`,
        ''
      );
      if (refPrompt) {
        paymentReference = refPrompt.trim();
      }
    }

    if (action === 'decline') {
      const promptReason = prompt(
        'Please enter the reason for declining (e.g. "Receipt blurred or transfer unconfirmed"):',
        'Proof of payment could not be validated with bank records.'
      );
      if (promptReason === null) return;
      reason = promptReason;
    }

    if (action === 'delete') {
      if (!confirm(`Archive registration ${trackingId}? This will safely soft-delete the record so it can be restored anytime.`)) {
        return;
      }
    }

    if (action === 'restore') {
      if (!confirm(`Restore registration ${trackingId} back to active records?`)) {
        return;
      }
    }

    if (action === 'permanent_delete') {
      if (!confirm(`CAUTION: Permanently delete record ${trackingId} from the database? This cannot be undone.`)) {
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trackingId,
          action,
          reason,
          verifiedAmount,
          paymentReference,
        }),
      });

      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      showToast(data.message || `Registration ${trackingId} updated.`);
      await fetchRegistrations();
    } catch (err: any) {
      alert(err.message || 'Error performing action');
      await fetchRegistrations();
    }
  };

  // Helper to extract admission letter URL from record
  const getAdmissionUrl = (reg: any): string | null => {
    if (reg.declined_reason && reg.declined_reason.includes('Admission Letter:')) {
      const match = reg.declined_reason.match(/https?:\/\/[^\s]+/);
      if (match) return match[0];
    }
    if (reg.declined_reason && reg.declined_reason.includes('UNIBEN Clearance Slip:')) {
      const match = reg.declined_reason.match(/https?:\/\/[^\s]+/);
      if (match) return match[0];
    }
    return null;
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
              Encrypted portal for payment verification, school directory &amp; bank configuration.
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
                  placeholder="Enter username"
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
            <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>HMAC-256 Protected &bull; Authorized Personnel Only</span>
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

      {/* Dashboard Error Banner */}
      {dashboardError && (
        <div className="bg-red-50 border-2 border-red-400 text-red-950 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{dashboardError}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              fetchRegistrations();
              fetchSchools();
              fetchSettings();
            }}
            className="bg-red-700 hover:bg-red-800 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition shrink-0 self-start sm:self-auto"
          >
            Retry Connection
          </button>
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
              Manage student approvals, payment verification, Isheri Pipeline schools, and financial reporting.
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
          <span className="text-xs text-slate-400 font-bold uppercase block">Active Students</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total}</span>
          <span className="text-[10px] text-slate-500">In database</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-blue-800 font-bold uppercase block">Under Review</span>
          <span className="text-2xl font-black text-blue-900 mt-1 block">{stats.underReview}</span>
          <span className="text-[10px] text-blue-700 font-semibold">{formatNaira(stats.underReviewPotential)} pending</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-amber-800 font-bold uppercase block">Pending Transfer</span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">{stats.pending}</span>
          <span className="text-[10px] text-amber-700">Awaiting payment</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-emerald-800 font-bold uppercase block">Approved</span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">{stats.approved}</span>
          <span className="text-[10px] text-emerald-700 font-semibold">Verified admissions</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Archived / Trash</span>
          <span className="text-2xl font-black text-slate-600 mt-1 block">{stats.archived}</span>
          <span className="text-[10px] text-slate-400">Can be restored</span>
        </div>

        <div className="bg-brand-950 text-white p-4 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs text-gold-400 font-bold uppercase block">Verified Revenue</span>
          <span className="text-lg sm:text-xl font-black text-white mt-1 block">
            {formatNaira(stats.totalRevenue)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Expected: {formatNaira(stats.expectedRevenue)}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl px-3 sm:px-5 pt-2.5 shadow-sm flex space-x-4 sm:space-x-6 text-xs sm:text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-brand-800 text-brand-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
            activeTab === 'registrations'
              ? 'border-brand-800 text-brand-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registrations &amp; Receipts</span>
          {stats.underReview > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              {stats.underReview}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('schools')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
            activeTab === 'schools'
              ? 'border-brand-800 text-brand-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <SchoolIcon className="w-4 h-4" />
          <span>Schools ({schools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 flex items-center gap-2 transition border-b-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-brand-800 text-brand-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: EXECUTIVE OVERVIEW & CATEGORY BREAKDOWN               */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* University Students Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">Track 1</span>
              </div>
              <span className="text-xs text-slate-500 font-semibold block uppercase">University Students</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.unibenCount}</span>
              <p className="text-xs text-slate-400 mt-2">
                Undergraduates enrolled from UNIBEN and tertiary institutions across all departments.
              </p>
            </div>

            {/* School Students Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <SchoolIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">Track 2</span>
              </div>
              <span className="text-xs text-slate-500 font-semibold block uppercase">School Students</span>
              <span className="text-3xl font-black text-emerald-900 mt-1 block">{stats.schoolCount}</span>
              <p className="text-xs text-slate-400 mt-2">
                Secondary school students from Go-Tegs International School and Isheri Pipeline partner schools.
              </p>
            </div>

            {/* General Public Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">Track 3</span>
              </div>
              <span className="text-xs text-slate-500 font-semibold block uppercase">General Public</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.generalCount}</span>
              <p className="text-xs text-slate-400 mt-2">
                Working professionals, graduates, and general tech enthusiasts enrolled.
              </p>
            </div>
          </div>

          {/* Financial Summary Box */}
          <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-brand-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-black uppercase tracking-widest text-gold-400 block">
                Financial Operations Ledger
              </span>
              <h3 className="text-2xl font-black text-white">
                Verified Academy Revenue: {formatNaira(stats.totalRevenue)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Calculated strictly from approved student payments. An additional <strong>{formatNaira(stats.underReviewPotential)}</strong> is currently under review across {stats.underReview} pending receipts.
              </p>
            </div>

            <button
              onClick={() => {
                setStatusFilter('Under Review');
                setActiveTab('registrations');
              }}
              className="bg-gold-500 hover:bg-gold-600 text-brand-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow transition flex items-center gap-2 shrink-0"
            >
              <span>Review Pending Receipts ({stats.underReview})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: REGISTRATIONS MANAGEMENT TABLE                         */}
      {/* ============================================================ */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'all', label: `All Active (${stats.total})` },
                { id: 'Under Review', label: `Under Review (${stats.underReview})` },
                { id: 'Pending', label: `Pending (${stats.pending})` },
                { id: 'Approved', label: `Approved (${stats.approved})` },
                { id: 'Declined', label: `Declined (${stats.declined})` },
                { id: 'archived', label: `Archived / Trash (${stats.archived})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                    statusFilter === pill.id
                      ? 'bg-brand-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Category Dropdown & Search Box */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                <option value="all">All Categories</option>
                <option value="uniben">UNIBEN Students</option>
                <option value="school">School Students (Isheri)</option>
                <option value="general">General Public</option>
              </select>

              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
                title="Refresh Records"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Registrations Cards (Phones & Small Tablets) */}
          <div className="md:hidden space-y-3">
            {registrations.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                {dataLoading ? 'Loading records...' : 'No registrations found matching this filter.'}
              </div>
            ) : (
              registrations.map((reg) => {
                const admissionUrl = getAdmissionUrl(reg);
                return (
                  <div
                    key={`mob-${reg.id || reg.tracking_id}`}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 text-sm truncate">{reg.full_name}</div>
                        <div className="text-[11px] font-mono font-bold text-brand-800">{reg.tracking_id}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-black text-slate-900 text-sm">{formatNaira(reg.amount)}</div>
                        <span
                          className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full mt-0.5 ${
                            reg.status === 'Archived'
                              ? 'bg-slate-200 text-slate-700'
                              : reg.status === 'Added to VIP Group'
                              ? 'bg-emerald-100 text-emerald-950'
                              : reg.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-900'
                              : reg.status === 'Under Review'
                              ? 'bg-blue-100 text-blue-900'
                              : reg.status === 'Pending'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {reg.status === 'Added to VIP Group' ? 'In VIP Group' : reg.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-2">
                      <div className="truncate">{reg.email}</div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-brand-800">{reg.phone}</span>
                        <a
                          href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {reg.category === 'school'
                          ? 'School Student'
                          : reg.category === 'uniben'
                          ? 'UNIBEN Student'
                          : 'General Public'}{' '}
                        &bull; {reg.institution === 'General Public' ? 'Open Enrollment' : reg.institution}
                      </div>
                    </div>

                    {(reg.receipt_url || admissionUrl) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {reg.receipt_url && (
                          <button
                            onClick={() =>
                              setDocModal({
                                receiptUrl: reg.receipt_url,
                                admissionLetterUrl: admissionUrl,
                                studentName: reg.full_name,
                                trackingId: reg.tracking_id,
                                activeTab: 'receipt',
                              })
                            }
                            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-2 rounded-xl"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Receipt</span>
                          </button>
                        )}
                        {admissionUrl && (
                          <button
                            onClick={() =>
                              setDocModal({
                                receiptUrl: reg.receipt_url,
                                admissionLetterUrl: admissionUrl,
                                studentName: reg.full_name,
                                trackingId: reg.tracking_id,
                                activeTab: 'admission',
                              })
                            }
                            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-gold-800 bg-gold-50 border border-gold-200 px-3 py-2 rounded-xl"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Admission Letter</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      {reg.status === 'Archived' ? (
                        <>
                          <button
                            onClick={() => handleAction(reg.tracking_id, 'restore')}
                            className="flex-1 bg-emerald-600 text-white font-bold text-xs py-2 px-3 rounded-xl inline-flex items-center justify-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => handleAction(reg.tracking_id, 'permanent_delete')}
                            className="bg-red-600 text-white font-bold text-xs py-2 px-3 rounded-xl inline-flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </>
                      ) : (
                        <>
                          {reg.status === 'Approved' && (
                            <button
                              onClick={() => handleAction(reg.tracking_id, 'added_to_vip')}
                              className="flex-1 bg-emerald-600 text-white font-bold text-xs py-2 px-3 rounded-xl"
                            >
                              Mark VIP Joined
                            </button>
                          )}
                          {reg.status !== 'Approved' && reg.status !== 'Added to VIP Group' && (
                            <button
                              onClick={() => handleAction(reg.tracking_id, 'approve', reg)}
                              className="flex-1 bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl"
                            >
                              {reg.status === 'Declined' ? 'Re-Approve' : 'Approve'}
                            </button>
                          )}
                          {reg.status !== 'Declined' && (
                            <button
                              onClick={() => handleAction(reg.tracking_id, 'decline')}
                              className="bg-slate-200 text-slate-800 font-bold text-xs py-2 px-3 rounded-xl"
                            >
                              Decline
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(reg.tracking_id, 'delete')}
                            className="bg-slate-100 text-slate-600 hover:text-red-600 p-2 rounded-xl"
                            title="Archive / Soft Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Registrations Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Student Details</th>
                    <th className="py-3.5 px-4">Category &amp; School</th>
                    <th className="py-3.5 px-4">Tuition Fee</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Documents</th>
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
                    registrations.map((reg) => {
                      const admissionUrl = getAdmissionUrl(reg);

                      return (
                        <tr key={reg.id || reg.tracking_id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{reg.full_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono font-bold text-brand-800">
                              {reg.tracking_id}
                            </div>
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
                            {reg.learning_goals && (
                              <div className="mt-1.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-950 max-w-xs">
                                <span className="font-bold block text-[9px] uppercase tracking-wider text-amber-800">
                                  Learning Goal:
                                </span>
                                <p className="line-clamp-2 hover:line-clamp-none transition-all cursor-pointer" title={reg.learning_goals}>
                                  {reg.learning_goals}
                                </p>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full uppercase ${
                                reg.category === 'school'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : reg.category === 'uniben'
                                  ? 'bg-brand-100 text-brand-900'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {reg.category === 'school'
                                ? 'School Student (₦5,000)'
                                : reg.category === 'uniben'
                                ? 'UNIBEN 30% Off'
                                : 'General Public'}
                            </span>
                            <div className="font-semibold text-slate-800 text-[11px] mt-1">
                              {reg.institution === 'General Public' ? 'General Enrollment' : reg.institution}
                            </div>
                            {reg.department && reg.department !== 'General' && (
                              <div className="text-[10px] text-slate-400">
                                {reg.department} &bull; {reg.level}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                            {formatNaira(reg.amount)}
                          </td>

                          <td className="py-3.5 px-4">
                            {reg.status === 'Archived' ? (
                              <span className="bg-slate-200 text-slate-700 font-black text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Archived</span>
                              </span>
                            ) : reg.status === 'Added to VIP Group' ? (
                              <span className="bg-emerald-100 text-emerald-950 font-black text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>In VIP Group</span>
                              </span>
                            ) : reg.status === 'Approved' ? (
                              <span className="bg-emerald-100 text-emerald-900 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Approved</span>
                              </span>
                            ) : reg.status === 'Under Review' ? (
                              <span className="bg-blue-100 text-blue-900 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max animate-pulse">
                                <Clock className="w-3.5 h-3.5 text-blue-700" />
                                <span>Under Review</span>
                              </span>
                            ) : reg.status === 'Pending' ? (
                              <span className="bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                                <span>Pending</span>
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-900 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                <XCircle className="w-3.5 h-3.5 text-red-700" />
                                <span>Declined</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 space-y-1">
                            <div className="flex flex-col gap-1 items-start">
                              {reg.receipt_url && (
                                <button
                                  onClick={() =>
                                    setDocModal({
                                      receiptUrl: reg.receipt_url,
                                      admissionLetterUrl: admissionUrl,
                                      studentName: reg.full_name,
                                      trackingId: reg.tracking_id,
                                      activeTab: 'receipt',
                                    })
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-2 py-0.5 rounded-lg border border-brand-200 transition"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Receipt Proof</span>
                                </button>
                              )}

                              {admissionUrl && (
                                <button
                                  onClick={() =>
                                    setDocModal({
                                      receiptUrl: reg.receipt_url,
                                      admissionLetterUrl: admissionUrl,
                                      studentName: reg.full_name,
                                      trackingId: reg.tracking_id,
                                      activeTab: 'admission',
                                    })
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-700 hover:text-gold-900 bg-gold-50 hover:bg-gold-100 px-2 py-0.5 rounded-lg border border-gold-200 transition"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Admission Letter</span>
                                </button>
                              )}

                              {!reg.receipt_url && !admissionUrl && (
                                <span className="text-slate-400 text-[11px] italic">No documents</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            {/* Archived Tab Actions: Restore or Permanent Delete */}
                            {reg.status === 'Archived' ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleAction(reg.tracking_id, 'restore')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition inline-flex items-center gap-1"
                                  title="Restore this record back to active records"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Restore</span>
                                </button>
                                <button
                                  onClick={() => handleAction(reg.tracking_id, 'permanent_delete')}
                                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg shadow-sm transition inline-flex items-center gap-1"
                                  title="Permanently delete from database"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                {reg.status === 'Approved' && (
                                  <button
                                    onClick={() => handleAction(reg.tracking_id, 'added_to_vip')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg shadow-sm transition"
                                    title="Mark as joined the VIP WhatsApp group"
                                  >
                                    VIP Joined
                                  </button>
                                )}

                                {reg.status !== 'Approved' && reg.status !== 'Added to VIP Group' && (
                                  <button
                                    onClick={() => handleAction(reg.tracking_id, 'approve', reg)}
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition"
                                    title="Verify payment and approve admission"
                                  >
                                    {reg.status === 'Declined' ? 'Re-Approve' : 'Approve'}
                                  </button>
                                )}

                                {reg.status !== 'Declined' && (
                                  <button
                                    onClick={() => handleAction(reg.tracking_id, 'decline')}
                                    className="bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition"
                                    title="Mark as declined"
                                  >
                                    Decline
                                  </button>
                                )}

                                <button
                                  onClick={() => handleAction(reg.tracking_id, 'delete')}
                                  className="bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition inline-flex items-center"
                                  title="Archive / Soft Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: ISHERI PIPELINE SCHOOLS DIRECTORY MANAGEMENT          */}
      {/* ============================================================ */}
      {activeTab === 'schools' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <SchoolIcon className="w-5 h-5 text-emerald-700" />
                <span>Isheri Pipeline Partner Schools Directory</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage partner schools, secret access codes, and dedicated payment details (Go-Tegs and others).
              </p>
            </div>

            <button
              onClick={() => {
                setEditingSchool({
                  id: `school-${Date.now()}`,
                  name: '',
                  address: '',
                  area: 'Isheri Pipeline, Lagos',
                  accessCode: `ISHERI-${new Date().getFullYear()}`,
                  paymentMethod: 'pending',
                  isEnabled: true,
                  hasPaymentConfigured: false,
                });
                setShowSchoolModal(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New School</span>
            </button>
          </div>

          {/* Mobile Schools Cards */}
          <div className="md:hidden space-y-3">
            {schools.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                {schoolsLoading ? 'Loading schools directory...' : 'No schools found.'}
              </div>
            ) : (
              schools.map((school) => (
                <div
                  key={`mob-school-${school.id}`}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 text-sm">{school.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{school.address}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{school.area}</div>
                    </div>
                    <button
                      onClick={() => handleToggleSchool(school.id)}
                      className={`shrink-0 font-bold text-[11px] px-2.5 py-1 rounded-full transition ${
                        school.isEnabled
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {school.isEnabled ? '✓ Active' : '✕ Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-semibold">Access Code:</span>
                    <span className="font-mono font-black text-brand-900 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg">
                      {school.accessCode}
                    </span>
                  </div>

                  {school.hasPaymentConfigured ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px]">
                      <div className="font-bold text-emerald-900">Dedicated Bank Configured</div>
                      <div className="font-mono font-bold text-slate-800 mt-0.5">
                        {school.bankName} &bull; {school.accountNumber}
                      </div>
                      <div className="text-slate-600">{school.accountName}</div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 font-semibold">
                      Pending Administrative Sign-off
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setEditingSchool({ ...school });
                        setShowSchoolModal(true);
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl transition"
                    >
                      Edit School
                    </button>
                    {school.id !== 'gotegs-intl' && (
                      <button
                        onClick={() => handleDeleteSchool(school.id, school.name)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs p-2 rounded-xl transition"
                        title="Delete School"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Schools Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">School Name &amp; Address</th>
                    <th className="py-3.5 px-4">Secret Access Code</th>
                    <th className="py-3.5 px-4">Payment Arrangement</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schools.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">
                        {schoolsLoading ? 'Loading schools directory...' : 'No schools found.'}
                      </td>
                    </tr>
                  ) : (
                    schools.map((school) => (
                      <tr key={school.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{school.name}</span>
                            {school.id === 'gotegs-intl' && (
                              <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                                Featured Partner
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{school.address}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{school.area}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono font-black text-brand-900 bg-brand-50 border border-brand-200 px-2 py-1 rounded-md text-xs">
                            {school.accessCode}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {school.hasPaymentConfigured ? (
                            <div>
                              <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                                Dedicated Bank Configured
                              </span>
                              <div className="text-[11px] font-mono font-bold text-slate-800 mt-1">
                                {school.bankName} - {school.accountNumber}
                              </div>
                              <div className="text-[10px] text-slate-500">{school.accountName}</div>
                            </div>
                          ) : (
                            <div>
                              <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                                Pending Administrative Sign-off
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Displays honest pending notice to students
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleSchool(school.id)}
                            className={`font-bold text-[11px] px-2.5 py-1 rounded-full transition cursor-pointer ${
                              school.isEnabled
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            }`}
                            title="Click to toggle status"
                          >
                            {school.isEnabled ? '✓ Active' : '✕ Disabled'}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingSchool({ ...school });
                              setShowSchoolModal(true);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            Edit
                          </button>
                          {school.id !== 'gotegs-intl' && (
                            <button
                              onClick={() => handleDeleteSchool(school.id, school.name)}
                              className="bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition inline-flex items-center"
                              title="Delete School"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      {/* TAB 4: BANK & ACADEMY SETTINGS FORM                           */}
      {/* ============================================================ */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl"
        >
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-700" />
              <span>Receiving Bank Account Configuration (Academy Default)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              These details are dynamically presented to UNIBEN and General Public students on payment checkout.
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

          {/* LIMITED OFFER & COUNTDOWN EXPIRATION SECTION */}
          <div className="pt-4 border-t border-slate-100 bg-amber-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8 py-5 rounded-2xl border border-amber-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Limited Offer &amp; Countdown Expiration Settings</span>
                </h3>
                <p className="text-xs text-amber-900/80 mt-0.5">
                  Control the limited-slot countdown. When the timer expires, the public site automatically switches off the discount and displays the normal price.
                </p>
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-sm">
                <input
                  type="checkbox"
                  checked={promoSettings.enabled}
                  onChange={(e) => {
                    const isEnabled = e.target.checked;
                    const isPast = new Date(promoSettings.expiresAt).getTime() <= Date.now();
                    const newExpiry = (isEnabled && isPast)
                      ? new Date(Date.now() + 72 * 3600 * 1000).toISOString()
                      : promoSettings.expiresAt;
                    setPromoSettings({ ...promoSettings, enabled: isEnabled, expiresAt: newExpiry });
                  }}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  {promoSettings.enabled ? 'Offer Active (Discount ON)' : 'Offer Disabled (Normal Price)'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <span>Limited Offer Slots Remaining</span>
                  <span className="text-[10px] text-amber-700 font-semibold">(Seats left)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={promoSettings.limitedOfferSlots}
                  onChange={(e) =>
                    setPromoSettings({ ...promoSettings, limitedOfferSlots: Number(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  UNIBEN Discount Price (₦)
                </label>
                <input
                  type="number"
                  value={promoSettings.unibenDiscountFee}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPromoSettings({ ...promoSettings, unibenDiscountFee: val });
                    setBankSettings({ ...bankSettings, unibenFee: val });
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-brand-900 focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  UNIBEN Normal Price (₦)
                </label>
                <input
                  type="number"
                  value={promoSettings.unibenNormalFee}
                  onChange={(e) =>
                    setPromoSettings({ ...promoSettings, unibenNormalFee: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-600 focus:ring-2 focus:ring-brand-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  General Public Discount Price (₦)
                </label>
                <input
                  type="number"
                  value={promoSettings.generalDiscountFee}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPromoSettings({ ...promoSettings, generalDiscountFee: val });
                    setBankSettings({ ...bankSettings, generalFee: val });
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-brand-900 focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  General Public Normal Price (₦)
                </label>
                <input
                  type="number"
                  value={promoSettings.generalNormalFee}
                  onChange={(e) =>
                    setPromoSettings({ ...promoSettings, generalNormalFee: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-600 focus:ring-2 focus:ring-brand-600"
                />
              </div>
            </div>

            {/* Countdown Expiration Settings */}
            <div className="mt-4 pt-3 border-t border-amber-200/60">
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-amber-700" />
                <span>Offer Expiration Date &amp; Time (When countdown hits 0, discount ends)</span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="datetime-local"
                  value={
                    promoSettings.expiresAt
                      ? new Date(new Date(promoSettings.expiresAt).getTime() - new Date().getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      setPromoSettings({
                        ...promoSettings,
                        expiresAt: new Date(e.target.value).toISOString(),
                      });
                    }
                  }}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-brand-600"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-500 font-semibold mr-1">Quick Add:</span>
                  {[
                    { label: '+24 Hours', hours: 24 },
                    { label: '+48 Hours', hours: 48 },
                    { label: '+3 Days', hours: 72 },
                    { label: '+7 Days', hours: 168 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const newExpiry = new Date(Date.now() + preset.hours * 3600 * 1000).toISOString();
                        setPromoSettings({ ...promoSettings, expiresAt: newExpiry, enabled: true });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] border border-amber-300 transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
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
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900 block">
                    Active Course Guide PDF Published Live
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Available to all students on Home Page, Registration Confirmation, and Status Portal.
                  </span>
                </div>
              </div>
              <a
                href={bankSettings.courseGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-1.5 rounded-lg transition text-[11px] inline-flex items-center gap-1 shadow-sm shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Active PDF &rarr;</span>
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
      {/* DUAL DOCUMENT INSPECTION MODAL                                */}
      {/* ============================================================ */}
      {docModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-black text-sm text-slate-900 block">
                  Document Viewer: {docModal.studentName} ({docModal.trackingId})
                </span>
                <span className="text-xs text-slate-400">
                  Inspect student payment receipt and admission clearance side-by-side
                </span>
              </div>
              <button
                onClick={() => setDocModal(null)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Document Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-bold">
              <button
                onClick={() => setDocModal({ ...docModal, activeTab: 'receipt' })}
                className={`py-3 px-4 border-b-2 flex items-center gap-1.5 ${
                  docModal.activeTab === 'receipt'
                    ? 'border-brand-800 text-brand-900 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment Proof Receipt</span>
                {docModal.receiptUrl ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ) : (
                  <span className="text-[10px] text-slate-400">(None)</span>
                )}
              </button>

              <button
                onClick={() => setDocModal({ ...docModal, activeTab: 'admission' })}
                className={`py-3 px-4 border-b-2 flex items-center gap-1.5 ${
                  docModal.activeTab === 'admission'
                    ? 'border-brand-800 text-brand-900 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Admission Letter / Student ID</span>
                {docModal.admissionLetterUrl ? (
                  <span className="w-2 h-2 rounded-full bg-gold-500" />
                ) : (
                  <span className="text-[10px] text-slate-400">(None)</span>
                )}
              </button>
            </div>

            {/* Viewer Pane */}
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-100 flex-1 min-h-[400px]">
              {docModal.activeTab === 'receipt' && (
                docModal.receiptUrl ? (
                  docModal.receiptUrl.toLowerCase().endsWith('.pdf') ? (
                    <iframe src={docModal.receiptUrl} className="w-full h-[520px] border-0 rounded-xl" title="Receipt PDF" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={docModal.receiptUrl}
                      alt="Receipt Proof"
                      className="max-h-[560px] max-w-full object-contain rounded-xl shadow"
                    />
                  )
                ) : (
                  <div className="text-slate-400 text-xs italic">No receipt proof uploaded for this student yet.</div>
                )
              )}

              {docModal.activeTab === 'admission' && (
                docModal.admissionLetterUrl ? (
                  docModal.admissionLetterUrl.toLowerCase().endsWith('.pdf') ? (
                    <iframe src={docModal.admissionLetterUrl} className="w-full h-[520px] border-0 rounded-xl" title="Admission Letter PDF" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={docModal.admissionLetterUrl}
                      alt="Admission Letter"
                      className="max-h-[560px] max-w-full object-contain rounded-xl shadow"
                    />
                  )
                ) : (
                  <div className="text-slate-400 text-xs italic">No admission letter / student ID uploaded for this student.</div>
                )
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                {docModal.activeTab === 'receipt' && docModal.receiptUrl && (
                  <a
                    href={docModal.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-brand-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open Receipt Full Size</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {docModal.activeTab === 'admission' && docModal.admissionLetterUrl && (
                  <a
                    href={docModal.admissionLetterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-gold-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open Admission Letter Full Size</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <button
                onClick={() => setDocModal(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT / CREATE SCHOOL MODAL                                    */}
      {/* ============================================================ */}
      {showSchoolModal && editingSchool && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSchool}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <SchoolIcon className="w-5 h-5 text-emerald-700" />
                <span>{editingSchool.name ? 'Edit School Configuration' : 'Add New Partner School'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSchoolModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">School Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Go-Tegs International School"
                value={editingSchool.name}
                onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15, Ayesanmi Street, GloryLand"
                  value={editingSchool.address}
                  onChange={(e) => setEditingSchool({ ...editingSchool, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Area / Corridor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Isheri Pipeline, Lagos"
                  value={editingSchool.area}
                  onChange={(e) => setEditingSchool({ ...editingSchool, area: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Secret Access Code * (Provided to School Coordinator)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SCHOOL-2026"
                value={editingSchool.accessCode}
                onChange={(e) => setEditingSchool({ ...editingSchool, accessCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Never shared publicly. Students must type this exact code to unlock the ₦5,000 subsidized rate.
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={editingSchool.hasPaymentConfigured}
                  onChange={(e) =>
                    setEditingSchool({
                      ...editingSchool,
                      hasPaymentConfigured: e.target.checked,
                      paymentMethod: e.target.checked ? 'bank_transfer' : 'pending',
                    })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  School Has Dedicated Receiving Account (e.g. Go-Tegs)
                </span>
              </label>

              {editingSchool.hasPaymentConfigured ? (
                <div className="space-y-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. OPay / PalmPay"
                        value={editingSchool.bankName || ''}
                        onChange={(e) => setEditingSchool({ ...editingSchool, bankName: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Account Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 8168575186"
                        value={editingSchool.accountNumber || ''}
                        onChange={(e) => setEditingSchool({ ...editingSchool, accountNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Account Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Go-Tegs Int. School (Python Cohort)"
                      value={editingSchool.accountName || ''}
                      onChange={(e) => setEditingSchool({ ...editingSchool, accountName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                  Pending: School registration will display the honest pending notice explaining that administrative payment arrangements are currently being finalized with school management.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingSchool.isEnabled}
                  onChange={(e) => setEditingSchool({ ...editingSchool, isEnabled: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">School Active in Directory</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow"
                >
                  Save School
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
