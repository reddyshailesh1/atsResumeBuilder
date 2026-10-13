import { useState, useRef } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { api } from '@/api/client';
import type { ResumeData, ResumeStyling, AiStylingProposal, DesignPreset } from '@/types/resume';
import { ResumeLivePreview } from './ResumeLivePreview';
import { 
  Sparkles, 
  Palette, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw,
  Sliders,
  CheckCircle2,
  Info,
  ArrowDown
} from 'lucide-react';

interface AiStylingModalProps {
  open: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  targetRole?: string;
  onApplyStyling: (newStyling: ResumeStyling, assessmentNotes?: string) => void;
}

const PRESET_OPTIONS: { id: DesignPreset; name: string; desc: string; sampleColor: string }[] = [
  { id: 'software_engineer', name: 'Software Engineer', desc: 'Navy blue headings, Inter sans, compact hierarchy, highlighted tech stack', sampleColor: '#1e3a8a' },
  { id: 'premium_corporate', name: 'Premium Corporate', desc: 'Garamond serif, deep slate headings, traditional corporate spacing', sampleColor: '#0f172a' },
  { id: 'modern_minimal', name: 'Modern Minimal', desc: 'Roboto font, monochrome charcoal, clean lines without horizontal bars', sampleColor: '#18181b' },
  { id: 'data_science', name: 'Data Science', desc: 'Teal accent bars, compact metrics density, emphasized projects & modeling skills', sampleColor: '#0f766e' },
  { id: 'academic_research', name: 'Academic Research', desc: 'Georgia serif, wide margins, education and publications priority', sampleColor: '#000000' },
  { id: 'campus_placement', name: 'Campus Placement', desc: 'Forest green headings, balanced sections, education & project priority', sampleColor: '#14532d' },
  { id: 'executive', name: 'Executive Professional', desc: 'Merriweather serif, warm amber accents, leadership & experience focus', sampleColor: '#1e293b' },
  { id: 'creative_portfolio', name: 'Creative Portfolio', desc: 'Indigo accents, dashed dividers, square bullets, modern portfolio flair', sampleColor: '#4338ca' },
];

export function AiStylingModal({
  open,
  onClose,
  resumeData,
  targetRole,
  onApplyStyling,
}: AiStylingModalProps) {
  const [prompt, setPrompt] = useState(
    'Create a clean, premium-looking Software Engineer resume with navy blue headings, modern typography, compact spacing, clearly highlighted technical skills, and a professional single-column layout.'
  );
  const [selectedPreset, setSelectedPreset] = useState<DesignPreset | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<AiStylingProposal | null>(null);

  const proposalSectionRef = useRef<HTMLDivElement>(null);

  const handleSelectPreset = (p: typeof PRESET_OPTIONS[0]) => {
    setSelectedPreset(p.id);
    setPrompt(
      `Apply ${p.name} styling with ${p.desc}. Ensure ATS compliance with a single-column layout.`
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a styling description or choose a preset.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api.aiGenerateStyling({
        prompt,
        currentStyling: resumeData.styling,
        targetRole,
        selectedPreset: selectedPreset || undefined,
        consent: true,
      });
      setProposal(res);
      // Automatically scroll down to the proposed resume preview
      setTimeout(() => {
        proposalSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err: any) {
      const msg = typeof err?.message === 'string'
        ? err.message
        : typeof err === 'string'
        ? err
        : (err ? JSON.stringify(err) : 'Failed to interpret styling instructions.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!proposal) return;
    onApplyStyling(
      proposal.styling,
      `${proposal.explanation} (${proposal.atsAssessment.notes})`
    );
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="AI Resume Styling Assistant"
      description="Design and tailor your resume's visual layout, typography, colors, and section hierarchy in plain English."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Natural Language Prompt Area */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
            Natural Language Styling Prompt
          </label>
          <Textarea
            rows={3}
            placeholder="Describe how you want your resume to look... e.g., Create a clean, premium-looking Software Engineer resume with navy blue headings, modern typography, compact spacing, clearly highlighted technical skills, and a professional single-column layout."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {/* 1-Click Design Presets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              1-Click Industry Presets
            </span>
            <span className="text-[11px] text-slate-400">Click to select or combine with prompt</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_OPTIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`p-2.5 rounded-lg border text-left transition-all text-xs flex flex-col justify-between cursor-pointer ${
                  selectedPreset === p.id
                    ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                    style={{ backgroundColor: p.sampleColor }}
                  />
                  <span className="font-semibold text-slate-900 line-clamp-1">{p.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                  {p.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate / Apply AI Styling Trigger */}
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            loading={loading}
            onClick={handleGenerate}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Styling Proposal
          </Button>
        </div>

        {/* Proposed Design Preview & Assessment */}
        {proposal && (
          <div ref={proposalSectionRef} className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Palette className="h-4 w-4 text-emerald-700" />
                Proposed Design Configuration
              </h4>
              <Badge variant="default" className="capitalize text-xs">
                {proposal.suggestedPreset.replace('_', ' ')}
              </Badge>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
              {proposal.explanation}
            </p>

            {/* Visual Swatches & Configuration Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Colors</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-3.5 h-3.5 rounded border border-black/10 shrink-0"
                      style={{ backgroundColor: proposal.styling.headingColor }}
                      title="Heading Color"
                    />
                    <span className="font-mono text-[11px] text-slate-700">{proposal.styling.headingColor}</span>
                  </div>
                  <span
                    className="w-3.5 h-3.5 rounded border border-black/10 shrink-0"
                    style={{ backgroundColor: proposal.styling.accentColor }}
                    title="Accent Color"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Typography</span>
                <span className="font-semibold text-slate-900 capitalize block mt-1">
                  {proposal.styling.fontFamily} ({proposal.styling.fontScale})
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Density & Margin</span>
                <span className="font-semibold text-slate-900 capitalize block mt-1">
                  {proposal.styling.spacingDensity} / {proposal.styling.marginSize}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Header Align</span>
                <span className="font-semibold text-slate-900 capitalize block mt-1">
                  {proposal.styling.headerAlignment}
                </span>
              </div>
            </div>

            {/* ATS Readability Assessment */}
            <div
              className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                proposal.atsAssessment.impact === 'safe'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {proposal.atsAssessment.impact === 'safe' ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  ATS Readability & Parsing Assessment
                </span>
                {proposal.atsAssessment.readabilityScoreImpact > 0 && (
                  <Badge variant="success" className="text-[10px] font-mono">
                    +{proposal.atsAssessment.readabilityScoreImpact} pts Readability
                  </Badge>
                )}
              </div>
              <p className="leading-relaxed opacity-90">{proposal.atsAssessment.notes}</p>
            </div>

            {/* Unsupported Requests Explanation */}
            {proposal.unsupportedRequests && proposal.unsupportedRequests.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-800">
                  <Info className="h-3.5 w-3.5" />
                  ATS Guardrail Adjustments:
                </span>
                {proposal.unsupportedRequests.map((warn, i) => (
                  <p key={i} className="leading-relaxed">{warn}</p>
                ))}
              </div>
            )}

            {/* Miniature Live Preview of Proposed Design */}
            <div>
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                Live Template Preview with Proposed Styling:
              </span>
              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-300 bg-slate-100 p-2 shadow-inner">
                <ResumeLivePreview data={resumeData} overrideStyling={proposal.styling} scale={0.85} />
              </div>
            </div>

            {/* Decision Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setProposal(null)}
              >
                Edit Preferences
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApply}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Apply Styling to Resume
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
