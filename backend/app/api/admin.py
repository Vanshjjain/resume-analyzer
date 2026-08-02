from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.database import User, Resume, ResumeAnalysis, ActivityLog
from app.schemas.auth import UserResponse
from typing import List, Any, Dict

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
) -> Any:
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
) -> Any:
    user_count = db.query(User).count()
    resume_count = db.query(Resume).count()
    analysis_count = db.query(ResumeAnalysis).count()
    log_count = db.query(ActivityLog).count()
    
    # Calculate simple role distributions
    admins = db.query(User).filter(User.role == "admin").count()
    users = db.query(User).filter(User.role == "user").count()
    
    # Average score
    avg_score = 0
    scores = db.query(ResumeAnalysis.ats_score).all()
    if scores:
        avg_score = int(sum([s[0] for s in scores]) / len(scores))
        
    return {
        "users": user_count,
        "resumes": resume_count,
        "analyses": analysis_count,
        "logs": log_count,
        "roles": {
            "admin": admins,
            "user": users
        },
        "average_ats_score": avg_score
    }


@router.get("/logs")
def get_activity_logs(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
) -> Any:
    # Join with users to return emails
    logs = db.query(
        ActivityLog.id,
        ActivityLog.action,
        ActivityLog.details,
        ActivityLog.created_at,
        User.email.label("user_email")
    ).join(User, ActivityLog.user_id == User.id).order_by(ActivityLog.created_at.desc()).limit(100).all()
    
    return [
        {
            "id": log.id,
            "action": log.action,
            "details": log.details,
            "created_at": log.created_at,
            "user_email": log.user_email
        }
        for log in logs
    ]


@router.post("/users/{user_id}/role")
def change_user_role(
    user_id: int,
    role_payload: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
) -> Any:
    new_role = role_payload.get("role")
    if new_role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role specified. Must be 'user' or 'admin'.")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent admin self-demotion
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Admins cannot change their own roles.")
        
    user.role = new_role
    db.commit()
    db.refresh(user)
    
    log = ActivityLog(
        user_id=admin.id,
        action="Change Role",
        details=f"Admin {admin.email} changed role of user {user.email} to {new_role}"
    )
    db.add(log)
    db.commit()
    
    return {"message": "Role successfully updated", "user_id": user.id, "role": user.role}
