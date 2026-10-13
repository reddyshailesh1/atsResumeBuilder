import { useState } from 'react';
import type { ResumeData, ResumeStyling, TemplateId } from '@/types/resume';
import { RESUME_TEMPLATES, REALISTIC_PROFILES, type ResumeTemplateDefinition } from '@/lib/templates';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Sparkles, 
  Layers, 
  FileCheck, 
  LayoutTemplate, 
  Sliders, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplateId: TemplateId;
  currentStyling?: ResumeStyling;
  onSelectTemplate: (templateDef: ResumeTemplateDefinition) => void;
  onLoadRealisticProfile: (profileData: ResumeData, profileTitle: string) => void;
}

export function TemplateGalleryModal({
  isOpen,
  onClose,
  currentTemplateId,
  currentStyling,
  onSelectTemplate,
  onLoadRealisticProfile,
}: TemplateGalleryModalProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'realistic_profiles'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateDefinition | null>(
    () => RESUME_TEMPLATES.find((t) => t.id === currentTemplateId) || RESUME_TEMPLATES[0]
  );
  const [confirmProfileModal, setConfirmProfileModal] = useState<any | null>(null);

  const categories = ['All', 'Tech', 'Corporate', 'Leadership', 'Academic', 'High-Density'];

  const filteredTemplates = RESUME_TEMPLATES.filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category === selectedCategory;
  });

  const handleApply = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Resume Template & Realistic Design Gallery"
      description="Switch between ATS-certified single-column templates or load realistic career profiles. Preserves all your content."
      maxWidth="5xl"
    >
      <div className="flex flex-col space-y-4">
        {/* Navigation Tabs & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">

            {/* Main Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'templates'
                    ? 'bg-white shadow-xs text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                ATS Templates ({RESUME_TEMPLATES.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('realistic_profiles')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'realistic_profiles'
                    ? 'bg-white shadow-xs text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                Realistic Profiles ({REALISTIC_PROFILES.length})
              </button>
            </div>
          </div>

          {/* Category Filter Pills (Visible when in templates tab) */}
          {activeTab === 'templates' && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Role Filter:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

        {/* Modal Body */}
        <div className="py-2">
          {activeTab === 'templates' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredTemplates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                const isCurrentlyActive = currentTemplateId === template.id;

                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`group relative flex flex-col rounded-xl border p-4 bg-white transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-1 mb-2.5">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium ${template.previewColors.bgBadge}`}>
                        {template.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        {template.atsScore} ATS
                      </span>
                    </div>

                    {/* Template Visual Mockup Thumbnail */}
                    <div className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between mb-3 group-hover:bg-slate-100/60 transition-colors">
                      {/* Mockup Header */}
                      <div className={`space-y-1 ${template.defaultStyling.headerAlignment === 'center' ? 'text-center' : 'text-left'}`}>
                        <div
                          className="h-2 rounded-xs font-bold text-[9px] uppercase tracking-wider"
                          style={{ color: template.previewColors.heading }}
                        >
                          CANDIDATE NAME
                        </div>
                        <div className="h-1 bg-slate-300 w-3/4 mx-auto rounded-xs opacity-75" />
                        <div
                          className="h-0.5 w-full mt-1.5"
                          style={{ backgroundColor: template.previewColors.accent }}
                        />
                      </div>

                      {/* Mockup Sections */}
                      <div className="space-y-1.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            {template.defaultStyling.headingStyle === 'accent_bar' && (
                              <div
                                className="w-0.5 h-1.5 rounded-xs"
                                style={{ backgroundColor: template.previewColors.accent }}
                              />
                            )}
                            <div
                              className="text-[7px] font-bold uppercase tracking-wider"
                              style={{ color: template.previewColors.heading }}
                            >
                              Experience
                            </div>
                          </div>
                          <div className="h-1 bg-slate-200 w-full rounded-xs" />
                          <div className="h-1 bg-slate-200 w-4/5 rounded-xs" />
                        </div>
                        <div className="space-y-0.5">
                          <div
                            className="text-[7px] font-bold uppercase tracking-wider"
                            style={{ color: template.previewColors.heading }}
                          >
                            Technical Skills
                          </div>
                          <div className="h-1 bg-slate-200 w-11/12 rounded-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Template Meta */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {template.name}
                          </h3>
                          {isCurrentlyActive && (
                            <span className="text-[10px] bg-slate-900 text-white font-semibold px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-indigo-700 mt-0.5">
                          {template.tagline}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {template.description}
                        </p>
                      </div>

                      {/* Feature Checklist */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                        {template.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Radio Select Visual */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500">
                        {template.defaultStyling.fontFamily} • {template.defaultStyling.marginSize} margin
                      </span>
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Tab 2: Realistic Sample Profiles */
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-950 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-indigo-950 mb-0.5">
                    Realistic, High-Impact Resume Profiles
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Need a realistic starting point? Load an authentic, top-tier resume crafted with real-world technical stacks, quantified achievement metrics (p99 latency reductions, revenue impacts, zero-downtime migrations), and Harvard-standard ATS bullet formulations.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {REALISTIC_PROFILES.map((profile) => (
                  <div
                    key={profile.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs bg-slate-100 font-semibold text-slate-700">
                          {profile.experienceYears}
                        </Badge>
                        <Badge variant="success" className="text-xs">
                          98% ATS Match
                        </Badge>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{profile.title}</h3>
                      <p className="text-xs font-semibold text-indigo-700 mt-0.5">{profile.role}</p>

                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                        {profile.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <div className="text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">Candidate: </span>
                          {profile.data.contact.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">Key Tech: </span>
                          {profile.data.technicalSkills.slice(0, 4).join(', ')}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">Experience: </span>
                          {profile.data.workExperience.map((w) => w.company).join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setConfirmProfileModal(profile)}
                        className="w-full text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        Load This Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer - Sticky at bottom of modal scroll container */}
        <div className="sticky -bottom-5 bg-white/95 backdrop-blur-xs px-4 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 shadow-xs mt-3 -mx-2 rounded-b-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Selected Template:
            </span>
            <span className="text-xs font-bold text-slate-900">
              {selectedTemplate?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs border-slate-300">
              Exit / Close
            </Button>
            {activeTab === 'templates' && (
              <Button size="sm" onClick={handleApply} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs">
                <Check className="h-3.5 w-3.5 mr-1" />
                Apply Selected Template
              </Button>
            )}
          </div>
        </div>

        {/* Confirm Profile Overwrite Confirmation Subdialog */}
        {confirmProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Load "{confirmProfileModal.title}"?
                  </h3>
                  <p className="text-xs text-slate-500">
                    This will populate the editor with authentic career accomplishments for {confirmProfileModal.data.contact.fullName}.
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-200 leading-relaxed">
                <strong>Notice:</strong> Your current resume form fields will be replaced with this realistic profile data. You can always undo or restore previous snapshots from the <strong>Versions</strong> menu.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmProfileModal(null)}
                  className="text-xs border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onLoadRealisticProfile(confirmProfileModal.data, confirmProfileModal.title);
                    setConfirmProfileModal(null);
                    onClose();
                  }}
                  className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
                >
                  Confirm & Load Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
