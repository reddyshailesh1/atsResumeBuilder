from app.services.jd_parser import jd_parser

def test_jd_parser_skill_extraction():
    sample_text = """
    We are seeking a Lead Backend Engineer with 5+ years of experience in Python and PostgreSQL.
    Requirements:
    - Proven expertise in Docker, Kubernetes, and AWS cloud environments.
    - Deep knowledge of FastAPI or Django.
    - Hands-on experience with automated testing and pytest.

    Nice to have:
    - Experience with Kafka, Redis, and Terraform.
    """
    parsed = jd_parser.parse(sample_text)
    assert parsed["experience_years"] == 5
    assert "python" in parsed["required_skills"]
    assert "postgresql" in parsed["required_skills"]
    assert "docker" in parsed["required_skills"]
    assert "kubernetes" in parsed["required_skills"]
    assert "kafka" in parsed["preferred_skills"]
    assert "redis" in parsed["preferred_skills"]

def test_jd_parser_empty_text():
    parsed = jd_parser.parse("")
    assert parsed["required_skills"] == []
    assert parsed["experience_years"] == 0
