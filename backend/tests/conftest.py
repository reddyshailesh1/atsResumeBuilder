import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set test environment
os.environ["DATABASE_URL"] = "sqlite:///./test_ats_resumes.db"
os.environ["SECRET_KEY"] = "test_super_secret_ats_jwt_key_1234567890"

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.utils.security import get_password_hash, create_access_token

TEST_DB_URL = "sqlite:///./test_ats_resumes.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_ats_resumes.db"):
        try:
            os.remove("./test_ats_resumes.db")
        except Exception:
            pass

@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user_a(db_session):
    user = User(
        email="candidate.a@test.com",
        hashed_password=get_password_hash("SecretPassword123!"),
        full_name="Alice Candidate",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_user_b(db_session):
    user = User(
        email="candidate.b@test.com",
        hashed_password=get_password_hash("SecretPassword123!"),
        full_name="Bob Candidate",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers_user_a(test_user_a):
    token = create_access_token({"sub": test_user_a.id, "email": test_user_a.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_user_b(test_user_b):
    token = create_access_token({"sub": test_user_b.id, "email": test_user_b.email})
    return {"Authorization": f"Bearer {token}"}
