from app.services.docx_service import DocxGenerationService
from app.api.resumes import SAMPLE_DEFAULT_RESUME_DATA

def test_docx_generation():
    docx_bytes = DocxGenerationService.generate_docx(SAMPLE_DEFAULT_RESUME_DATA)
    assert isinstance(docx_bytes, bytes)
    assert len(docx_bytes) > 500
    # docx files are zip archives starting with PK
    assert docx_bytes.startswith(b"PK")

def test_plain_text_generation():
    plain_txt = DocxGenerationService.generate_plain_text(SAMPLE_DEFAULT_RESUME_DATA)
    assert isinstance(plain_txt, str)
    assert len(plain_txt) > 100
    assert "Alex Rivera" in plain_txt or "Software Engineer" in plain_txt
    assert "WORK EXPERIENCE" in plain_txt
