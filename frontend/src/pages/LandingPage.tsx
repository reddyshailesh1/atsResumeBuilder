import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getTimeGreeting } from '@/lib/utils';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="bg-white text-slate-900 selection:bg-yellow-200 selection:text-slate-900">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Sky-Blue Ethereal Wash + Editorial Typography)          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 bg-gradient-to-b from-[#dff1fd] via-[#f3f9fd] to-[#fbfaf8] border-b border-stone-200/60">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          
          {/* Main Editorial Hero Headline */}
          <h1 className="font-serif-editorial text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto">
            Resume intelligence, <br />
            built for careers
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-stone-600 font-sans leading-relaxed">
            Track impact, pass applicant tracking systems, and accelerate progress—with clarity and confidence.
          </p>

          {/* Twin Black Rectangular Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <button
                type="button"
                className="bg-black hover:bg-neutral-800 text-white rounded-none px-6 py-2.5 text-xs font-mono font-medium tracking-wide flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <span className="text-[10px]">▪</span>
                <span>Build ATS Resume</span>
              </button>
            </Link>
            <Link to="/analysis">
              <button
                type="button"
                className="bg-black hover:bg-neutral-800 text-white rounded-none px-6 py-2.5 text-xs font-mono font-medium tracking-wide flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <span className="text-[10px]">▪</span>
                <span>Test Job Match</span>
              </button>
            </Link>
          </div>

          {/* ======================================================================= */}
          {/* HERO DASHBOARD CARD (Replica of Acme Inc Dashboard from Screenshots)  */}
          {/* ======================================================================= */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl bg-white border border-stone-200/90 shadow-2xl p-6 sm:p-8 text-left ring-1 ring-black/5">
            {/* Top Greeting Inside Card */}
            <div className="pb-6 border-b border-stone-100">
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-slate-900">
                {user ? `${getTimeGreeting()}, ${user.full_name || 'Candidate'}` : 'Candidate Career Benchmark'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-sans mt-0.5">
                {user
                  ? 'Your daily ATS impact metrics are ready to review.'
                  : 'Daily ATS impact metrics and keyword targets calibrated for top tech roles.'}
              </p>
            </div>

            {/* Metric Widgets Row */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Widget 1: ATS Compatibility (56% / yellow swatch) */}
              <div className="md:col-span-4 rounded-2xl border border-stone-200/80 p-5 bg-white flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
                    192 keywords parsed
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-serif-editorial text-4xl sm:text-5xl font-medium text-slate-900">
                      94%
                    </span>
                    <span className="text-xs font-medium text-emerald-700 font-sans">
                      Match Score
                    </span>
                  </div>
                </div>
                {/* Yellow swatch card from screenshot */}
                <div className="mt-4 h-16 w-full rounded-xl bg-[#facc15] flex items-center justify-center shadow-xs">
                  <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-widest">
                    ATS PASSED
                  </span>
                </div>
              </div>

              {/* Widget 2: Energy consumption / Parser Reliability with Geometric Star */}
              <div className="md:col-span-4 rounded-2xl border border-stone-200/80 p-5 bg-white flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                    Parser integrity
                  </span>
                  {/* Geometric multi-line star from screenshot */}
                  <svg className="w-5 h-5 text-stone-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
                  </svg>
                </div>
                <div className="mt-4">
                  <div className="font-serif-editorial text-4xl sm:text-5xl font-medium text-slate-900">
                    99.8<span className="text-xl font-sans font-normal text-stone-500 ml-1">%</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-emerald-700 font-mono">
                    <span>↓0.0%</span>
                    <span className="text-stone-500">syntax errors</span>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-stone-500 font-sans border-t border-stone-100 pt-2">
                  Greenhouse & Lever schema compliant
                </div>
              </div>

              {/* Widget 3: Forecast / Goal Alignment Card */}
              <div className="md:col-span-4 rounded-2xl border border-stone-200/80 p-5 bg-white flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#fef08a] text-stone-900 mb-2">
                    Forecast
                  </span>
                  <h4 className="font-serif-editorial text-lg text-slate-900 leading-snug">
                    You're in the top 3% for Senior Software Engineer applicants
                  </h4>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-3">
                  <span>Target: 1 Page A4</span>
                  <span className="font-mono text-emerald-700 font-bold">Auto-Fit ON</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar Chart: Carbon emissions trend / ATS Keyword Density */}
            <div className="mt-8 pt-6 border-t border-stone-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
                  ATS Section Density & Keyword Alignment
                </span>
                <span className="text-xs font-mono font-bold text-stone-800">
                  Target: 100 pts
                </span>
              </div>

              {/* Minimalist Bar Graph Matching Screenshot 2 */}
              <div className="relative pt-6 pb-2">
                {/* Yellow peak badge at middle */}
                <div className="absolute top-0 left-[54%] -translate-x-1/2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#facc15] text-slate-900 shadow-2xs">
                    98.4
                  </span>
                </div>

                {/* Grid guidelines */}
                <div className="w-full border-b border-stone-200 mb-1" />

                {/* Vertical Bar Sequence (32 clean bars) */}
                <div className="flex items-end justify-between h-28 sm:h-32 gap-1 px-1">
                  {[
                    24, 28, 32, 38, 42, 48, 54, 62, 70, 78, 88, 98, 110, 120, 135, 150,
                    145, 132, 118, 105, 96, 88, 80, 72, 65, 58, 52, 46, 40, 36, 32, 28
                  ].map((height, i) => {
                    const isPeak = i === 15;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div
                          style={{ height: `${height * 0.7}px` }}
                          className={`w-full max-w-[5px] rounded-xs transition-all ${
                            isPeak
                              ? 'bg-stone-900 ring-2 ring-yellow-400'
                              : 'bg-stone-800/85 hover:bg-stone-950'
                          }`}
                          title={`Section density metric #${i + 1}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Month / Section labels under graph */}
                <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-2 px-1">
                  <span>Summary</span>
                  <span>Skills</span>
                  <span>Experience</span>
                  <span>Projects</span>
                  <span>Education</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. NUMBERED EDITORIAL SECTION (Everything you need to measure, model...)  */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h2 className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl font-normal text-slate-900 text-center max-w-3xl mx-auto leading-tight mb-20">
          Everything you need to measure, model, and act on your resume
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Airy scenic backdrop card with floating white stat card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-tr from-sky-200 via-sky-100 to-indigo-100 p-6 flex items-end shadow-lg">
              {/* Soft visual background pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

              {/* Floating White Metric Card from Screenshot 1 */}
              <div className="relative z-10 w-full rounded-2xl bg-white p-6 shadow-xl border border-stone-200/90 max-w-sm">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
                    ATS Parse Reliability
                  </span>
                  <svg className="w-5 h-5 text-stone-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
                  </svg>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div className="font-serif-editorial text-4xl font-medium text-slate-900">
                    99.8 <span className="text-lg font-sans font-normal text-stone-500">MWh</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-700">
                    ↓0.2% drop
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Numbered List from Screenshot 1 */}
          <div className="lg:col-span-6 space-y-10 pl-0 lg:pl-6">
            {/* 001 */}
            <div className="border-b border-stone-200 pb-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif-editorial text-2xl font-medium text-slate-900">
                  Track
                </h3>
                <span className="font-mono text-xs text-stone-400">001</span>
              </div>
              <p className="mt-2 text-sm text-stone-600 font-sans leading-relaxed">
                Parse rates, required hard skills, and keyword density across your full employment history.
              </p>
            </div>

            {/* 002 */}
            <div className="border-b border-stone-200 pb-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif-editorial text-2xl font-medium text-slate-900">
                  Model
                </h3>
                <span className="font-mono text-xs text-stone-400">002</span>
              </div>
              <p className="mt-2 text-sm text-stone-600 font-sans leading-relaxed">
                Page Fitting with an instant <strong className="text-stone-900 font-semibold">OFF / ON switch</strong> that dynamically adjusts font sizes, margins, and vertical line spacing.
              </p>
            </div>

            {/* 003 */}
            <div className="border-b border-stone-200 pb-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif-editorial text-2xl font-medium text-slate-900">
                  Report
                </h3>
                <span className="font-mono text-xs text-stone-400">003</span>
              </div>
              <p className="mt-2 text-sm text-stone-600 font-sans leading-relaxed">
                Generate transparent ATS audit disclosures, pinpointing missing qualifications without fabricated statistics.
              </p>
            </div>

            {/* 004 */}
            <div className="pb-2">
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif-editorial text-2xl font-medium text-slate-900">
                  Act
                </h3>
                <span className="font-mono text-xs text-stone-400">004</span>
              </div>
              <p className="mt-2 text-sm text-stone-600 font-sans leading-relaxed">
                Enhance weak bullet points using genuine XYZ formulas and export publication-ready selectable vector PDFs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WARM OATMEAL SECTION (Built for clarity / Designed for action)        */}
      {/* ========================================================================= */}
      <section className="bg-[#f6f2ec] text-slate-900 py-24 sm:py-32 border-y border-stone-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          {/* Main Title Matching Screenshot 4 */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-slate-900 leading-tight">
              Built for clarity <br />
              Designed for action
            </h2>
          </div>

          {/* 3 White Rounded Cards from Screenshot 4 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Circle with cross icon (⨁) */}
            <div className="rounded-3xl bg-white p-8 border border-stone-200 shadow-xs flex flex-col justify-between h-full">
              <div>
                {/* Minimalist quartered circle icon */}
                <div className="w-10 h-10 mb-8 text-stone-900">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                </div>
                <h3 className="font-serif-editorial text-2xl font-medium text-slate-900">
                  Clarity drives action
                </h3>
                <p className="mt-4 text-sm text-stone-600 font-sans leading-relaxed">
                  We believe better hiring decisions start with better career data—measured, visible, and trusted.
                </p>
              </div>
            </div>

            {/* Card 2: Wireframe globe icon (🌐) */}
            <div className="rounded-3xl bg-white p-8 border border-stone-200 shadow-xs flex flex-col justify-between h-full">
              <div>
                {/* Minimalist globe icon */}
                <div className="w-10 h-10 mb-8 text-stone-900">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <h3 className="font-serif-editorial text-2xl font-medium text-slate-900">
                  ATS is a systems problem
                </h3>
                <p className="mt-4 text-sm text-stone-600 font-sans leading-relaxed">
                  We build tools that help applicants connect the dots between experience, impact, and parser specifications.
                </p>
              </div>
            </div>

            {/* Card 3: Circle with northeast arrow icon (↗) */}
            <div className="rounded-3xl bg-white p-8 border border-stone-200 shadow-xs flex flex-col justify-between h-full">
              <div>
                {/* Minimalist diagonal arrow icon */}
                <div className="w-10 h-10 mb-8 text-stone-900">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="9" y1="15" x2="15" y2="9" />
                    <polyline points="9 9 15 9 15 15" />
                  </svg>
                </div>
                <h3 className="font-serif-editorial text-2xl font-medium text-slate-900">
                  Progress over perfection
                </h3>
                <p className="mt-4 text-sm text-stone-600 font-sans leading-relaxed">
                  We support real-world career momentum—helping candidates move from passive applications to measurable offers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FROM THE JOURNAL SECTION (Screenshot 5)                                */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-14 flex items-baseline justify-between border-b border-stone-200 pb-6">
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-normal text-slate-900">
            From the journal
          </h2>
          <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
            Research & Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Article 1 */}
          <div className="group cursor-pointer">
            <div className="aspect-[16/9] rounded-2xl bg-stone-100 overflow-hidden mb-4 border border-stone-200 flex items-center justify-center p-6 bg-gradient-to-tr from-sky-50 to-stone-100">
              <div className="w-full text-center">
                <span className="font-mono text-xs text-sky-800 font-bold block mb-1">ATS PARSING ENGINE</span>
                <span className="font-serif-editorial text-2xl text-slate-900">Lever & Workday Parser Spec</span>
              </div>
            </div>
            <h3 className="font-serif-editorial text-xl font-medium text-slate-900 group-hover:text-stone-700 transition-colors">
              Inside the ATS parsing model: How recruitment software scores career keywords
            </h3>
            <div className="mt-2 flex items-center gap-3 text-xs text-stone-500 font-mono">
              <span>Insights</span>
              <span>•</span>
              <span>5 min read</span>
            </div>
          </div>

          {/* Article 2 */}
          <div className="group cursor-pointer">
            <div className="aspect-[16/9] rounded-2xl bg-stone-100 overflow-hidden mb-4 border border-stone-200 flex items-center justify-center p-6 bg-gradient-to-tr from-yellow-50 to-stone-100">
              <div className="w-full text-center">
                <span className="font-mono text-xs text-amber-800 font-bold block mb-1">PAGE DENSITY STUDY</span>
                <span className="font-serif-editorial text-2xl text-slate-900">The 1-Page Resume Advantage</span>
              </div>
            </div>
            <h3 className="font-serif-editorial text-xl font-medium text-slate-900 group-hover:text-stone-700 transition-colors">
              Fit to Pages: Why calibrated single-page resumes receive 3.4x faster recruiter reviews
            </h3>
            <div className="mt-2 flex items-center gap-3 text-xs text-stone-500 font-mono">
              <span>Engineering</span>
              <span>•</span>
              <span>6 min read</span>
            </div>
          </div>
        </div>

        {/* View all articles button matching screenshot */}
        <div className="mt-14 text-center">
          <Link to="/register">
            <button
              type="button"
              className="bg-black hover:bg-neutral-800 text-white rounded-none px-6 py-2.5 text-xs font-mono font-medium tracking-wide inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <span className="text-[10px]">▪</span>
              <span>View all articles & guides</span>
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
