from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="user")  # "user" or "admin"
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan")


class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    version_name = Column(String, nullable=False)  # e.g., "v1", "v2"
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # "pdf" or "docx"
    file_size = Column(String, nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_data = Column(JSON, nullable=True)  # JSON representation of parsed resume fields
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resume = relationship("Resume", back_populates="versions")
    analyses = relationship("ResumeAnalysis", back_populates="resume_version", cascade="all, delete-orphan")
    job_recommendations = relationship("JobRecommendation", back_populates="resume_version", cascade="all, delete-orphan")
    skill_gap_reports = relationship("SkillGapReport", back_populates="resume_version", cascade="all, delete-orphan")
    interview_questions = relationship("InterviewQuestion", back_populates="resume_version", cascade="all, delete-orphan")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_version_id = Column(Integer, ForeignKey("resume_versions.id"), nullable=False)
    ats_score = Column(Integer, nullable=False)
    category_scores = Column(JSON, nullable=False)  # e.g. {formatting: 85, technical: 75, soft: 90, readability: 80}
    feedback = Column(JSON, nullable=False)  # e.g. {suggestions: [...], missing_keywords: [...], missing_sections: [...]}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resume_version = relationship("ResumeVersion", back_populates="analyses")


class JobRecommendation(Base):
    __tablename__ = "job_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    resume_version_id = Column(Integer, ForeignKey("resume_versions.id"), nullable=False)
    role_name = Column(String, nullable=False)
    match_percentage = Column(Integer, nullable=False)
    fit_reason = Column(Text, nullable=False)
    missing_skills = Column(JSON, nullable=False)
    learning_roadmap = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resume_version = relationship("ResumeVersion", back_populates="job_recommendations")


class SkillGapReport(Base):
    __tablename__ = "skill_gap_reports"

    id = Column(Integer, primary_key=True, index=True)
    resume_version_id = Column(Integer, ForeignKey("resume_versions.id"), nullable=False)
    target_role = Column(String, nullable=False)
    current_skills = Column(JSON, nullable=False)
    missing_skills = Column(JSON, nullable=False)
    learning_priority = Column(JSON, nullable=False)
    learning_resources = Column(JSON, nullable=False)
    estimated_time = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resume_version = relationship("ResumeVersion", back_populates="skill_gap_reports")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    resume_version_id = Column(Integer, ForeignKey("resume_versions.id"), nullable=False)
    target_role = Column(String, nullable=False)
    category = Column(String, nullable=False)  # "HR", "Technical", "Coding", "Behavioral", "System Design"
    question = Column(Text, nullable=False)
    sample_answer = Column(Text, nullable=False)
    difficulty = Column(String, nullable=False)  # "Easy", "Medium", "Hard"
    evaluation_tips = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resume_version = relationship("ResumeVersion", back_populates="interview_questions")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    details = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="activity_logs")
