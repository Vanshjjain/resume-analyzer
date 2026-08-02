from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.database import User, Resume, ResumeVersion, ActivityLog
from app.schemas.resumes import ResumeResponse, ResumeVersionResponse
from app.services.parser import extract_text_from_pdf, extract_text_from_docx, parse_resume_data
from app.services.storage import save_uploaded_file
from typing import List, Any
import os

router = APIRouter(prefix="/resumes", tags=["Resumes"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".pdf", ".docx"}

def validate_file(file: UploadFile):
    filename = file.filename or ""
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF and DOCX files are allowed."
        )
    # Check file size (FastAPI does not parse size immediately, we check it as we read or assume size)
    # We can get size by seeking or checking content-length header
    size = 0
    try:
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
    except Exception:
        pass
        
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the maximum limit of 5MB."
        )

@router.post("/upload", response_model=ResumeVersionResponse)
def upload_resume(
    file: UploadFile = File(...),
    version_name: str = Form("v1"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    validate_file(file)
    
    # 1. Create a parent Resume entry
    new_resume = Resume(
        user_id=current_user.id,
        original_name=file.filename or "resume.pdf"
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    
    # 2. Save physical file
    try:
        file_path = save_uploaded_file(file, new_resume.id, version_name)
    except Exception as e:
        db.delete(new_resume)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
    # 3. Extract text and parse
    _, ext = os.path.splitext(file.filename.lower())
    raw_text = ""
    if ext == ".pdf":
        raw_text = extract_text_from_pdf(file_path)
    else:
        raw_text = extract_text_from_docx(file_path)
        
    parsed_data = parse_resume_data(raw_text)
    
    # Calculate file size text
    size_mb = os.path.getsize(file_path) / (1024 * 1024)
    file_size_str = f"{size_mb:.2f} MB"
    
    # 4. Create ResumeVersion entry
    new_version = ResumeVersion(
        resume_id=new_resume.id,
        version_name=version_name,
        file_path=file_path,
        file_type="pdf" if ext == ".pdf" else "docx",
        file_size=file_size_str,
        raw_text=raw_text,
        parsed_data=parsed_data
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    
    # Log Activity
    log = ActivityLog(
        user_id=current_user.id,
        action="Upload Resume",
        details=f"Uploaded resume version {version_name} for '{file.filename}'"
    )
    db.add(log)
    db.commit()
    
    return new_version


@router.post("/{resume_id}/new-version", response_model=ResumeVersionResponse)
def upload_new_version(
    resume_id: int,
    file: UploadFile = File(...),
    version_name: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Verify owner
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # Verify version name isn't duplicated
    duplicate = db.query(ResumeVersion).filter(
        ResumeVersion.resume_id == resume_id,
        ResumeVersion.version_name == version_name
    ).first()
    if duplicate:
        raise HTTPException(status_code=400, detail=f"Version '{version_name}' already exists for this resume.")
        
    validate_file(file)
    
    # Save file
    file_path = save_uploaded_file(file, resume_id, version_name)
    
    _, ext = os.path.splitext(file.filename.lower())
    raw_text = ""
    if ext == ".pdf":
        raw_text = extract_text_from_pdf(file_path)
    else:
        raw_text = extract_text_from_docx(file_path)
        
    parsed_data = parse_resume_data(raw_text)
    size_mb = os.path.getsize(file_path) / (1024 * 1024)
    file_size_str = f"{size_mb:.2f} MB"
    
    new_version = ResumeVersion(
        resume_id=resume_id,
        version_name=version_name,
        file_path=file_path,
        file_type="pdf" if ext == ".pdf" else "docx",
        file_size=file_size_str,
        raw_text=raw_text,
        parsed_data=parsed_data
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    
    log = ActivityLog(
        user_id=current_user.id,
        action="Upload Resume Version",
        details=f"Uploaded version {version_name} for resume ID {resume_id}"
    )
    db.add(log)
    db.commit()
    
    return new_version


@router.get("/", response_model=List[ResumeResponse])
def list_resumes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    return resumes


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.get("/versions/{version_id}", response_model=ResumeVersionResponse)
def get_version(version_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    version = db.query(ResumeVersion).join(Resume).filter(
        ResumeVersion.id == version_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
    return version


@router.delete("/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # Delete physical files
    for version in resume.versions:
        try:
            if os.path.exists(version.file_path):
                os.remove(version.file_path)
        except Exception as e:
            print(f"Error removing file {version.file_path}: {e}")
            
    db.delete(resume)
    db.commit()
    
    log = ActivityLog(
        user_id=current_user.id,
        action="Delete Resume",
        details=f"Deleted resume: {resume.original_name}"
    )
    db.add(log)
    db.commit()
    
    return {"message": "Resume successfully deleted"}
