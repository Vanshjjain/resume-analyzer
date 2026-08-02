from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.database import User, ResumeVersion, Resume, JobRecommendation, SkillGapReport, ActivityLog
from app.schemas.jobs import JobMatchRequest, JobMatchResponse, JobRecommendationResponse, SkillGapResponse
from app.services import ai
from typing import List, Any

router = APIRouter(prefix="/jobs", tags=["Jobs & Careers"])

@router.post("/{version_id}/match", response_model=JobMatchResponse)
def match_job_description(
    version_id: int,
    payload: JobMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    version = db.query(ResumeVersion).join(Resume).filter(
        ResumeVersion.id == version_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
        
    match_result = ai.match_job_description(version.parsed_data or {}, payload.job_description)
    
    log = ActivityLog(
        user_id=current_user.id,
        action="Job Match Analysis",
        details=f"Matched resume version ID {version_id} with JD, match score: {match_result['match_percentage']}%"
    )
    db.add(log)
    db.commit()
    
    return match_result


@router.get("/{version_id}/recommendations", response_model=List[JobRecommendationResponse])
def get_recommendations(
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Verify owner
    version = db.query(ResumeVersion).join(Resume).filter(
        ResumeVersion.id == version_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
        
    # Check if we already have recommendations stored
    recs = db.query(JobRecommendation).filter(JobRecommendation.resume_version_id == version_id).all()
    if recs:
        return recs
        
    # Create recommendations
    ai_recs = ai.recommend_job_roles(version.parsed_data or {})
    db_recs = []
    
    for r in ai_recs:
        db_rec = JobRecommendation(
            resume_version_id=version_id,
            role_name=r["role_name"],
            match_percentage=r["match_percentage"],
            fit_reason=r["fit_reason"],
            missing_skills=r["missing_skills"],
            learning_roadmap=r["learning_roadmap"]
        )
        db.add(db_rec)
        db_recs.append(db_rec)
        
    db.commit()
    for rec in db_recs:
        db.refresh(rec)
        
    log = ActivityLog(
        user_id=current_user.id,
        action="Job Recommendations",
        details=f"Generated role recommendations for resume version ID {version_id}"
    )
    db.add(log)
    db.commit()
    
    return db_recs


@router.get("/{version_id}/skill-gap", response_model=SkillGapResponse)
def get_skill_gap(
    version_id: int,
    target_role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    version = db.query(ResumeVersion).join(Resume).filter(
        ResumeVersion.id == version_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
        
    # Check existing report
    report = db.query(SkillGapReport).filter(
        SkillGapReport.resume_version_id == version_id,
        SkillGapReport.target_role == target_role
    ).first()
    
    if report:
        return report
        
    # Generate skill gap
    gap = ai.analyze_skill_gap(version.parsed_data or {}, target_role)
    new_report = SkillGapReport(
        resume_version_id=version_id,
        target_role=target_role,
        current_skills=gap["current_skills"],
        missing_skills=gap["missing_skills"],
        learning_priority=gap["learning_priority"],
        learning_resources=gap["learning_resources"],
        estimated_time=gap["estimated_time"]
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    log = ActivityLog(
        user_id=current_user.id,
        action="Skill Gap Analysis",
        details=f"Analyzed skill gaps for role '{target_role}' on resume version ID {version_id}"
    )
    db.add(log)
    db.commit()
    
    return new_report
