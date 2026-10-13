from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class JobDescriptionCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    company: Optional[str] = None
    raw_text: str = Field(..., min_length=10)

class JobDescriptionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    company: Optional[str] = None
    raw_text: str
    parsed_data: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AnalysisRunRequest(BaseModel):
    resume_id: str
    job_id: Optional[str] = None
    job_title: Optional[str] = None
    job_text: Optional[str] = None

class AnalysisFindingResponse(BaseModel):
    id: str
    category: str
    severity: str
    title: str
    detail: str
    evidence: Optional[str] = None
    suggested_action: Optional[str] = None
    estimated_score_impact: int

class MatchedSkillResponse(BaseModel):
    skill: str
    matchedAs: Optional[str] = None
    status: str
    contextSnippet: Optional[str] = None

class AnalysisResponse(BaseModel):
    id: str
    resume_id: str
    job_id: Optional[str] = None
    overall_score: int
    skills_score: float
    experience_score: float
    structure_score: float
    readability_score: float
    summary: str
    findings: List[AnalysisFindingResponse]
    matched_skills: List[MatchedSkillResponse]
    missing_skills: List[str]
    created_at: datetime
