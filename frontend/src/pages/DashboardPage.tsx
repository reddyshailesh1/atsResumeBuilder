import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import type { ResumeEntity } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { 
  Plus, 
  FileText, 
  Copy, 
  Trash2, 
  BarChart2, 
  Download, 
  Clock, 
  Sparkles,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { formatDate, getTimeGreeting } from '@/lib/utils';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Resume Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('Senior Software Engineer Resume');
  const [newTargetRole, setNewTargetRole] = useState('Full Stack Software Engineer');
  const [createLoading, setCreateLoading] = useState(false);

  // Delete Dialog State
  const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await api.listResumes();
      setResumes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCreateResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setCreateLoading(true);
    try {
      const created = await api.createResume({
        title: newTitle,
        target_role: newTargetRole,
      });
      setCreateDialogOpen(false);
      navigate(`/editor/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create resume');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.duplicateResume(id);
      fetchResumes();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate resume');
    }
  };

  const handleDelete = async () => {
    if (!deleteResumeId) return;
    setDeleteLoading(true);
    try {
      await api.deleteResume(deleteResumeId);
      setDeleteResumeId(null);
      fetchResumes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete resume');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownload = async (resume: ResumeEntity, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.downloadPdf(resume.id, resume.title);
    } catch (err: any) {
      alert(err.message || 'Failed to download PDF');
    }
  };

  const handleDownloadDocx = async (resume: ResumeEntity, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.downloadDocx(resume.id, resume.title);
    } catch (err: any) {
      alert(err.message || 'Failed to download Word Document');
    }
  };

  const handleDownloadTxt = async (resume: ResumeEntity, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.downloadTxt(resume.id, resume.title);
    } catch (err: any) {
      alert(err.message || 'Failed to download Plain Text');
    }
  };

  const displayName = user?.full_name || 'Candidate';

  return (
    <div className="bg-[#fbfaf8] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* ========================================================================= */}
        {/* HERO METRICS CARD (ATSCraft Dashboard Layout)                             */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-white border border-stone-200/90 shadow-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl font-medium text-slate-900">
                {getTimeGreeting()}, {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-sans mt-0.5">
                Your daily ATS impact metrics and resume portfolios are ready to review.
              </p>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link to="/analysis">
                <button
                  type="button"
                  className="bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-none px-4 py-2 text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 cursor-pointer transition-colors border border-stone-200"
                >
                  <BarChart2 className="h-3.5 w-3.5 text-stone-700" />
                  <span>Test ATS Match</span>
                </button>
              </Link>
              <button
                type="button"
                onClick={() => setCreateDialogOpen(true)}
                className="bg-black hover:bg-neutral-800 text-white rounded-none px-4 py-2 text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <span className="text-[10px]">▪</span>
                <span>New Resume</span>
              </button>
            </div>
          </div>

          {/* Metric Widgets Row */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Widget 1: ATS Score with Yellow Swatch */}
            <div className="md:col-span-4 rounded-2xl border border-stone-200/80 p-5 bg-white flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
                  ATS Score Benchmark
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-serif-editorial text-4xl sm:text-5xl font-medium text-slate-900">
                    94%
                  </span>
                  <span className="text-xs font-medium text-emerald-700 font-sans">
                    Readiness
                  </span>
                </div>
              </div>
              <div className="mt-4 h-14 w-full rounded-xl bg-[#facc15] flex items-center justify-center shadow-xs">
                <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-widest">
                  100% PARSE PASS
                </span>
              </div>
            </div>

            {/* Widget 2: Parser Integrity with Geometric Star */}
            <div className="md:col-span-4 rounded-2xl border border-stone-200/80 p-5 bg-white flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  Parser integrity
                </span>
                <svg className="w-5 h-5 text-stone-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
                </svg>
              </div>
              <div className="mt-3">
                <div className="font-serif-editorial text-4xl sm:text-5xl font-medium text-slate-900">
                  99.8<span className="text-xl font-sans font-normal text-stone-500 ml-1">%</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-emerald-700 font-mono">
                  <span>↓0.0%</span>
                  <span className="text-stone-500">syntax errors</span>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-stone-500 font-sans border-t border-stone-100 pt-2">
                Greenhouse, Lever & Workday certified
              </div>
            </div>

            {/* Widget 3: Forecast Card */}
            <div className="md:col-span-4 rounded-2xl border border-stone-200/80 p-5 bg-white flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#fef08a] text-stone-900 mb-2">
                  Forecast
                </span>
                <h4 className="font-serif-editorial text-lg text-slate-900 leading-snug">
                  You're in the top 3% candidate pool for tech roles
                </h4>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-2">
                <span>Active Resumes: {resumes.length}</span>
                <span className="font-mono text-emerald-700 font-bold">Fit to 1-Page ON</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* RESUMES COLLECTION SECTION                                                */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-baseline gap-2">
              <h2 className="font-serif-editorial text-2xl font-medium text-slate-900">
                Your Resumes
              </h2>
              <span className="font-mono text-xs text-stone-400">
                ({resumes.length.toString().padStart(2, '0')})
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 rounded-2xl border border-stone-200 bg-white p-6 animate-pulse">
                  <div className="h-6 w-3/4 bg-stone-100 rounded mb-4" />
                  <div className="h-4 w-1/2 bg-stone-100 rounded mb-8" />
                  <div className="h-8 w-full bg-stone-100 rounded mt-12" />
                </div>
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-800 mb-4">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="font-serif-editorial text-2xl font-medium text-slate-900">No Resumes Yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-stone-500 font-sans">
                Start by crafting your first ATS-compliant resume with 1-page auto-fitting, verified formatting, and keyword optimization.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-black hover:bg-neutral-800 text-white rounded-none px-6 py-2.5 text-xs font-mono font-medium tracking-wide inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <span className="text-[10px]">▪</span>
                  <span>Build Your First Resume</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume, idx) => (
                <Card
                  key={resume.id}
                  className="group rounded-2xl border-stone-200 hover:border-stone-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden bg-white"
                  onClick={() => navigate(`/editor/${resume.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-[10px] text-stone-400 uppercase tracking-wider block mb-1">
                          00{(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <h3 className="font-serif-editorial text-xl font-medium text-slate-900 group-hover:text-stone-700 transition-colors line-clamp-1">
                          {resume.title}
                        </h3>
                        <p className="text-xs text-stone-500 font-sans mt-0.5">
                          {resume.target_role || 'General Engineering Role'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ● Fit: {resume.page_target || 1} Page{resume.page_target > 1 ? 's' : ''}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        ATS Certified
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(resume.updated_at)}
                      </span>
                    </div>
                  </CardContent>

                  {/* Card Actions */}
                  <div
                    className="bg-stone-50/80 border-t border-stone-100 px-5 py-3 flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(resume.id, e)}
                        className="text-stone-500 hover:text-stone-900 p-1.5 rounded hover:bg-stone-200/60 transition-colors cursor-pointer"
                        title="Duplicate Resume"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteResumeId(resume.id);
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Resume"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDownload(resume, e)}
                        className="text-[10px] font-mono px-2 py-1 rounded bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Download selectable vector PDF"
                      >
                        <Download className="h-3 w-3 text-stone-600" />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDownloadDocx(resume, e)}
                        className="text-[10px] font-mono px-2 py-1 rounded bg-white hover:bg-stone-100 text-blue-900 border border-blue-200/60 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Download editable Microsoft Word document (.docx)"
                      >
                        <FileText className="h-3 w-3 text-blue-700" />
                        <span>DOCX</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDownloadTxt(resume, e)}
                        className="text-[10px] font-mono px-2 py-1 rounded bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Download clean plain text (.txt)"
                      >
                        <span>TXT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/editor/${resume.id}`)}
                        className="text-[11px] font-mono px-3 py-1 rounded bg-black hover:bg-neutral-800 text-white transition-colors cursor-pointer flex items-center gap-1 ml-1"
                      >
                        <span>Edit</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Resume Modal */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        title="Create New ATS Resume"
        description="Choose a title and targeted job title to calibrate ATS keyword extraction."
      >
        <form onSubmit={handleCreateResume} className="space-y-4">
          <Input
            label="Resume Title *"
            placeholder="e.g. Senior Software Engineer Resume"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <Input
            label="Target Job Title *"
            placeholder="e.g. Full Stack Developer, Tech Lead"
            value={newTargetRole}
            onChange={(e) => setNewTargetRole(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={createLoading}
              className="bg-black hover:bg-neutral-800 text-white rounded-none px-5 py-2 text-xs font-mono font-medium tracking-wide inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span className="text-[10px]">▪</span>
              <span>{createLoading ? 'Creating...' : 'Create & Open Editor'}</span>
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteResumeId}
        onClose={() => setDeleteResumeId(null)}
        title="Delete Resume"
        description="Are you sure you want to delete this resume? This action cannot be undone."
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteResumeId(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={deleteLoading}
            onClick={handleDelete}
          >
            Delete Resume
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
