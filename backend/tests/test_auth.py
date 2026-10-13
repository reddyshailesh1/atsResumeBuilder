def test_register_and_login(client):
    # 1. Register new user
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": "fresh.user@example.com",
            "password": "Password123!",
            "full_name": "Fresh Candidate",
        },
    )
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "fresh.user@example.com"

    # 2. Duplicate registration should be rejected with 400
    dup_res = client.post(
        "/api/auth/register",
        json={
            "email": "fresh.user@example.com",
            "password": "Password123!",
            "full_name": "Duplicate Candidate",
        },
    )
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"].lower()

    # 3. Login with correct password
    login_res = client.post(
        "/api/auth/login",
        json={
            "email": "fresh.user@example.com",
            "password": "Password123!",
        },
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # 4. Access /auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "fresh.user@example.com"

    # 5. Login with invalid password
    bad_login = client.post(
        "/api/auth/login",
        json={
            "email": "fresh.user@example.com",
            "password": "WrongPassword!",
        },
    )
    assert bad_login.status_code == 401

def test_auth_me_unauthorized(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
