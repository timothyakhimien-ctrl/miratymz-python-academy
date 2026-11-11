'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Building,
  Calendar,
  FileText,
  CreditCard,
  Upload,
} from 'lucide-react';
import { formatNaira } from '@/lib/utils';

function StatusContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Auto-search if query param present
  useEffect(() => {
    if (initialQuery) {
      performLookup(initialQuery);
    }
  }, [initialQuery]);

  const performLookup = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setErrorMsg('Please enter your Tracking ID, Email, or WhatsApp Number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch(`/api/status?q=${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No registration record found.');
      }

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error checking status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(query);
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-700 bg-brand-100 px-3.5 py-1 rounded-full border border-brand-200">
          Real-Time Verification
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Check Your Admission &amp; Payment Status
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Enter your Tracking ID (e.g. MTZ-XXXXX) or the WhatsApp phone number you registered with.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              required
              placeholder="Enter Tracking ID (e.g. MTZ-7A9B2) or Phone Number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-800 hover:bg-brand-900 text-white font-bold px-6 py-3 rounded-2xl transition disabled:opacity-50 text-sm shadow-sm flex items-center gap-2"
          >
            {loading ? <span>Searching...</span> : <span>Verify</span>}
          </button>
        </div>
      </form>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Record Not Found</div>
            <p className="text-xs mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Status Result Card */}
      {result && result.registration && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {result.registration.fullName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>Tracking ID:</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {result.registration.trackingId}
                </span>
                <button
                  type="button"
                  onClick={() => copyId(result.registration.trackingId)}
                  className="text-brand-700 hover:text-brand-900"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Status Pill */}
            <div>
              {result.registration.status === 'Approved' && (
                <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>ADMISSION APPROVED</span>
                </div>
              )}
              {result.registration.status === 'Under Review' && (
                <div className="bg-blue-100 text-blue-900 border border-blue-300 font-black text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-4 h-4 text-blue-700 animate-spin" />
                  <span>PAYMENT UNDER REVIEW</span>
                </div>
              )}
              {result.registration.status === 'Pending' && (
                <div className="bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>AWAITING PAYMENT / PROOF</span>
                </div>
              )}
              {result.registration.status === 'Declined' && (
                <div className="bg-red-100 text-red-900 border border-red-300 font-black text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <XCircle className="w-4 h-4 text-red-700" />
                  <span>VERIFICATION DECLINED</span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* STATE 1: APPROVED (With Rephrased WhatsApp Invite)       */}
          {/* ========================================================= */}
          {result.registration.status === 'Approved' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-900 to-brand-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-400/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Congratulations! Your Admission is Confirmed.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                    Your payment of <strong>{formatNaira(result.registration.amount)}</strong> has been verified and approved by the MiraTymz Admissions Desk. You have been granted full student credentials for the <strong>8-Week Python Training Programme</strong>.
                  </p>
                </div>

                {/* Instant WhatsApp Button */}
                <div className="pt-2">
                  <a
                    href={result.whatsappLink || 'https://chat.whatsapp.com/invite/miratymz-python-vip'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-black text-sm sm:text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition transform hover:-translate-y-0.5"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Join Approved Paid Members WhatsApp Group</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Click the button above right away to join your class group, receive lecture schedules, and download orientation software packages.
                  </p>
                </div>
              </div>

              {/* Class Schedule Note */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-700" />
                  <span>Official Class Commencement Date:</span>
                </div>
                <strong className="text-brand-900">Monday, 16 November 2026</strong>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STATE 2: UNDER REVIEW                                    */}
          {/* ========================================================= */}
          {result.registration.status === 'Under Review' && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-blue-900 space-y-3">
              <div className="flex items-center gap-2 font-black text-base text-blue-950">
                <Clock className="w-5 h-5 text-blue-700" />
                <span>Your Transaction Receipt is Under Review</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-blue-900/90">
                We have successfully logged your proof of payment. Our admissions team is currently matching your transfer against our banking ledger. Verification typically completes within <strong>15 to 30 minutes</strong>.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                {result.registration.receiptUrl && (
                  <a
                    href={result.registration.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-blue-300 hover:bg-blue-100 transition shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Uploaded Receipt</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
                <span className="text-slate-500">
                  Please refresh this page shortly to check for final approval.
                </span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STATE 3: PENDING (Provide details to finish payment)      */}
          {/* ========================================================= */}
          {result.registration.status === 'Pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-950 space-y-4">
              <div className="flex items-center gap-2 font-black text-base text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-700" />
                <span>Pending Payment Confirmation</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                Your registration form has been recorded, but we have not yet received your payment receipt. Please make your transfer of <strong>{formatNaira(result.registration.amount)}</strong> to the account below and submit your receipt.
              </p>

              {result.bankDetails && (
                <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs space-y-2">
                  <div className="font-bold text-slate-800">Bank Transfer Details:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-400 block">Bank Name:</span>
                      <strong className="text-slate-900">{result.bankDetails.bankName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Account Number:</span>
                      <strong className="text-brand-900 font-mono text-sm">{result.bankDetails.accountNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Account Name:</span>
                      <strong className="text-slate-900">{result.bankDetails.accountName}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Payment Receipt Now</span>
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STATE 4: DECLINED                                        */}
          {/* ========================================================= */}
          {result.registration.status === 'Declined' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-950 space-y-3">
              <div className="flex items-center gap-2 font-black text-base text-red-900">
                <XCircle className="w-5 h-5 text-red-700" />
                <span>Verification Issue / Payment Declined</span>
              </div>
              <p className="text-xs sm:text-sm text-red-900/90 leading-relaxed">
                {result.registration.declinedReason ||
                  'Your submitted receipt could not be validated or the transfer was not confirmed in our records.'}
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
                >
                  <span>Re-submit Correct Proof of Payment</span>
                </Link>
              </div>
            </div>
          )}

          {/* Summary Registration Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block">Category</span>
              <strong className="text-slate-800 uppercase font-extrabold">
                {result.registration.category === 'uniben' ? 'UNIBEN Participant' : 'General Public'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Tuition Fee</span>
              <strong className="text-brand-900 font-extrabold">
                {formatNaira(result.registration.amount)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Institution</span>
              <strong className="text-slate-800">{result.registration.institution}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">WhatsApp Phone</span>
              <strong className="text-slate-800">{result.registration.phone}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading Status Portal...</div>}>
      <StatusContent />
    </Suspense>
  );
}
