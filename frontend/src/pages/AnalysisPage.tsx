import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/api/client';
import type { ResumeEntity } from '@/types/resume';
import type { ATSAnalysisResult } from '@/types/analysis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { 
  BarChart2, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Lightbulb, 
  ArrowRight, 
  FileText, 
  Briefcase,
  Zap,
  Clock,
  Layers
} from 'lucide-react';

export function AnalysisPage() {
  const [searchParams] = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');

  const [resumes, setResumes] = useState<ResumeEntity[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(preselectedResumeId || '');
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Software Engineer');
  const [jobText, setJobText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample JD loader for quick testing
  const loadSampleJob = () => {
    setJobTitle('Senior Backend Engineer (Python / Distributed Systems)');
    setJobText(`We are looking for a Senior Backend Engineer with 5+ years of experience in Python and PostgreSQL.
Requirements:
- Strong proficiency in Python, FastAPI or Django, and asynchronous architectures.
- Deep expertise in relational databases (PostgreSQL) and caching (Redis).
- Experience with Docker, Kubernetes, and AWS cloud infrastructure.
- Proven track record designing high-throughput microservices and RESTful APIs.
- Bachelor's degree in Computer Science or equivalent practical experience.

Preferred:
- Experience with Kafka or message queues.
- Familiarity with CI/CD pipelines (GitHub Actions) and automated testing with pytest.
- Strong communication and cross-functional leadership skills.`);
  };

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await api.listResumes();
        setResumes(data);
        if (!selectedResumeId && data.length > 0) {
          setSelectedResumeId(data[0].id);
        }
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchResumes();
  }, []);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Please select a resume to evaluate.');
      return;
    }
    setError(null);
    setAnalyzing(true);
    try {
      const res = await api.analyzeResume({
        resume_id: selectedResumeId,
        job_title: jobTitle,
        job_text: jobText,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'ATS analysis failed. Verify inputs.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ATS Compatibility Scoring & Job Matcher
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deterministic rule-based compatibility engine against actual job requirements
          </p>
        </div>
        <button
          type="button"
          onClick={loadSampleJob}
          className="text-xs text-emerald-700 hover:underline font-medium self-start sm:self-auto"
        >
          Load Sample Job Description
        </button>
      </div>

      {error && <Alert variant="danger" className="my-6">{error}</Alert>}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* LEFT: INPUTS FORM (Resume Picker + Job Description Input) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200">
            <form onSubmit={handleRunAnalysis}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-700" />
                  Target Role & Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resume Selector */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Select Resume To Evaluate *
                  </label>
                  {resumes.length === 0 ? (
                    <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      No resumes found. <Link to="/dashboard" className="text-emerald-700 underline font-semibold">Create one first</Link>.
                    </div>
                  ) : (
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.target_role || 'General'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Job Title */}
                <div>
                  <Input
                    label="Job Title"
                    placeholder="e.g. Lead Distributed Systems Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Job Description Text */}
                <div>
                  <Textarea
                    label="Paste Full Job Description"
                    placeholder="Paste the entire job post here, including responsibilities, requirements, qualifications..."
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    rows={10}
                    helperText="Our parser deterministically extracts required skills, preferred skills, tools, and experience thresholds."
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    loading={analyzing}
                    disabled={resumes.length === 0}
                    className="w-full bg-emerald-700 hover:bg-emerald-800"
                  >
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Calculate ATS Compatibility Score
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* RIGHT: ANALYSIS RESULTS DASHBOARD                         */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !analyzing && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 mb-4">
                <BarChart2 className="h-6 w-6 text-emerald-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Awaiting Job Description</h3>
              <p className="mx-auto mt-2 max-w-sm text-xs text-slate-500 leading-relaxed">
                Paste a target job posting on the left to compute the deterministic 100-point compatibility score, skill matches, and prioritized fixes.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-r-transparent"></div>
              <p className="text-sm font-medium text-slate-900">
                Running deterministic parsing and qualification matching...
              </p>
              <p className="text-xs text-slate-500">
                Extracting keywords, normalizing synonyms, and evaluating evidence strength
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Overall Score Header */}
              <Card className="border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Overall ATS Compatibility
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-4xl font-extrabold text-slate-950">
                        {result.overall_score}
                      </span>
                      <span className="text-sm font-medium text-slate-400">/ 100 Points</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 max-w-md">
                      {result.summary}
                    </p>
                  </div>

                  <div className={`px-5 py-4 rounded-xl border text-center ${getScoreColor(result.overall_score)}`}>
                    <span className="block text-xs uppercase font-bold tracking-wider">
                      Match Rating
                    </span>
                    <span className="text-lg font-bold">
                      {result.overall_score >= 80
                        ? 'High Match'
                        : result.overall_score >= 60
                        ? 'Moderate Match'
                        : 'Significant Gaps'}
                    </span>
                  </div>
                </div>

                {/* Category Breakdown (35 / 25 / 20 / 20) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white text-center p-4">
                  <div className="p-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                      Skills Match
                    </span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">
                      {result.skills_score} <span className="text-xs font-normal text-slate-400">/ 35</span>
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                      Experience & Evidence
                    </span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">
                      {result.experience_score} <span className="text-xs font-normal text-slate-400">/ 25</span>
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                      Structure & Headings
                    </span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">
                      {result.structure_score} <span className="text-xs font-normal text-slate-400">/ 20</span>
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                      Readability & Contact
                    </span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">
                      {result.readability_score} <span className="text-xs font-normal text-slate-400">/ 20</span>
                    </span>
                  </div>
                </div>
              </Card>

              {/* Matched vs Missing Skills */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-700" />
                    Requirement Qualification Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Clearly Demonstrated Skills */}
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide block mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Clearly Demonstrated Skills ({result.matched_skills.filter(s => s.status === 'clearly_demonstrated').length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matched_skills
                        .filter((s) => s.status === 'clearly_demonstrated')
                        .map((s, idx) => (
                          <Badge key={idx} variant="success">
                            {s.skill}
                            {s.matchedAs && s.matchedAs.toLowerCase() !== s.skill.toLowerCase() && (
                              <span className="opacity-75 ml-1 font-mono text-[10px]">
                                (syn: {s.matchedAs})
                              </span>
                            )}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  {/* Mentioned But Weakly Supported */}
                  {result.matched_skills.some(s => s.status === 'weakly_supported') && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide block mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Mentioned But Weakly Supported ({result.matched_skills.filter(s => s.status === 'weakly_supported').length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matched_skills
                          .filter((s) => s.status === 'weakly_supported')
                          .map((s, idx) => (
                            <Badge key={idx} variant="warning">
                              {s.skill} (listed in skills but lacks work experience evidence)
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Requirements */}
                  {result.missing_skills.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide block mb-2 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Missing From Resume ({result.missing_skills.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missing_skills.map((s, idx) => (
                          <Badge key={idx} variant="destructive">
                            {s}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 italic">
                        * Only incorporate missing skills if you possess genuine, hands-on experience with them. Never fabricate skills.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Categorized Actionable Findings */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-emerald-700" />
                    Prioritized Recommended Fixes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.findings.length === 0 ? (
                    <p className="text-xs text-slate-500">No issues detected. Your resume structure and content meet all rules.</p>
                  ) : (
                    result.findings.map((finding) => (
                      <div
                        key={finding.id}
                        className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                          finding.severity === 'critical'
                            ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                            : finding.severity === 'warning'
                            ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                            : finding.severity === 'positive'
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="flex items-center gap-1.5">
                            {finding.severity === 'critical' && <AlertCircle className="h-4 w-4 text-rose-600" />}
                            {finding.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                            {finding.severity === 'positive' && <CheckCircle2 className="h-4 w-4 text-emerald-700" />}
                            {finding.severity === 'suggestion' && <Lightbulb className="h-4 w-4 text-sky-600" />}
                            {finding.title}
                          </span>
                          {finding.estimated_score_impact > 0 && (
                            <Badge variant="success" className="font-mono text-[10px]">
                              +{finding.estimated_score_impact} pts if resolved
                            </Badge>
                          )}
                        </div>
                        <p className="leading-relaxed opacity-90">{finding.detail}</p>
                        {finding.suggested_action && (
                          <p className="font-medium pt-1">
                            <strong>Recommended Action:</strong> {finding.suggested_action}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Action Link to Editor */}
              <div className="pt-2 flex justify-end">
                <Link to={`/editor/${selectedResumeId}`}>
                  <Button className="bg-emerald-700 hover:bg-emerald-800">
                    Apply Fixes in Resume Editor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
