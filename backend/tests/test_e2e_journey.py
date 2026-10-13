import io
from pypdf import PdfReader

def test_complete_end_to_end_user_journey(client):
    # -------------------------------------------------------------------------
    # Step 1: Candidate Sign-up & Authentication
    # -------------------------------------------------------------------------
    signup_res = client.post(
        "/api/auth/register",
        json={
            "email": "e2e.engineer@domain.com",
            "password": "ProductionPass2026!",
            "full_name": "Jordan Vance",
        },
    )
    assert signup_res.status_code == 201
    auth_data = signup_res.json()
    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # -------------------------------------------------------------------------
    # Step 2: Create a Targeted ATS Resume
    # -------------------------------------------------------------------------
    create_res = client.post(
        "/api/resumes",
        headers=headers,
        json={
            "title": "Principal Distributed Systems Engineer",
            "target_role": "Principal Backend Architect",
        },
    )
    assert create_res.status_code == 201
    resume = create_res.json()
    resume_id = resume["id"]
    assert resume["user_id"] == auth_data["user"]["id"]

    # -------------------------------------------------------------------------
    # Step 3: Candidate Edits Resume Sections & Autosave Simulation
    # -------------------------------------------------------------------------
    resume_data = resume["data"]
    resume_data["contact"]["fullName"] = "Jordan Vance"
    resume_data["contact"]["email"] = "jordan.vance@domain.com"
    resume_data["contact"]["phone"] = "+1 (555) 987-6543"
    resume_data["contact"]["location"] = "Seattle, WA"
    resume_data["summary"] = "Principal Engineer with 10+ years architecting high-scale distributed data pipelines."
    resume_data["technicalSkills"] = ["Python", "Go", "PostgreSQL", "Kafka", "Docker", "Kubernetes"]
    resume_data["workExperience"] = [
        {
            "id": "e2e_exp_1",
            "company": "Horizon Cloud",
            "position": "Principal Architect",
            "location": "Seattle, WA",
            "startDate": "2021",
            "endDate": "Present",
            "current": True,
            "highlights": [
                "Architected event-driven distributed streaming system in Go and Kafka processing 50M messages daily.",
                "Optimized partitioned PostgreSQL query indexing, decreasing p99 latency by 42% across all endpoints."
            ]
        }
    ]

    update_res = client.put(
        f"/api/resumes/{resume_id}",
        headers=headers,
        json={"data": resume_data, "page_target": 1},
    )
    assert update_res.status_code == 200

    # -------------------------------------------------------------------------
    # Step 4: Snapshot Version History
    # -------------------------------------------------------------------------
    snap_res = client.post(
        f"/api/resumes/{resume_id}/versions",
        headers=headers,
        json={"title": "v1.0 Milestone", "change_summary": "Added Go and Kafka streaming architecture"},
    )
    assert snap_res.status_code == 201
    assert snap_res.json()["version_number"] == 1

    # -------------------------------------------------------------------------
    # Step 5: Paste Job Description & Run Deterministic ATS Compatibility Engine
    # -------------------------------------------------------------------------
    job_text = """
    We are looking for a Principal Backend Architect to join our Core Infrastructure team.
    Requirements:
    - 7+ years of experience building mission-critical backend systems.
    - Deep expertise in Go or Python, Kafka, and distributed systems.
    - Strong database design skills in PostgreSQL and caching.
    - Experience with Docker, Kubernetes, and automated testing with pytest.

    Preferred:
    - Experience mentoring senior engineers and leading architectural reviews.
    """
    analysis_res = client.post(
        "/api/analysis/run",
        headers=headers,
        json={
            "resume_id": resume_id,
            "job_title": "Principal Backend Architect",
            "job_text": job_text,
        },
    )
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()

    # Verify score pillars: 35 skills, 25 experience, 20 structure, 20 readability
    assert 0 <= analysis["overall_score"] <= 100
    assert analysis["skills_score"] <= 35.0
    assert analysis["experience_score"] <= 25.0
    assert analysis["structure_score"] <= 20.0
    assert analysis["readability_score"] <= 20.0
    assert len(analysis["findings"]) > 0

    # -------------------------------------------------------------------------
    # Step 6: Use AI Assistant with Explicit Consent to Refine a Weak Bullet
    # -------------------------------------------------------------------------
    ai_res = client.post(
        "/api/ai/rewrite-bullet",
        headers=headers,
        json={
            "bullet": "worked on team database indexing to make things faster",
            "role": "Principal Architect",
            "consent": True,
        },
    )
    assert ai_res.status_code == 200
    suggestions = ai_res.json()["suggestions"]
    assert len(suggestions) >= 2
    # Candidate applies refined bullet to resume
    refined_bullet = suggestions[0]
    resume_data["workExperience"][0]["highlights"].append(refined_bullet)
    client.put(f"/api/resumes/{resume_id}", headers=headers, json={"data": resume_data})

    # -------------------------------------------------------------------------
    # Step 7: Export Vector-Based A4 PDF and Run PyPDF Text QA Verification
    # -------------------------------------------------------------------------
    pdf_res = client.get(f"/api/resumes/{resume_id}/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    pdf_bytes = pdf_res.content

    reader = PdfReader(io.BytesIO(pdf_bytes))
    assert len(reader.pages) >= 1
    extracted_text = reader.pages[0].extract_text()
    # Confirm candidate details, sections, and bullets extracted accurately
    assert "JORDAN VANCE" in extracted_text or "Jordan Vance" in extracted_text
    assert "jordan.vance@domain.com" in extracted_text
    assert "WORK EXPERIENCE" in extracted_text
    assert "Horizon Cloud" in extracted_text

    # -------------------------------------------------------------------------
    # Step 8: Clean Up / Account Deletion Purge Verification
    # -------------------------------------------------------------------------
    del_acc_res = client.delete("/api/auth/account", headers=headers)
    assert del_acc_res.status_code == 204

    # Token is now invalid
    assert client.get("/api/auth/me", headers=headers).status_code == 401
