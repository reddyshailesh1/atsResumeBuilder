def test_tenant_isolation_cross_user_access_prohibited(
    client, auth_headers_user_a, auth_headers_user_b
):
    # User A creates a resume
    create_res = client.post(
        "/api/resumes",
        headers=auth_headers_user_a,
        json={"title": "Alice Confidential Resume"},
    )
    assert create_res.status_code == 201
    alice_resume_id = create_res.json()["id"]

    # User B attempts to read Alice's resume -> 404 / 403 Forbidden
    read_res = client.get(f"/api/resumes/{alice_resume_id}", headers=auth_headers_user_b)
    assert read_res.status_code == 404

    # User B attempts to update Alice's resume
    update_res = client.put(
        f"/api/resumes/{alice_resume_id}",
        headers=auth_headers_user_b,
        json={"title": "Hacked Title"},
    )
    assert update_res.status_code == 404

    # User B attempts to duplicate Alice's resume
    dup_res = client.post(
        f"/api/resumes/{alice_resume_id}/duplicate",
        headers=auth_headers_user_b,
    )
    assert dup_res.status_code == 404

    # User B attempts to export Alice's PDF
    pdf_res = client.get(
        f"/api/resumes/{alice_resume_id}/pdf",
        headers=auth_headers_user_b,
    )
    assert pdf_res.status_code == 404

    # User B attempts to delete Alice's resume
    del_res = client.delete(
        f"/api/resumes/{alice_resume_id}",
        headers=auth_headers_user_b,
    )
    assert del_res.status_code == 404

    # User A can still access their resume safely
    assert client.get(f"/api/resumes/{alice_resume_id}", headers=auth_headers_user_a).status_code == 200
