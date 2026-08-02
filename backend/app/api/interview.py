from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.database import User, ResumeVersion, Resume, InterviewQuestion, ActivityLog
from app.schemas.interview import InterviewQuestionResponse
from app.services import ai
from typing import List, Any

router = APIRouter(prefix="/interview", tags=["Interview Preparation"])

@router.get("/{version_id}/questions", response_model=List[InterviewQuestionResponse])
def get_interview_prep(
    version_id: int,
    target_role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Verify owner
    version = db.query(ResumeVersion).join(Resume).filter(
        ResumeVersion.id == version_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
        
    # Check if questions already exist
    existing = db.query(InterviewQuestion).filter(
        InterviewQuestion.resume_version_id == version_id,
        InterviewQuestion.target_role == target_role
    ).all()
    
    if existing:
        return existing
        
    # Generate new ones
    questions = ai.generate_interview_questions(version.parsed_data or {}, target_role)
    db_questions = []
    
    for q in questions:
        db_q = InterviewQuestion(
            resume_version_id=version_id,
            target_role=target_role,
            category=q["category"],
            question=q["question"],
            sample_answer=q["sample_answer"],
            difficulty=q["difficulty"],
            evaluation_tips=q["evaluation_tips"]
        )
        db.add(db_q)
        db_questions.append(db_q)
        
    db.commit()
    for db_q in db_questions:
        db.refresh(db_q)
        
    log = ActivityLog(
        user_id=current_user.id,
        action="Generate Interview Questions",
        details=f"Generated interview questions for '{target_role}' on resume version ID {version_id}"
    )
    db.add(log)
    db.commit()
    
    return db_questions
