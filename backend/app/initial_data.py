import copy
from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.resume import Resume
from app.utils.security import get_password_hash
from app.api.resumes import SAMPLE_DEFAULT_RESUME_DATA

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        demo_email = "demo.candidate@example.com"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            user = User(
                email=demo_email,
                hashed_password=get_password_hash("DemoPass123!"),
                full_name="Alex Rivera",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created demo candidate user: {demo_email}")

        # Check if demo resume exists
        existing_resume = db.query(Resume).filter(Resume.user_id == user.id).first()
        if not existing_resume:
            demo_data = copy.deepcopy(SAMPLE_DEFAULT_RESUME_DATA)
            demo_data["contact"]["fullName"] = "Alex Rivera"
            demo_data["contact"]["email"] = demo_email

            resume = Resume(
                user_id=user.id,
                title="Staff Distributed Systems Engineer",
                target_role="Senior / Staff Backend Engineer",
                data=demo_data,
                page_target=1,
                is_primary=True,
            )
            db.add(resume)
            db.commit()
            print("Created initial seed ATS resume for demo user.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
