# ATS Resume Builder — Architectural Design & Specification

## 1. System Overview

The **ATS Resume Builder** is a production-grade full-stack SaaS platform designed to help job applicants craft clear, single-page (or two-page when justified), applicant tracking system (ATS) compliant resumes. It features:
- Deterministic ATS compatibility scoring (0–100) based on actual job description requirements.
- Synonym-aware keyword matching and evidence qualification.
- Hallucination-free AI writing enhancement (preserves original facts, requests real metrics, never invents achievements).
- High-fidelity selectable-text PDF generation conforming to strict ATS parsing benchmarks.
- Multi-resume management, version comparison, and privacy-first ownership security.

---

## 2. Architecture & Technology Stack

```
+-----------------------------------------------------------------------+
|                             Client Tier                               |
|   React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons          |
|   React Hook Form + Zod (Validation) + TanStack Query (State/Cache)    |
|   Real-time A4 Live Page Break & Overflow Visualizer                  |
+-----------------------------------------------------------------------+
                                   |
                         HTTPS / REST JSON API
                                   |
+-----------------------------------------------------------------------+
|                             API Gateway                               |
|   FastAPI + Pydantic v2 + CORS Middleware + Rate Limiting             |
|   Bearer Token Authentication (Supabase / Standard JWT Validator)     |
+-----------------------------------------------------------------------+
                                   |
+-----------------------------------------------------------------------+
|                          Service Layer                                |
|   * ATS Scoring Engine (Deterministic, Weighted, Rule-Based)          |
|   * Job Description Parser (Skill Normalization & Synonyms)           |
|   * AI Assistant Interface (Gemini / OpenAI / Heuristic Fallback)     |
|   * PDF Generation Service (HTML/ReportLab selectable text engine)    |
+-----------------------------------------------------------------------+
                                   |
+-----------------------------------------------------------------------+
|                            Data Layer                                 |
|   SQLAlchemy 2.0 (Async/Sync) + Alembic Migrations                    |
|   PostgreSQL 15+ (Production) / SQLite3 (Zero-setup Dev & CI)        |
+-----------------------------------------------------------------------+
```

---

## 3. Database Schema Design

The relational database enforces user isolation at every query with the following core entities:

### `profiles`
- `id`: UUID (Primary Key, matches Auth User ID)
- `email`: VARCHAR(255) (Unique, Indexed)
- `full_name`: VARCHAR(255)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### `resumes`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `profiles.id`, Indexed, ON DELETE CASCADE)
- `title`: VARCHAR(255) (e.g., "Senior Software Engineer - FinTech")
- `target_role`: VARCHAR(255)
- `data`: JSONB / JSON (Full structured resume object: contact, summary, skills, experience, projects, education, certifications)
- `page_target`: INTEGER (Default 1, max 2)
- `is_primary`: BOOLEAN
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### `resume_versions`
- `id`: UUID (Primary Key)
- `resume_id`: UUID (Foreign Key -> `resumes.id`, Indexed, ON DELETE CASCADE)
- `user_id`: UUID (Foreign Key -> `profiles.id`)
- `version_number`: INTEGER
- `title`: VARCHAR(255)
- `snapshot_data`: JSONB / JSON
- `change_summary`: TEXT
- `created_at`: TIMESTAMPTZ

### `job_descriptions`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `profiles.id`, Indexed, ON DELETE CASCADE)
- `title`: VARCHAR(255)
- `company`: VARCHAR(255)
- `raw_text`: TEXT
- `parsed_data`: JSONB / JSON (Extracted required skills, preferred skills, tools, experience years)
- `created_at`: TIMESTAMPTZ

### `resume_analyses`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `profiles.id`, Indexed, ON DELETE CASCADE)
- `resume_id`: UUID (Foreign Key -> `resumes.id`, ON DELETE CASCADE)
- `job_id`: UUID (Foreign Key -> `job_descriptions.id`, Nullable, ON DELETE SET NULL)
- `overall_score`: INTEGER (0 to 100)
- `skills_score`: FLOAT (Max 35)
- `experience_score`: FLOAT (Max 25)
- `structure_score`: FLOAT (Max 20)
- `readability_score`: FLOAT (Max 20)
- `summary`: TEXT
- `created_at`: TIMESTAMPTZ

### `analysis_findings`
- `id`: UUID (Primary Key)
- `analysis_id`: UUID (Foreign Key -> `resume_analyses.id`, Indexed, ON DELETE CASCADE)
- `category`: VARCHAR(50) (e.g., 'skills', 'experience', 'structure', 'readability')
- `severity`: VARCHAR(20) ('critical', 'warning', 'positive', 'suggestion')
- `title`: VARCHAR(255)
- `detail`: TEXT
- `evidence`: TEXT (Quote or reference from resume or JD)
- `suggested_action`: TEXT
- `estimated_score_impact`: INTEGER

---

## 4. ATS Compatibility Scoring Engine Specifications

The engine is strictly deterministic and never generates stochastic numbers.
Total possible score: **100 points**.

1. **Job-Relevant Skills Match (35 Points)**
   - Required skills found in resume with direct/synonym match: up to 25 pts.
   - Preferred skills / tools found: up to 10 pts.
   - Normalization applies keyword density checks to prevent keyword stuffing.
2. **Experience & Evidence Quality (25 Points)**
   - Role duration & relevance to required seniority: up to 10 pts.
   - Bullet point strength: Action verbs present in experience bullets: up to 8 pts.
   - Quantified impact metrics (numbers, percentages, scales) present: up to 7 pts.
3. **Resume Structure & Parsing Compatibility (20 Points)**
   - Standard headings recognized ("Work Experience", "Education", "Skills", etc.): 8 pts.
   - Date formats parseable and chronologically consistent: 6 pts.
   - No complex tables, text boxes, or decorative multi-column blocks: 6 pts.
4. **Readability & Contact Information (20 Points)**
   - Contact essentials present (Full Name, Email, Phone, Location, LinkedIn/GitHub): 10 pts.
   - Page budget adherence (No overflow past chosen 1 or 2 page limit): 5 pts.
   - Word count and bullet conciseness within standard bounds (30-80 words per bullet): 5 pts.

---

## 5. AI Assistant Safeguards

The AI writing assistant strictly obeys anti-hallucination rules:
1. **Preserve Facts**: Never invent employer names, institutions, dates, technologies, or job titles not provided by the user.
2. **Prompt for Quantification**: If a user bullet says "Improved website speed", the AI rewrites it with placeholders for real figures (e.g., "Decreased page load times by [X]% through code splitting and asset compression") and asks the user to fill in their real numbers.
3. **Provider Agnostic**: Works with Google Gemini, OpenAI, or a deterministic fallback rule-based assistant if no API key is supplied.
4. **User Consent**: The user must explicitly request an AI rewrite before resume fragments are sent to the external provider.

---

## 6. PDF Quality Assurance & Selectable Text

- Output format: Standard A4 (210mm x 297mm) with 0.5-0.75in margins.
- Clean standard typefaces (Helvetica, Times, Arial or crisp web typography).
- Zero flattening into raster images: 100% vector fonts and selectable text.
- Automated verification: An internal test reads the generated PDF using PDF extraction tools and asserts that contact data, headers, and bullet texts extract accurately into plain text without encoding artifacts.

---

## 7. Security & Privacy

1. **Tenant Isolation**: Every database query filters by `user_id = current_user.id`.
2. **Input Sanitization**: Pydantic v2 schemas reject oversized payloads, invalid email formats, and unexpected fields.
3. **Sanitized Logs**: Resume body contents, tokens, and personal credentials are scrubbed from server logs.
4. **Full Deletion**: Users can delete individual resumes or their entire account, cascading all versions and analysis data.

---

## 8. AI-Powered Resume Styling Assistant — Natural Language Design

The styling assistant enables users to customize the visual presentation of their resume using plain English prompts, 1-click industry presets, or a combination of both.

```
+-----------------------------------------------------------------------------------------+
|                                User Natural Language Prompt                             |
|  "Create a clean, premium Software Engineer resume with navy blue headings, modern font"|
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                               AI Styling Service Layer                                  |
|   1. Parse NLP directives for styles, colors, typography, margins, spacing, order       |
|   2. Intercept ATS-hazardous requests (e.g. photos, graphic meters, multi-columns)      |
|   3. Validate against strict Pydantic ResumeStylingSchema                               |
|   4. Compute AtsStylingAssessment (parsing reliability score, readability, warnings)    |
+-----------------------------------------------------------------------------------------+
                                             |
                    +------------------------+------------------------+
                    |                                                 |
                    v                                                 v
+---------------------------------------+ +-----------------------------------------------+
|         Frontend Presentation         | |             PDF Export Service                |
|  * Real-time CSS Variable application | |  * ReportLab vector typography & leading      |
|  * Dynamic A4 live preview & thumbnail| |  * Exact margin, bullet & color translation   |
|  * Undo / Redo styling stack          | |  * 100% selectable text & ATS compliance      |
|  * Revert to Classic ATS default      | |                                               |
+---------------------------------------+ +-----------------------------------------------+
```

### 8.1 Structured Styling Configuration (`ResumeStylingSchema`)
To prevent injection attacks, layout breaking, and unreadable outputs, the AI is **never allowed to generate arbitrary HTML, CSS, JavaScript, or executable code**. It returns validated structured data matching a strict enum/bounded schema:
- `templateId`: e.g. `'ats_classic'`, `'modern_clean'`, `'executive'`, `'minimal'`
- `preset`: 1-Click presets (`'software_engineer'`, `'premium_corporate'`, `'modern_minimal'`, `'data_science'`, `'academic_research'`, `'campus_placement'`, `'executive_professional'`, `'creative_portfolio'`)
- `colorPalette`: Named palette (`'navy_blue'`, `'monochrome'`, `'slate_gray'`, `'dark_emerald'`, etc.)
- `headingColor` & `accentColor`: Hex color strings restricted to accessible, high-contrast dark tones
- `fontFamily`: Standard ATS-parseable web & vector fonts (`'Inter'`, `'Roboto'`, `'Merriweather'`, `'Georgia'`, `'Helvetica'`, `'Calibri'`, `'Arial'`, `'Times New Roman'`)
- `fontScale`: Font size scaling (`'compact'`, `'normal'`, `'spacious'`)
- `headingSize` & `bodySize`: Scaled typography points (e.g. 13-18pt headers, 9.5-11pt body)
- `sectionSpacing` & `lineSpacing`: Spacing tokens (`'compact'`, `'normal'`, `'relaxed'`)
- `margins`: Page margins in inches (`0.5in`, `'0.6in'`, `'0.75in'`, `'1.0in'`)
- `headerAlignment`: Contact header alignment (`'center'`, `'left'`, `'right'`)
- `dividerStyle`: Section separator rule (`'line'`, `'subtle'`, `'double'`, `'none'`)
- `bulletStyle`: Bullet point glyph (`'disc'`, `'square'`, `'dash'`, `'circle'`)
- `sectionOrder`: Reorderable array of resume sections
- `sectionEmphasis`: Targeted highlight for critical sections (`'projects'`, `'skills'`, `'experience'`, `'education'`)

### 8.2 Separation of Content and Styling
Resume factual data (experience, company names, skills, dates, contact details) and visual styling preferences are stored as two completely independent objects within `ResumeData`:
- Mutating styles **never modifies or risks corrupting** user factual achievements or career history.
- Users can switch or undo visual styles freely without triggering content revisions or data loss.
- Styling preferences persist seamlessly in database records (`resumes.data.styling`) and version snapshots.

### 8.3 ATS & Readability Guardrails
The system automatically enforces parsing safety:
1. **Single-Column Structural Guarantee**: All templates maintain a single-column linear layout to preserve deterministic top-to-bottom ATS reading order.
2. **Unsupported Request Interception**: Prompts requesting multi-column layouts, profile pictures, avatar graphics, or decorative skill bars are gracefully intercepted. The assistant provides clear, user-facing explanations detailing the ATS parsing hazard and preserves single-column compliance.
3. **Accessible Contrast Ratios**: Section heading and accent colors are constrained to high-contrast values (WCAG AA compliant) against white paper backgrounds.
4. **Vector Font Preservation**: In PDF export, all selected fonts map directly to standard vector typefaces ensuring zero rasterization and 100% text selection.

