import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("job_descriptions.id", ondelete="SET NULL"), nullable=True, index=True)
    
    overall_score = Column(Integer, nullable=False)
    skills_score = Column(Float, nullable=False)
    experience_score = Column(Float, nullable=False)
    structure_score = Column(Float, nullable=False)
    readability_score = Column(Float, nullable=False)
    summary = Column(Text, nullable=False)

    matched_skills = Column(JSON, nullable=False, default=list)
    missing_skills = Column(JSON, nullable=False, default=list)

    created_at = Column(DateTime, default=utc_now)

    # Relationships
    user = relationship("User", back_populates="analyses")
    resume = relationship("Resume", back_populates="analyses")
    job = relationship("JobDescription", back_populates="analyses")
    findings = relationship("AnalysisFinding", back_populates="analysis", cascade="all, delete-orphan")


class AnalysisFinding(Base):
    __tablename__ = "analysis_findings"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    analysis_id = Column(String(36), ForeignKey("resume_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    
    category = Column(String(50), nullable=False)  # 'skills', 'experience', 'structure', 'readability'
    severity = Column(String(20), nullable=False)  # 'critical', 'warning', 'positive', 'suggestion'
    title = Column(String(255), nullable=False)
    detail = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    suggested_action = Column(Text, nullable=True)
    estimated_score_impact = Column(Integer, default=0, nullable=False)

    # Relationships
    analysis = relationship("ResumeAnalysis", back_populates="findings")
