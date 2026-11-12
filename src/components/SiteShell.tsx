'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Terminal, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/miraadmintymz');

  // If in staff admin portal, render clean isolated layout without student navbar/footer
  if (isAdminRoute) {
    return <main className="flex-1 bg-slate-900 min-h-screen">{children}</main>;
  }

  return (
    <>
      {/* Top Notification Bar */}
      <div className="bg-brand-950 text-brand-300 text-xs py-2 px-3 text-center font-medium border-b border-brand-900/60 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 leading-tight">
        <span className="bg-gold-500 text-brand-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
          Limited Slots
        </span>
        <span>
          Classes Commencing <strong>Monday, 16 November 2026</strong> &bull; UNIBEN 30% Discount Active
        </span>
        <Link href="/register" className="text-gold-400 font-bold underline hover:text-white transition whitespace-nowrap">
          Claim ₦5,950 Offer &rarr;
        </Link>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

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
              <div className="text-xs text-gold-400 font-bold">
                &bull; Special University of Benin 30% Subsidy Active
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
                  <span>support@miratymz.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>+234 816 8575 186</span>
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
