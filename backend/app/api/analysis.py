from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.analysis import ResumeAnalysis, AnalysisFinding
from app.schemas.analysis import (
    AnalysisRunRequest,
    AnalysisResponse,
)
from app.api.deps import get_current_user
from app.services.jd_parser import jd_parser
from app.services.ats_scorer import ats_scorer

router = APIRouter(prefix="/analysis", tags=["ATS Analysis"])

@router.post("/run", response_model=AnalysisResponse)
def run_analysis(
    payload: AnalysisRunRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify resume ownership
    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied.",
        )

    parsed_job = None
    job_id = None

    if payload.job_id:
        job = (
            db.query(JobDescription)
            .filter(JobDescription.id == payload.job_id, JobDescription.user_id == current_user.id)
            .first()
        )
        if job:
            parsed_job = job.parsed_data
            job_id = job.id
    elif payload.job_text and payload.job_text.strip():
        parsed_job = jd_parser.parse(payload.job_text)
        # Optionally persist this JD
        job = JobDescription(
            user_id=current_user.id,
            title=payload.job_title or "Target Job",
            raw_text=payload.job_text,
            parsed_data=parsed_job,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        job_id = job.id

    # Run deterministic scoring
    result = ats_scorer.score(resume.data, parsed_job)

    # Persist analysis
    analysis = ResumeAnalysis(
        user_id=current_user.id,
        resume_id=resume.id,
        job_id=job_id,
        overall_score=result["overall_score"],
        skills_score=result["skills_score"],
        experience_score=result["experience_score"],
        structure_score=result["structure_score"],
        readability_score=result["readability_score"],
        summary=result["summary"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # Persist findings
    for f in result["findings"]:
        finding = AnalysisFinding(
            analysis_id=analysis.id,
            category=f.get("category", "general"),
            severity=f.get("severity", "suggestion"),
            title=f.get("title", ""),
            detail=f.get("detail", ""),
            evidence=f.get("evidence"),
            suggested_action=f.get("suggested_action"),
            estimated_score_impact=f.get("estimated_score_impact", 0),
        )
        db.add(finding)

    db.commit()
    db.refresh(analysis)

    return AnalysisResponse(
        id=analysis.id,
        resume_id=analysis.resume_id,
        job_id=analysis.job_id,
        overall_score=analysis.overall_score,
        skills_score=analysis.skills_score,
        experience_score=analysis.experience_score,
        structure_score=analysis.structure_score,
        readability_score=analysis.readability_score,
        summary=analysis.summary,
        findings=[
            {
                "id": str(f.id),
                "category": f.category,
                "severity": f.severity,
                "title": f.title,
                "detail": f.detail,
                "evidence": f.evidence,
                "suggested_action": f.suggested_action,
                "estimated_score_impact": f.estimated_score_impact,
            }
            for f in analysis.findings
        ],
        matched_skills=analysis.matched_skills,
        missing_skills=analysis.missing_skills,
        created_at=analysis.created_at,
    )

@router.get("/latest/{resume_id}", response_model=Optional[AnalysisResponse])
def get_latest_analysis(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.resume_id == resume_id, ResumeAnalysis.user_id == current_user.id)
        .order_by(ResumeAnalysis.created_at.desc())
        .first()
    )
    if not analysis:
        return None

    return AnalysisResponse(
        id=analysis.id,
        resume_id=analysis.resume_id,
        job_id=analysis.job_id,
        overall_score=analysis.overall_score,
        skills_score=analysis.skills_score,
        experience_score=analysis.experience_score,
        structure_score=analysis.structure_score,
        readability_score=analysis.readability_score,
        summary=analysis.summary,
        findings=[
            {
                "id": str(f.id),
                "category": f.category,
                "severity": f.severity,
                "title": f.title,
                "detail": f.detail,
                "evidence": f.evidence,
                "suggested_action": f.suggested_action,
                "estimated_score_impact": f.estimated_score_impact,
            }
            for f in analysis.findings
        ],
        matched_skills=analysis.matched_skills,
        missing_skills=analysis.missing_skills,
        created_at=analysis.created_at,
    )
