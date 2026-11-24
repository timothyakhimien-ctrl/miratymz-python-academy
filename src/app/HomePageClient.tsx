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
  Lock,
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
      a: 'Not at all. The 8-week curriculum is built from the absolute ground up. We assume zero prior background and use intuitive analogies before writing any code.',
    },
    {
      q: 'What is the format of the training?',
      a: 'We offer a flexible hybrid structure: physical hands-on classroom sessions plus live interactive online broadcasts with recordings provided for every class.',
    },
    {
      q: !isExpired ? 'How does the UNIBEN 30% discount work?' : 'What is the tuition fee for UNIBEN students?',
      a: !isExpired
        ? `Students currently enrolled at the University of Benin (UNIBEN) pay a discounted fee of ₦${promo.unibenDiscountFee.toLocaleString()} (30% off the standard ₦${promo.unibenNormalFee.toLocaleString()} course fee). Simply select the UNIBEN option during registration.`
        : `Students currently enrolled at the University of Benin (UNIBEN) pay the standard tuition fee of ₦${promo.unibenNormalFee.toLocaleString()} for the complete 8-week course. Simply select the UNIBEN option during registration.`,
    },
    {
      q: 'How do I submit my proof of payment?',
      a: 'After filling your registration form on this site, our bank account details will appear. Make your bank transfer, upload a screenshot or PDF of the receipt on the same page, and click "I Have Paid". Our team will verify it promptly.',
    },
    {
      q: 'What happens after my payment is approved?',
      a: 'Once approved by the admin, your status will update to "Approved" on the Status Check page, and an instant link will be provided for you to join the private WhatsApp Group for Paid Members.',
    },
    {
      q: 'When does the training begin?',
      a: 'Classes commence officially on Monday, 23 November 2026. Register early to secure your limited seat and orientation materials.',
    },
  ];

  return (
    <div className="flex flex-col gap-14 sm:gap-20 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-brand-950 via-brand-900 to-slate-900 text-white">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              {/* High-Visibility Limited Seat Alert Banner */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div className="inline-flex items-center gap-2 bg-brand-800/80 border border-brand-500/30 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-brand-300">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400 shrink-0" />
                  <span>8-WEEK INTENSIVE TRAINING PROGRAMME</span>
                </div>

                {!isExpired && (
                  <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-black shadow-lg border border-gold-400/50 animate-pulse tracking-wide">
                    <Flame className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                    <span>🔥 ONLY {promo.slots} SEATS REMAINING AT 30% SUBSIDY</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] sm:leading-[1.1]">
                PYTHON <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-brand-300 to-emerald-400">
                  PROGRAMMING
                </span>
                <span className="block text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-200 mt-2">
                  Foundations &amp; Practical Development
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-1 sm:px-0">
                Learn Python through guided lessons, hands-on practice, and practical projects. Go from absolute beginner to building real-world software, automation tools, and data applications.
              </p>

              {/* Flyer Highlights Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 sm:pt-2 text-left">
                <div className="bg-brand-900/60 border border-brand-700/50 p-2.5 sm:p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gold-400 font-bold text-xs sm:text-sm">
                    <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Online Learning</span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-400 block mt-0.5">Live Interactive Classes</span>
                </div>

                <div className="bg-brand-900/60 border border-brand-700/50 p-2.5 sm:p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-brand-400 font-bold text-xs sm:text-sm">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Materials</span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-400 block mt-0.5">Slides, Notes &amp; Code</span>
                </div>

                <div className="bg-brand-900/60 border border-brand-700/50 p-2.5 sm:p-3 rounded-xl col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Starts Nov 23</span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-400 block mt-0.5">Monday, 23 Nov 2026</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="w-full sm:w-auto bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-brand-950 font-black text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-gold-500/20 transition flex items-center justify-center gap-2 text-center"
                >
                  <span>Enroll Now &bull; UNIBEN ₦{(isExpired ? promo.unibenNormalFee : promo.unibenDiscountFee).toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                </Link>

                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
                >
                  <FileText className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Download Course Guide (PDF)</span>
                </button>

                <Link
                  href="/status"
                  className="w-full sm:w-auto bg-brand-900/80 hover:bg-brand-900 border border-brand-700 text-slate-300 font-bold text-xs sm:text-sm px-4 py-3.5 sm:py-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Status</span>
                </Link>
              </div>

              <div className="text-[11px] sm:text-xs text-slate-400 flex items-center justify-center lg:justify-start gap-2 pt-1 sm:pt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>{!isExpired ? `Limited Seats: Only ${promo.slots} seats left for November 2026 Cohort` : 'Admission Open for November 2026 Cohort'}</span>
              </div>
            </div>

            {/* Right Column: Code Showcase & Flyer Card */}
            <div className="lg:col-span-5 space-y-4">
              {/* Code Banner */}
              <div className="bg-[#0b1320] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs">
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                    <span className="text-slate-400 text-[11px] ml-2">miratymz_python.py</span>
                  </div>
                  <span className="text-brand-400 text-[10px] font-bold">Python 3.12</span>
                </div>
                <div className="p-5 text-slate-200 space-y-2 leading-relaxed">
                  <div className="text-slate-500"># MiraTymz Programming Academy</div>
                  <div>
                    <span className="text-purple-400">def</span>{' '}
                    <span className="text-blue-400">learn_python</span>():
                  </div>
                  <div className="pl-6">
                    <span className="text-yellow-400">print</span>(
                    <span className="text-emerald-400">&quot;Build Skills.&quot;</span>)
                  </div>
                  <div className="pl-6">
                    <span className="text-yellow-400">print</span>(
                    <span className="text-emerald-400">&quot;Create Solutions.&quot;</span>)
                  </div>
                  <div className="pl-6">
                    <span className="text-yellow-400">print</span>(
                    <span className="text-emerald-400">&quot;Shape Your Future.&quot;</span>)
                  </div>
                  <div className="pt-2 text-brand-300">
                    <span className="text-purple-400">if</span> __name__ =={' '}
                    <span className="text-emerald-400">&quot;__main__&quot;</span>:
                  </div>
                  <div className="pl-6 text-gold-400">
                    learn_python() <span className="text-slate-500"># Enroll Today</span>
                  </div>
                </div>
              </div>

              {/* Pricing Callout Card - Interactive & Dynamic */}
              <Link
                href="/register?category=uniben"
                className="block bg-gradient-to-br from-brand-900 to-brand-950 hover:from-brand-850 hover:to-brand-900 border-2 border-gold-500/60 hover:border-gold-400 rounded-2xl p-5 shadow-xl text-white transition-all transform hover:-translate-y-0.5 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-gold-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                      <span>{isExpired ? 'UNIBEN Standard Tuition' : 'UNIBEN Limited Offer'}</span>
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-baseline gap-2">
                      <span>₦{(isExpired ? promo.unibenNormalFee : promo.unibenDiscountFee).toLocaleString()}</span>
                      {!isExpired && (
                        <span className="text-xs sm:text-sm line-through text-slate-400 font-normal">
                          ₦{promo.unibenNormalFee.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gold-500 group-hover:bg-gold-400 text-brand-950 font-black px-3 py-1.5 rounded-xl text-xs sm:text-sm shadow flex items-center gap-1 transition">
                    <span>{isExpired ? 'ENROLL' : '30% OFF'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition transform group-hover:translate-x-0.5" />
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  {!isExpired
                    ? `Special subsidy • Only ${promo.slots} seats left at this price! General rate: ₦${promo.generalDiscountFee.toLocaleString()}.`
                    : `Standard university participant tuition rate (₦${promo.unibenNormalFee.toLocaleString()}). General rate: ₦${promo.generalNormalFee.toLocaleString()}.`}
                </p>
                <div className="mt-3 pt-2.5 border-t border-brand-800/80 flex items-center justify-between text-xs font-bold text-gold-400 group-hover:text-gold-300">
                  <span>{isExpired ? 'Click to Begin Registration' : 'Click to Claim Offer & Register Now'}</span>
                  <span className="text-sm font-black">&rarr;</span>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* WHY START EARLY & PHILOSOPHY */}
      <section id="why-python" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
            Strategic Skill Acquisition
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Why Every University Student Needs Practical Code
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
            Theoretical lectures are essential, but building projects that solve real problems is what opens doors to high-impact internships, global freelance gigs, and project mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center font-bold mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">
              Automate Everyday Tasks
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Eliminate repetitive manual computation, spreadsheet processing, and web data collection. Learn to write 20-line Python scripts that do hours of tedious work in seconds.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">
              Portfolio &amp; Internships
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Employers and internship recruiters look for proof of competence, not paper certificates. Graduate with 6–8 public GitHub repositories demonstrating working software.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">
              Final Year Project Mastery
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Never be forced to outsource or pay external developers to code your final-year thesis or seminar project. Design, code, and defend your work with authentic pride.
            </p>
          </div>
        </div>
      </section>

      {/* 8-WEEK CURRICULUM ACCORDION */}
      <section id="curriculum" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
            Structured Syllabus
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            The 8-Week Practical Learning Roadmap
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
            A comprehensive, progressive curriculum designed to take you from core logic to building real applications with databases, APIs, and clean architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {curriculum.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-brand-500 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-brand-900 text-brand-300 font-extrabold text-xs px-3 py-1 rounded-full">
                    {item.week}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Module {index + 1}</span>
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
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

        {/* Course Guide PDF Download Callout */}
        <div className="mt-10 bg-gradient-to-r from-brand-950 via-slate-900 to-brand-950 border border-brand-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-wider text-gold-400 block">
              Official Syllabus &amp; Roadmap
            </span>
            <h3 className="text-xl font-black text-white">
              Want the full printable curriculum and exercise guide?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Download the official 8-week syllabus guide uploaded by our faculty — includes setup instructions, weekly learning targets, and project specifications.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="w-full md:w-auto bg-gold-500 hover:bg-gold-600 text-brand-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl transition shadow-lg whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Download Course Guide PDF &rarr;</span>
          </button>
        </div>
      </section>

      {/* PRICING & REGISTRATION OFFERS */}
      <section id="pricing" className="bg-slate-900 text-white py-14 sm:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
              Transparent Tuition Fees
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
              Invest in Practical Skills That Last a Lifetime
            </h2>
            <p className="text-slate-400 mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed px-1 sm:px-0">
              No hidden fees. Full access to physical/online live classes, complete learning resources, software installation support, and private community mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {/* UNIBEN Special Offer Card */}
            <div className="bg-gradient-to-b from-brand-900 to-brand-950 border-2 border-gold-500 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between">
              <div className="absolute -top-3.5 right-6 sm:right-8 bg-gold-500 text-brand-950 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow">
                {!isExpired ? '30% OFF Limited Offer' : 'Standard Rate'}
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold text-brand-300 tracking-wider">
                  University of Benin Students
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">UNIBEN Participant Rate</h3>
                <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    ₦{(isExpired ? promo.unibenNormalFee : promo.unibenDiscountFee).toLocaleString()}
                  </span>
                  {!isExpired && (
                    <span className="text-xs sm:text-sm line-through text-slate-400">
                      ₦{promo.unibenNormalFee.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-brand-300 font-bold ml-1">/ Full 8 Weeks</span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  {!isExpired
                    ? `Subsidized rate for UNIBEN undergraduates across all faculties. Only ${promo.slots} seats left!`
                    : 'Standard tuition rate for UNIBEN undergraduates across all faculties and departments.'}
                </p>

                <ul className="space-y-2.5 sm:space-y-3 mt-5 sm:mt-6 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>Physical + Online hybrid classroom access</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>All learning materials, slides &amp; repositories</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>8 Guided practical capstone portfolio projects</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>Exclusive VIP Paid Members WhatsApp community</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>Official Certificate of Completion</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 sm:pt-8">
                <Link
                  href="/register?category=uniben"
                  className="w-full bg-gold-500 hover:bg-gold-600 text-brand-950 font-black text-sm text-center py-3.5 sm:py-4 rounded-xl shadow-lg transition block"
                >
                  Register as UNIBEN Student &bull; ₦{(isExpired ? promo.unibenNormalFee : promo.unibenDiscountFee).toLocaleString()}
                </Link>
              </div>
            </div>

            {/* School Students (Isheri Pipeline / Go-Tegs) Card */}
            <div className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between">
              <div className="absolute -top-3.5 right-6 sm:right-8 bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow">
                Partner Schools Cohort
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
                  Isheri Pipeline &amp; Partner Schools
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">Secondary School Students</h3>
                <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    Subsidized Tuition
                  </span>
                  <span className="text-xs text-emerald-300 font-bold ml-1">/ 8 Weeks</span>
                </div>
                <div className="mt-1.5 p-2 rounded-xl bg-emerald-900/50 border border-emerald-700/60 text-[11px] text-emerald-200">
                  <span className="font-bold block">Go-Tegs International School &amp; Area Schools</span>
                  <span>Special student rate strictly unlocked upon entering your school access code during registration.</span>
                </div>

                <ul className="space-y-2.5 sm:space-y-3 mt-5 sm:mt-6 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dedicated Go-Tegs International School arrangement</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Searchable directory of 13+ Isheri Pipeline schools</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Foundation-level algorithms &amp; interactive scripts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Code-verified access with dedicated support</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Official Certificate of Completion</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 sm:pt-8">
                <Link
                  href="/register?category=school"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm text-center py-3.5 sm:py-4 rounded-xl shadow-lg transition block"
                >
                  Register as School Student &bull; Enter Code
                </Link>
              </div>
            </div>

            {/* General Public Rate Card */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                  External &amp; General Public
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">General Registration</h3>
                <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    ₦{(isExpired ? promo.generalNormalFee : promo.generalDiscountFee).toLocaleString()}
                  </span>
                  {!isExpired && (
                    <span className="text-xs sm:text-sm line-through text-slate-400">
                      ₦{promo.generalNormalFee.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-bold ml-1">/ Full 8 Weeks</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Standard registration for non-UNIBEN students, working professionals, and tech aspirants.
                </p>

                <ul className="space-y-2.5 sm:space-y-3 mt-5 sm:mt-6 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>Full online live class broadcasting &amp; recordings</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>Comprehensive Python handbook &amp; cheatsheets</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>8 Guided practical capstone portfolio projects</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>Dedicated technical mentorship &amp; code reviews</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>Official Certificate of Completion</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 sm:pt-8">
                <Link
                  href="/register?category=general"
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm text-center py-3.5 sm:py-4 rounded-xl transition block"
                >
                  Register as General Participant &bull; ₦{(isExpired ? promo.generalNormalFee : promo.generalDiscountFee).toLocaleString()}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Clear Answers to Help You Get Started
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5 pl-8">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-950 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-white text-center relative overflow-hidden shadow-2xl border border-brand-800">
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5 relative z-10">
            <span className="bg-gold-500 text-brand-950 font-black text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Classes Begin Monday, 23 November 2026
            </span>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              Ready to Master Python and Elevate Your Technical Career?
            </h2>
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed px-1 sm:px-0">
              Fill the simple enrollment form, make your direct bank transfer, upload your receipt, and receive instant access upon review.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-brand-950 font-black text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg transition text-center"
              >
                Enroll Now &bull; UNIBEN ₦{(isExpired ? promo.unibenNormalFee : promo.unibenDiscountFee).toLocaleString()}{!isExpired ? ' Offer' : ''}
              </Link>
              <Link
                href="/status"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3.5 sm:py-4 rounded-xl border border-white/20 transition text-center"
              >
                Already Paid? Check Status
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED COURSE GUIDE ACCESS POPUP MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in zoom-in-95 duration-200 text-slate-900">
            {/* Close X Button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition text-sm font-bold"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Icon Header */}
            <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <BookOpen className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full inline-block">
                Exclusive Complimentary Materials
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Enrollment Verification Required
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                To download the complete <strong>8-Week Python Mastery Guide</strong>, installation manuals, exercise solutions, and physical/online lecture handouts, you must first <strong>register and be approved</strong>.
              </p>
            </div>

            {/* Benefit Highlights */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5 text-left text-slate-700 my-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complete week-by-week curriculum blueprint &amp; exercises</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Python &amp; VS Code step-by-step setup walkthrough</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant access unlocked automatically upon admin approval</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Link
                href="/register"
                onClick={() => setShowGuideModal(false)}
                className="w-full bg-brand-800 hover:bg-brand-900 text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-center"
              >
                <span>Register &amp; Enroll as UNIBEN Student (₦{(isExpired ? promo.unibenNormalFee : promo.unibenDiscountFee).toLocaleString()}) &rarr;</span>
              </Link>
              <div className="flex items-center justify-center gap-4 text-xs pt-1">
                <Link
                  href="/status"
                  onClick={() => setShowGuideModal(false)}
                  className="font-bold text-brand-700 hover:underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Already registered? Check Status to Download</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
