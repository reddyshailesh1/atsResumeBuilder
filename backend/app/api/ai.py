from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User
from app.schemas.ai import (
    PolishSummaryRequest,
    PolishSummaryResponse,
    RewriteBulletRequest,
    RewriteBulletResponse,
    GenerateStylingRequest,
    GenerateStylingResponse,
    ExtractTemplateFromImageRequest,
    ExtractTemplateFromImageResponse,
)
from app.api.deps import get_current_user
from app.services.ai_assistant import ai_service

router = APIRouter(prefix="/ai", tags=["AI Writing Assistant"])

@router.post("/polish-summary", response_model=PolishSummaryResponse)
async def polish_summary(
    payload: PolishSummaryRequest,
    current_user: User = Depends(get_current_user),
):
    if not payload.consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Explicit user consent is required before processing resume snippets.",
        )

    try:
        result = await ai_service.polish_summary(
            summary=payload.summary,
            target_role=payload.targetRole,
            consent=payload.consent,
        )
        return PolishSummaryResponse(
            polished=result.get("polished", payload.summary),
            tips=result.get("tips", []),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}",
        )

@router.post("/rewrite-bullet", response_model=RewriteBulletResponse)
async def rewrite_bullet(
    payload: RewriteBulletRequest,
    current_user: User = Depends(get_current_user),
):
    if not payload.consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Explicit user consent is required before processing resume snippets.",
        )

    try:
        result = await ai_service.rewrite_bullet(
            bullet=payload.bullet,
            role=payload.role,
            consent=payload.consent,
        )
        return RewriteBulletResponse(
            suggestions=result.get("suggestions", [payload.bullet]),
            quantificationPrompt=result.get("quantificationPrompt"),
            actionVerb=result.get("actionVerb", "Led"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}",
        )

@router.post("/styling", response_model=GenerateStylingResponse)
async def generate_styling(
    payload: GenerateStylingRequest,
    current_user: User = Depends(get_current_user),
):
    if not payload.consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Explicit user consent is required before processing styling request.",
        )

    try:
        current_dict = payload.currentStyling.model_dump() if payload.currentStyling else None
        result = await ai_service.generate_styling_config(
            prompt=payload.prompt,
            current_styling=current_dict,
            target_role=payload.targetRole,
            selected_preset=payload.selectedPreset,
            consent=payload.consent,
        )
        return GenerateStylingResponse(
            styling=result["styling"],
            explanation=result["explanation"],
            atsAssessment=result["atsAssessment"],
            suggestedPreset=result["suggestedPreset"],
            unsupportedRequests=result.get("unsupportedRequests", []),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI styling service error: {str(e)}",
        )

@router.post("/extract-template-image", response_model=ExtractTemplateFromImageResponse)
async def extract_template_image(
    payload: ExtractTemplateFromImageRequest,
    current_user: User = Depends(get_current_user),
):
    if not payload.consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Explicit user consent is required before processing template image.",
        )

    try:
        result = await ai_service.extract_template_from_image(
            image_base64=payload.imageBase64,
            role_hint=payload.roleHint,
        )
        return ExtractTemplateFromImageResponse(
            styling=result["styling"],
            explanation=result["explanation"],
            atsAssessment=result["atsAssessment"],
            extractedTraits=result.get("extractedTraits", {}),
            confidenceScore=result.get("confidenceScore", 0.95),
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Template extraction error: {str(e)}",
        )
