export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface WorkExperienceItem {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  technologies: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
}

export type TemplateId = 
  | 'classic_ats' 
  | 'modern_ats' 
  | 'minimal_ats' 
  | 'executive_ats'
  | 'tech_lead'
  | 'data_science_ats'
  | 'academic_ats'
  | 'compact_ats';

export type DesignPreset = 
  | 'software_engineer'
  | 'premium_corporate'
  | 'modern_minimal'
  | 'data_science'
  | 'academic_research'
  | 'campus_placement'
  | 'executive'
  | 'creative_portfolio'
  | 'custom';

export type FontFamily = 'inter' | 'roboto' | 'helvetica' | 'georgia' | 'garamond' | 'merriweather';
export type FontScale = 'compact' | 'normal' | 'spacious';
export type HeadingStyle = 'bold_uppercase' | 'bold_capitalize' | 'underlined' | 'accent_bar';
export type DividerStyle = 'solid' | 'dashed' | 'none' | 'thick';
export type BulletStyle = 'disc' | 'circle' | 'square' | 'hyphen';
export type SpacingDensity = 'compact' | 'comfortable' | 'spacious';
export type MarginSize = 'narrow' | 'normal' | 'wide';
export type HeaderAlignment = 'left' | 'center' | 'right';
export type BodyAlignment = 'left' | 'center' | 'right' | 'justify';

export interface ResumeStyling {
  templateId: TemplateId;
  preset: DesignPreset;
  headingColor: string;
  accentColor: string;
  bodyColor: string;
  fontFamily: FontFamily;
  fontScale: FontScale;
  fontSizePt?: number;
  headingStyle: HeadingStyle;
  dividerStyle: DividerStyle;
  bulletStyle: BulletStyle;
  spacingDensity: SpacingDensity;
  marginSize: MarginSize;
  headerAlignment: HeaderAlignment;
  bodyAlignment?: BodyAlignment;
  sectionOrder: string[];
  sectionEmphasis: string[];
}

export interface AiStylingProposal {
  styling: ResumeStyling;
  explanation: string;
  atsAssessment: {
    impact: 'safe' | 'caution' | 'warning';
    readabilityScoreImpact: number;
    notes: string;
  };
  suggestedPreset: DesignPreset;
  unsupportedRequests?: string[];
}

export interface ExtractedTemplateProposal {
  styling: ResumeStyling;
  explanation: string;
  atsAssessment: {
    impact: 'safe' | 'caution' | 'warning';
    readabilityScoreImpact: number;
    notes: string;
  };
  extractedTraits: Record<string, any>;
  confidenceScore: number;
}

export interface ResumeData {
  contact: ContactInfo;
  summary: string;
  technicalSkills: string[];
  softSkills: string[];
  toolsAndPlatforms: string[];
  workExperience: WorkExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  leadershipAndActivities?: CustomSectionItem[];
  languages?: string[];
  pageTarget: number;
  pageFitEnabled?: boolean;
  template: TemplateId;
  styling?: ResumeStyling;
}

export interface ResumeEntity {
  id: string;
  user_id: string;
  title: string;
  target_role?: string;
  data: ResumeData;
  page_target: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  version_number: number;
  title: string;
  snapshot_data: ResumeData;
  change_summary?: string;
  created_at: string;
}
