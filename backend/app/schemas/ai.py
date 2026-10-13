from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict

class PolishSummaryRequest(BaseModel):
    summary: str = Field(..., min_length=5, max_length=3000)
    targetRole: Optional[str] = None
    consent: bool = Field(..., description="User explicit consent to send resume snippet to AI service")

class PolishSummaryResponse(BaseModel):
    polished: str
    tips: List[str]

class RewriteBulletRequest(BaseModel):
    bullet: str = Field(..., min_length=3, max_length=1000)
    role: Optional[str] = None
    consent: bool = Field(..., description="User explicit consent to send resume snippet to AI service")

class RewriteBulletResponse(BaseModel):
    suggestions: List[str]
    quantificationPrompt: Optional[str] = None
    actionVerb: str

# -------------------------------------------------------------
# AI Resume Styling Assistant Schemas
# -------------------------------------------------------------
TemplateIdType = Literal[
    "classic_ats",
    "modern_ats",
    "minimal_ats",
    "executive_ats",
    "tech_lead",
    "data_science_ats",
    "academic_ats",
    "compact_ats",
]
DesignPresetType = Literal[
    "software_engineer",
    "premium_corporate",
    "modern_minimal",
    "data_science",
    "academic_research",
    "campus_placement",
    "executive",
    "creative_portfolio",
    "custom"
]
FontFamilyType = Literal["inter", "roboto", "helvetica", "georgia", "garamond", "merriweather"]
FontScaleType = Literal["compact", "normal", "spacious"]
HeadingStyleType = Literal["bold_uppercase", "bold_capitalize", "underlined", "accent_bar"]
DividerStyleType = Literal["solid", "dashed", "none", "thick"]
BulletStyleType = Literal["disc", "circle", "square", "hyphen"]
SpacingDensityType = Literal["compact", "comfortable", "spacious"]
MarginSizeType = Literal["narrow", "normal", "wide"]
HeaderAlignmentType = Literal["left", "center", "right"]
BodyAlignmentType = Literal["left", "center", "right", "justify"]

class ResumeStylingSchema(BaseModel):
    templateId: TemplateIdType = "modern_ats"
    preset: DesignPresetType = "software_engineer"
    headingColor: str = "#1e3a8a"
    accentColor: str = "#2563eb"
    bodyColor: str = "#0f172a"
    fontFamily: FontFamilyType = "inter"
    fontScale: FontScaleType = "normal"
    fontSizePt: Optional[float] = Field(default=10.5, ge=7.0, le=18.0, description="Exact font size in points")
    headingStyle: HeadingStyleType = "bold_uppercase"
    dividerStyle: DividerStyleType = "solid"
    bulletStyle: BulletStyleType = "disc"
    spacingDensity: SpacingDensityType = "compact"
    marginSize: MarginSizeType = "normal"
    headerAlignment: HeaderAlignmentType = "center"
    bodyAlignment: BodyAlignmentType = "left"
    sectionOrder: List[str] = Field(default_factory=lambda: [
        "summary", "skills", "experience", "projects", "education", "certifications"
    ])
    sectionEmphasis: List[str] = Field(default_factory=lambda: ["skills", "projects"])

    model_config = ConfigDict(from_attributes=True)

class AtsStylingAssessmentSchema(BaseModel):
    impact: Literal["safe", "caution", "warning"] = "safe"
    readabilityScoreImpact: int = 0
    notes: str = ""

class GenerateStylingRequest(BaseModel):
    prompt: str = Field(..., min_length=2, max_length=1500)
    currentStyling: Optional[ResumeStylingSchema] = None
    targetRole: Optional[str] = None
    selectedPreset: Optional[DesignPresetType] = None
    consent: bool = True

class GenerateStylingResponse(BaseModel):
    styling: ResumeStylingSchema
    explanation: str
    atsAssessment: AtsStylingAssessmentSchema
    suggestedPreset: DesignPresetType
    unsupportedRequests: List[str] = Field(default_factory=list)

class ExtractTemplateFromImageRequest(BaseModel):
    imageBase64: str = Field(..., description="Base64 encoded image string of template or resume screenshot")
    roleHint: Optional[str] = None
    consent: bool = True

class ExtractTemplateFromImageResponse(BaseModel):
    styling: ResumeStylingSchema
    explanation: str
    atsAssessment: AtsStylingAssessmentSchema
    extractedTraits: Dict[str, Any] = Field(default_factory=dict)
    confidenceScore: float = 0.95
