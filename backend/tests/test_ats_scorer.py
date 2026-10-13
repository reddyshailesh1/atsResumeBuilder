from app.services.ats_scorer import ats_scorer, ATSScoringEngine

def test_empty_resume_scoring():
    # Empty resume should not raise exceptions and should yield minimal score
    empty_resume = {
        "contact": {},
        "summary": "",
        "technicalSkills": [],
        "toolsAndPlatforms": [],
        "softSkills": [],
        "workExperience": [],
        "projects": [],
        "education": [],
        "certifications": [],
    }
    result = ats_scorer.score(empty_resume, parsed_job=None)
    assert isinstance(result["overall_score"], int)
    assert result["overall_score"] >= 0
    assert result["overall_score"] < 40
    assert len(result["findings"]) > 0

def test_synonym_and_duplicate_matching():
    # Resume has 'postgres', 'k8s', and duplicate entries
    resume = {
        "contact": {
            "fullName": "Jane Doe",
            "email": "jane@example.com",
            "phone": "+1 555-0100",
            "location": "New York, NY",
        },
        "summary": "Distributed systems engineer with 5 years experience.",
        "technicalSkills": ["postgres", "PostgreSQL", "k8s", "Kubernetes", "Python"],
        "toolsAndPlatforms": ["Docker", "AWS"],
        "softSkills": ["System Design"],
        "workExperience": [
            {
                "id": "1",
                "company": "DataCorp",
                "position": "Software Engineer",
                "startDate": "2021",
                "endDate": "Present",
                "current": True,
                "highlights": [
                    "Engineered distributed PostgreSQL pipelines serving 1M queries/sec.",
                    "Deployed containerized Kubernetes pods across multi-region AWS clusters."
                ]
            }
        ],
        "projects": [],
        "education": [{"id": "e1", "degree": "B.S. CS", "institution": "NYU", "startDate": "2017", "endDate": "2021"}],
        "pageTarget": 1,
    }

    # Job demands 'postgresql' and 'kubernetes'
    job = {
        "required_skills": ["postgresql", "kubernetes", "python"],
        "preferred_skills": ["aws", "docker"],
        "tools_and_tech": ["docker", "kubernetes", "aws"],
        "experience_years": 3,
    }

    result = ats_scorer.score(resume, parsed_job=job)
    assert result["overall_score"] >= 75
    # Synonyms should match clearly demonstrated
    matched_skill_names = [m["skill"] for m in result["matched_skills"]]
    assert "postgresql" in matched_skill_names
    assert "kubernetes" in matched_skill_names
    # Missing skills should be empty
    assert len(result["missing_skills"]) == 0

def test_action_verbs_and_quantification():
    resume = {
        "contact": {"fullName": "John Smith", "email": "john@test.com", "phone": "123456", "location": "Austin, TX"},
        "summary": "Backend specialist with scalable architecture experience.",
        "technicalSkills": ["Go", "Python", "Docker"],
        "toolsAndPlatforms": ["Redis"],
        "softSkills": [],
        "workExperience": [
            {
                "id": "1",
                "company": "ScaleInc",
                "position": "Senior Engineer",
                "startDate": "2020",
                "endDate": "Present",
                "current": True,
                "highlights": [
                    # Bullet with strong verb & metric
                    "Architected caching tier in Redis, reducing p95 database query latency by 45%.",
                    # Bullet with strong verb & metric
                    "Spearheaded team migration to Docker containers, cutting CI deployment times by 60%."
                ]
            }
        ],
        "projects": [],
        "education": [],
        "pageTarget": 1,
    }

    result = ats_scorer.score(resume)
    assert result["experience_score"] > 18
    # Positive finding for quantified metrics should be present
    positive_titles = [f["title"] for f in result["findings"] if f["severity"] == "positive"]
    assert any("Quantified Results Present" in t for t in positive_titles)

def test_configurable_engine_weights():
    custom_engine = ATSScoringEngine(
        max_skills_pts=50.0,
        max_experience_pts=20.0,
        max_structure_pts=15.0,
        max_readability_pts=15.0,
    )
    assert custom_engine.max_skills_pts == 50.0
    assert custom_engine.max_experience_pts == 20.0
