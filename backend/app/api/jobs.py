from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.job_description import JobDescription
from app.schemas.analysis import (
    JobDescriptionCreateRequest,
    JobDescriptionResponse,
)
from app.api.deps import get_current_user
from app.services.jd_parser import jd_parser

router = APIRouter(prefix="/jobs", tags=["Job Descriptions"])

@router.get("", response_model=List[JobDescriptionResponse])
def list_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(JobDescription)
        .filter(JobDescription.user_id == current_user.id)
        .order_by(JobDescription.created_at.desc())
        .all()
    )

@router.post("", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: JobDescriptionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    parsed = jd_parser.parse(payload.raw_text)

    job = JobDescription(
        user_id=current_user.id,
        title=payload.title,
        company=payload.company,
        raw_text=payload.raw_text,
        parsed_data=parsed,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
