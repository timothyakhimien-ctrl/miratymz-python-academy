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
  Lock,
  MessageCircle,
  X,
  Search,
  KeyRound,
  GraduationCap,
  School as SchoolIcon,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import type { PublicPromoData } from '@/lib/promo';

interface PublicSchoolItem {
  id: string;
  name: string;
  address: string;
  area: string;
  isEnabled: boolean;
  hasPaymentConfigured: boolean;
}

function RegisterForm({ initialPromo }: { initialPromo?: PublicPromoData }) {
  const searchParams = useSearchParams();
  const preCategory = searchParams.get('category');

  // Multi-step: 
  // 1 = Details Form
  // 2 = UNIBEN Admission Letter (if UNIBEN) OR skipped to 3 (if General / School)
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

  // 3 Categories: 'uniben' | 'school' | 'general'
  const initialCat = preCategory === 'school' ? 'school' : preCategory === 'general' ? 'general' : 'uniben';
  const [category, setCategory] = useState<'uniben' | 'school' | 'general'>(initialCat);

  // School Specific State
  const [schoolsList, setSchoolsList] = useState<PublicSchoolItem[]>([]);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [schoolCodeInput, setSchoolCodeInput] = useState('');
  const [classLevel, setClassLevel] = useState('Senior Secondary (SS 2)');
  const [isSchoolCodeVerified, setIsSchoolCodeVerified] = useState(false);
  const [verifiedSchoolData, setVerifiedSchoolData] = useState<any>(null);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [schoolCodeError, setSchoolCodeError] = useState('');

  const isInitialActive = initialPromo ? initialPromo.isOfferActive : true;
  const initialUniben = initialPromo 
    ? (initialPromo.isOfferActive ? initialPromo.unibenDiscountFee : initialPromo.unibenNormalFee)
    : 5950;
  const initialGeneral = initialPromo 
    ? (initialPromo.isOfferActive ? initialPromo.generalDiscountFee : initialPromo.generalNormalFee)
    : 10000;

  // Dynamic fees from admin settings
  const [fees, setFees] = useState({
    uniben: initialUniben,
    general: initialGeneral,
    unibenNormal: initialPromo?.unibenNormalFee || 8500,
    generalNormal: initialPromo?.generalNormalFee || 15000,
    isOfferActive: isInitialActive,
    slots: initialPromo?.limitedOfferSlots || 7,
  });

  // Step 2 & 3 Server Data
  const [trackingId, setTrackingId] = useState('');
  const [amount, setAmount] = useState(
    category === 'school' ? 5000 : category === 'general' ? initialGeneral : initialUniben
  );
  const [bankDetails, setBankDetails] = useState({
    bankName: 'OPay / PalmPay',
    accountNumber: '8100000000',
    accountName: 'MiraTymz Programming Academy',
    paymentInstructions: 'Transfer the exact amount and upload your transfer receipt as proof of payment.',
    hasPaymentConfigured: true,
    paymentMethod: 'bank_transfer',
  });

  // Files
  const [clearanceFile, setClearanceFile] = useState<File | null>(null);
  const [clearancePreview, setClearancePreview] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    department?: string;
    school?: string;
  }>({});
  const [phoneWarning, setPhoneWarning] = useState('');
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);

  // Fetch live active pricing on mount
  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.effectiveFees) {
          const isOfferActive = data.isOfferActive !== false;
          setFees({
            uniben: Number(data.effectiveFees.uniben) || 5950,
            general: Number(data.effectiveFees.general) || 10000,
            unibenNormal: Number(data.promoSettings?.unibenNormalFee) || 8500,
            generalNormal: Number(data.promoSettings?.generalNormalFee) || 15000,
            isOfferActive,
            slots: Number(data.promoSettings?.limitedOfferSlots) || 7,
          });
          if (category === 'uniben') {
            setAmount(data.effectiveFees.uniben);
          } else if (category === 'general') {
            setAmount(data.effectiveFees.general);
          }
        }
      } catch {}
    }
    fetchPricing();
  }, [category]);

  // Load school directory when category is school
  useEffect(() => {
    async function loadSchools() {
      try {
        const res = await fetch('/api/schools');
        const data = await res.json();
        if (data.schools && Array.isArray(data.schools)) {
          setSchoolsList(data.schools);
          // Auto-select Go-Tegs as default if available
          if (!selectedSchoolId && data.schools.length > 0) {
            const gotegs = data.schools.find((s: PublicSchoolItem) => s.id === 'gotegs-intl');
            if (gotegs) {
              setSelectedSchoolId(gotegs.id);
            } else {
              setSelectedSchoolId(data.schools[0].id);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch schools directory:', err);
      }
    }
    if (category === 'school' && schoolsList.length === 0) {
      loadSchools();
    }
  }, [category, schoolsList.length, selectedSchoolId]);

  // Handle school code verification on server
  const handleVerifySchoolCode = async () => {
    if (isSchoolCodeVerified) return; // Prevent re-submitting while already verified
    if (!selectedSchoolId) {
      setSchoolCodeError('Please select your school from the directory first.');
      return;
    }
    if (!schoolCodeInput.trim()) {
      setSchoolCodeError('Please enter your school access code.');
      return;
    }

    setSchoolCodeError('');
    setFieldErrors((prev) => ({ ...prev, school: undefined }));
    setVerifyingCode(true);

    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: selectedSchoolId,
          accessCode: schoolCodeInput.trim(),
          code: schoolCodeInput.trim(),
        }),
      });

      const data = await res.json();
      const isVerifiedOk = res.ok && (data.valid === true || data.success === true) && Boolean(data.school);

      if (!isVerifiedOk) {
        setIsSchoolCodeVerified(false);
        setVerifiedSchoolData(null);
        setSchoolCodeError(
          data.error ||
            data.message ||
            'Invalid school access code. Please check with your teacher or school coordinator.'
        );
      } else {
        setIsSchoolCodeVerified(true);
        setVerifiedSchoolData(data.school);
        setAmount(data.school.fee || 5000); // ₦5,000 subsidized school fee revealed ONLY upon verification
        setSchoolCodeError('');
        setErrorMsg('');
      }
    } catch (err: any) {
      setSchoolCodeError('Network error verifying code. Please check your connection and try again.');
    } finally {
      setVerifyingCode(false);
    }
  };

  // Allow user to unlock and change their school or code
  const handleResetSchoolVerification = () => {
    setIsSchoolCodeVerified(false);
    setVerifiedSchoolData(null);
    setSchoolCodeInput('');
    setSchoolCodeError('');
    setFieldErrors((prev) => ({ ...prev, school: undefined }));
  };

  // Handle Phone Change with Smart Real-Time Validation
  const handlePhoneChange = (val: string) => {
    if (/[a-zA-Z]/.test(val)) {
      setPhoneWarning('Numbers only: please do not enter letters in the phone field.');
    } else {
      setPhoneWarning('');
    }
    const sanitized = val.replace(/[^0-9+\s-]/g, '');
    setPhone(sanitized);
    if (errorMsg) setErrorMsg('');
  };

  // Handle Step 1 Submit
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const newFieldErrors: {
      fullName?: string;
      email?: string;
      phone?: string;
      department?: string;
      school?: string;
    } = {};

    // 1. School validation (must be verified first if school category)
    if (category === 'school') {
      if (!selectedSchoolId) {
        newFieldErrors.school = 'Please select your school from the directory above.';
      } else if (!isSchoolCodeVerified || !verifiedSchoolData) {
        newFieldErrors.school = 'Please enter and verify your school access code first to unlock the ₦5,000 rate.';
      }
    }

    // 2. Full name validation
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 3) {
      newFieldErrors.fullName = 'Please enter your full name (First Name and Surname, at least 3 characters).';
    }

    // 3. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newFieldErrors.email = 'Please provide a valid email address (e.g. yourname@gmail.com).';
    }

    // 4. Phone number validation
    const rawPhone = phone.trim();
    const phoneDigits = rawPhone.replace(/\D/g, '');
    if (!rawPhone || phoneDigits.length < 10) {
      newFieldErrors.phone = 'Please enter a valid WhatsApp phone number with at least 10 digits (e.g. 08123456789).';
    }

    // 5. UNIBEN Department validation
    if (category === 'uniben' && (!department || !department.trim())) {
      newFieldErrors.department = 'Please enter your UNIBEN Department / Faculty.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      const firstMsg =
        newFieldErrors.school ||
        newFieldErrors.fullName ||
        newFieldErrors.email ||
        newFieldErrors.phone ||
        newFieldErrors.department ||
        'Please complete all required fields.';
      setErrorMsg(firstMsg);
      window.scrollTo({ top: 140, behavior: 'smooth' });
      return;
    }

    setFieldErrors({});

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: trimmedName,
          email: email.trim(),
          phone: rawPhone,
          institution: category === 'school' ? verifiedSchoolData.name : category === 'uniben' ? institution.trim() : 'General Public',
          department: category === 'school' ? classLevel : category === 'uniben' ? department.trim() : 'General',
          level: category === 'school' ? 'School Student' : category === 'uniben' ? level : 'General',
          category,
          learningGoals: learningGoals.trim(),
          schoolId: category === 'school' ? selectedSchoolId : undefined,
          schoolCode: category === 'school' ? schoolCodeInput.trim() : undefined,
          classLevel: category === 'school' ? classLevel : undefined,
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

      // If UNIBEN -> go to Step 2 (Admission Letter upload)
      // If School or General -> proceed directly to Step 3 (Payment Transfer & Receipt)
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

  // Handle Step 2 (Admission Letter validation)
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clearanceFile) {
      setErrorMsg('Please select your UNIBEN Admission Letter, course registration slip, or student ID card before proceeding.');
      return;
    }
    setErrorMsg('');
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Step 3 (Receipt upload and final submission with smart popup if missing)
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      setShowReceiptPopup(true);
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

  // Filtered schools
  const filteredSchools = schoolsList.filter((s) =>
    s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    s.address.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    s.area.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Step Indicator Header */}
      <div className="mb-10 text-center">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-700 bg-brand-100 px-3.5 py-1 rounded-full border border-brand-200">
          Official Enrollment Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          {step === 1 && 'Step 1: Student Information'}
          {step === 2 && 'Step 2: UNIBEN Admission Letter Verification'}
          {step === 3 && 'Step 3: Bank Transfer & Payment Proof'}
          {step === 4 && 'Registration Successfully Received!'}
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          {step === 1 && 'Fill your details below to calculate your course fee and generate your enrollment ID.'}
          {step === 2 && (fees.isOfferActive
            ? 'Upload your UNIBEN Admission Letter (or course registration slip / student ID) to validate your 30% discount.'
            : 'Upload your UNIBEN Admission Letter (or course registration slip / student ID) to validate your student status.'
          )}
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
                <span className="hidden sm:inline">Admission Letter</span>
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

      {/* Smart Animated Response Correction Popup Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 via-rose-50 to-red-50 border-2 border-red-400 text-red-950 text-xs sm:text-sm shadow-md flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <strong className="block font-black text-red-900 text-xs uppercase tracking-wider mb-0.5">
                Correction Needed
              </strong>
              <p className="text-red-900/90 leading-relaxed font-semibold">
                {errorMsg}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="p-1 text-red-400 hover:text-red-800 transition"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1: PERSONAL & ACADEMIC DETAILS FORM                    */}
      {/* ============================================================ */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} noValidate className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
          {/* Category Selector Card - 3 DISTINCT CATEGORIES */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Your Enrollment Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. UNIBEN Student */}
              <label
                className={`cursor-pointer rounded-2xl p-4 border-2 transition flex flex-col justify-between ${
                  category === 'uniben'
                    ? 'border-brand-700 bg-brand-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-brand-950 text-sm sm:text-base flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-brand-700 shrink-0" />
                      <span>UNIBEN Student</span>
                    </span>
                    <input
                      type="radio"
                      name="category"
                      value="uniben"
                      checked={category === 'uniben'}
                      onChange={() => {
                        setCategory('uniben');
                        setAmount(fees.isOfferActive ? fees.uniben : fees.unibenNormal);
                        setErrorMsg('');
                      }}
                      className="text-brand-700 focus:ring-brand-500"
                    />
                  </div>
                  <div className="mt-2 text-xl sm:text-2xl font-black text-brand-900 flex items-baseline gap-1.5">
                    <span>₦{(fees.isOfferActive ? fees.uniben : fees.unibenNormal).toLocaleString()}</span>
                    {fees.isOfferActive && (
                      <span className="text-[11px] line-through text-slate-400 font-normal">
                        ₦{fees.unibenNormal.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-brand-700 mt-1 font-semibold">
                    {fees.isOfferActive ? '30% Subsidy Active' : 'Undergraduate Rate'}
                  </p>
                </div>
              </label>

              {/* 2. School Students (Isheri Pipeline / Go-Tegs) */}
              <label
                className={`cursor-pointer rounded-2xl p-4 border-2 transition flex flex-col justify-between ${
                  category === 'school'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-950 text-sm sm:text-base flex items-center gap-1.5">
                      <SchoolIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>School Student</span>
                    </span>
                    <input
                      type="radio"
                      name="category"
                      value="school"
                      checked={category === 'school'}
                      onChange={() => {
                        setCategory('school');
                        setErrorMsg('');
                      }}
                      className="text-emerald-700 focus:ring-emerald-500"
                    />
                  </div>

                  {/* STRICT REQUIREMENT: DO NOT SHOW ₦5,000 BEFORE CODE IS VERIFIED */}
                  {isSchoolCodeVerified && verifiedSchoolData ? (
                    <div className="mt-2">
                      <div className="text-xl sm:text-2xl font-black text-emerald-800">
                        ₦{(5000).toLocaleString()}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mt-0.5">
                        ✓ Subsidized Partner Tuition
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="text-xs font-black text-emerald-900 uppercase tracking-wide bg-emerald-100/70 px-2 py-1 rounded-lg inline-block">
                        Access Code Required
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        Special rate unlocked upon school code entry.
                      </p>
                    </div>
                  )}
                </div>
              </label>

              {/* 3. General Public */}
              <label
                className={`cursor-pointer rounded-2xl p-4 border-2 transition flex flex-col justify-between ${
                  category === 'general'
                    ? 'border-brand-700 bg-brand-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>General Public</span>
                    </span>
                    <input
                      type="radio"
                      name="category"
                      value="general"
                      checked={category === 'general'}
                      onChange={() => {
                        setCategory('general');
                        setAmount(fees.isOfferActive ? fees.general : fees.generalNormal);
                        setErrorMsg('');
                      }}
                      className="text-brand-700 focus:ring-brand-500"
                    />
                  </div>
                  <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 flex items-baseline gap-1.5">
                    <span>₦{(fees.isOfferActive ? fees.general : fees.generalNormal).toLocaleString()}</span>
                    {fees.isOfferActive && (
                      <span className="text-[11px] line-through text-slate-400 font-normal">
                        ₦{fees.generalNormal.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Open to Everyone
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SCHOOL STUDENTS SPECIAL SECTION: DIRECTORY & ACCESS CODE */}
          {/* ========================================================= */}
          {category === 'school' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-slate-50 border-2 border-emerald-300 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <SchoolIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Isheri Pipeline &amp; Partner Schools Program
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                    Select your school and enter the official access code provided by your school administration or ICT coordinator to unlock the subsidized student rate.
                  </p>
                </div>
              </div>

              {/* School Search & Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-800">
                    1. Select Your School *
                  </label>
                  {isSchoolCodeVerified && (
                    <button
                      type="button"
                      onClick={handleResetSchoolVerification}
                      className="text-xs font-extrabold text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-300 hover:bg-emerald-50 px-3 py-1 rounded-lg transition inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Change School</span>
                    </button>
                  )}
                </div>

                {isSchoolCodeVerified && verifiedSchoolData ? (
                  <div className="p-3.5 rounded-xl bg-white border-2 border-emerald-500 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                          {verifiedSchoolData.name}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          School selection locked &bull; Click &quot;Change School&quot; to switch
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search school name or address (e.g. Go-Tegs, Phidel, Pipeline)..."
                        value={schoolSearch}
                        onChange={(e) => setSchoolSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                      />
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-white">
                      {filteredSchools.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400">
                          No schools found matching &quot;{schoolSearch}&quot;
                        </div>
                      ) : (
                        filteredSchools.map((s) => (
                          <button
                            type="button"
                            key={s.id}
                            onClick={() => {
                              setSelectedSchoolId(s.id);
                              setIsSchoolCodeVerified(false);
                              setVerifiedSchoolData(null);
                              setSchoolCodeError('');
                              setFieldErrors((prev) => ({ ...prev, school: undefined }));
                            }}
                            className={`w-full p-3 rounded-xl cursor-pointer transition text-left flex items-start justify-between gap-2 ${
                              selectedSchoolId === s.id
                                ? 'bg-emerald-100/80 border-2 border-emerald-500 text-emerald-950 font-bold'
                                : 'hover:bg-slate-50 border border-transparent text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="text-xs sm:text-sm font-extrabold flex flex-wrap items-center gap-1.5">
                                <span>{s.name}</span>
                                {s.id === 'gotegs-intl' && (
                                  <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                                    Featured Partner
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                                {s.address} &bull; {s.area}
                              </div>
                            </div>
                            {selectedSchoolId === s.id && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* School Access Code Input */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-800">
                  2. Enter School Access Code *
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <KeyRound className={`w-4 h-4 absolute left-3.5 top-3.5 ${isSchoolCodeVerified ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      placeholder="Enter your school access code"
                      value={schoolCodeInput}
                      disabled={isSchoolCodeVerified || verifyingCode}
                      onChange={(e) => {
                        setSchoolCodeInput(e.target.value.toUpperCase());
                        setSchoolCodeError('');
                        setFieldErrors((prev) => ({ ...prev, school: undefined }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isSchoolCodeVerified) {
                          e.preventDefault();
                          handleVerifySchoolCode();
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-3 text-sm uppercase font-mono tracking-wider rounded-xl border focus:outline-none transition ${
                        isSchoolCodeVerified
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold cursor-not-allowed'
                          : schoolCodeError || fieldErrors.school
                          ? 'bg-white border-red-400 focus:ring-2 focus:ring-red-500'
                          : 'bg-white border-slate-300 focus:ring-2 focus:ring-emerald-600'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifySchoolCode}
                    disabled={isSchoolCodeVerified || verifyingCode || !selectedSchoolId || !schoolCodeInput.trim()}
                    className={`font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow transition whitespace-nowrap flex items-center justify-center gap-2 min-h-[46px] ${
                      isSchoolCodeVerified
                        ? 'bg-emerald-600 text-white cursor-default opacity-100'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {verifyingCode ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : isSchoolCodeVerified ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verified</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify School Code</span>
                      </>
                    )}
                  </button>
                </div>

                {(schoolCodeError || (!isSchoolCodeVerified && fieldErrors.school)) && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-xs text-red-800 font-semibold flex items-start gap-2 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{schoolCodeError || fieldErrors.school}</span>
                  </div>
                )}

                {/* VERIFIED SUCCESS CARD - STRICTLY REVEALS ₦5,000 ONLY HERE */}
                {isSchoolCodeVerified && verifiedSchoolData && (
                  <div className="p-4 rounded-xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 shadow-sm">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
                      <div>
                        <strong className="text-sm block">Access Code Verified Successfully!</strong>
                        <span className="text-emerald-900 font-semibold block">
                          {verifiedSchoolData.name} &bull; Subsidized Tuition:{' '}
                          <span className="font-black text-sm">₦{(5000).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetSchoolVerification}
                      className="text-[11px] font-extrabold text-emerald-900 bg-white/90 hover:bg-white border border-emerald-300 px-3 py-1.5 rounded-lg transition shrink-0 self-start sm:self-auto"
                    >
                      Change School / Code
                    </button>
                  </div>
                )}
              </div>

              {/* Class / Grade Level */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  3. Student Class / Level
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="Junior Secondary (JSS 1)">Junior Secondary (JSS 1)</option>
                  <option value="Junior Secondary (JSS 2)">Junior Secondary (JSS 2)</option>
                  <option value="Junior Secondary (JSS 3)">Junior Secondary (JSS 3)</option>
                  <option value="Senior Secondary (SS 1)">Senior Secondary (SS 1)</option>
                  <option value="Senior Secondary (SS 2)">Senior Secondary (SS 2)</option>
                  <option value="Senior Secondary (SS 3)">Senior Secondary (SS 3)</option>
                  <option value="Secondary School Leaver">Secondary School Leaver / Post-SSCE</option>
                  <option value="Primary School Graduate">Primary School Graduate (Special Track)</option>
                </select>
              </div>
            </div>
          )}

          {/* Core Personal Form Fields */}
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
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${
                    fieldErrors.fullName
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-brand-600'
                  }`}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.fullName}</span>
                </p>
              )}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${
                    fieldErrors.email
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-brand-600'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div className={category !== 'uniben' ? 'sm:col-span-2' : ''}>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-bold text-slate-700">
                  WhatsApp Phone Number *
                </label>
                {phoneWarning && (
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 animate-pulse">
                    ⚠️ {phoneWarning}
                  </span>
                )}
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0812 345 6789"
                  value={phone}
                  onChange={(e) => {
                    handlePhoneChange(e.target.value);
                    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${
                    fieldErrors.phone
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-500'
                      : phoneWarning
                      ? 'border-amber-400 bg-amber-50/20 focus:ring-amber-500'
                      : 'border-slate-300 focus:ring-brand-600'
                  }`}
                />
              </div>
              {fieldErrors.phone ? (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.phone}</span>
                </p>
              ) : (
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Digits only (e.g. 08123456789). This number is verified to add you to the Paid Members WhatsApp Group upon admission.
                </span>
              )}
            </div>

            {/* UNIBEN Specific Fields */}
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
                    Department / Faculty *
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Computer Science / Engineering"
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        if (fieldErrors.department) setFieldErrors((prev) => ({ ...prev, department: undefined }));
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${
                        fieldErrors.department
                          ? 'border-red-400 bg-red-50/20 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-brand-600'
                      }`}
                    />
                  </div>
                  {fieldErrors.department && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.department}</span>
                    </p>
                  )}
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

            {/* Optional Learning Goals / Targets TextArea */}
            <div className="sm:col-span-2 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 flex-wrap">
                  <Target className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                  <span>What do you want to achieve after this Python course?</span>
                  <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <span className="text-[11px] text-slate-400 sm:text-right shrink-0">
                  {learningGoals.length} characters
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="Tell us what you want to achieve after this course (e.g. automated scripting, software engineering, machine learning, career progression, or school ICT projects)..."
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent resize-y"
              />
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-xs text-brand-900 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              <strong>100% Online Intensive Mode:</strong> Live interactive broadcasting, step-by-step coding demonstrations, and recorded replays for your schedule.
            </span>
          </div>

          {/* Live Readiness Checklist */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              Form Completion Checklist
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {category === 'school' && (
                <div className={`flex items-center gap-1.5 font-semibold ${isSchoolCodeVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isSchoolCodeVerified ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{isSchoolCodeVerified ? 'School access code verified' : 'Verify your school access code'}</span>
                </div>
              )}
              <div className={`flex items-center gap-1.5 font-semibold ${fullName.trim().length >= 3 ? 'text-emerald-700' : 'text-slate-500'}`}>
                {fullName.trim().length >= 3 ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block shrink-0" />}
                <span>Full name entered</span>
              </div>
              <div className={`flex items-center gap-1.5 font-semibold ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'text-emerald-700' : 'text-slate-500'}`}>
                {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block shrink-0" />}
                <span>Valid email address</span>
              </div>
              <div className={`flex items-center gap-1.5 font-semibold ${phone.replace(/\D/g, '').length >= 10 ? 'text-emerald-700' : 'text-slate-500'}`}>
                {phone.replace(/\D/g, '').length >= 10 ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block shrink-0" />}
                <span>WhatsApp phone (10+ digits)</span>
              </div>
              {category === 'uniben' && (
                <div className={`flex items-center gap-1.5 font-semibold ${department.trim().length > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {department.trim().length > 0 ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block shrink-0" />}
                  <span>Department / Faculty entered</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-extrabold text-sm sm:text-base py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 min-h-[54px] ${
                loading
                  ? 'bg-brand-700 text-white opacity-80 cursor-wait'
                  : category === 'school' && !isSchoolCodeVerified
                  ? 'bg-slate-800 hover:bg-slate-900 text-white'
                  : 'bg-brand-800 hover:bg-brand-900 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Payment Order...</span>
                </>
              ) : (
                <>
                  <span>
                    {category === 'school'
                      ? isSchoolCodeVerified
                        ? `Proceed to Payment (${formatNaira(5000)})`
                        : 'Verify School Code & Proceed'
                      : category === 'uniben'
                      ? `Proceed to Payment (${formatNaira(fees.isOfferActive ? fees.uniben : fees.unibenNormal)})`
                      : `Proceed to Payment (${formatNaira(fees.isOfferActive ? fees.general : fees.generalNormal)})`}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2">
              {category === 'school' && !isSchoolCodeVerified
                ? 'Please verify your school access code above before continuing.'
                : 'Next step: Bank Account details and payment proof upload.'}
            </p>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* STEP 2: UNIBEN ADMISSION LETTER UPLOAD (For UNIBEN Students) */}
      {/* ============================================================ */}
      {step === 2 && category === 'uniben' && (
        <form onSubmit={handleStep2Submit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="bg-gold-50 border border-gold-200 rounded-2xl p-4 text-gold-950 flex items-start gap-3">
            <FileText className="w-5 h-5 text-gold-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                UNIBEN Admission Letter Verification
              </h3>
              {fees.isOfferActive ? (
                <p className="text-xs text-gold-900 mt-1 leading-relaxed">
                  To activate your <strong>30% university discount ({formatNaira(fees.uniben)})</strong>, please attach a snapshot or PDF of your <strong>UNIBEN Admission Letter</strong> (or course registration slip / student ID card).
                </p>
              ) : (
                <p className="text-xs text-gold-900 mt-1 leading-relaxed">
                  To verify your UNIBEN student enrollment status, please attach a snapshot or PDF of your <strong>UNIBEN Admission Letter</strong> (or course registration slip / student ID card).
                </p>
              )}
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
                {clearanceFile ? clearanceFile.name : 'Click to select UNIBEN Admission Letter or student ID'}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Supports JPG, PNG, WebP or PDF (Max 10MB)
              </span>
            </label>

            {clearancePreview && (
              <div className="mt-4 inline-block relative border rounded-xl overflow-hidden shadow-sm max-w-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={clearancePreview} alt="Admission letter preview" className="max-h-40 object-contain" />
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition text-center"
            >
              &larr; Back to Details
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 bg-brand-800 hover:bg-brand-900 text-white font-extrabold text-sm sm:text-base py-3.5 sm:py-4 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-center"
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
          <div className="bg-brand-950 text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="text-left w-full sm:w-auto">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-gold-400 block">
                Your Unique Tracking Reference
              </span>
              <div className="text-2xl sm:text-3xl font-black tracking-wider text-white mt-1 font-mono">
                {trackingId}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                Keep this code safe to check your admission status anytime.
              </p>
            </div>
            <div className="w-full sm:w-auto bg-brand-900/60 p-3.5 sm:p-4 rounded-2xl border border-brand-800 flex items-center justify-between sm:flex-col sm:items-end sm:justify-center text-left sm:text-right gap-2 sm:gap-0.5">
              <span className="text-xs text-slate-300">Amount to Transfer:</span>
              <span className="text-2xl sm:text-3xl font-black text-gold-400">
                {formatNaira(amount)}
              </span>
            </div>
          </div>

          {/* Official Bank Account Details Box */}
          <div className="bg-white border-2 border-brand-700/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-brand-900 font-extrabold text-base mb-4 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-brand-600" />
              <span>
                {category === 'school' && verifiedSchoolData?.name
                  ? `Payment Arrangement for ${verifiedSchoolData.name}`
                  : 'Designated Bank Account for MiraTymz Academy'}
              </span>
            </div>

            {bankDetails.hasPaymentConfigured ? (
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
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm">
                <div className="font-extrabold flex items-center gap-2 mb-1 text-amber-900">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>Pending School Administrative Arrangement</span>
                </div>
                <p className="leading-relaxed">
                  {bankDetails.paymentInstructions ||
                    'Payment arrangements for this school are currently being finalized with the school administration. Please contact your school coordinator or reach out to MiraTymz support directly below.'}
                </p>
              </div>
            )}

            <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Please transfer exactly <strong>{formatNaira(amount)}</strong>. Use your Tracking ID <strong>({trackingId})</strong> as your transfer remark/narration.
                </span>
              </div>
              <a
                href={`https://wa.me/2348168575186?text=Hello%20MiraTymz%2C%20I%20am%20at%20the%20payment%20transfer%20step%20for%20tracking%20ID%20${trackingId}%20and%20need%20assistance.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl shadow-sm transition whitespace-nowrap shrink-0 self-end sm:self-auto"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Questions? Chat on WhatsApp &rarr;</span>
              </a>
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

            <div
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
                receiptFile
                  ? 'border-emerald-500 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-brand-600 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                id="receiptUpload"
                accept="image/*,.pdf"
                onChange={handleReceiptChange}
                className="hidden"
              />
              <label htmlFor="receiptUpload" className="cursor-pointer flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    receiptFile ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-800'
                  }`}
                >
                  {receiptFile ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>
                <span className="text-sm font-bold text-slate-800 break-all max-w-xs mx-auto">
                  {receiptFile ? receiptFile.name : 'Click to select receipt image or PDF'}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports JPG, PNG, WebP or PDF (Max 10MB)
                </span>
                {receiptFile && (
                  <span className="text-[11px] font-bold text-emerald-700 mt-2 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                    ✓ File attached &bull; Ready to submit
                  </span>
                )}
              </label>

              {receiptPreview && (
                <div className="mt-4 inline-block relative border rounded-xl overflow-hidden shadow-sm max-w-[200px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={receiptPreview} alt="Receipt preview" className="max-h-36 object-contain" />
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(category === 'uniben' ? 2 : 1)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition text-center"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-gradient-to-r from-brand-800 to-emerald-900 hover:from-brand-900 hover:to-emerald-950 text-white font-extrabold text-sm sm:text-base py-3.5 sm:py-4 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 text-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                    <span>Uploading Receipt &amp; Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />
                    <span>I Have Paid &bull; Submit Proof</span>
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

          <div className="flex flex-col items-center justify-center text-center px-1">
            <div className="inline-flex items-center justify-center gap-1.5 text-xs uppercase font-extrabold tracking-wider sm:tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-300 shadow-sm text-center max-w-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Receipt Successfully Uploaded</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3.5 leading-tight">
              Payment Under Review!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Thank you, <strong>{fullName}</strong>. Your payment proof and enrollment details have been securely received by the MiraTymz Admissions Desk.
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
              1. Our finance and admissions officers will verify your transfer and student status.
            </p>
            <p>
              2. Once approved, you can visit the <strong>Status Page</strong> to connect with the admin directly on WhatsApp with your student credentials to be added to the VIP Paid Members Group.
            </p>
          </div>

          {/* Locked Study Package Callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs text-slate-600 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 block font-bold text-sm mb-0.5">Complimentary Study Package (PDF)</strong>
              <span>Will unlock automatically on your status tracking page immediately upon approval of your transfer.</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto w-full">
            <Link
              href={`/status?q=${trackingId}`}
              className="w-full sm:flex-1 bg-brand-800 hover:bg-brand-900 text-white font-extrabold text-sm sm:text-base py-3.5 sm:py-4 px-6 rounded-xl shadow transition text-center flex items-center justify-center gap-1.5"
            >
              <span>Check Admission Status Now</span>
              <span>&rarr;</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm py-3.5 sm:py-4 px-6 rounded-xl transition text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POPUP CORRECTION WHEN "I HAVE PAID" IS CLICKED WITHOUT RECEIPT*/}
      {/* ============================================================ */}
      {showReceiptPopup && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border-2 border-red-500 animate-in zoom-in-95 duration-200 text-slate-900 text-center space-y-4">
            <button
              type="button"
              onClick={() => setShowReceiptPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition text-sm font-bold"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] uppercase font-black tracking-widest text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full inline-block">
                Missing Proof of Payment
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2.5">
                Receipt Screenshot Required!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                Please upload your payment receipt before submitting your payment details. Our finance desk needs this transaction screenshot to confirm and approve your enrollment.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <label
                htmlFor="receiptUpload"
                onClick={() => setShowReceiptPopup(false)}
                className="w-full bg-gradient-to-r from-brand-800 to-emerald-900 hover:from-brand-900 hover:to-emerald-950 text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Upload className="w-4 h-4 text-brand-300" />
                <span>Select &amp; Attach Receipt Now</span>
              </label>

              <button
                type="button"
                onClick={() => setShowReceiptPopup(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition"
              >
                Dismiss &amp; Review Transfer Account Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterClient({ initialPromo }: { initialPromo?: PublicPromoData }) {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-12 text-center text-slate-400">Loading enrollment portal...</div>}>
      <RegisterForm initialPromo={initialPromo} />
    </Suspense>
  );
}
