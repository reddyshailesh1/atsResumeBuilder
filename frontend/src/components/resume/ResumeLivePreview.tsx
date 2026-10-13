import { useEffect, useRef, useState } from 'react';
import type { ResumeData, ResumeStyling } from '@/types/resume';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ResumeLivePreviewProps {
  data: ResumeData;
  overrideStyling?: ResumeStyling;
  scale?: number;
}

export function ResumeLivePreview({ data, overrideStyling, scale = 1 }: ResumeLivePreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflowPercentage, setOverflowPercentage] = useState<number>(0);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);

  // Standard A4 dimensions at 96 DPI: 794px width x 1123px height
  const SINGLE_PAGE_MAX_HEIGHT_PX = 1040;
  const TWO_PAGE_MAX_HEIGHT_PX = 2080;

  // Active styling: override or data.styling or default
  const styling: ResumeStyling = overrideStyling || data.styling || {
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
    sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    sectionEmphasis: ['skills', 'projects'],
  };

  const pageFitActive = data.pageFitEnabled !== false;

  useEffect(() => {
    if (!contentRef.current) return;
    if (!pageFitActive) {
      setIsOverflowing(false);
      setOverflowPercentage(0);
      return;
    }
    const height = contentRef.current.scrollHeight;
    const targetPages = Math.max(1, data.pageTarget || 1);
    const maxBudget = targetPages * SINGLE_PAGE_MAX_HEIGHT_PX;

    if (height > maxBudget) {
      const over = Math.round(((height - maxBudget) / maxBudget) * 100);
      setOverflowPercentage(over);
      setIsOverflowing(true);
    } else {
      setIsOverflowing(false);
      setOverflowPercentage(0);
    }
  }, [data, styling, pageFitActive]);

  const {
    contact,
    summary,
    technicalSkills,
    softSkills,
    toolsAndPlatforms,
    workExperience,
    projects,
    education,
    certifications,
    leadershipAndActivities,
    languages,
  } = data;

  // Font family mapping
  const getFontFamilyClass = (f: string) => {
    if (f === 'georgia' || f === 'garamond' || f === 'merriweather') {
      return 'font-serif';
    }
    return 'font-sans';
  };

  // Margin padding mapping
  const getMarginClass = (m: string) => {
    if (m === 'narrow') return 'p-5 sm:p-8';
    if (m === 'wide') return 'p-10 sm:p-14';
    return 'p-8 sm:p-11';
  };

  // Spacing density mapping
  const getSpacingClass = (d: string) => {
    if (d === 'compact') return 'space-y-2.5';
    if (d === 'spacious') return 'space-y-4';
    return 'space-y-3';
  };

  // Bullet symbol
  const getBulletSymbol = (b: string) => {
    if (b === 'hyphen') return '-';
    if (b === 'square') return '▪';
    if (b === 'circle') return '○';
    return '•';
  };

  // Text alignment helpers
  const getHeaderAlignClass = (align?: string) => {
    if (align === 'left') return 'text-left';
    if (align === 'right') return 'text-right';
    return 'text-center';
  };

  const getHeaderFlexAlignClass = (align?: string) => {
    if (align === 'left') return 'justify-start';
    if (align === 'right') return 'justify-end';
    return 'justify-center';
  };

  const getBodyAlignClass = (align?: string) => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    if (align === 'justify') return 'text-justify';
    return 'text-left';
  };

  const currentFontSizePt = styling.fontSizePt || (
    styling.fontScale === 'compact' ? 9.5 : (styling.fontScale === 'spacious' ? 12.0 : 10.5)
  );

  const getFontScaleClass = (scale?: string) => {
    if (styling.fontSizePt) return '';
    if (scale === 'compact') return 'text-[11px] leading-snug';
    if (scale === 'spacious') return 'text-[13px] leading-relaxed';
    return 'text-xs leading-normal';
  };

  const isEmphasized = (sectionKey: string) => {
    return styling.sectionEmphasis?.includes(sectionKey);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Page Budget & Overflow Notification */}
      <div className="w-full mb-3 flex items-center justify-between text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {pageFitActive ? (
            <Badge variant="outline" className="font-mono text-[11px] bg-emerald-50 text-emerald-900 border-emerald-300">
              ● Fit to {data.pageTarget} Page{data.pageTarget > 1 ? 's' : ''} (A4 Locked)
            </Badge>
          ) : (
            <Badge variant="outline" className="font-mono text-[11px] bg-stone-100 text-stone-600 border-stone-300">
              ○ Fit to Pages: OFF (Freeflow Length)
            </Badge>
          )}
          <Badge variant="neutral" className="text-[11px] font-mono">
            Size: {currentFontSizePt} pt
          </Badge>
          <Badge variant="neutral" className="text-[11px] capitalize">
            {styling.preset.replace('_', ' ')}
          </Badge>
          {pageFitActive && (
            isOverflowing ? (
              <span className="flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Overflows {data.pageTarget}-page limit by ~{overflowPercentage}%
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
                Fits strictly within {data.pageTarget} Page budget
              </span>
            )
          )}
        </div>
      </div>

      {/* A4 Container - Realistic Printed Document Appearance */}
      <div
        className={`w-full max-w-[794px] bg-white shadow-2xl border border-slate-300 rounded-xs overflow-hidden transition-all text-left relative ring-1 ring-slate-900/5 ${getFontFamilyClass(
          styling.fontFamily
        )}`}
        style={{
          minHeight: pageFitActive ? `${Math.max(1, data.pageTarget || 1) * 1123}px` : '1123px',
          color: styling.bodyColor || '#0f172a',
          fontSize: `${currentFontSizePt}pt`,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
      >
        {/* Visible Page Break Lines for Multi-Page Target when page fitting is ON */}
        {pageFitActive && (data.pageTarget || 1) > 1 &&
          Array.from({ length: (data.pageTarget || 1) - 1 }).map((_, idx) => (
            <div
              key={idx}
              className="absolute left-0 right-0 border-b-2 border-dashed border-red-300 pointer-events-none z-10 flex items-center justify-end px-4 text-[10px] text-red-500 font-mono"
              style={{ top: `${(idx + 1) * 1123}px` }}
            >
              --- A4 Page {idx + 1} Break ---
            </div>
          ))}

        {/* Printable ATS Resume Document Content */}
        <div
          ref={contentRef}
          className={`${getMarginClass(styling.marginSize)} ${getSpacingClass(
            styling.spacingDensity
          )} leading-normal`}
          id="resume-printable-area"
        >
          {/* Header & Contact Details */}
          <div
            className={`border-b pb-3 ${getHeaderAlignClass(styling.headerAlignment)}`}
            style={{ borderColor: styling.accentColor || '#cbd5e1' }}
          >
            <h1
              className={`font-bold tracking-tight uppercase ${
                styling.templateId === 'executive_ats' ? 'tracking-wider' : ''
              }`}
              style={{
                color: styling.headingColor || '#0f172a',
                fontSize: `${Math.round(currentFontSizePt * 2.2 * 10) / 10}pt`,
                lineHeight: 1.15,
              }}
            >
              {contact.fullName || 'YOUR NAME'}
            </h1>
            {contact.headline && (
              <p
                className="mt-1 font-semibold tracking-wide"
                style={{
                  color: styling.accentColor || '#334155',
                  fontSize: `${Math.round(currentFontSizePt * 1.05 * 10) / 10}pt`,
                }}
              >
                {contact.headline}
              </p>
            )}
            <div
              className={`mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-700 ${getHeaderFlexAlignClass(
                styling.headerAlignment
              )}`}
              style={{ fontSize: `${Math.round(currentFontSizePt * 0.95 * 10) / 10}pt` }}
            >
              {contact.email && <span>{contact.email}</span>}
              {contact.phone && <span>• {contact.phone}</span>}
              {contact.location && <span>• {contact.location}</span>}
              {contact.linkedin && <span>• {contact.linkedin}</span>}
              {contact.github && <span>• {contact.github}</span>}
              {contact.portfolio && <span>• {contact.portfolio}</span>}
            </div>
          </div>

          {/* Section Heading Component Helper */}
          {(() => {
            const renderHeading = (title: string, sectionKey: string) => {
              const uppercase = styling.headingStyle === 'bold_uppercase';
              const underlined = styling.headingStyle === 'underlined';
              const accentBar = styling.headingStyle === 'accent_bar';
              const headingJustify =
                styling.bodyAlignment === 'center'
                  ? 'justify-center'
                  : styling.bodyAlignment === 'right'
                  ? 'justify-end'
                  : 'justify-start';

              return (
                <div className="pt-1">
                  <div className={`flex items-center gap-1.5 ${headingJustify}`}>
                    {accentBar && (
                      <span
                        className="w-1.5 h-3.5 rounded-xs shrink-0"
                        style={{ backgroundColor: styling.accentColor }}
                      />
                    )}
                    <h2
                      className={`font-bold tracking-wider ${
                        uppercase ? 'uppercase' : 'capitalize'
                      } ${underlined ? 'underline' : ''}`}
                      style={{
                        color: styling.headingColor,
                        fontSize: `${Math.round(currentFontSizePt * 1.25 * 10) / 10}pt`,
                        lineHeight: 1.25,
                      }}
                    >
                      {title}
                      {isEmphasized(sectionKey) && (
                        <span
                          className="ml-2 text-[10px] font-normal uppercase tracking-widest px-1 py-0.2 rounded"
                          style={{
                            backgroundColor: `${styling.accentColor}15`,
                            color: styling.accentColor,
                          }}
                        >
                          Focus
                        </span>
                      )}
                    </h2>
                  </div>
                  {styling.dividerStyle === 'solid' && (
                    <div
                      className="border-b mt-0.5"
                      style={{ borderColor: styling.accentColor || '#e2e8f0' }}
                    />
                  )}
                  {styling.dividerStyle === 'dashed' && (
                    <div className="border-b border-dashed border-slate-300 mt-0.5" />
                  )}
                  {styling.dividerStyle === 'thick' && (
                    <div
                      className="border-b-2 mt-0.5"
                      style={{ borderColor: styling.headingColor }}
                    />
                  )}
                </div>
              );
            };

            // Section Renderers
            const sections: Record<string, () => React.ReactNode> = {
              summary: () =>
                summary ? (
                  <section key="summary" className="space-y-1">
                    {renderHeading('Professional Summary', 'summary')}
                    <p
                      className={`leading-relaxed pt-1 ${getFontScaleClass(styling.fontScale)} ${getBodyAlignClass(styling.bodyAlignment)}`}
                      style={{ color: styling.bodyColor }}
                    >
                      {summary}
                    </p>
                  </section>
                ) : null,

              skills: () =>
                technicalSkills?.length > 0 ||
                toolsAndPlatforms?.length > 0 ||
                softSkills?.length > 0 ? (
                  <section key="skills" className="space-y-1">
                    {renderHeading('Technical & Professional Skills', 'skills')}
                    <div
                      className={`space-y-1 pt-1 ${getFontScaleClass(styling.fontScale)} ${getBodyAlignClass(styling.bodyAlignment)} ${
                        isEmphasized('skills') ? 'bg-slate-50/70 p-2 rounded border border-slate-100' : ''
                      }`}
                      style={{ color: styling.bodyColor }}
                    >
                      {technicalSkills?.length > 0 && (
                        <div>
                          <span
                            className="font-bold"
                            style={{ color: styling.headingColor }}
                          >
                            Languages & Frameworks:{' '}
                          </span>
                          <span>{technicalSkills.join(', ')}</span>
                        </div>
                      )}
                      {toolsAndPlatforms?.length > 0 && (
                        <div>
                          <span
                            className="font-bold"
                            style={{ color: styling.headingColor }}
                          >
                            Tools, Cloud & Databases:{' '}
                          </span>
                          <span>{toolsAndPlatforms.join(', ')}</span>
                        </div>
                      )}
                      {softSkills?.length > 0 && (
                        <div>
                          <span
                            className="font-bold"
                            style={{ color: styling.headingColor }}
                          >
                            Core Competencies:{' '}
                          </span>
                          <span>{softSkills.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </section>
                ) : null,

              experience: () =>
                workExperience?.length > 0 ? (
                  <section key="experience" className="space-y-2">
                    {renderHeading('Work Experience', 'experience')}
                    <div className="space-y-2.5 pt-1">
                      {workExperience.map((job) => (
                        <div key={job.id} className="space-y-1 text-xs">
                          <div className="flex items-baseline justify-between font-bold">
                            <div>
                              <span style={{ color: styling.headingColor }}>{job.position}</span>
                              <span className="font-semibold text-slate-700"> | {job.company}</span>
                              {job.location && (
                                <span className="font-normal text-slate-600">, {job.location}</span>
                              )}
                            </div>
                            <span className="font-medium text-slate-600 text-[11px] shrink-0">
                              {job.startDate} – {job.current ? 'Present' : job.endDate}
                            </span>
                          </div>
                          {job.highlights?.length > 0 && (
                            <ul className={`pl-4 space-y-0.5 leading-relaxed ${getFontScaleClass(styling.fontScale)} ${getBodyAlignClass(styling.bodyAlignment)}`}>
                              {job.highlights.map((bullet, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span
                                    className="select-none font-bold shrink-0 mt-0.5"
                                    style={{ color: styling.accentColor }}
                                  >
                                    {getBulletSymbol(styling.bulletStyle)}
                                  </span>
                                  <span style={{ color: styling.bodyColor }}>
                                    {(() => {
                                      const mdMatch = bullet.match(/^\*\*(.*?)\*\*(.*)/);
                                      if (mdMatch) {
                                        return (
                                          <span>
                                            <strong className="font-semibold text-slate-900">
                                              {mdMatch[1]}
                                            </strong>
                                            {mdMatch[2]}
                                          </span>
                                        );
                                      }
                                      const colonMatch = bullet.match(/^([A-Za-z0-9\s/&-]{3,35}:)\s*(.*)/);
                                      if (colonMatch) {
                                        return (
                                          <span>
                                            <strong className="font-semibold text-slate-900">
                                              {colonMatch[1]}{' '}
                                            </strong>
                                            {colonMatch[2]}
                                          </span>
                                        );
                                      }
                                      return <span>{bullet}</span>;
                                    })()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null,

              projects: () =>
                projects?.length > 0 ? (
                  <section key="projects" className="space-y-2">
                    {renderHeading('Key Projects', 'projects')}
                    <div className="space-y-2 pt-1">
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className={`space-y-1 text-xs ${
                            isEmphasized('projects')
                              ? 'border-l-2 pl-2.5 py-0.5'
                              : ''
                          }`}
                          style={{ borderColor: styling.accentColor }}
                        >
                          <div className="flex items-baseline justify-between font-bold">
                            <div className="flex flex-wrap items-baseline gap-x-1.5">
                              <span style={{ color: styling.headingColor }}>{proj.name}</span>
                              {proj.role && (
                                <span className="font-semibold text-slate-700"> ({proj.role})</span>
                              )}
                              {proj.link && (
                                <span className="font-mono text-[10px] text-indigo-600">
                                  [{proj.link}]
                                </span>
                              )}
                              {proj.technologies?.length > 0 && (
                                <span className="font-normal text-slate-600 text-[11px]">
                                  — [{proj.technologies.join(', ')}]
                                </span>
                              )}
                            </div>
                            {proj.startDate && (
                              <span className="font-medium text-slate-600 text-[11px] shrink-0">
                                {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                              </span>
                            )}
                          </div>
                          {proj.bullets?.length > 0 && (
                            <ul className={`pl-4 space-y-0.5 leading-relaxed ${getFontScaleClass(styling.fontScale)} ${getBodyAlignClass(styling.bodyAlignment)}`}>
                              {proj.bullets.map((bullet, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span
                                    className="select-none font-bold shrink-0 mt-0.5"
                                    style={{ color: styling.accentColor }}
                                  >
                                    {getBulletSymbol(styling.bulletStyle)}
                                  </span>
                                  <span style={{ color: styling.bodyColor }}>
                                    {(() => {
                                      const mdMatch = bullet.match(/^\*\*(.*?)\*\*(.*)/);
                                      if (mdMatch) {
                                        return (
                                          <span>
                                            <strong className="font-semibold text-slate-900">
                                              {mdMatch[1]}
                                            </strong>
                                            {mdMatch[2]}
                                          </span>
                                        );
                                      }
                                      return <span>{bullet}</span>;
                                    })()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null,

              education: () =>
                education?.length > 0 ? (
                  <section key="education" className="space-y-1.5">
                    {renderHeading('Education', 'education')}
                    <div className="space-y-1.5 pt-1">
                      {education.map((edu) => (
                        <div key={edu.id} className="flex items-baseline justify-between text-xs">
                          <div>
                            <div
                              className="font-bold"
                              style={{ color: styling.headingColor }}
                            >
                              {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                            </div>
                            <div className="text-slate-700">
                              {edu.institution}
                              {edu.location ? `, ${edu.location}` : ''}
                              {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                              {edu.honors ? ` | ${edu.honors}` : ''}
                            </div>
                          </div>
                          <span className="font-medium text-slate-600 text-[11px] shrink-0">
                            {edu.startDate} – {edu.endDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null,

              certifications: () =>
                certifications?.length > 0 ? (
                  <section key="certifications" className="space-y-1">
                    {renderHeading('Certifications & Accreditations', 'certifications')}
                    <div className="space-y-1 pt-1 text-xs">
                      {certifications.map((cert) => (
                        <div key={cert.id} className="flex items-baseline justify-between">
                          <div>
                            <span
                              className="font-bold"
                              style={{ color: styling.headingColor }}
                            >
                              {cert.name}
                            </span>
                            <span className="text-slate-700"> — {cert.issuer}</span>
                          </div>
                          {cert.issueDate && (
                            <span className="font-medium text-slate-600 text-[11px] shrink-0">
                              {cert.issueDate}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null,

              leadership: () =>
                leadershipAndActivities && leadershipAndActivities.length > 0 ? (
                  <section key="leadership" className="space-y-1">
                    {renderHeading('Leadership & Co-Curricular', 'leadership')}
                    <div className="space-y-1 pt-1 text-xs">
                      {leadershipAndActivities.map((act) => (
                        <div key={act.id}>
                          <div className="flex items-baseline justify-between font-bold">
                            <span style={{ color: styling.headingColor }}>
                              {act.title} {act.subtitle ? `| ${act.subtitle}` : ''}
                            </span>
                            {act.date && (
                              <span className="font-medium text-slate-600 text-[11px]">
                                {act.date}
                              </span>
                            )}
                          </div>
                          {act.description && (
                            <p
                              className="text-[11px]"
                              style={{ color: styling.bodyColor }}
                            >
                              {act.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null,

              languages: () =>
                languages && languages.length > 0 ? (
                  <section key="languages" className="space-y-1">
                    {renderHeading('Languages', 'languages')}
                    <p
                      className="text-xs pt-1"
                      style={{ color: styling.bodyColor }}
                    >
                      {languages.join(', ')}
                    </p>
                  </section>
                ) : null,
            };

            // Render in configured section order
            const order = styling.sectionOrder || [
              'summary',
              'skills',
              'experience',
              'projects',
              'education',
              'certifications',
            ];

            return (
              <>
                {order.map((key) => (sections[key] ? sections[key]() : null))}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
