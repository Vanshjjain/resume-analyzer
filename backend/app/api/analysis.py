from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.database import User, ResumeVersion, ResumeAnalysis, ActivityLog, Resume
from app.schemas.analysis import AnalysisResponse, RewriteRequest, RewriteResponse, ComparisonResponse
from app.services import ai, pdf_report
from app.api import jobs, interview
from typing import Any, Dict
import io

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.post("/{version_id}/analyze", response_model=AnalysisResponse)
def analyze_version(
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Fetch version
    version = db.query(ResumeVersion).join(Resume).filter(
        ResumeVersion.id == version_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
        
    # Check if analysis already exists
    existing = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_version_id == version_id).first()
    if existing:
        return existing
        
    # Analyze raw text & parsed structure
    analysis_result = ai.analyze_resume_ats(version.parsed_data or {}, version.raw_text or "")
    
    new_analysis = ResumeAnalysis(
        resume_version_id=version_id,
        ats_score=analysis_result["ats_score"],
        category_scores=analysis_result["category_scores"],
        feedback=analysis_result["feedback"]
    )
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    
    # Log Activity
    log = ActivityLog(
        user_id=current_user.id,
        action="Run ATS Analysis",
        details=f"Ran ATS analysis on resume version ID {version_id}, score: {new_analysis.ats_score}"
    )
    db.add(log)
    db.commit()
    
    return new_analysis


@router.get("/{version_id}/analysis", response_model=AnalysisResponse)
def get_analysis(
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    version = db.query(ResumeVersion).join(Resume).filter(
        ResumeVersion.id == version_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
        
    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_version_id == version_id).first()
    if not analysis:
        # Generate on the fly
        return analyze_version(version_id, db, current_user)
        
    return analysis


@router.post("/rewrite", response_model=RewriteResponse)
def rewrite_description(
    payload: RewriteRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    rewritten = ai.rewrite_resume_section(payload.section_type, payload.text)
    return rewritten


@router.get("/compare")
def compare_versions(
    version_1_id: int = Query(...),
    version_2_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    v1 = db.query(ResumeVersion).join(Resume).filter(
        ResumeVersion.id == version_1_id,
        Resume.user_id == current_user.id
    ).first()
    v2 = db.query(ResumeVersion).join(Resume).filter(
        ResumeVersion.id == version_2_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not v1 or not v2:
        raise HTTPException(status_code=404, detail="One or both resume versions not found")
        
    comparison = ai.compare_resumes(v1.parsed_data or {}, v2.parsed_data or {})
    return {
        "resume_1_id": version_1_id,
        "resume_2_id": version_2_id,
        "score_1": comparison["score_1"],
        "score_2": comparison["score_2"],
        "comparison_details": comparison
    }


@router.get("/{version_id}/report")
def get_pdf_report(
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Fetch version and details
    version = db.query(ResumeVersion).join(Resume).filter(
        ResumeVersion.id == version_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
        
    # 2. Get/generate analysis
    analysis_model = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_version_id == version_id).first()
    if not analysis_model:
        analysis_res = ai.analyze_resume_ats(version.parsed_data or {}, version.raw_text or "")
        analysis_dict = analysis_res
    else:
        analysis_dict = {
            "ats_score": analysis_model.ats_score,
            "category_scores": analysis_model.category_scores,
            "feedback": analysis_model.feedback
        }
        
    # 3. Get/generate recommendations & skill gap & interview questions
    parsed = version.parsed_data or {}
    roles = ai.recommend_job_roles(parsed)
    
    # Primary role for skill gap
    target_role = roles[0]["role_name"] if roles else "Software Engineer"
    skills = ai.analyze_skill_gap(parsed, target_role)
    questions = ai.generate_interview_questions(parsed, target_role)
    
    # 4. Create PDF bytes
    user_name = current_user.full_name or current_user.email
    resume_name = version.resume.original_name
    
    pdf_data = pdf_report.generate_pdf_report_bytes(
        user_name=user_name,
        resume_name=resume_name,
        analysis=analysis_dict,
        roles=roles,
        skills=skills,
        questions=questions
    )
    
    # Stream the PDF response
    return StreamingResponse(
        io.BytesIO(pdf_data),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=resume_report_{version_id}.pdf"}
    )
