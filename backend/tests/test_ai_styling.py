import pytest
from app.services.ai_assistant import ai_service, PRESET_DEFINITIONS
from app.services.pdf_service import pdf_service
from app.api.resumes import SAMPLE_DEFAULT_RESUME_DATA

@pytest.mark.asyncio
async def test_natural_language_software_engineer_styling():
    prompt = (
        "Make my resume look premium and professional for software engineering jobs. "
        "Use navy blue section headings, black body text, modern readable fonts, compact spacing, "
        "clearly visible project titles, and a clean ATS-friendly single-column layout. "
        "Keep it elegant without excessive colors."
    )
    res = await ai_service.generate_styling_config(prompt, consent=True)
    styling = res["styling"]

    # Verify structured configuration output
    assert styling["headingColor"] == "#1e3a8a"  # Navy blue
    assert styling["bodyColor"] == "#0f172a"
    assert styling["fontFamily"] == "inter"
    assert styling["spacingDensity"] == "compact"
    assert "projects" in styling["sectionEmphasis"]
    assert styling["templateId"] == "modern_ats"
    assert res["atsAssessment"]["impact"] == "safe"
    assert res["atsAssessment"]["readabilityScoreImpact"] >= 0

@pytest.mark.asyncio
async def test_academic_research_preset_and_styling():
    prompt = "Create an academic research style resume with Georgia serif font, wide margins, and education first."
    res = await ai_service.generate_styling_config(prompt, selected_preset="academic_research", consent=True)
    styling = res["styling"]

    assert styling["fontFamily"] == "georgia"
    assert styling["marginSize"] == "wide"
    assert styling["headingColor"] == "#000000"
    # Education should be prioritized right after summary
    assert styling["sectionOrder"][1] == "education"

@pytest.mark.asyncio
async def test_unsupported_two_column_and_photo_guardrails():
    prompt = "Please make this a two-column sidebar layout with my photo at the top and 5-star skill rating bars."
    res = await ai_service.generate_styling_config(prompt, consent=True)
    
    # Verify that ATS guardrails intercepted unsafe options
    unsupported = res["unsupportedRequests"]
    assert len(unsupported) >= 2
    assert any("Multi-column" in u or "sidebar" in u for u in unsupported)
    assert any("photo" in u or "headshot" in u for u in unsupported)
    assert any("meter" in u or "bar" in u for u in unsupported)
    # The layout must remain single-column safe
    assert res["styling"]["templateId"] in ["classic_ats", "modern_ats", "minimal_ats", "executive_ats"]

@pytest.mark.asyncio
async def test_pdf_export_with_custom_ai_styling():
    custom_resume_data = dict(SAMPLE_DEFAULT_RESUME_DATA)
    custom_resume_data["styling"] = {
        "templateId": "modern_ats",
        "preset": "software_engineer",
        "headingColor": "#1e3a8a",
        "accentColor": "#2563eb",
        "bodyColor": "#0f172a",
        "fontFamily": "inter",
        "fontScale": "compact",
        "headingStyle": "bold_uppercase",
        "dividerStyle": "thick",
        "bulletStyle": "square",
        "spacingDensity": "compact",
        "marginSize": "narrow",
        "headerAlignment": "left",
        "sectionOrder": ["summary", "skills", "projects", "experience", "education", "certifications"],
        "sectionEmphasis": ["skills", "projects"],
    }

    # Generate PDF with dynamic styling
    pdf_bytes = pdf_service.generate_pdf(custom_resume_data)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000

    # Verify extractability
    is_valid, snippet, page_count = pdf_service.verify_pdf_extractability(
        pdf_bytes,
        expected_name=custom_resume_data["contact"]["fullName"]
    )
    assert is_valid is True
    assert page_count >= 1

def test_ai_styling_api_endpoint(client, auth_headers_user_a):
    payload = {
        "prompt": "Modern Minimal layout with dark green headings and compact spacing.",
        "targetRole": "Senior Data Scientist",
        "selectedPreset": "data_science",
        "consent": True,
    }
    res = client.post("/api/ai/styling", headers=auth_headers_user_a, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "styling" in data
    assert "explanation" in data
    assert data["styling"]["headingColor"] in ["#14532d", "#0f766e"]

def test_extract_template_from_image_endpoint(client, auth_headers_user_a):
    import base64
    import io
    from PIL import Image

    # Create dummy template screenshot
    img = Image.new("RGB", (600, 800), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64_str = base64.b64encode(buf.getvalue()).decode()

    payload = {
        "imageBase64": b64_str,
        "roleHint": "Software Engineer",
        "consent": True,
    }
    res = client.post("/api/ai/extract-template-image", headers=auth_headers_user_a, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "styling" in data
    assert "explanation" in data
    assert "atsAssessment" in data
    assert data["atsAssessment"]["impact"] == "safe"
    assert data["confidenceScore"] >= 0.9
    assert data["styling"]["templateId"] in ["modern_ats", "classic_ats", "minimal_ats", "executive_ats"]

@pytest.mark.asyncio
async def test_text_alignment_and_compression_parsing():
    prompt = "Compress to 1 page with all text to center and compact font size."
    res = await ai_service.generate_styling_config(prompt, consent=True)
    styling = res["styling"]
    assert styling["headerAlignment"] == "center"
    assert styling["bodyAlignment"] == "center"
    assert styling["spacingDensity"] == "compact"
    assert styling["fontScale"] == "compact"
    assert styling["marginSize"] == "narrow"
