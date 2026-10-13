import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/client';
import type { ResumeData, ResumeEntity, WorkExperienceItem, ProjectItem, EducationItem, CertificationItem } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ResumeLivePreview } from '@/components/resume/ResumeLivePreview';
import { AiRewriteModal } from '@/components/resume/AiRewriteModal';
import { AiStylingModal } from '@/components/resume/AiStylingModal';
import { VersionHistoryModal } from '@/components/resume/VersionHistoryModal';
import { TemplateGalleryModal } from '@/components/resume/TemplateGalleryModal';
import { CloneTemplateImageModal } from '@/components/resume/CloneTemplateImageModal';
import { RESUME_TEMPLATES, type ResumeTemplateDefinition } from '@/lib/templates';
import type { ResumeStyling } from '@/types/resume';
import { 
  Save, 
  Download, 
  BarChart2, 
  History, 
  Plus, 
  Trash2, 
  Sparkles, 
  Palette,
  LayoutTemplate,
  UserCheck,
  Layers,
  Undo2,
  Redo2,
  RotateCcw,
  ChevronUp, 
  ChevronDown, 
  Check, 
  AlertCircle, 
  Eye, 
  Edit3,
  FileText,
  Camera,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Shrink,
  Minus,
} from 'lucide-react';

const DEFAULT_RESUME_DATA: ResumeData = {
  contact: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: '',
  technicalSkills: [],
  softSkills: [],
  toolsAndPlatforms: [],
  workExperience: [],
  projects: [],
  education: [],
  certifications: [],
  leadershipAndActivities: [],
  languages: [],
  pageTarget: 1,
  template: 'classic_ats',
};

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [resume, setResume] = useState<ResumeEntity | null>(null);
  const [data, setData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Autosave status state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const autosaveTimerRef = useRef<any>(null);

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // AI Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalText, setAiModalText] = useState('');
  const [aiModalType, setAiModalType] = useState<'bullet' | 'summary'>('bullet');
  const [aiApplyCallback, setAiApplyCallback] = useState<((refined: string) => void) | null>(null);

  // Version History Modal
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  // Template Gallery Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // AI Styling Assistant State & History Stack
  const [stylingModalOpen, setStylingModalOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [undoStylingStack, setUndoStylingStack] = useState<ResumeStyling[]>([]);
  const [redoStylingStack, setRedoStylingStack] = useState<ResumeStyling[]>([]);
  const [stylingNotice, setStylingNotice] = useState<string | null>(null);

  // Multi-Format Export Dropdown State
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Temp tag inputs for skills
  const [techSkillInput, setTechSkillInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [softSkillInput, setSoftSkillInput] = useState('');

  // Fetch initial resume
  useEffect(() => {
    if (!id) return;
    const fetchResume = async () => {
      setLoading(true);
      try {
        const fetched = await api.getResume(id);
        setResume(fetched);
        setData(fetched.data || DEFAULT_RESUME_DATA);
        setSaveStatus('saved');
      } catch (err: any) {
        setError(err.message || 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  // Debounced Autosave Trigger
  const triggerAutosave = useCallback(
    (newData: ResumeData) => {
      if (!id) return;
      setSaveStatus('saving');
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      autosaveTimerRef.current = setTimeout(async () => {
        try {
          await api.updateResume(id, {
            data: newData,
            page_target: newData.pageTarget,
          });
          setSaveStatus('saved');
          setSaveError(null);
        } catch (err: any) {
          setSaveStatus('error');
          setSaveError(err.message || 'Autosave failed. Check connection.');
        }
      }, 1500); // 1.5s debounce
    },
    [id]
  );

  const updateData = (updater: (prev: ResumeData) => ResumeData) => {
    setData((prev) => {
      const next = updater(prev);
      triggerAutosave(next);
      return next;
    });
  };

  const handleManualSave = async () => {
    if (!id) return;
    setSaveStatus('saving');
    try {
      await api.updateResume(id, {
        data,
        page_target: data.pageTarget,
      });
      setSaveStatus('saved');
      setSaveError(null);
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err.message || 'Save failed');
    }
  };

  const handleDownloadJson = () => {
    if (!resume) return;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(resume.title || 'resume').replace(/[^a-zA-Z0-9_-]/g, '_')}_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt' | 'json') => {
    if (!resume) return;
    setExportingFormat(format);
    setExportMenuOpen(false);
    try {
      if (format === 'pdf') {
        await api.downloadPdf(resume.id, resume.title);
      } else if (format === 'docx') {
        await api.downloadDocx(resume.id, resume.title);
      } else if (format === 'txt') {
        await api.downloadTxt(resume.id, resume.title);
      } else if (format === 'json') {
        handleDownloadJson();
      }
    } catch (err: any) {
      alert(err.message || `Failed to export resume as ${format.toUpperCase()}`);
    } finally {
      setExportingFormat(null);
    }
  };

  const handleDownload = () => handleExport('pdf');

  // AI Styling Handlers (Content is preserved strictly independent of Styling)
  const handleApplyStyling = (newStyling: ResumeStyling, assessmentNotes?: string) => {
    if (data.styling) {
      setUndoStylingStack((prev) => [...prev, data.styling!]);
    }
    setRedoStylingStack([]);
    if (assessmentNotes) {
      setStylingNotice(assessmentNotes);
      setTimeout(() => setStylingNotice(null), 8000);
    }
    updateData((prev) => ({
      ...prev,
      styling: newStyling,
    }));
  };

  const handleUndoStyling = () => {
    if (undoStylingStack.length === 0) return;
    const previous = undoStylingStack[undoStylingStack.length - 1];
    setUndoStylingStack((prev) => prev.slice(0, -1));
    if (data.styling) {
      setRedoStylingStack((prev) => [...prev, data.styling!]);
    }
    updateData((prev) => ({
      ...prev,
      styling: previous,
    }));
    setStylingNotice('Undid previous styling change.');
    setTimeout(() => setStylingNotice(null), 4000);
  };

  const handleRedoStyling = () => {
    if (redoStylingStack.length === 0) return;
    const next = redoStylingStack[redoStylingStack.length - 1];
    setRedoStylingStack((prev) => prev.slice(0, -1));
    if (data.styling) {
      setUndoStylingStack((prev) => [...prev, data.styling!]);
    }
    updateData((prev) => ({
      ...prev,
      styling: next,
    }));
    setStylingNotice('Redid styling change.');
    setTimeout(() => setStylingNotice(null), 4000);
  };

  const handleRestoreDefaultStyling = () => {
    if (data.styling) {
      setUndoStylingStack((prev) => [...prev, data.styling!]);
    }
    updateData((prev) => {
      const copy = { ...prev };
      delete copy.styling;
      return copy;
    });
    setStylingNotice('Restored original ATS classic styling.');
    setTimeout(() => setStylingNotice(null), 4000);
  };

  const currentStyling: ResumeStyling = data.styling || {
    templateId: 'modern_ats',
    preset: 'software_engineer',
    headingColor: '#1e3a8a',
    accentColor: '#2563eb',
    bodyColor: '#0f172a',
    fontFamily: 'inter',
    fontScale: 'normal',
    headingStyle: 'bold_uppercase',
    dividerStyle: 'solid',
    bulletStyle: 'disc',
    spacingDensity: 'compact',
    marginSize: 'normal',
    headerAlignment: 'center',
    bodyAlignment: 'left',
    sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    sectionEmphasis: ['skills', 'projects'],
  };

  const currentFontSizePt = currentStyling.fontSizePt || (
    currentStyling.fontScale === 'compact' ? 9.5 : (currentStyling.fontScale === 'spacious' ? 12.0 : 10.5)
  );

  const handleSetFontSizePt = (newPt: number) => {
    const clamped = Math.min(16.0, Math.max(7.5, Math.round(newPt * 10) / 10));
    const scale: 'compact' | 'normal' | 'spacious' = clamped <= 9.0 ? 'compact' : (clamped >= 12.0 ? 'spacious' : 'normal');
    handleApplyStyling({
      ...currentStyling,
      fontSizePt: clamped,
      fontScale: scale,
    });
  };

  const handleStepFontSize = (delta: number) => {
    handleSetFontSizePt(currentFontSizePt + delta);
  };

  const pageFitEnabled = data.pageFitEnabled !== false;

  const handleTogglePageFit = (enabled: boolean) => {
    updateData((prev) => ({
      ...prev,
      pageFitEnabled: enabled,
    }));
    if (enabled) {
      handleAutoFitToPages(data.pageTarget || 1);
    } else {
      setStylingNotice('Fit to Pages is OFF: Switched to natural freeflow document mode.');
      setTimeout(() => setStylingNotice(null), 3500);
    }
  };

  const handleSetPageLimit = (pages: number) => {
    const targetPages = Math.min(5, Math.max(1, Math.round(pages)));
    updateData((prev) => ({
      ...prev,
      pageTarget: targetPages,
      pageFitEnabled: true,
    }));
    handleAutoFitToPages(targetPages);
  };

  const handleAutoFitToPages = (targetPages: number) => {
    const pages = Math.min(5, Math.max(1, Math.round(targetPages)));
    if (pages === 1) {
      handleApplyStyling(
        {
          ...currentStyling,
          fontSizePt: 9.5,
          fontScale: 'compact',
          spacingDensity: 'compact',
          marginSize: 'narrow',
        },
        '✨ Fit to 1 Page ON: Auto-compacted to 9.5pt font, tight vertical density, and narrow margins.'
      );
    } else {
      handleApplyStyling(
        {
          ...currentStyling,
          fontSizePt: 10.5,
          fontScale: 'normal',
          spacingDensity: 'comfortable',
          marginSize: 'normal',
        },
        `✨ Fit to ${pages} Pages ON: Balanced 10.5pt font and comfortable section spacing.`
      );
    }
    updateData((prev) => ({
      ...prev,
      pageTarget: pages,
      pageFitEnabled: true,
    }));
  };

  const handleQuickFontScale = (scale: 'compact' | 'normal' | 'spacious') => {
    const pt = scale === 'compact' ? 9.5 : (scale === 'spacious' ? 12.0 : 10.5);
    handleApplyStyling({
      ...currentStyling,
      fontScale: scale,
      fontSizePt: pt,
    });
  };

  const handleQuickHeadingColor = (hex: string) => {
    handleApplyStyling({
      ...currentStyling,
      headingColor: hex,
    });
  };

  const handleQuickTextAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    handleApplyStyling({
      ...currentStyling,
      headerAlignment: alignment === 'justify' ? 'center' : alignment,
      bodyAlignment: alignment,
    });
  };

  const handleAutoCompressOnePage = () => {
    handleApplyStyling(
      {
        ...currentStyling,
        spacingDensity: 'compact',
        fontScale: 'compact',
        marginSize: 'narrow',
      },
      '✨ Auto-compressed: Page margins, density, and font scaling adjusted to fit strictly on 1 page!'
    );
    updateData((prev) => ({
      ...prev,
      pageTarget: 1,
    }));
  };

  const handleSelectTemplate = (templateDef: ResumeTemplateDefinition) => {
    if (data.styling) {
      setUndoStylingStack((prev) => [...prev, data.styling!]);
    }
    setRedoStylingStack([]);
    updateData((prev) => ({
      ...prev,
      template: templateDef.id,
      styling: templateDef.defaultStyling,
    }));
    setStylingNotice(`Applied template: ${templateDef.name}`);
    setTimeout(() => setStylingNotice(null), 5000);
  };

  const handleLoadRealisticProfile = (profileData: ResumeData, profileTitle: string) => {
    if (data.styling) {
      setUndoStylingStack((prev) => [...prev, data.styling!]);
    }
    updateData(() => profileData);
    setStylingNotice(`Loaded realistic profile: ${profileTitle}`);
    setTimeout(() => setStylingNotice(null), 6000);
  };

  // Helper for opening AI modal
  const openAiAssistant = (
    text: string,
    type: 'bullet' | 'summary',
    onApply: (refined: string) => void
  ) => {
    setAiModalText(text);
    setAiModalType(type);
    setAiApplyCallback(() => onApply);
    setAiModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center text-slate-500">
          <FileText className="mx-auto h-8 w-8 animate-pulse text-emerald-700 mb-2" />
          <p className="text-sm">Loading ATS resume workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <Alert variant="danger">{error || 'Resume not found'}</Alert>
        <div className="mt-4">
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfaf8]">
      {/* Editor Subheader & Action Toolbar */}
      <div className="sticky top-16 z-30 border-b border-stone-200/90 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-xs font-mono px-2 py-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1"
            >
              ← Dashboard
            </Link>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-2">
              <span className="font-serif-editorial text-base sm:text-lg font-medium text-slate-900 truncate max-w-[180px] sm:max-w-xs">
                {resume.title}
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                Studio
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              {saveStatus === 'saving' && (
                <span className="text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-700" />
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-[11px] font-mono text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded flex items-center gap-1" title={saveError || ''}>
                  <AlertCircle className="h-3 w-3 text-rose-600" />
                  Save error
                </span>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Clone from Screenshot Button */}
            <button
              type="button"
              onClick={() => setCloneModalOpen(true)}
              className="group text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/90 hover:border-stone-300 font-medium flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs hover:shadow-xs font-sans"
              title="Upload screenshot or photo to clone template with AI"
            >
              <div className="p-0.5 rounded bg-violet-50 text-violet-700 group-hover:scale-105 transition-transform">
                <Camera className="h-3.5 w-3.5" />
              </div>
              <span className="hidden sm:inline">Clone from Screenshot</span>
              <span className="sm:hidden">Clone</span>
              <span className="text-[9px] font-mono px-1 py-0.5 bg-violet-100 text-violet-800 font-bold rounded">AI</span>
            </button>

            {/* Template Gallery Selector Button */}
            <button
              type="button"
              onClick={() => setTemplateModalOpen(true)}
              className="group text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/90 hover:border-stone-300 font-medium flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs hover:shadow-xs font-sans"
              title="Browse and select ATS resume templates"
            >
              <LayoutTemplate className="h-3.5 w-3.5 text-stone-600 group-hover:text-stone-900 transition-colors" />
              <span>Templates</span>
            </button>

            {/* Customize with AI Styling Button */}
            <button
              type="button"
              onClick={() => setStylingModalOpen(true)}
              className="group text-xs px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white font-medium flex items-center gap-1.5 cursor-pointer transition-all shadow-xs hover:shadow-sm font-sans border border-stone-800"
              title="Style your resume in plain English with AI"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>Customize with AI</span>
            </button>

            {/* Undo / Redo Styling Controls */}
            {undoStylingStack.length > 0 && (
              <button
                type="button"
                onClick={handleUndoStyling}
                title="Undo Styling Change"
                className="text-xs border border-stone-200 bg-white hover:bg-stone-50 h-8 w-8 p-0 rounded-lg flex items-center justify-center cursor-pointer transition-colors shadow-2xs text-stone-700"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
            )}
            {redoStylingStack.length > 0 && (
              <button
                type="button"
                onClick={handleRedoStyling}
                title="Redo Styling Change"
                className="text-xs border border-stone-200 bg-white hover:bg-stone-50 h-8 w-8 p-0 rounded-lg flex items-center justify-center cursor-pointer transition-colors shadow-2xs text-stone-700"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setVersionModalOpen(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-700 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs font-sans"
              title="Snapshots & History"
            >
              <History className="h-3.5 w-3.5 text-stone-500" />
              <span className="hidden sm:inline">Versions</span>
            </button>

            <Link to={`/analysis?resumeId=${resume.id}`}>
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs font-sans"
                title="Run automated ATS parsing and job description match"
              >
                <BarChart2 className="h-3.5 w-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Test ATS Match</span>
              </button>
            </Link>

            {/* Multi-Format Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                disabled={exportingFormat !== null}
                className="text-xs px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-70 text-white font-medium flex items-center gap-1.5 cursor-pointer transition-all shadow-xs font-sans"
                title="Export resume in PDF, Word DOCX, Plain Text TXT, or JSON"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{exportingFormat ? `Exporting...` : 'Export Resume'}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-stone-200/90 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
                      Download Resume Formats
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/60 mt-0.5 group-hover:scale-105 transition-transform">
                      <Download className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>PDF Document</span>
                        <span className="font-mono text-[10px] text-stone-500">.pdf</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                        Print-ready ATS verified vector PDF with selectable text.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExport('docx')}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 mt-0.5 group-hover:scale-105 transition-transform">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>Word Document</span>
                        <span className="font-mono text-[10px] text-stone-500">.docx</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                        Editable Microsoft Word document formatted for ATS recruiters.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExport('txt')}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 mt-0.5 group-hover:scale-105 transition-transform">
                      <AlignLeft className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>Plain Text</span>
                        <span className="font-mono text-[10px] text-stone-500">.txt</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                        Raw ASCII text optimized for pasting directly into job applications.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExport('json')}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 mt-0.5 group-hover:scale-105 transition-transform">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>Structured Data</span>
                        <span className="font-mono text-[10px] text-stone-500">.json</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                        Machine-readable JSON schema of all resume sections.
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Visual Styling & Compression Strip */}
        <div className="mx-auto max-w-7xl mt-2 px-1">
          <div className="bg-slate-50/90 border border-slate-200 rounded-lg px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs text-xs">
            {/* Left Controls: Text Size, Colors, Alignment */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Numerical Font Size Stepper & Input */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-1 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-1 select-none">
                  Text Size:
                </span>
                <button
                  type="button"
                  onClick={() => handleStepFontSize(-0.5)}
                  disabled={currentFontSizePt <= 7.5}
                  className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Decrease font size by 0.5pt (limit min: 7.5pt)"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <div className="flex items-center px-1">
                  <input
                    type="number"
                    step="0.5"
                    min="7.5"
                    max="16.0"
                    value={currentFontSizePt}
                    onChange={(e) => handleSetFontSizePt(parseFloat(e.target.value) || 10.5)}
                    className="w-11 text-center font-mono font-bold text-xs text-indigo-950 bg-indigo-50/60 rounded py-0.5 border border-indigo-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    title="Exact font size in points (range: 7.5pt – 16.0pt)"
                  />
                  <span className="text-[11px] font-mono text-slate-500 ml-0.5">pt</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleStepFontSize(0.5)}
                  disabled={currentFontSizePt >= 16.0}
                  className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Increase font size by 0.5pt (limit max: 16.0pt)"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Color Swatches & Picker */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-1 select-none">
                  Color:
                </span>
                {[
                  { name: 'Navy', hex: '#1e3a8a' },
                  { name: 'Slate', hex: '#0f172a' },
                  { name: 'Forest', hex: '#14532d' },
                  { name: 'Crimson', hex: '#831843' },
                  { name: 'Indigo', hex: '#4338ca' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => handleQuickHeadingColor(c.hex)}
                    className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                      currentStyling.headingColor === c.hex ? 'ring-2 ring-indigo-500 scale-110 border-white' : 'border-slate-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={`Set heading color to ${c.name} (${c.hex})`}
                  />
                ))}
                <label className="relative cursor-pointer flex items-center" title="Pick custom heading color">
                  <input
                    type="color"
                    value={currentStyling.headingColor || '#1e3a8a'}
                    onChange={(e) => handleQuickHeadingColor(e.target.value)}
                    className="sr-only"
                  />
                  <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200" title="Custom color picker">
                    +
                  </span>
                </label>
              </div>

              {/* Text Alignment Controls */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-1 select-none">
                  Align:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickTextAlignment('left')}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    (currentStyling.bodyAlignment || 'left') === 'left' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Align all text Left"
                >
                  <AlignLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTextAlignment('center')}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    currentStyling.bodyAlignment === 'center' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Align / Compress all text to Center"
                >
                  <AlignCenter className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTextAlignment('right')}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    currentStyling.bodyAlignment === 'right' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Align all text to Right"
                >
                  <AlignRight className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTextAlignment('justify')}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    currentStyling.bodyAlignment === 'justify' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Justify all text"
                >
                  <AlignJustify className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Right Controls: Fit to Pages Switch (OFF / ON) & Page Limiter */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Fit to Pages Toggle Switch with OFF / ON Status */}
              <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-md px-2 py-1 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-stone-600 select-none">
                  Fit to Pages:
                </span>

                {/* Animated Switch Button */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={pageFitEnabled}
                  onClick={() => handleTogglePageFit(!pageFitEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    pageFitEnabled ? 'bg-black' : 'bg-stone-300'
                  }`}
                  title={pageFitEnabled ? 'Page fitting constraint is ON (click to turn OFF)' : 'Page fitting constraint is OFF (click to turn ON)'}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      pageFitEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors ${
                    pageFitEnabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {pageFitEnabled ? 'ON' : 'OFF'}
                </span>

                {/* If ON: show target page limit stepper and auto-fit trigger */}
                {pageFitEnabled && (
                  <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => handleSetPageLimit((data.pageTarget || 1) - 1)}
                      disabled={(data.pageTarget || 1) <= 1}
                      className="w-5 h-5 flex items-center justify-center rounded bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Decrease target page count (min: 1)"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <div className="flex items-center px-0.5">
                      <span className="font-mono font-bold text-xs text-stone-900">
                        {data.pageTarget || 1}
                      </span>
                      <span className="text-[10px] text-stone-500 ml-1">
                        {(data.pageTarget || 1) > 1 ? 'pages' : 'page'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSetPageLimit((data.pageTarget || 1) + 1)}
                      disabled={(data.pageTarget || 1) >= 5}
                      className="w-5 h-5 flex items-center justify-center rounded bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Increase target page count (max: 5)"
                    >
                      <Plus className="h-3 w-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAutoFitToPages(data.pageTarget || 1)}
                      className="ml-1 text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer"
                      title="Re-run auto-compression for content"
                    >
                      Re-Fit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Styling Notice Banner if present */}
        {stylingNotice && (
          <div className="mx-auto max-w-7xl mt-2 px-1">
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-950">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-indigo-700 shrink-0" />
                {stylingNotice}
              </span>
              <button
                type="button"
                onClick={handleRestoreDefaultStyling}
                className="text-[11px] text-indigo-700 underline font-semibold hover:text-indigo-900 shrink-0"
              >
                Restore Classic ATS Styling
              </button>
            </div>
          </div>
        )}

        {/* Mobile Tab Toggle */}
        <div className="mt-3 flex lg:hidden border-t border-slate-100 pt-2">
          <div className="grid w-full grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMobileTab('editor')}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold ${
                mobileTab === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Resume Editor
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold ${
                mobileTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              A4 Live Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout with Separate Independent Rollers/Scrollbars */}
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 lg:px-8 lg:h-[calc(100vh-8.5rem)] lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:h-full">
          
          {/* ========================================================= */}
          {/* LEFT: FORM EDITORS (Independent Left Roller)             */}
          {/* ========================================================= */}
          <div className={`space-y-6 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'} lg:col-span-6 xl:col-span-6 lg:h-full lg:overflow-y-auto lg:pr-3 pb-24 overscroll-contain`}>
            {/* Left Header Indicator */}
            <div className="hidden lg:flex items-center justify-between bg-white px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-2xs">
              <span className="font-semibold flex items-center gap-1.5 text-slate-900">
                <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
                Resume Content & Customization Editor
              </span>
              <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                Left Roller
              </span>
            </div>
            
            {/* 1. Contact Details */}
            <Card className="rounded-2xl border-stone-200/90 bg-white shadow-2xs">
              <CardHeader className="pb-3 border-b border-stone-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-stone-600 font-bold bg-stone-100 px-2 py-0.5 rounded">
                      01
                    </span>
                    <CardTitle className="text-base text-slate-900 font-serif-editorial">
                      Contact & Identification
                    </CardTitle>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">
                    ATS Required
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Full Name *"
                    placeholder="First & Last Name"
                    value={data.contact.fullName}
                    onChange={(e) =>
                      updateData((p) => ({
                        ...p,
                        contact: { ...p.contact, fullName: e.target.value },
                      }))
                    }
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="email@example.com"
                    value={data.contact.email}
                    onChange={(e) =>
                      updateData((p) => ({
                        ...p,
                        contact: { ...p.contact, email: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Input
                    label="Professional Headline / Target Role"
                    placeholder="e.g. Senior Software Engineer | Distributed Systems & Cloud Architecture"
                    value={data.contact.headline || ''}
                    onChange={(e) =>
                      updateData((p) => ({
                        ...p,
                        contact: { ...p.contact, headline: e.target.value },
                      }))
                    }
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Displayed under your name in modern templates to instantly convey role and seniority.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Phone Number *"
                    placeholder="+1 (555) 019-2834"
                    value={data.contact.phone}
                    onChange={(e) =>
                      updateData((p) => ({
                        ...p,
                        contact: { ...p.contact, phone: e.target.value },
                      }))
                    }
                  />
                  <Input
                    label="Location (City, State / Country) *"
                    placeholder="San Francisco, CA"
                    value={data.contact.location}
                    onChange={(e) =>
                      updateData((p) => ({
                        ...p,
                        contact: { ...p.contact, location: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="LinkedIn"
                    placeholder="linkedin.com/in/username"
                    value={data.contact.linkedin || ''}
                    onChange={(e) =>
                      updateData((p) => ({
                        ...p,
                        contact: { ...p.contact, linkedin: e.target.value },
                      }))
                    }
                  />
                  <Input
                    label="GitHub"
                    placeholder="github.com/username"
                    value={data.contact.github || ''}
                    onChange={(e) =>
                      updateData((p) => ({
                        ...p,
                        contact: { ...p.contact, github: e.target.value },
                      }))
                    }
                  />
                  <Input
                    label="Portfolio / Website"
                    placeholder="yourportfolio.dev"
                    value={data.contact.portfolio || ''}
                    onChange={(e) =>
                      updateData((p) => ({
                        ...p,
                        contact: { ...p.contact, portfolio: e.target.value },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Professional Summary */}
            <Card className="rounded-2xl border-stone-200/90 bg-white shadow-2xs">
              <CardHeader className="pb-3 border-b border-stone-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-stone-600 font-bold bg-stone-100 px-2 py-0.5 rounded">
                    02
                  </span>
                  <CardTitle className="text-base text-slate-900 font-serif-editorial">
                    Professional Summary
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800"
                  onClick={() =>
                    openAiAssistant(data.summary, 'summary', (refined) =>
                      updateData((p) => ({ ...p, summary: refined }))
                    )
                  }
                >
                  <Sparkles className="h-3 w-3 mr-1 text-emerald-700" />
                  AI Polish
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  placeholder="Senior Software Engineer with 6+ years designing high-throughput distributed systems in Python and Go..."
                  value={data.summary}
                  onChange={(e) =>
                    updateData((p) => ({ ...p, summary: e.target.value }))
                  }
                  rows={4}
                  helperText="Keep to 3-4 impactful sentences. Focus on domain expertise and career achievements."
                />
              </CardContent>
            </Card>

            {/* 3. Skills */}
            <Card className="rounded-2xl border-stone-200/90 bg-white shadow-2xs">
              <CardHeader className="pb-3 border-b border-stone-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-stone-600 font-bold bg-stone-100 px-2 py-0.5 rounded">
                    03
                  </span>
                  <CardTitle className="text-base text-slate-900 font-serif-editorial">
                    Skills & Competencies
                  </CardTitle>
                </div>
                <span className="text-[11px] font-mono text-stone-500">
                  ATS Keywords
                </span>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Languages & Frameworks */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Languages & Frameworks
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="e.g. TypeScript, Python, React, Go"
                      value={techSkillInput}
                      onChange={(e) => setTechSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (techSkillInput.trim()) {
                            updateData((p) => ({
                              ...p,
                              technicalSkills: [...p.technicalSkills, techSkillInput.trim()],
                            }));
                            setTechSkillInput('');
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (techSkillInput.trim()) {
                          updateData((p) => ({
                            ...p,
                            technicalSkills: [...p.technicalSkills, techSkillInput.trim()],
                          }));
                          setTechSkillInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.technicalSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {skill}
                        <button
                          type="button"
                          className="hover:text-red-600 font-bold ml-0.5"
                          onClick={() =>
                            updateData((p) => ({
                              ...p,
                              technicalSkills: p.technicalSkills.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tools & Cloud */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Tools, Cloud & Databases
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="e.g. PostgreSQL, AWS ECS, Docker, Kafka"
                      value={toolInput}
                      onChange={(e) => setToolInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (toolInput.trim()) {
                            updateData((p) => ({
                              ...p,
                              toolsAndPlatforms: [...p.toolsAndPlatforms, toolInput.trim()],
                            }));
                            setToolInput('');
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (toolInput.trim()) {
                          updateData((p) => ({
                            ...p,
                            toolsAndPlatforms: [...p.toolsAndPlatforms, toolInput.trim()],
                          }));
                          setToolInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.toolsAndPlatforms.map((tool, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {tool}
                        <button
                          type="button"
                          className="hover:text-red-600 font-bold ml-0.5"
                          onClick={() =>
                            updateData((p) => ({
                              ...p,
                              toolsAndPlatforms: p.toolsAndPlatforms.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Soft Skills */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Core Competencies & Practices
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="e.g. System Design, Agile, Mentorship, CI/CD"
                      value={softSkillInput}
                      onChange={(e) => setSoftSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (softSkillInput.trim()) {
                            updateData((p) => ({
                              ...p,
                              softSkills: [...p.softSkills, softSkillInput.trim()],
                            }));
                            setSoftSkillInput('');
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (softSkillInput.trim()) {
                          updateData((p) => ({
                            ...p,
                            softSkills: [...p.softSkills, softSkillInput.trim()],
                          }));
                          setSoftSkillInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.softSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {skill}
                        <button
                          type="button"
                          className="hover:text-red-600 font-bold ml-0.5"
                          onClick={() =>
                            updateData((p) => ({
                              ...p,
                              softSkills: p.softSkills.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Work Experience */}
            <Card className="rounded-2xl border-stone-200/90 bg-white shadow-2xs">
              <CardHeader className="pb-3 border-b border-stone-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-stone-600 font-bold bg-stone-100 px-2 py-0.5 rounded">
                    04
                  </span>
                  <CardTitle className="text-base text-slate-900 font-serif-editorial">
                    Work Experience & Internships
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-stone-200 hover:bg-stone-50"
                  onClick={() => {
                    const newItem: WorkExperienceItem = {
                      id: 'exp_' + Date.now(),
                      company: 'Tech Corp',
                      position: 'Software Engineer',
                      location: 'Remote',
                      startDate: 'Jan 2022',
                      endDate: 'Present',
                      current: true,
                      highlights: ['Architected microservices that processed 10M+ daily events.'],
                    };
                    updateData((p) => ({
                      ...p,
                      workExperience: [newItem, ...p.workExperience],
                    }));
                  }}
                >
                  <Plus className="h-3 w-3 mr-1 text-emerald-700" />
                  Add Position
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.workExperience.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No experience entries added yet.</p>
                ) : (
                  data.workExperience.map((job, jIdx) => (
                    <div key={job.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 uppercase">
                          Position #{jIdx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          {jIdx > 0 && (
                            <button
                              type="button"
                              className="p-1 text-slate-400 hover:text-slate-800"
                              title="Move Up"
                              onClick={() => {
                                const list = [...data.workExperience];
                                const temp = list[jIdx - 1];
                                list[jIdx - 1] = list[jIdx];
                                list[jIdx] = temp;
                                updateData((p) => ({ ...p, workExperience: list }));
                              }}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                          )}
                          {jIdx < data.workExperience.length - 1 && (
                            <button
                              type="button"
                              className="p-1 text-slate-400 hover:text-slate-800"
                              title="Move Down"
                              onClick={() => {
                                const list = [...data.workExperience];
                                const temp = list[jIdx + 1];
                                list[jIdx + 1] = list[jIdx];
                                list[jIdx] = temp;
                                updateData((p) => ({ ...p, workExperience: list }));
                              }}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Remove"
                            onClick={() =>
                              updateData((p) => ({
                                ...p,
                                workExperience: p.workExperience.filter((_, i) => i !== jIdx),
                              }))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Job Title"
                          value={job.position}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateData((p) => {
                              const list = [...p.workExperience];
                              list[jIdx] = { ...list[jIdx], position: val };
                              return { ...p, workExperience: list };
                            });
                          }}
                        />
                        <Input
                          label="Company Name"
                          value={job.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateData((p) => {
                              const list = [...p.workExperience];
                              list[jIdx] = { ...list[jIdx], company: val };
                              return { ...p, workExperience: list };
                            });
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          label="Location"
                          value={job.location || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateData((p) => {
                              const list = [...p.workExperience];
                              list[jIdx] = { ...list[jIdx], location: val };
                              return { ...p, workExperience: list };
                            });
                          }}
                        />
                        <Input
                          label="Start Date"
                          placeholder="e.g. Jan 2021"
                          value={job.startDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateData((p) => {
                              const list = [...p.workExperience];
                              list[jIdx] = { ...list[jIdx], startDate: val };
                              return { ...p, workExperience: list };
                            });
                          }}
                        />
                        <Input
                          label="End Date"
                          placeholder="e.g. Present"
                          value={job.endDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateData((p) => {
                              const list = [...p.workExperience];
                              list[jIdx] = { ...list[jIdx], endDate: val };
                              return { ...p, workExperience: list };
                            });
                          }}
                        />
                      </div>

                      {/* Bullets */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Impact Bullets
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 text-emerald-800"
                            onClick={() => {
                              updateData((p) => {
                                const list = [...p.workExperience];
                                list[jIdx] = {
                                  ...list[jIdx],
                                  highlights: [...list[jIdx].highlights, ''],
                                };
                                return { ...p, workExperience: list };
                              });
                            }}
                          >
                            + Add Bullet
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {job.highlights.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex gap-2 items-start">
                              <span className="text-slate-400 text-xs mt-2">•</span>
                              <div className="flex-1">
                                <Textarea
                                  value={bullet}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateData((p) => {
                                      const list = [...p.workExperience];
                                      const bList = [...list[jIdx].highlights];
                                      bList[bIdx] = val;
                                      list[jIdx] = { ...list[jIdx], highlights: bList };
                                      return { ...p, workExperience: list };
                                    });
                                  }}
                                  rows={2}
                                />
                              </div>
                              <div className="flex flex-col gap-1 pt-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-emerald-800"
                                  title="AI Polish Bullet"
                                  onClick={() =>
                                    openAiAssistant(bullet, 'bullet', (refined) => {
                                      updateData((p) => {
                                        const list = [...p.workExperience];
                                        const bList = [...list[jIdx].highlights];
                                        bList[bIdx] = refined;
                                        list[jIdx] = { ...list[jIdx], highlights: bList };
                                        return { ...p, workExperience: list };
                                      });
                                    })
                                  }
                                >
                                  <Sparkles className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                                  title="Delete Bullet"
                                  onClick={() => {
                                    updateData((p) => {
                                      const list = [...p.workExperience];
                                      list[jIdx] = {
                                        ...list[jIdx],
                                        highlights: list[jIdx].highlights.filter((_, i) => i !== bIdx),
                                      };
                                      return { ...p, workExperience: list };
                                    });
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* 5. Projects */}
            <Card className="rounded-2xl border-stone-200/90 bg-white shadow-2xs">
              <CardHeader className="pb-3 border-b border-stone-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-stone-600 font-bold bg-stone-100 px-2 py-0.5 rounded">
                    05
                  </span>
                  <CardTitle className="text-base text-slate-900 font-serif-editorial">
                    Key Projects & Technical Initiatives
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-stone-200 hover:bg-stone-50"
                  onClick={() => {
                    const newProj: ProjectItem = {
                      id: 'proj_' + Date.now(),
                      name: 'OpenSource Tool',
                      role: 'Lead Developer',
                      technologies: ['React', 'FastAPI'],
                      startDate: '2023',
                      bullets: ['Built real-time collaboration engine using WebSockets.'],
                    };
                    updateData((p) => ({
                      ...p,
                      projects: [newProj, ...p.projects],
                    }));
                  }}
                >
                  <Plus className="h-3 w-3 mr-1 text-emerald-700" />
                  Add Project
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.projects.map((proj, pIdx) => (
                  <div key={proj.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase">
                        Project #{pIdx + 1}
                      </span>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-red-600 p-1"
                        onClick={() =>
                          updateData((p) => ({
                            ...p,
                            projects: p.projects.filter((_, i) => i !== pIdx),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Project Name"
                        value={proj.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateData((p) => {
                            const list = [...p.projects];
                            list[pIdx] = { ...list[pIdx], name: val };
                            return { ...p, projects: list };
                          });
                        }}
                      />
                      <Input
                        label="Technologies (comma separated)"
                        value={proj.technologies.join(', ')}
                        onChange={(e) => {
                          const val = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          updateData((p) => {
                            const list = [...p.projects];
                            list[pIdx] = { ...list[pIdx], technologies: val };
                            return { ...p, projects: list };
                          });
                        }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase">Project Bullets</label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 text-emerald-800"
                          onClick={() => {
                            updateData((p) => {
                              const list = [...p.projects];
                              list[pIdx] = {
                                ...list[pIdx],
                                bullets: [...list[pIdx].bullets, ''],
                              };
                              return { ...p, projects: list };
                            });
                          }}
                        >
                          + Add Bullet
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {proj.bullets.map((b, bIdx) => (
                          <div key={bIdx} className="flex gap-2 items-start">
                            <span className="text-slate-400 text-xs mt-2">•</span>
                            <div className="flex-1">
                              <Textarea
                                value={b}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateData((p) => {
                                    const list = [...p.projects];
                                    const bList = [...list[pIdx].bullets];
                                    bList[bIdx] = val;
                                    list[pIdx] = { ...list[pIdx], bullets: bList };
                                    return { ...p, projects: list };
                                  });
                                }}
                                rows={2}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-emerald-800 mt-1"
                              onClick={() =>
                                openAiAssistant(b, 'bullet', (refined) => {
                                  updateData((p) => {
                                    const list = [...p.projects];
                                    const bList = [...list[pIdx].bullets];
                                    bList[bIdx] = refined;
                                    list[pIdx] = { ...list[pIdx], bullets: bList };
                                    return { ...p, projects: list };
                                  });
                                })
                              }
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 6. Education */}
            <Card className="rounded-2xl border-stone-200/90 bg-white shadow-2xs">
              <CardHeader className="pb-3 border-b border-stone-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-stone-600 font-bold bg-stone-100 px-2 py-0.5 rounded">
                    06
                  </span>
                  <CardTitle className="text-base text-slate-900 font-serif-editorial">
                    Education & Academic Credentials
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-stone-200 hover:bg-stone-50"
                  onClick={() => {
                    const newEdu: EducationItem = {
                      id: 'edu_' + Date.now(),
                      institution: 'University Name',
                      degree: 'B.S. in Computer Science',
                      startDate: '2018',
                      endDate: '2022',
                    };
                    updateData((p) => ({
                      ...p,
                      education: [...p.education, newEdu],
                    }));
                  }}
                >
                  <Plus className="h-3 w-3 mr-1 text-emerald-700" />
                  Add Education
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.education.map((edu, eIdx) => (
                  <div key={edu.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase">Degree #{eIdx + 1}</span>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-red-600 p-1"
                        onClick={() =>
                          updateData((p) => ({
                            ...p,
                            education: p.education.filter((_, i) => i !== eIdx),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Degree & Field"
                        placeholder="B.S. Computer Science"
                        value={edu.degree}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateData((p) => {
                            const list = [...p.education];
                            list[eIdx] = { ...list[eIdx], degree: val };
                            return { ...p, education: list };
                          });
                        }}
                      />
                      <Input
                        label="Institution"
                        placeholder="State University"
                        value={edu.institution}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateData((p) => {
                            const list = [...p.education];
                            list[eIdx] = { ...list[eIdx], institution: val };
                            return { ...p, education: list };
                          });
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="Dates Attended"
                        placeholder="2018 – 2022"
                        value={`${edu.startDate} – ${edu.endDate}`}
                        onChange={(e) => {
                          const parts = e.target.value.split('–');
                          updateData((p) => {
                            const list = [...p.education];
                            list[eIdx] = {
                              ...list[eIdx],
                              startDate: parts[0]?.trim() || '',
                              endDate: parts[1]?.trim() || '',
                            };
                            return { ...p, education: list };
                          });
                        }}
                      />
                      <Input
                        label="GPA / Honors (Optional)"
                        placeholder="3.8 / Magna Cum Laude"
                        value={edu.gpa || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateData((p) => {
                            const list = [...p.education];
                            list[eIdx] = { ...list[eIdx], gpa: val };
                            return { ...p, education: list };
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 7. Certifications */}
            <Card className="rounded-2xl border-stone-200/90 bg-white shadow-2xs">
              <CardHeader className="pb-3 border-b border-stone-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-stone-600 font-bold bg-stone-100 px-2 py-0.5 rounded">
                    07
                  </span>
                  <CardTitle className="text-base text-slate-900 font-serif-editorial">
                    Certifications & Licenses
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-stone-200 hover:bg-stone-50"
                  onClick={() => {
                    const newCert: CertificationItem = {
                      id: 'cert_' + Date.now(),
                      name: 'AWS Certified Solutions Architect',
                      issuer: 'Amazon Web Services',
                      issueDate: '2023',
                    };
                    updateData((p) => ({
                      ...p,
                      certifications: [...p.certifications, newCert],
                    }));
                  }}
                >
                  <Plus className="h-3 w-3 mr-1 text-emerald-700" />
                  Add Certification
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {data.certifications.map((cert, cIdx) => (
                  <div key={cert.id} className="flex gap-2 items-center">
                    <Input
                      placeholder="Certificate Name"
                      value={cert.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateData((p) => {
                          const list = [...p.certifications];
                          list[cIdx] = { ...list[cIdx], name: val };
                          return { ...p, certifications: list };
                        });
                      }}
                    />
                    <Input
                      placeholder="Issuer (e.g. AWS)"
                      value={cert.issuer}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateData((p) => {
                          const list = [...p.certifications];
                          list[cIdx] = { ...list[cIdx], issuer: val };
                          return { ...p, certifications: list };
                        });
                      }}
                    />
                    <button
                      type="button"
                      className="text-slate-400 hover:text-red-600 p-2"
                      onClick={() =>
                        updateData((p) => ({
                          ...p,
                          certifications: p.certifications.filter((_, i) => i !== cIdx),
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

          {/* ========================================================= */}
          {/* RIGHT: LIVE A4 PREVIEW (Independent Right Roller)        */}
          {/* ========================================================= */}
          <div className={`space-y-3 ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'} lg:col-span-6 xl:col-span-6 lg:h-full lg:overflow-y-auto lg:pl-3 pb-24 overscroll-contain`}>
            {/* Right Header Indicator */}
            <div className="hidden lg:flex items-center justify-between bg-white px-3.5 py-2 rounded-2xl border border-stone-200/90 text-xs text-slate-700 shadow-2xs">
              <span className="font-semibold flex items-center gap-1.5 text-slate-900">
                <Eye className="h-3.5 w-3.5 text-emerald-700" />
                Live A4 Resume Preview
              </span>
              <span className="text-[10px] text-stone-500 font-mono bg-stone-100 px-2 py-0.5 rounded">
                A4 Standard · 300 DPI Vector
              </span>
            </div>
            {/* Quick Template Switcher & Realistic Example Bar */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full">
                <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1">
                  <LayoutTemplate className="h-3.5 w-3.5 text-stone-700" />
                  Template:
                </span>
                {RESUME_TEMPLATES.map((tmpl) => {
                  const isActive = data.template === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tmpl)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                        isActive
                          ? 'bg-black text-white font-semibold shadow-2xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                      title={tmpl.description}
                    >
                      {tmpl.name.split(' ')[0]}
                      {isActive && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTemplateModalOpen(true)}
                  className="text-xs h-7 border-indigo-200 text-indigo-900 bg-indigo-50 hover:bg-indigo-100"
                >
                  <Layers className="h-3 w-3 mr-1 text-indigo-600" />
                  Gallery
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTemplateModalOpen(true)}
                  className="text-xs h-7 border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                  title="Load realistic high-impact resume profile"
                >
                  <UserCheck className="h-3 w-3 mr-1 text-emerald-700" />
                  Realistic Profiles
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-stone-100/70 p-4 sm:p-6 shadow-inner">
              <ResumeLivePreview data={data} />
            </div>
          </div>

        </div>
      </div>

      {/* AI Assistant Modal */}
      <AiRewriteModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        originalText={aiModalText}
        contextType={aiModalType}
        role={resume.target_role}
        onApply={(refined) => {
          if (aiApplyCallback) {
            aiApplyCallback(refined);
          }
        }}
      />

      {/* AI Resume Styling Assistant Modal */}
      <AiStylingModal
        open={stylingModalOpen}
        onClose={() => setStylingModalOpen(false)}
        resumeData={data}
        targetRole={resume.target_role}
        onApplyStyling={handleApplyStyling}
      />

      {/* Template & Realistic Profile Gallery Modal */}
      <TemplateGalleryModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        currentTemplateId={data.template}
        currentStyling={data.styling}
        onSelectTemplate={handleSelectTemplate}
        onLoadRealisticProfile={handleLoadRealisticProfile}
      />

      {/* Clone Template from Image / Screenshot Modal */}
      <CloneTemplateImageModal
        open={cloneModalOpen}
        onClose={() => setCloneModalOpen(false)}
        resumeData={data}
        onApplyStyling={(s) =>
          handleApplyStyling(s, '✨ Reconstructed template from screenshot applied successfully!')
        }
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        open={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        resumeId={resume.id}
        onRestore={(restored) => {
          setData(restored);
          triggerAutosave(restored);
        }}
      />
    </div>
  );
}
