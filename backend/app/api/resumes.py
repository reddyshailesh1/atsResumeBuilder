import copy
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.schemas.resume import (
    ResumeCreateRequest,
    ResumeUpdateRequest,
    ResumeResponse,
    ResumeVersionCreateRequest,
    ResumeVersionResponse,
)
from app.api.deps import get_current_user
from app.services.pdf_service import pdf_service
from app.services.docx_service import DocxGenerationService

router = APIRouter(prefix="/resumes", tags=["Resumes"])

SAMPLE_DEFAULT_RESUME_DATA = {
    "contact": {
        "fullName": "Alex Rivera",
        "headline": "Staff Software Engineer | Distributed Systems & Cloud Infrastructure",
        "email": "alex.rivera@example.com",
        "phone": "+1 (555) 019-2834",
        "location": "San Francisco, CA",
        "linkedin": "linkedin.com/in/alexrivera-dev",
        "github": "github.com/alexrivera-dev",
        "portfolio": "alexrivera.dev",
    },
    "summary": "Senior Software Engineer with 6+ years of experience engineering high-throughput backend services, distributed systems, and real-time data pipelines in Python and Go.",
    "technicalSkills": ["Python", "FastAPI", "Go", "TypeScript", "React", "SQL"],
    "toolsAndPlatforms": ["PostgreSQL", "Docker", "Kubernetes", "AWS ECS", "Redis", "Kafka", "CI/CD"],
    "softSkills": ["System Design", "Agile Leadership", "Cross-Functional Collaboration", "Mentorship"],
    "workExperience": [
        {
            "id": "exp_1",
            "company": "Apex Cloud Systems",
            "position": "Senior Backend Software Engineer",
            "location": "San Francisco, CA",
            "startDate": "Mar 2022",
            "endDate": "Present",
            "current": True,
            "highlights": [
                "Architected asynchronous ingestion microservice handling 45M+ daily requests, decreasing p99 latency by 38%.",
                "Migrated monolithic legacy database to partitioned PostgreSQL clusters, boosting database query throughput by 55%.",
                "Mentored 4 junior engineers on distributed consensus, clean code, and automated CI/CD pipeline deployments."
            ],
        },
        {
            "id": "exp_2",
            "company": "Nexus Technologies",
            "position": "Software Engineer",
            "location": "Remote",
            "startDate": "Jul 2019",
            "endDate": "Feb 2022",
            "current": False,
            "highlights": [
                "Developed RESTful APIs in Python and FastAPI servicing 120,000 monthly active users.",
                "Automated end-to-end integration test suites with pytest, lifting test coverage from 62% to 94%."
            ],
        }
    ],
    "projects": [
        {
            "id": "proj_1",
            "name": "High-Throughput Log Aggregator",
            "role": "Creator & Lead Developer",
            "technologies": ["Go", "Kafka", "Docker"],
            "startDate": "2023",
            "bullets": [
                "Built lightweight open-source log streamer benchmarked at 250,000 messages/sec.",
                "Maintained 99.99% uptime in distributed test harness with automated failover."
            ],
        }
    ],
    "education": [
        {
            "id": "edu_1",
            "institution": "University of California, Berkeley",
            "degree": "B.S. in Computer Science",
            "fieldOfStudy": "Computer Science",
            "startDate": "2015",
            "endDate": "2019",
            "gpa": "3.85",
            "honors": "Dean's Honor List",
        }
    ],
    "certifications": [
        {
            "id": "cert_1",
            "name": "AWS Certified Solutions Architect",
            "issuer": "Amazon Web Services",
            "issueDate": "2023",
        }
    ],
    "leadershipAndActivities": [],
    "languages": ["English (Native)", "Spanish (Conversational)"],
    "pageTarget": 1,
    "template": "classic_ats",
}

@router.get("", response_model=List[ResumeResponse])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.updated_at.desc())
        .all()
    )

@router.post("", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
def create_resume(
    payload: ResumeCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    initial_data = payload.initialData or copy.deepcopy(SAMPLE_DEFAULT_RESUME_DATA)
    # Customize name and email to candidate's actual credentials
    if "contact" in initial_data:
        if current_user.full_name and current_user.full_name.strip():
            initial_data["contact"]["fullName"] = current_user.full_name.strip()
        elif current_user.email:
            initial_data["contact"]["fullName"] = current_user.email.split("@")[0].replace(".", " ").title()
        if current_user.email:
            initial_data["contact"]["email"] = current_user.email

    resume = Resume(
        user_id=current_user.id,
        title=payload.title,
        target_role=payload.target_role,
        data=initial_data,
        page_target=initial_data.get("pageTarget", 1),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied.",
        )
    return resume

@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: str,
    payload: ResumeUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied.",
        )

    if payload.title is not None:
        resume.title = payload.title
    if payload.target_role is not None:
        resume.target_role = payload.target_role
    if payload.data is not None:
        resume.data = payload.data
    if payload.page_target is not None:
        resume.page_target = payload.page_target

    db.commit()
    db.refresh(resume)
    return resume

@router.post("/{resume_id}/duplicate", response_model=ResumeResponse)
def duplicate_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied.",
        )

    dup_resume = Resume(
        user_id=current_user.id,
        title=f"{resume.title} (Copy)",
        target_role=resume.target_role,
        data=copy.deepcopy(resume.data),
        page_target=resume.page_target,
    )
    db.add(dup_resume)
    db.commit()
    db.refresh(dup_resume)
    return dup_resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied.",
        )

    db.delete(resume)
    db.commit()
    return None

# -------------------------------------------------------------
# Version History Endpoints
# -------------------------------------------------------------
@router.get("/{resume_id}/versions", response_model=List[ResumeVersionResponse])
def list_versions(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify ownership
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied.",
        )

    return (
        db.query(ResumeVersion)
        .filter(ResumeVersion.resume_id == resume_id, ResumeVersion.user_id == current_user.id)
        .order_by(ResumeVersion.version_number.desc())
        .all()
    )

@router.post("/{resume_id}/versions", response_model=ResumeVersionResponse, status_code=status.HTTP_201_CREATED)
def create_version_snapshot(
    resume_id: str,
    payload: ResumeVersionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied.",
        )

    latest_ver = (
        db.query(ResumeVersion)
        .filter(ResumeVersion.resume_id == resume_id)
        .order_by(ResumeVersion.version_number.desc())
        .first()
    )
    next_ver_num = (latest_ver.version_number + 1) if latest_ver else 1

    version = ResumeVersion(
        resume_id=resume.id,
        user_id=current_user.id,
        version_number=next_ver_num,
        title=payload.title,
        snapshot_data=copy.deepcopy(resume.data),
        change_summary=payload.change_summary,
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return version

@router.post("/{resume_id}/versions/{version_id}/restore", response_model=ResumeResponse)
def restore_version_snapshot(
    resume_id: str,
    version_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied.",
        )

    version = (
        db.query(ResumeVersion)
        .filter(
            ResumeVersion.id == version_id,
            ResumeVersion.resume_id == resume_id,
            ResumeVersion.user_id == current_user.id,
        )
        .first()
    )
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version snapshot not found or access denied.",
        )

    resume.data = copy.deepcopy(version.snapshot_data)
    resume.page_target = version.snapshot_data.get("pageTarget", 1)
    db.commit()
    db.refresh(resume)
    return resume

# -------------------------------------------------------------
# PDF Export Endpoint
# -------------------------------------------------------------
@router.get("/{resume_id}/pdf")
def export_pdf(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied.",
        )

    pdf_bytes = pdf_service.generate_pdf(resume.data)

    safe_title = "".join(c for c in resume.title if c.isalnum() or c in (" ", "-", "_")).strip()
    safe_title = safe_title.replace(" ", "_") or "Resume"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_title}_ATS.pdf"',
        },
    )

@router.get("/{resume_id}/docx")
def export_docx(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied.",
        )

    docx_bytes = DocxGenerationService.generate_docx(resume.data)

    safe_title = "".join(c for c in resume.title if c.isalnum() or c in (" ", "-", "_")).strip()
    safe_title = safe_title.replace(" ", "_") or "Resume"

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_title}_ATS.docx"',
        },
    )

@router.get("/{resume_id}/txt")
def export_txt(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied.",
        )

    text_content = DocxGenerationService.generate_plain_text(resume.data)

    safe_title = "".join(c for c in resume.title if c.isalnum() or c in (" ", "-", "_")).strip()
    safe_title = safe_title.replace(" ", "_") or "Resume"

    return Response(
        content=text_content.encode("utf-8"),
        media_type="text/plain; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_title}_ATS.txt"',
        },
    )
