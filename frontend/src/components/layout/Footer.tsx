import { Shield, CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#fbfaf8] text-stone-600 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-serif-editorial text-2xl font-bold tracking-tight text-slate-900">
                ATSCraft
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold tracking-wider">
                ATS
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed font-sans">
              Precision Resume Architecture. Deterministic ATS scoring, selectable vector PDFs, and transparent qualification matching.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900 mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="text-stone-600 hover:text-slate-900">Resume Workspace</Link></li>
              <li><Link to="/analysis" className="text-stone-600 hover:text-slate-900">ATS Job Matcher</Link></li>
              <li><Link to="/#features" className="text-stone-600 hover:text-slate-900">Scoring Engine</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900 mb-3">Integrity</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-stone-600">
                <Shield className="h-3.5 w-3.5 text-stone-800" />
                Zero Resume Data Brokering
              </li>
              <li className="flex items-center gap-1.5 text-stone-600">
                <CheckCircle className="h-3.5 w-3.5 text-stone-800" />
                No Fabricated AI Qualifications
              </li>
              <li className="flex items-center gap-1.5 text-stone-600">
                <Zap className="h-3.5 w-3.5 text-stone-800" />
                Instant Account & Data Wipe
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900 mb-3">Compliance</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-sans">
              Standard A4 typography. Single-column ATS parsing architecture certified for Greenhouse, Lever, and Workday.
            </p>
            <div className="mt-3 text-[11px] font-mono text-stone-400">
              © {new Date().getFullYear()} ATSCraft. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
