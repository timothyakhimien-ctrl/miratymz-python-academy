import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Terminal, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Python Programming: Foundations & Practical Development | MiraTymz Programming Academy',
  description: '8-Week Intensive Python Training Programme by MiraTymz Programming Academy. Learn today, stay ahead with hands-on projects, industry curriculum, and physical/online mentorship.',
  openGraph: {
    title: 'Python Programming Programme | MiraTymz Academy',
    description: 'Special 30% discount for UNIBEN students. Learn today, stay ahead!',
    images: ['/flyer.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">
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
                  <div className="w-9 h-9 rounded-lg bg-brand-800 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-brand-300" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xl text-white">MiraTymz</span>
                    <span className="text-xs uppercase font-bold tracking-widest text-brand-400 block -mt-1">
                      Programming Academy
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                  Learn Today, Stay Ahead! A premier university tech academy providing rigorous, practical, project-based Python engineering training for undergraduates and aspiring developers.
                </p>
                <div className="flex items-center gap-4 text-xs text-brand-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Hybrid Learning
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Complete Materials
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Capstone Portfolio
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                  Quick Navigation
                </h4>
                <ul className="space-y-2.5 text-sm text-slate-400">
                  <li>
                    <Link href="/register" className="hover:text-white transition">
                      Registration &amp; Enrollment
                    </Link>
                  </li>
                  <li>
                    <Link href="/status" className="hover:text-white transition">
                      Payment Status Lookup
                    </Link>
                  </li>
                  <li>
                    <Link href="/#curriculum" className="hover:text-white transition">
                      8-Week Course Outline
                    </Link>
                  </li>
                  <li>
                    <Link href="/#pricing" className="hover:text-white transition">
                      UNIBEN ₦5,950 Discount
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                  Support &amp; Verification
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Need assistance with your transfer or course registration? Contact the admissions office directly.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="text-slate-300">
                    <strong>Official WhatsApp:</strong>
                    <span className="block text-brand-400">Via Admissions Desk</span>
                  </div>
                  <div className="text-slate-300 pt-1">
                    <strong>Schedule:</strong>
                    <span className="block text-slate-400">Mon - Sat: 9:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
              <p>&copy; {new Date().getFullYear()} MiraTymz Programming Academy. All rights reserved.</p>
              <p className="text-brand-400 font-semibold">
                Tagline: Learn Today, Stay Ahead!
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
