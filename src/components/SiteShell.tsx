'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Terminal, ShieldCheck, Mail, Phone, MapPin, MessageCircle, Flame, Clock, Menu, X, FileText } from 'lucide-react';
import type { PublicPromoData } from '@/lib/promo';

export default function SiteShell({
  children,
  initialPromo,
}: {
  children: React.ReactNode;
  initialPromo?: PublicPromoData;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/miraadmintymz');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Promotional Urgency & Countdown State - initialized from server data to prevent flash of wrong content
  const [promo, setPromo] = useState<{
    enabled: boolean;
    slots: number;
    unibenFee: number;
    expiresAt: string;
  }>({
    enabled: initialPromo ? initialPromo.isOfferActive : true,
    slots: initialPromo?.limitedOfferSlots || 7,
    unibenFee: initialPromo ? initialPromo.unibenFee : 5950,
    expiresAt: initialPromo?.expiresAt || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  });

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>(() => {
    if (initialPromo && !initialPromo.isOfferActive) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
    const diff =
      (initialPromo?.expiresAt ? new Date(initialPromo.expiresAt).getTime() : Date.now() + 72 * 3600 * 1000) -
      Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isExpired: false,
    };
  });

  // Fetch live promo settings on mount to catch any background updates
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.promoSettings) {
          const isOfferActive = data.isOfferActive !== false;
          setPromo({
            enabled: isOfferActive,
            slots: Number(data.promoSettings.limitedOfferSlots) || 7,
            unibenFee: Number(data.effectiveFees?.uniben || data.promoSettings.unibenDiscountFee) || 5950,
            expiresAt: data.promoSettings.expiresAt || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
          });
        }
      } catch {
        // Fall back to default
      }
    }
    loadSettings();
  }, []);

  // Live countdown timer interval
  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(promo.expiresAt).getTime() - Date.now();
      if (difference <= 0 || !promo.enabled) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [promo.expiresAt, promo.enabled]);

  // If in staff admin portal, render clean isolated layout without student navbar/footer
  if (isAdminRoute) {
    return <main className="flex-1 bg-slate-900 min-h-screen">{children}</main>;
  }

  // WhatsApp DM prefilled URL
  const whatsappUrl =
    'https://wa.me/2348168575186?text=Hello%20MiraTymz%20Academy%2C%20I%20have%20an%20inquiry%20regarding%20the%20Python%20Mastery%20Training.';

  return (
    <>
      {/* Top Notification Bar with Live Urgency Countdown */}
      <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-brand-950 text-brand-300 text-xs py-2 px-3 text-center font-medium border-b border-brand-900/60 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 leading-tight">
        {!timeLeft.isExpired ? (
          <>
            <span className="bg-amber-500 text-brand-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shrink-0 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-red-700 animate-pulse" />
              <span>🔥 ONLY {promo.slots} SEATS LEFT</span>
            </span>
            <span className="text-slate-200">
              UNIBEN 30% Subsidy Active (₦{promo.unibenFee.toLocaleString()}) &bull; Ends In:
            </span>
            <span className="font-mono font-black text-gold-400 bg-brand-900/90 px-2 py-0.5 rounded border border-brand-700/60 text-[11px] tracking-wider shrink-0">
              {String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h :{' '}
              {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
            <Link
              href="/register"
              className="text-gold-400 hover:text-white font-extrabold underline transition whitespace-nowrap ml-1"
            >
              Claim Offer &rarr;
            </Link>
          </>
        ) : (
          <>
            <span className="bg-emerald-500 text-brand-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
              Enrollment Open
            </span>
            <span>
              Classes Commencing <strong>Monday, 23 November 2026</strong> &bull; Cohort Admission Open
            </span>
            <Link href="/register" className="text-gold-400 font-bold underline hover:text-white transition whitespace-nowrap">
              Enroll Now &rarr;
            </Link>
          </>
        )}
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-900 border border-brand-700 flex items-center justify-center shadow-md group-hover:bg-brand-800 transition shrink-0">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
                MiraTymz
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-brand-700">
                Programming Academy
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/#curriculum" className="hover:text-brand-700 transition">
              8-Week Curriculum
            </Link>
            <Link href="/#pricing" className="hover:text-brand-700 transition">
              Fees &amp; Offers
            </Link>
            <Link href="/#why-python" className="hover:text-brand-700 transition">
              Why Python?
            </Link>
            <Link href="/#faq" className="hover:text-brand-700 transition">
              FAQ
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition"
              title="Chat with Admissions Director"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp DM</span>
            </a>

            <Link
              href="/status"
              className="text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-2 rounded-lg text-slate-700 hover:text-brand-700 hover:bg-slate-100 transition flex items-center gap-1 sm:gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="hidden xs:inline">Check Status</span>
              <span className="xs:hidden">Status</span>
            </Link>
            <Link
              href="/register"
              className="bg-brand-800 hover:bg-brand-900 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm hover:shadow transition flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
            >
              <span>Enroll Now</span>
              <span className="hidden sm:inline">&rarr;</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-brand-50 hover:text-brand-800 transition"
            >
              Fees &amp; Enrollment Tracks
            </Link>
            <Link
              href="/#curriculum"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-brand-50 hover:text-brand-800 transition"
            >
              8-Week Curriculum
            </Link>
            <Link
              href="/#why-python"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-brand-50 hover:text-brand-800 transition"
            >
              Why Python?
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-brand-50 hover:text-brand-800 transition"
            >
              Frequently Asked Questions (FAQ)
            </Link>
            <a
              href="/syllabus.pdf"
              download="MiraTymz_Python_8Week_Syllabus.pdf"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-brand-800 bg-brand-50 border border-brand-200 transition"
            >
              <FileText className="w-4 h-4 text-brand-700 shrink-0" />
              <span>Download Syllabus (PDF)</span>
            </a>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                href="/status"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              >
                Check Status
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs font-bold py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition"
              >
                WhatsApp DM
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* ============================================================ */}
      {/* FLOATING PRO WHATSAPP CHAT WIDGET                            */}
      {/* ============================================================ */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat directly on WhatsApp with MiraTymz Admissions"
        className="fixed bottom-5 right-4 sm:right-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-2xl hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105 group border-2 border-white/30"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <MessageCircle className="w-5 h-5 text-white shrink-0" />
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[10px] font-semibold text-emerald-100">Need Help?</span>
          <span className="text-xs font-black tracking-wide whitespace-nowrap">WhatsApp MiraTymz</span>
        </div>
      </a>

      {/* Footer */}
      <footer className="bg-brand-950 text-slate-300 border-t border-brand-900 pt-16 pb-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-brand-900/60">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-900 border border-brand-700 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-brand-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-white">MiraTymz Programming Academy</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400">
                    Empowering Tech Leaders
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Transforming curious beginners into job-ready software developers through disciplined coding fundamentals, architecture, and live mentor-led project delivery.
              </p>
              <div className="text-xs text-gold-400 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Special University of Benin 30% Subsidy Active</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-white mb-4">
                Curriculum Tracks
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                <li>Core Syntax &amp; Logic</li>
                <li>Object-Oriented Programming</li>
                <li>Data Structures &amp; Algorithms</li>
                <li>File Automation &amp; APIs</li>
                <li>Database Engineering (SQL)</li>
                <li>Web Apps &amp; Capstone Project</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-white mb-4">
                Admissions &amp; Support
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                  <a href="mailto:miraclemira231@gmail.com" className="hover:text-white transition">
                    miraclemira231@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition group"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition" />
                    <span>+234 816 8575 186</span>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                      WhatsApp DM &rarr;
                    </span>
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>University of Benin, Benin City</span>
                </li>
                <li className="pt-2">
                  <Link
                    href="/status"
                    className="inline-block bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-brand-700 transition"
                  >
                    Check Admission Status &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} MiraTymz Academy. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/#curriculum" className="hover:text-slate-300 transition">
                Curriculum
              </Link>
              <Link href="/#pricing" className="hover:text-slate-300 transition">
                Fees
              </Link>
              <Link href="/status" className="hover:text-slate-300 transition">
                Verification Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
