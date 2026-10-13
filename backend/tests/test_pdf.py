from app.services.pdf_service import pdf_service
from app.api.resumes import SAMPLE_DEFAULT_RESUME_DATA

def test_pdf_generation_and_text_extractability():
    # 1. Generate PDF bytes
    pdf_bytes = pdf_service.generate_pdf(SAMPLE_DEFAULT_RESUME_DATA)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")

    # 2. Automated QA Extractability Verification
    is_valid, snippet, page_count = pdf_service.verify_pdf_extractability(
        pdf_bytes,
        expected_name=SAMPLE_DEFAULT_RESUME_DATA["contact"]["fullName"]
    )

    assert is_valid is True, f"PDF failed extractability QA: {snippet}"
    assert page_count >= 1
    # Check that text contains key contact info and section title
    assert "Alex Rivera" in snippet or "ALEX RIVERA" in snippet
