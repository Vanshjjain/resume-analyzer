from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.database import Base
from app.models.database import User, Resume, ResumeVersion, ResumeAnalysis, JobRecommendation, SkillGapReport, InterviewQuestion, ActivityLog
from app.core.security import get_password_hash
import datetime

# Create database session
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def seed_database():
    # 1. Initialize Tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database tables re-initialized.")

    # 2. Add Test Users
    # Hashed passwords for "password123" and "admin123"
    test_user = User(
        email="test@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test Candidate",
        role="user",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=Test%20Candidate",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
    )
    
    admin_user = User(
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Workspace Admin",
        role="admin",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=Workspace%20Admin",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
    )
    
    db.add(test_user)
    db.add(admin_user)
    db.commit()
    db.refresh(test_user)
    db.refresh(admin_user)
    print("Test users inserted: 'test@example.com' / 'password123' and 'admin@example.com' / 'admin123'")

    # 3. Add Resumes and Versions for Test User
    resume = Resume(
        user_id=test_user.id,
        original_name="software_engineer_resume.pdf",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # v1 version
    v1 = ResumeVersion(
        resume_id=resume.id,
        version_name="v1",
        file_path="./uploads/resume_1_v1_se.pdf",
        file_type="pdf",
        file_size="1.2 MB",
        raw_text="Test Candidate Resume. Worked at ABC corp. Built pages in React.",
        parsed_data={
            "name": "Test Candidate",
            "email": "test@example.com",
            "phone": "555-019-2831",
            "linkedin": "https://linkedin.com/in/testcandidate",
            "github": "https://github.com/testcandidate",
            "skills": ["Python", "JavaScript", "HTML", "CSS", "React", "SQL"],
            "education": ["B.S. Computer Science - State University"],
            "experience": ["Software Engineer at ABC Corp (2022-Present)", "Built web layouts using React. Worked on API data payloads."],
            "projects": ["Personal Portal - Built responsive portfolio widgets."],
            "certifications": [],
            "languages": ["English"],
            "achievements": []
        },
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
    )
    
    # v2 version (Improved)
    v2 = ResumeVersion(
        resume_id=resume.id,
        version_name="v2",
        file_path="./uploads/resume_1_v2_se.pdf",
        file_type="pdf",
        file_size="1.3 MB",
        raw_text="Test Candidate. Software Engineer with 3+ years experience. Built FastAPI and React microservices.",
        parsed_data={
            "name": "Test Candidate",
            "email": "test@example.com",
            "phone": "555-019-2831",
            "linkedin": "https://linkedin.com/in/testcandidate",
            "github": "https://github.com/testcandidate",
            "skills": ["Python", "JavaScript", "TypeScript", "React", "FastAPI", "SQL", "PostgreSQL", "Docker", "Git"],
            "education": ["B.S. Computer Science - State University"],
            "experience": [
                "Software Engineer at ABC Corp (2022-Present)", 
                "Led design of high-performance dashboard layouts. Optimized SQL database indexing, reducing latencies by 30%. Deployed Docker containers for scaling services."
            ],
            "projects": [
                "E-Commerce Microservices Portal",
                "Spearheaded development of FastAPI APIs, handling peak loads of 2000 requests/min. Integrated responsive React dashboards."
            ],
            "certifications": ["AWS Cloud Practitioner"],
            "languages": ["English", "Spanish"],
            "achievements": ["Spearheaded tech migration resulting in 20% engagement boost."]
        },
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    
    db.add(v1)
    db.add(v2)
    db.commit()
    db.refresh(v1)
    db.refresh(v2)
    print("Resume versions v1 and v2 seeded.")

    # 4. Seed ATS Analyses
    a1 = ResumeAnalysis(
        resume_version_id=v1.id,
        ats_score=52,
        category_scores={"formatting": 60, "sections": 75, "keywords": 40, "readability": 70, "grammar": 85, "action_verbs": 30, "experience_quality": 50, "project_quality": 45},
        feedback={
            "suggestions": [
                "Your experience bullets seem passive. Swap weak verbs with high-impact power verbs.",
                "Incorporate technology keywords like Docker, FastAPI, and TypeScript to match modern roles.",
                "Detail measurable achievements to showcase project outcomes."
            ],
            "missing_sections": ["Certifications", "Achievements"],
            "missing_keywords": ["FastAPI", "Docker", "TypeScript", "AWS", "CI/CD"]
        },
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
    )

    a2 = ResumeAnalysis(
        resume_version_id=v2.id,
        ats_score=88,
        category_scores={"formatting": 95, "sections": 100, "keywords": 85, "readability": 90, "grammar": 95, "action_verbs": 85, "experience_quality": 85, "project_quality": 80},
        feedback={
            "suggestions": [
                "Consider adding a CI/CD automation project to strengthen DevOps capabilities.",
                "Format experience titles consistently across all bullet points."
            ],
            "missing_sections": [],
            "missing_keywords": ["Kubernetes", "CI/CD"]
        },
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )

    db.add(a1)
    db.add(a2)
    db.commit()
    print("Resume analyses seeded successfully.")

    # 5. Add Job Recommendations for v2
    recs = [
        JobRecommendation(
            resume_version_id=v2.id,
            role_name="Frontend Developer",
            match_percentage=82,
            fit_reason="You have good expertise in building visual web panels using React, Tailwind, and TypeScript.",
            missing_skills=["Next.js", "Redux", "Tailwind CSS"],
            learning_roadmap={"phase_1": "Master Next.js", "phase_2": "Build 2 portfolio apps", "phase_3": "Add Redux State"}
        ),
        JobRecommendation(
            resume_version_id=v2.id,
            role_name="Backend Developer",
            match_percentage=90,
            fit_reason="Your background in Python, FastAPI, Docker, and SQL is a strong match for API designs.",
            missing_skills=["Go", "MongoDB", "Kubernetes"],
            learning_roadmap={"phase_1": "Learn Go & MongoDB", "phase_2": "Deploy with Kubernetes", "phase_3": "Integrate logging"}
        ),
        JobRecommendation(
            resume_version_id=v2.id,
            role_name="Full Stack Developer",
            match_percentage=88,
            fit_reason="Excellent crossover knowledge between React dashboards and backend APIs designs.",
            missing_skills=["AWS Cloud Practitioner", "CI/CD"],
            learning_roadmap={"phase_1": "Learn AWS fundamentals", "phase_2": "Automate Docker deploys via GitHub Actions"}
        )
    ]
    db.add_all(recs)
    
    # 6. Add Skill Gaps for v2 target role "Backend Developer"
    gap = SkillGapReport(
        resume_version_id=v2.id,
        target_role="Backend Developer",
        current_skills=["Python", "FastAPI", "SQL", "PostgreSQL", "Docker", "Git"],
        missing_skills=["Go", "MongoDB", "Kubernetes", "gRPC"],
        learning_priority=["Go", "MongoDB", "Kubernetes"],
        learning_resources=[
            {"skill": "Go Programming", "course": "Go: The Complete BootCamp", "link": "https://www.coursera.org"},
            {"skill": "MongoDB Admin", "course": "MongoDB Basics", "link": "https://www.coursera.org"},
            {"skill": "Kubernetes Deploys", "course": "Kubernetes in Production", "link": "https://www.coursera.org"}
        ],
        estimated_time="9 weeks",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    db.add(gap)

    # 7. Add Interview Questions
    questions = [
        InterviewQuestion(
            resume_version_id=v2.id,
            target_role="Backend Developer",
            category="Technical",
            question="What is the difference between concurrency and parallelism in Python, and how does Uvicorn utilize it?",
            sample_answer="Concurrency is about dealing with lots of things at once (using asyncio/event loops), while parallelism is about doing lots of things at once (using multi-processing). Uvicorn utilizes concurrency by processing incoming requests on a single-threaded asyncio event loop asynchronously.",
            difficulty="Medium",
            evaluation_tips="Ensure the candidate mentions asyncio, Gil constraints, and multi-worker configurations."
        ),
        InterviewQuestion(
            resume_version_id=v2.id,
            target_role="Backend Developer",
            category="Coding",
            question="Write an efficient SQL query to find the second highest salary from an Employee table.",
            sample_answer="SELECT MAX(Salary) FROM Employee WHERE Salary < (SELECT MAX(Salary) FROM Employee);",
            difficulty="Easy",
            evaluation_tips="Verify that they handle duplicate maximum values correctly."
        )
    ]
    db.add_all(questions)

    # 8. Seed Activity Logs
    logs = [
        ActivityLog(user_id=test_user.id, action="Register", details="Registered user: test@example.com", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)),
        ActivityLog(user_id=test_user.id, action="Upload Resume", details="Uploaded resume version v1", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)),
        ActivityLog(user_id=test_user.id, action="Run ATS Analysis", details="Analyzed v1 score: 52", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)),
        ActivityLog(user_id=test_user.id, action="Upload Resume Version", details="Uploaded improved version v2", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)),
        ActivityLog(user_id=test_user.id, action="Run ATS Analysis", details="Analyzed v2 score: 88", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1))
    ]
    db.add_all(logs)
    db.commit()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
