# ATS Resume Builder — Production-Ready Full-Stack Web Application

An end-to-end Applicant Tracking System (ATS) Resume Builder that enables users to create, optimize, score, and export high-conversion, ATS-compliant resumes tailored to real-world job descriptions.

---

## Features

- **Multi-Resume Management**: Create, duplicate, rename, version, and delete multiple targeted resumes.
- **ATS-First Resume Editor**: Single-column structured editor with debounced autosave, field validation, and real-time A4 overflow detection.
- **Deterministic ATS Scoring Engine**: Computes a transparent 0–100 score across 4 key pillars:
  - Job-Relevant Skills (35%)
  - Experience & Quantified Evidence (25%)
  - Resume Structure & Parsing (20%)
  - Readability & Contact Details (20%)
- **Contextual Job Description Analyzer**: Extracts required vs. preferred skills, calculates synonym-aware keyword matches, and highlights missing qualifications.
- **Hallucination-Free AI Writing Assistant**: Improves summaries, tightens bullet points, suggests action verbs and impact metrics without inventing facts or fabricating qualifications.
- **Selectable-Text A4 PDF Generation**: Strict PDF rendering with automated text extraction verification to guarantee ATS parser readability.
- **Version Tracking**: Snapshot versions, record change logs, and track compatibility score improvements over time.
- **Privacy & Security First**: Strict tenant isolation on every database query, sanitized logging, and complete account/data deletion capabilities.

---

## Tech Stack

| Domain | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Hook Form, Zod, TanStack Query |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, ReportLab (Vector PDF Generation) |
| **Database** | PostgreSQL 15+ (Production) / SQLite3 (Local Dev & Testing), Alembic |
| **Auth** | Secure JWT Bearer Authentication / Supabase Auth integration |
| **Testing** | Pytest, FastAPI TestClient, Vitest |

---

## Quickstart Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm 9+

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp ../.env.example .env

# Run database migrations / initialization
python -m app.initial_data

# Start backend development server
uvicorn app.main:app --reload --port 8000
```
Backend runs at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## Running Automated Tests

```bash
cd backend
pytest -v
```

---

## Known Limitations & Future Improvements

1. **OCR / Scanned Image Parsing**: The current analyzer prioritizes plain text and digital PDFs. Future work can incorporate Tesseract OCR for scanned physical resume sheets.
2. **Multi-Language ATS Parsing**: Scoring dictionaries currently target English job postings. Multi-language dictionary support (Spanish, French, German) can be added.
3. **LinkedIn One-Click Import**: Direct OAuth import of profile data into the resume editor.
4. **Custom Typography Templates**: Additional minimalist ATS-safe serif & sans-serif layout variants.
