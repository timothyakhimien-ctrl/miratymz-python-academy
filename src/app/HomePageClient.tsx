'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Terminal,
  CheckCircle2,
  Calendar,
  Users,
  Laptop,
  BookOpen,
  ArrowRight,
  Code2,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Shield,
  Layers,
  Award,
  FileText,
  ShieldCheck,
  Flame,
  School as SchoolIcon,
  GraduationCap,
  User,
  KeyRound,
  Check,
  Search,
} from 'lucide-react';
import type { PublicPromoData } from '@/lib/promo';

export default function HomePageClient({ initialPromo }: { initialPromo?: PublicPromoData }) {
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Dynamic promo state from admin settings - initialized from server data to prevent flash
  const [promo, setPromo] = useState<{
    enabled: boolean;
    slots: number;
    unibenDiscountFee: number;
    unibenNormalFee: number;
    generalDiscountFee: number;
    generalNormalFee: number;
    expiresAt: string;
  }>({
    enabled: initialPromo ? initialPromo.isOfferActive : true,
    slots: initialPromo?.limitedOfferSlots || 7,
    unibenDiscountFee: initialPromo?.unibenDiscountFee || 5950,
    unibenNormalFee: initialPromo?.unibenNormalFee || 8500,
    generalDiscountFee: initialPromo?.generalDiscountFee || 10000,
    generalNormalFee: initialPromo?.generalNormalFee || 15000,
    expiresAt: initialPromo?.expiresAt || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  });

  const [isExpired, setIsExpired] = useState(initialPromo ? !initialPromo.isOfferActive : false);

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
            unibenDiscountFee: Number(data.promoSettings.unibenDiscountFee) || 5950,
            unibenNormalFee: Number(data.promoSettings.unibenNormalFee) || 8500,
            generalDiscountFee: Number(data.promoSettings.generalDiscountFee) || 10000,
            generalNormalFee: Number(data.promoSettings.generalNormalFee) || 15000,
            expiresAt: data.promoSettings.expiresAt || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
          });
          setIsExpired(!isOfferActive);
        }
      } catch {
        // Fall back to defaults
      }
    }
    loadSettings();
  }, []);

  const curriculum = [
    {
      week: 'Week 1',
      title: 'Foundations & Algorithmic Thinking',
      topics: 'Python installation, VS Code workflow, memory variables, primitive types, input/output & basic math operations.',
      project: 'Interactive Terminal Calculator & Bio Generator',
    },
    {
      week: 'Week 2',
      title: 'Conditional Branching & Dynamic Loops',
      topics: 'Boolean logic, if/elif/else decision trees, for & while loops, break, continue, and loop algorithms.',
      project: 'Number Guessing Game & Password Validator',
    },
    {
      week: 'Week 3',
      title: 'Functions & Modular Code Design',
      topics: 'Function parameters, return values, variable scope, lambda expressions, and reusable logic blocks.',
      project: 'Unit Converter & Automated Grading Tool',
    },
    {
      week: 'Week 4',
      title: 'Data Structures Mastery',
      topics: 'Lists, tuples, sets, dictionaries, nested collections, list comprehensions, and data transformations.',
      project: 'Contact Book & Shopping Cart Manager',
    },
    {
      week: 'Week 5',
      title: 'File I/O & Exception Handling',
      topics: 'Reading/writing TXT, CSV, and JSON files, persistent storage, try/except/finally blocks, and error resilience.',
      project: 'Personal Expense Tracker (with file save/load)',
    },
    {
      week: 'Week 6',
      title: 'Object-Oriented Programming (OOP)',
      topics: 'Classes, objects, attributes, methods, inheritance, polymorphism, and modular package architecture.',
      project: 'Departmental Student Information System',
    },
    {
      week: 'Week 7',
      title: 'APIs, Web Scraping & Git/GitHub',
      topics: 'HTTP requests, REST APIs, JSON parsing, BeautifulSoup web scraping, Git version control, and GitHub portfolio setup.',
      project: 'Live Weather Tracker & GitHub Code Repository',
    },
    {
      week: 'Week 8',
      title: 'Capstone Project & Career Transition',
      topics: 'Full software project development, debugging, packaging, code review, and career roadmaps in AI, Data, and Web.',
      project: 'Complete Capstone Application & Certificate Defense',
    },
  ];

  const faqs = [
    {
      q: 'Do I need prior programming experience before joining?',
      a: 'Not at all. The 8-week curriculum is built from the ground up for beginners, school students, and undergraduates alike. We use intuitive analogies and step-by-step demonstrations before writing any code.',
    },
    {
      q: 'What are the three enrollment categories?',
      a: 'We offer three distinct tracks: (1) University Students (UNIBEN & undergraduates), (2) School Students (Isheri Pipeline partner schools including Go-Tegs International School with subsidized ₦5,000 tuition using an access code), and (3) General Students (working professionals, tech career switchers, and the general public).',
    },
    {
      q: 'How does the School Students category work?',
      a: 'Students from participating secondary schools in the Isheri Pipeline corridor (such as Go-Tegs International School) select their school and enter their school coordinator access code to unlock the subsidized ₦5,000 tuition and school payment details.',
    },
    {
      q: 'What is the format of the training?',
      a: 'We offer live interactive online broadcasts with recorded replays provided for every class, practical weekly projects, and personal mentorship.',
    },
    {
      q: 'How do I submit my proof of payment?',
      a: 'After selecting your category and filling your enrollment form, the designated bank account details appear. Make your transfer, attach a screenshot or PDF receipt, and submit. Our admissions desk verifies it promptly.',
    },
    {
      q: 'What happens after my payment is approved?',
      a: 'Once approved, your status updates to "Approved" on the Status Check page, and a direct button connects you to the admin on WhatsApp to be added to the VIP Paid Members Group.',
    },
    {
      q: 'When does the training begin?',
      a: 'Classes commence officially on Monday, 23 November 2026. Register early to secure your limited seat and preparatory study guide.',
    },
  ];

  return (
    <div className="flex flex-col gap-12 sm:gap-16 overflow-hidden">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-20 lg:pt-18 lg:pb-24 bg-gradient-to-b from-brand-950 via-brand-900 to-slate-900 text-white">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-10">
          {/* Top Banner Row */}
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 bg-brand-800/90 border border-brand-500/40 px-4 py-1.5 rounded-full text-xs font-bold text-brand-200 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>8-WEEK PRACTICAL PYTHON MASTERY PROGRAMME</span>
              </div>

              {!isExpired && (
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg border border-gold-400/50 animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                  <span>ONLY {promo.slots} SEATS REMAINING</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Learn Real Programming. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-brand-300 to-emerald-400">
                Build Real Software.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              From foundational algorithmic thinking to building working applications, automation tools, and APIs. Practical training tailored for university undergraduates, secondary school students, and working professionals.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="#enrollment-tracks"
                className="bg-gold-500 hover:bg-gold-600 text-brand-950 font-black text-sm px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <span>Choose Your Enrollment Track</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-gold-400" />
                <span>Download Syllabus (PDF)</span>
              </button>

              <Link
                href="/status"
                className="bg-brand-900/80 hover:bg-brand-800 border border-brand-700 text-slate-300 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Check Admission Status</span>
              </Link>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 2. THE THREE ENROLLMENT TRACKS & FEES                        */}
          {/* ============================================================ */}
          <div id="pricing" className="pt-6 sm:pt-10 scroll-mt-24">
            <div id="enrollment-tracks" className="text-center mb-6 scroll-mt-24">
              <span className="text-xs uppercase font-extrabold tracking-widest text-gold-400 block">
                Fees, Offers &amp; Enrollment Tracks
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Select Your Category to Enroll
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
                All three tracks receive comprehensive 8-week curriculum access, live online classes, weekly hands-on projects, and official certificate of completion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {/* TRACK 1: UNIVERSITY STUDENTS */}
              <div className="bg-gradient-to-b from-brand-900/90 to-brand-950/95 border-2 border-gold-500/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-gold-400 transition-all hover:scale-[1.01]">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
                      Track 1 &bull; Undergraduates
                    </span>
                    {!isExpired && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
                        30% Off
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white leading-tight">University Students</h3>
                      <span className="text-xs text-brand-300 font-medium">UNIBEN &amp; Tertiary Undergraduates</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-brand-800">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        ₦{(isExpired ? promo.unibenNormalFee : promo.unibenDiscountFee).toLocaleString()}
                      </span>
                      {!isExpired && (
                        <span className="text-xs line-through text-slate-400">
                          ₦{promo.unibenNormalFee.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs text-brand-300 font-bold ml-1">/ 8 Weeks</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Subsidized rate for university undergraduates across all faculties and departments. Attach your student ID or admission letter to verify.
                    </p>
                  </div>

                  <ul className="space-y-2 mt-4 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                      <span>Hybrid live broadcasting + recorded replays</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                      <span>8 Portfolio capstone assignments &amp; review</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                      <span>Exclusive VIP Paid Members WhatsApp community</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <Link
                    href="/register?category=uniben"
                    className="w-full bg-gold-500 hover:bg-gold-600 text-brand-950 font-black text-xs sm:text-sm text-center py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span>Enroll as University Student</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* TRACK 2: SCHOOL STUDENTS (ISHERI PIPELINE / GO-TEGS) */}
              <div className="bg-gradient-to-b from-emerald-950/90 via-slate-900 to-slate-950 border-2 border-emerald-500/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-emerald-400 transition-all hover:scale-[1.01]">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                      Track 2 &bull; Secondary Schools
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                      Isheri Pipeline
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <SchoolIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white leading-tight">School Students</h3>
                      <span className="text-xs text-emerald-300 font-medium">Go-Tegs &amp; Area Partner Schools</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400">
                        Subsidized ₦5,000 Rate
                      </span>
                      <span className="text-xs text-emerald-300 font-bold ml-1">/ 8 Weeks</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Special tuition for students of Go-Tegs International School and Isheri Pipeline schools. Enter your school access code during registration to unlock.
                    </p>
                  </div>

                  <ul className="space-y-2 mt-4 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Dedicated Go-Tegs payment arrangement</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Beginner-friendly junior/senior secondary curriculum</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Searchable 13-school Isheri Pipeline directory</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <Link
                    href="/register?category=school"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm text-center py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span>Enroll as School Student</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* TRACK 3: GENERAL PUBLIC */}
              <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/95 border-2 border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-500 transition-all hover:scale-[1.01]">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
                      Track 3 &bull; Open Enrollment
                    </span>
                    {!isExpired && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-brand-800 text-brand-200 px-2 py-0.5 rounded-full">
                        Promo Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white leading-tight">General Public</h3>
                      <span className="text-xs text-slate-400 font-medium">Professionals &amp; Career Switchers</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        ₦{(isExpired ? promo.generalNormalFee : promo.generalDiscountFee).toLocaleString()}
                      </span>
                      {!isExpired && (
                        <span className="text-xs line-through text-slate-400">
                          ₦{promo.generalNormalFee.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-bold ml-1">/ 8 Weeks</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Open to all working professionals, graduates, and tech aspirants worldwide. No university or secondary school affiliation required.
                    </p>
                  </div>

                  <ul className="space-y-2 mt-4 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>Full live class recordings &amp; handbook</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>Real-world automation &amp; API project portfolio</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>Code reviews &amp; tech career transition guidance</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <Link
                    href="/register?category=general"
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs sm:text-sm text-center py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <span>Enroll as General Student</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. PRACTICAL OUTCOMES SECTION                                */}
      {/* ============================================================ */}
      <section id="why-python" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-3.5 py-1 rounded-full border border-brand-200">
            Real Software Competence
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Why Students Choose MiraTymz Academy
          </h2>
          <p className="text-slate-600 mt-2 text-xs sm:text-sm leading-relaxed">
            Move beyond memorizing syntax to designing, coding, and debugging working software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center font-bold mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
              Automate Everyday Tasks
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Eliminate repetitive manual computation, spreadsheet processing, and web data collection. Learn to write Python scripts that do hours of tedious work in seconds.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
              Portfolio &amp; GitHub Projects
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Build competence that speaks for itself. Graduate with public GitHub repositories demonstrating working software, clean structure, and documentation.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
              Academic &amp; Career Advancement
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Whether you are preparing for secondary school ICT excellence, university computer science coursework, or global freelance opportunities, gain confidence that lasts.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. 8-WEEK PROGRESSIVE CURRICULUM ACCORDION                   */}
      {/* ============================================================ */}
      <section id="curriculum" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-3.5 py-1 rounded-full border border-brand-200">
            Structured Syllabus
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            The 8-Week Practical Learning Roadmap
          </h2>
          <p className="text-slate-600 mt-2 text-xs sm:text-sm leading-relaxed">
            Step-by-step progression taking you from beginner concepts to building complete applications.
          </p>
          <div className="mt-4 flex justify-center">
            <a
              href="/syllabus.pdf"
              download="MiraTymz_Python_8Week_Syllabus.pdf"
              className="inline-flex items-center gap-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
            >
              <FileText className="w-4 h-4 text-gold-400" />
              <span>Download Full Syllabus (PDF)</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {curriculum.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-brand-500 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-brand-900 text-brand-300 font-extrabold text-xs px-3 py-1 rounded-full">
                    {item.week}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Module {index + 1}</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                  {item.topics}
                </p>
              </div>

              <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-xs text-brand-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Hands-on Project:</strong> {item.project}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. FAQ SECTION                                               */}
      {/* ============================================================ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-mt-24">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Clear Answers to Help You Get Started
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 pl-6.5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. COURSE GUIDE PDF PREVIEW MODAL                            */}
      {/* ============================================================ */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-black text-sm sm:text-base text-slate-900 truncate">
                  Python Programming Fundamentals to Career Pathways
                </h3>
                <span className="text-xs text-slate-500 block">Official 8-Week Course Guide &amp; Curriculum (PDF)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Close syllabus modal"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-sm font-bold flex items-center justify-center shrink-0 transition"
              >
                ✕
              </button>
            </div>

            {/* Mobile-Friendly Direct Download Banner */}
            <div className="p-4 bg-brand-50 border-b border-brand-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-brand-950">
                <strong className="block font-extrabold">8-Week Python Syllabus Ready</strong>
                <span className="text-brand-800">Download the PDF directly or open it in a new tab for easy mobile reading.</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href="/syllabus.pdf"
                  download="MiraTymz_Python_8Week_Syllabus.pdf"
                  className="flex-1 sm:flex-initial bg-gold-500 hover:bg-gold-600 text-brand-950 font-black text-xs px-4 py-2.5 rounded-xl shadow transition text-center whitespace-nowrap"
                >
                  Download PDF &darr;
                </a>
                <a
                  href="/syllabus.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition text-center whitespace-nowrap inline-flex items-center justify-center gap-1"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-3 sm:p-4 overflow-auto flex-1 bg-slate-100 min-h-[260px] sm:min-h-[420px] hidden sm:flex items-center justify-center">
              <iframe
                src="/syllabus.pdf"
                className="w-full h-[460px] border-0 rounded-xl bg-white"
                title="MiraTymz Python 8-Week Curriculum Preview"
              />
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
              <Link
                href="/register"
                onClick={() => setShowGuideModal(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition inline-flex items-center gap-1.5"
              >
                <span>Ready to Enroll? Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
