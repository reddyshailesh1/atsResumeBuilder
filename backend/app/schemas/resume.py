from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class ContactInfoSchema(BaseModel):
    fullName: str = ""
    headline: Optional[str] = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""

class WorkExperienceItemSchema(BaseModel):
    id: str
    company: str = ""
    position: str = ""
    location: Optional[str] = ""
    startDate: str = ""
    endDate: str = ""
    current: bool = False
    highlights: List[str] = Field(default_factory=list)

class ProjectItemSchema(BaseModel):
    id: str
    name: str = ""
    role: Optional[str] = ""
    technologies: List[str] = Field(default_factory=list)
    link: Optional[str] = ""
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    bullets: List[str] = Field(default_factory=list)

class EducationItemSchema(BaseModel):
    id: str
    institution: str = ""
    degree: str = ""
    fieldOfStudy: Optional[str] = ""
    location: Optional[str] = ""
    startDate: str = ""
    endDate: str = ""
    gpa: Optional[str] = ""
    honors: Optional[str] = ""

class CertificationItemSchema(BaseModel):
    id: str
    name: str = ""
    issuer: str = ""
    issueDate: Optional[str] = ""
    credentialUrl: Optional[str] = ""

class CustomSectionItemSchema(BaseModel):
    id: str
    title: str = ""
    subtitle: Optional[str] = ""
    date: Optional[str] = ""
    description: Optional[str] = ""

class ResumeDataSchema(BaseModel):
    contact: ContactInfoSchema = Field(default_factory=ContactInfoSchema)
    summary: str = ""
    technicalSkills: List[str] = Field(default_factory=list)
    softSkills: List[str] = Field(default_factory=list)
    toolsAndPlatforms: List[str] = Field(default_factory=list)
    workExperience: List[WorkExperienceItemSchema] = Field(default_factory=list)
    projects: List[ProjectItemSchema] = Field(default_factory=list)
    education: List[EducationItemSchema] = Field(default_factory=list)
    certifications: List[CertificationItemSchema] = Field(default_factory=list)
    leadershipAndActivities: Optional[List[CustomSectionItemSchema]] = Field(default_factory=list)
    languages: Optional[List[str]] = Field(default_factory=list)
    pageTarget: int = Field(default=1, ge=1, le=2)
    template: str = Field(default="classic_ats")
    styling: Optional[Dict[str, Any]] = None

class ResumeCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    target_role: Optional[str] = None
    initialData: Optional[Dict[str, Any]] = None

class ResumeUpdateRequest(BaseModel):
    title: Optional[str] = None
    target_role: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    page_target: Optional[int] = Field(None, ge=1, le=2)

class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    target_role: Optional[str] = None
    data: Dict[str, Any]
    page_target: int
    is_primary: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResumeVersionCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    change_summary: Optional[str] = None

class ResumeVersionResponse(BaseModel):
    id: str
    resume_id: str
    version_number: int
    title: str
    snapshot_data: Dict[str, Any]
    change_summary: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
