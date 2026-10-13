export type FindingSeverity = 'critical' | 'warning' | 'positive' | 'suggestion';
export type FindingCategory = 'skills' | 'experience' | 'structure' | 'readability';

export interface AnalysisFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  detail: string;
  evidence?: string;
  suggested_action?: string;
  estimated_score_impact: number;
}

export interface MatchedSkillItem {
  skill: string;
  matchedAs?: string;
  status: 'clearly_demonstrated' | 'weakly_supported' | 'missing';
  contextSnippet?: string;
}

export interface ATSAnalysisResult {
  id: string;
  resume_id: string;
  job_id?: string;
  overall_score: number;
  skills_score: number;
  experience_score: number;
  structure_score: number;
  readability_score: number;
  summary: string;
  findings: AnalysisFinding[];
  matched_skills: MatchedSkillItem[];
  missing_skills: string[];
  created_at: string;
}

export interface JobDescriptionEntity {
  id: string;
  user_id: string;
  title: string;
  company?: string;
  raw_text: string;
  parsed_data: {
    required_skills: string[];
    preferred_skills: string[];
    tools_and_tech: string[];
    experience_years?: number;
    responsibilities?: string[];
  };
  created_at: string;
}
