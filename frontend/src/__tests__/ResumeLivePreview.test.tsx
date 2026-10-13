import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ResumeLivePreview } from '../components/resume/ResumeLivePreview';
import type { ResumeData } from '../types/resume';

const sampleData: ResumeData = {
  contact: {
    fullName: 'Jane Developer',
    email: 'jane@example.com',
    phone: '+1 555-0199',
    location: 'Austin, TX',
  },
  summary: 'Senior Cloud Engineer with extensive experience in distributed systems.',
  technicalSkills: ['TypeScript', 'Python', 'Go'],
  softSkills: ['Team Mentorship'],
  toolsAndPlatforms: ['PostgreSQL', 'Docker', 'AWS'],
  workExperience: [
    {
      id: 'exp1',
      company: 'TechCorp',
      position: 'Staff Engineer',
      startDate: '2021',
      endDate: 'Present',
      current: true,
      highlights: ['Engineered streaming data pipelines processing 20M events daily.'],
    },
  ],
  projects: [],
  education: [],
  certifications: [],
  pageTarget: 1,
  template: 'classic_ats',
};

describe('ResumeLivePreview Component', () => {
  it('renders candidate full name and contact information', () => {
    render(<ResumeLivePreview data={sampleData} />);
    expect(screen.getByText(/Jane Developer/i)).toBeDefined();
    expect(screen.getByText(/jane@example.com/)).toBeDefined();
    expect(screen.getByText(/\+1 555-0199/)).toBeDefined();
  });

  it('renders technical skills and work experience sections', () => {
    render(<ResumeLivePreview data={sampleData} />);
    expect(screen.getByText(/TypeScript, Python, Go/)).toBeDefined();
    expect(screen.getByText(/Staff Engineer/)).toBeDefined();
    expect(screen.getByText(/TechCorp/)).toBeDefined();
  });

  it('displays A4 single-page budget compliance indicator', () => {
    render(<ResumeLivePreview data={sampleData} />);
    expect(screen.getByText(/Fits strictly within 1 Page budget/i)).toBeDefined();
  });
});
