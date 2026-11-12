'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Copy,
  Check,
  Upload,
  FileText,
  AlertCircle,
  Building,
  CreditCard,
  User,
  Mail,
  Phone,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Target,
} from 'lucide-react';
import { formatNaira } from '@/lib/utils';

function RegisterForm() {
  const searchParams = useSearchParams();
  const preCategory = searchParams.get('category');

  // Multi-step: 
  // 1 = Details Form
  // 2 = UNIBEN Clearance Slip (if UNIBEN) OR skipped to 3 (if General)
  // 3 = Bank Details & Receipt Upload
  // 4 = Confirmation & 24hr Warning
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('University of Benin (UNIBEN)');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('200 Level');
  const [learningGoals, setLearningGoals] = useState('');
  const [category, setCategory] = useState<'uniben' | 'general'>(
    preCategory === 'general' ? 'general' : 'uniben'
  );

  // Step 2 & 3 Server Data
  const [trackingId, setTrackingId] = useState('');
  const [amount, setAmount] = useState(5950);
  const [bankDetails, setBankDetails] = useState({
    bankName: 'OPay / PalmPay',
    accountNumber: '8100000000',
    accountName: 'MiraTymz Programming Academy',
  });

  // Files
  const [clearanceFile, setClearanceFile] = useState<File | null>(null);
  const [clearancePreview, setClearancePreview] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Step 1 Submit (Personal Details)
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          institution: category === 'uniben' ? institution : 'General Public',
          department: category === 'uniben' ? department : 'General',
          level: category === 'uniben' ? level : 'General',
          category,
          learningGoals,
          learningMode: 'online',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit details');
      }

      setTrackingId(data.trackingId);
      setAmount(data.amount);
      if (data.bankDetails) {
        setBankDetails(data.bankDetails);
      }

      // If UNIBEN -> go to Step 2 (Clearance Slip upload)
      // If General -> proceed directly to Step 3 (Payment Transfer & Receipt)
      if (category === 'uniben') {
        setStep(2);
      } else {
        setStep(3);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2 (Clearance Slip validation)
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clearanceFile) {
      setErrorMsg('Please select your UNIBEN clearance slip, course registration slip, or student ID card.');
      return;
    }
    setErrorMsg('');
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Step 3 (Receipt upload and final submission)
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      setErrorMsg('Please upload a screenshot or PDF receipt of your payment transfer.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('trackingId', trackingId);
      formData.append('file', receiptFile);
      if (clearanceFile) {
        formData.append('clearanceFile', clearanceFile);
      }

      const res = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload receipt');
      }

      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading receipt.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Receipt File Selection
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      if (file.type.startsWith('image/')) {
        setReceiptPreview(URL.createObjectURL(file));
      } else {
        setReceiptPreview(null);
      }
    }
  };

  // Handle Clearance File Selection
  const handleClearanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setClearanceFile(file);
      if (file.type.startsWith('image/')) {
        setClearancePreview(URL.createObjectURL(file));
      } else {
        setClearancePreview(null);
      }
    }
  };

  // Copy Account Number
  const copyAccount = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Copy Tracking ID
  const copyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Step Indicator Header */}
      <div className="mb-10 text-center">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-700 bg-brand-100 px-3.5 py-1 rounded-full border border-brand-200">
          Official Enrollment Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          {step === 1 && 'Step 1: Student Information'}
          {step === 2 && 'Step 2: UNIBEN Student Verification'}
          {step === 3 && 'Step 3: Bank Transfer & Payment Proof'}
          {step === 4 && 'Registration Successfully Received!'}
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          {step === 1 && 'Fill your details below to calculate your course fee and generate your enrollment ID.'}
          {step === 2 && 'Upload your UNIBEN student clearance slip or ID card to validate your 30% discount.'}
          {step === 3 && 'Transfer the exact fee to the designated account below and submit your payment screenshot.'}
          {step === 4 && 'Your payment is now under review by our admissions department.'}
        </p>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6">
          <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 1 ? 'text-brand-800' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-brand-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
              1
            </span>
            <span className="hidden sm:inline">Details</span>
          </div>
          <div className={`w-6 sm:w-10 h-0.5 ${step >= 2 ? 'bg-brand-800' : 'bg-slate-200'}`} />
          
          {category === 'uniben' && (
            <>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 2 ? 'text-brand-800' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-brand-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  2
                </span>
                <span className="hidden sm:inline">Clearance</span>
              </div>
              <div className={`w-6 sm:w-10 h-0.5 ${step >= 3 ? 'bg-brand-800' : 'bg-slate-200'}`} />
            </>
          )}

          <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 3 ? 'text-brand-800' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-brand-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {category === 'uniben' ? '3' : '2'}
            </span>
            <span className="hidden sm:inline">Payment</span>
          </div>
          <div className={`w-6 sm:w-10 h-0.5 ${step >= 4 ? 'bg-brand-800' : 'bg-slate-200'}`} />

          <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 4 ? 'text-brand-800' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 4 ? 'bg-brand-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {category === 'uniben' ? '4' : '3'}
            </span>
            <span className="hidden sm:inline">Finish</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1: PERSONAL & ACADEMIC DETAILS FORM                    */}
      {/* ============================================================ */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Category Selector Card */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Your Enrollment Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`cursor-pointer rounded-2xl p-4 border-2 transition flex flex-col justify-between ${
                  category === 'uniben'
                    ? 'border-brand-700 bg-brand-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-brand-950 text-base">UNIBEN Student</span>
                    <input
                      type="radio"
                      name="category"
                      value="uniben"
                      checked={category === 'uniben'}
                      onChange={() => setCategory('uniben')}
                      className="text-brand-700 focus:ring-brand-500"
                    />
                  </div>
                  <div className="mt-2 text-2xl font-black text-brand-900">
                    ₦5,950{' '}
                    <span className="text-xs line-through text-slate-400 font-normal">₦8,500</span>
                  </div>
                  <p className="text-xs text-brand-700 mt-1 font-semibold">
                    &bull; 30% Off Limited University Subsidy
                  </p>
                </div>
              </label>

              <label
                className={`cursor-pointer rounded-2xl p-4 border-2 transition flex flex-col justify-between ${
                  category === 'general'
                    ? 'border-brand-700 bg-brand-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-base">General Public</span>
                    <input
                      type="radio"
                      name="category"
                      value="general"
                      checked={category === 'general'}
                      onChange={() => setCategory('general')}
                      className="text-brand-700 focus:ring-brand-500"
                    />
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900">
                    ₦10,000
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    &bull; Open to Everyone (No University Affiliation Required)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name (First &amp; Last Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Timothy Akhimien"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className={category === 'general' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                WhatsApp Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0812 345 6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                This is the number to be added to the Paid Members WhatsApp Group upon approval.
              </span>
            </div>

            {/* UNIBEN Specific Fields: Institution, Department, Level */}
            {category === 'uniben' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Institution / University *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. University of Benin (UNIBEN)"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Department / Faculty
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Computer Science / Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Academic Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent bg-white"
                  >
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                    <option value="500 Level">500 Level</option>
                    <option value="Graduate / Professional">Graduate / Working Professional</option>
                  </select>
                </div>
              </>
            )}

            {/* Optional Learning Goals / Targets TextArea for all categories */}
            <div className="sm:col-span-2 pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-brand-700" />
                  <span>What do you want to achieve after this Python course?</span>
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {learningGoals.length} characters (1,500 recommended)
                </span>
              </div>
              <textarea
                rows={5}
                placeholder="Tell us what you want to achieve after this course (e.g. automated scripting, software engineering, machine learning, career progression, or personal projects)..."
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent resize-y"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Optional – share your specific targets so our mentors can personalize your learning path and project assignments.
              </span>
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-xs text-brand-900 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              <strong>100% Online Intensive Mode:</strong> Live interactive broadcasting, step-by-step coding demonstrations, and recorded replays for your schedule.
            </span>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-800 hover:bg-brand-900 text-white font-extrabold text-base py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Generating Payment Order...</span>
              ) : (
                <>
                  <span>Proceed to Payment ({category === 'uniben' ? '₦5,950' : '₦10,000'})</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              Next step: Bank Account details and payment proof upload.
            </p>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* STEP 2: UNIBEN CLEARANCE SLIP UPLOAD (For UNIBEN Students)   */}
      {/* ============================================================ */}
      {step === 2 && category === 'uniben' && (
        <form onSubmit={handleStep2Submit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="bg-gold-50 border border-gold-200 rounded-2xl p-4 text-gold-950 flex items-start gap-3">
            <FileText className="w-5 h-5 text-gold-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                UNIBEN Student Enrollment Verification
              </h3>
              <p className="text-xs text-gold-900 mt-1 leading-relaxed">
                To activate your <strong>30% university discount (₦5,950)</strong>, please attach a snapshot or PDF of your UNIBEN clearance slip, course registration form, or student ID card.
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-gold-300 hover:border-gold-500 bg-gold-50/20 rounded-2xl p-6 sm:p-8 text-center transition">
            <input
              type="file"
              id="clearanceUpload"
              required
              accept="image/*,.pdf"
              onChange={handleClearanceChange}
              className="hidden"
            />
            <label htmlFor="clearanceUpload" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gold-100 text-gold-800 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                {clearanceFile ? clearanceFile.name : 'Click to select UNIBEN clearance slip or student ID'}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Supports JPG, PNG, WebP or PDF (Max 10MB)
              </span>
            </label>

            {clearancePreview && (
              <div className="mt-4 inline-block relative border rounded-xl overflow-hidden shadow-sm max-w-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={clearancePreview} alt="Clearance slip preview" className="max-h-40 object-contain" />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
            >
              &larr; Back to Details
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 bg-brand-800 hover:bg-brand-900 text-white font-extrabold text-base py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Continue to Payment &rarr;</span>
            </button>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* STEP 3: BANK TRANSFER DETAILS & RECEIPT UPLOAD             */}
      {/* ============================================================ */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Tracking ID Header Card */}
          <div className="bg-brand-950 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block">
                Your Unique Tracking Reference
              </span>
              <div className="text-3xl font-black tracking-wider text-white mt-1">
                {trackingId}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Keep this code safe to check your admission status anytime.
              </p>
            </div>
            <div className="text-right sm:text-right w-full sm:w-auto bg-brand-900/60 p-4 rounded-2xl border border-brand-800">
              <span className="text-xs text-slate-300 block">Amount to Transfer:</span>
              <span className="text-2xl sm:text-3xl font-black text-gold-400">
                {formatNaira(amount)}
              </span>
            </div>
          </div>

          {/* Official Bank Account Details Box */}
          <div className="bg-white border-2 border-brand-700/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-brand-900 font-extrabold text-base mb-4 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-brand-600" />
              <span>Designated Bank Account for MiraTymz Academy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">Bank Name</span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                  {bankDetails.bankName}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-semibold block">Account Number</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-mono font-black text-brand-900">
                    {bankDetails.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={copyAccount}
                    className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 transition text-slate-700 text-xs flex items-center gap-1 shadow-sm"
                    title="Copy Account Number"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="font-bold">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-semibold block">Account Name</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                  {bankDetails.accountName}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Please transfer exactly <strong>{formatNaira(amount)}</strong>. You may use your Tracking ID <strong>({trackingId})</strong> as your transfer remark/narration.
              </span>
            </div>
          </div>

          {/* Upload Proof of Payment Form */}
          <form onSubmit={handleStep3Submit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-700" />
                <span>Upload Transaction Proof (Receipt / Screenshot) *</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload your bank receipt in JPG, PNG, or PDF format after completing your transfer.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-brand-600 rounded-2xl p-6 text-center transition bg-slate-50/50">
              <input
                type="file"
                id="receiptUpload"
                required
                accept="image/*,.pdf"
                onChange={handleReceiptChange}
                className="hidden"
              />
              <label htmlFor="receiptUpload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {receiptFile ? receiptFile.name : 'Click to select receipt image or PDF'}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports JPG, PNG, WebP or PDF (Max 10MB)
                </span>
              </label>

              {receiptPreview && (
                <div className="mt-4 inline-block relative border rounded-xl overflow-hidden shadow-sm max-w-[200px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={receiptPreview} alt="Receipt preview" className="max-h-36 object-contain" />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(category === 'uniben' ? 2 : 1)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-gradient-to-r from-brand-800 to-emerald-900 hover:from-brand-900 hover:to-emerald-950 text-white font-extrabold text-base py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Uploading Receipt &amp; Submitting...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-brand-400" />
                    <span>I Have Paid &bull; Submit Proof (Done)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 4: SUBMISSION SUCCESS & 24HR SECURITY WARNING          */}
      {/* ============================================================ */}
      {step === 4 && (
        <div className="bg-white border-2 border-brand-600 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Receipt Successfully Uploaded
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              Payment Under Review!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Thank you, <strong>{fullName}</strong>. Your payment proof and details have been securely received by the MiraTymz Admissions Desk.
            </p>
          </div>

          {/* Tracking ID Badge with Copy */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Your Application Tracking Reference
            </span>
            <div className="flex items-center justify-center gap-2 my-1">
              <span className="text-3xl font-mono font-black text-brand-900 tracking-wider">
                {trackingId}
              </span>
              <button
                type="button"
                onClick={copyTrackingId}
                className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 transition text-slate-700 text-xs flex items-center gap-1 shadow-sm"
                title="Copy Tracking ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="font-bold">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Save this reference code to check your admission status anytime.
            </p>
          </div>

          {/* 24-HOUR SECURITY NOTICE */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 max-w-md mx-auto text-left text-amber-950 space-y-2">
            <div className="font-extrabold text-sm flex items-center gap-2 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <span>IMPORTANT: Copy &amp; Save Your Tracking ID!</span>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              For security and privacy reasons, this tracking reference will <strong>stop displaying on this page after 24 hours</strong>. However, it will remain fully functional in our system for your status lookups. Copy or screenshot it now!
            </p>
          </div>

          {/* What Happens Next Callout */}
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs text-brand-900 leading-relaxed space-y-2">
            <div className="font-extrabold flex items-center gap-1.5 text-brand-950">
              <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
              <span>What Happens Next?</span>
            </div>
            <p>
              1. Our finance and admissions officers will verify your transfer and student clearance slip.
            </p>
            <p>
              2. Once approved, you can visit the <strong>Status Page</strong> to connect with the admin directly on WhatsApp with your student credentials to be added to the VIP Paid Members Group.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/api/course-guide/download"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-extrabold px-6 py-3.5 rounded-xl shadow transition flex items-center justify-center gap-2 text-sm"
            >
              <FileText className="w-4 h-4 text-gold-400" />
              <span>Download 8-Week Course Guide (PDF)</span>
            </a>
            <Link
              href={`/status?q=${trackingId}`}
              className="w-full sm:w-auto bg-brand-800 hover:bg-brand-900 text-white font-extrabold px-8 py-3.5 rounded-xl shadow transition"
            >
              Check My Admission Status Now &rarr;
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3.5 rounded-xl transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading Enrollment Portal...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
