def test_resume_crud_and_versioning(client, auth_headers_user_a):
    # 1. Create Resume
    create_res = client.post(
        "/api/resumes",
        headers=auth_headers_user_a,
        json={
            "title": "Senior Cloud Engineer",
            "target_role": "Cloud Architect",
        },
    )
    assert create_res.status_code == 201
    resume_data = create_res.json()
    resume_id = resume_data["id"]
    assert resume_data["title"] == "Senior Cloud Engineer"

    # 2. Get Resume
    get_res = client.get(f"/api/resumes/{resume_id}", headers=auth_headers_user_a)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == resume_id

    # 3. Update Resume
    updated_payload = get_res.json()["data"]
    updated_payload["summary"] = "Experienced Cloud Architect with 8+ years designing scalable AWS microservices."
    update_res = client.put(
        f"/api/resumes/{resume_id}",
        headers=auth_headers_user_a,
        json={
            "title": "Principal Cloud Architect",
            "data": updated_payload,
        },
    )
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Principal Cloud Architect"
    assert update_res.json()["data"]["summary"] == updated_payload["summary"]

    # 4. Duplicate Resume
    dup_res = client.post(f"/api/resumes/{resume_id}/duplicate", headers=auth_headers_user_a)
    assert dup_res.status_code == 200
    dup_id = dup_res.json()["id"]
    assert dup_id != resume_id
    assert "Copy" in dup_res.json()["title"]

    # 5. Create Version Snapshot
    snap_res = client.post(
        f"/api/resumes/{resume_id}/versions",
        headers=auth_headers_user_a,
        json={
            "title": "v1 Pre-interview",
            "change_summary": "Expanded summary and AWS skills",
        },
    )
    assert snap_res.status_code == 201
    version_id = snap_res.json()["id"]
    assert snap_res.json()["version_number"] == 1

    # 6. List Versions
    versions_res = client.get(f"/api/resumes/{resume_id}/versions", headers=auth_headers_user_a)
    assert versions_res.status_code == 200
    assert len(versions_res.json()) >= 1

    # 7. Restore Version
    restore_res = client.post(
        f"/api/resumes/{resume_id}/versions/{version_id}/restore",
        headers=auth_headers_user_a,
    )
    assert restore_res.status_code == 200

    # 8. Delete Duplicate Resume
    del_res = client.delete(f"/api/resumes/{dup_id}", headers=auth_headers_user_a)
    assert del_res.status_code == 204
