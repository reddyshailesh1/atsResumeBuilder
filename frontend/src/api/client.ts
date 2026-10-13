import type { AuthResponse, LoginPayload, RegisterPayload, UserProfile } from '../types/auth';
import type { ResumeData, ResumeEntity, ResumeVersion, ResumeStyling, AiStylingProposal, ExtractedTemplateProposal } from '../types/resume';
import type { ATSAnalysisResult, JobDescriptionEntity } from '../types/analysis';

const API_HOST = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';
const BASE_URL = API_HOST ? `${API_HOST.replace(/\/$/, '')}/api` : '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('ats_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('ats_token', token);
    } else {
      localStorage.removeItem('ats_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      // Let callers catch or redirect
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        if (typeof errJson.detail === 'string') {
          errorMsg = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorMsg = errJson.detail
            .map((item: any) => {
              if (typeof item === 'string') return item;
              if (item?.msg) return `${item.loc ? item.loc.slice(-1)[0] + ': ' : ''}${item.msg}`;
              return JSON.stringify(item);
            })
            .join('; ');
        } else if (typeof errJson.detail === 'object' && errJson.detail !== null) {
          errorMsg = errJson.detail.message || JSON.stringify(errJson.detail);
        } else if (errJson.message) {
          errorMsg = String(errJson.message);
        }
      } catch {
        // use fallback
      }
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth Endpoints
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: LoginPayload): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getCurrentUser(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me');
  }

  async deleteAccount(): Promise<void> {
    await this.request<void>('/auth/account', {
      method: 'DELETE',
    });
    this.setToken(null);
  }

  // Resume Endpoints
  async listResumes(): Promise<ResumeEntity[]> {
    return this.request<ResumeEntity[]>('/resumes');
  }

  async getResume(id: string): Promise<ResumeEntity> {
    return this.request<ResumeEntity>(`/resumes/${id}`);
  }

  async createResume(payload: { title: string; target_role?: string; initialData?: Partial<ResumeData> }): Promise<ResumeEntity> {
    return this.request<ResumeEntity>('/resumes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateResume(id: string, payload: { title?: string; target_role?: string; data?: ResumeData; page_target?: number }): Promise<ResumeEntity> {
    return this.request<ResumeEntity>(`/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async duplicateResume(id: string): Promise<ResumeEntity> {
    return this.request<ResumeEntity>(`/resumes/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async deleteResume(id: string): Promise<void> {
    return this.request<void>(`/resumes/${id}`, {
      method: 'DELETE',
    });
  }

  // Versions
  async listResumeVersions(resumeId: string): Promise<ResumeVersion[]> {
    return this.request<ResumeVersion[]>(`/resumes/${resumeId}/versions`);
  }

  async createResumeVersion(resumeId: string, payload: { title: string; change_summary?: string }): Promise<ResumeVersion> {
    return this.request<ResumeVersion>(`/resumes/${resumeId}/versions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async restoreResumeVersion(resumeId: string, versionId: string): Promise<ResumeEntity> {
    return this.request<ResumeEntity>(`/resumes/${resumeId}/versions/${versionId}/restore`, {
      method: 'POST',
    });
  }

  // Job Descriptions
  async listJobs(): Promise<JobDescriptionEntity[]> {
    return this.request<JobDescriptionEntity[]>('/jobs');
  }

  async createJob(payload: { title: string; company?: string; raw_text: string }): Promise<JobDescriptionEntity> {
    return this.request<JobDescriptionEntity>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Analysis
  async analyzeResume(payload: { resume_id: string; job_id?: string; job_text?: string; job_title?: string }): Promise<ATSAnalysisResult> {
    return this.request<ATSAnalysisResult>('/analysis/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getLatestAnalysis(resumeId: string): Promise<ATSAnalysisResult | null> {
    return this.request<ATSAnalysisResult | null>(`/analysis/latest/${resumeId}`);
  }

  // AI Assistant Endpoints
  async aiPolishSummary(payload: { summary: string; targetRole?: string; consent: boolean }): Promise<{ polished: string; tips: string[] }> {
    return this.request<{ polished: string; tips: string[] }>('/ai/polish-summary', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async aiRewriteBullet(payload: { bullet: string; role?: string; consent: boolean }): Promise<{
    suggestions: string[];
    quantificationPrompt?: string;
    actionVerb: string;
  }> {
    return this.request<{
      suggestions: string[];
      quantificationPrompt?: string;
      actionVerb: string;
    }>('/ai/rewrite-bullet', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async aiGenerateStyling(payload: {
    prompt: string;
    currentStyling?: ResumeStyling;
    targetRole?: string;
    selectedPreset?: string;
    consent?: boolean;
  }): Promise<AiStylingProposal> {
    return this.request<AiStylingProposal>('/ai/styling', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        consent: payload.consent ?? true,
      }),
    });
  }

  async aiExtractTemplateFromImage(payload: {
    imageBase64: string;
    roleHint?: string;
    consent?: boolean;
  }): Promise<ExtractedTemplateProposal> {
    return this.request<ExtractedTemplateProposal>('/ai/extract-template-image', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        consent: payload.consent ?? true,
      }),
    });
  }

  // PDF Export
  async downloadPdf(resumeId: string, filename: string): Promise<void> {
    const headers = new Headers();
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${BASE_URL}/resumes/${resumeId}/pdf`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\s+/g, '_')}_Resume.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Word Document (.docx) Export
  async downloadDocx(resumeId: string, filename: string): Promise<void> {
    const headers = new Headers();
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${BASE_URL}/resumes/${resumeId}/docx`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to generate Word Document');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\s+/g, '_')}_Resume.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Plain Text (.txt) Export
  async downloadTxt(resumeId: string, filename: string): Promise<void> {
    const headers = new Headers();
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${BASE_URL}/resumes/${resumeId}/txt`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to generate Text resume');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Profile update
  async updateProfile(payload: { full_name?: string; avatar_url?: string }): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiClient();
