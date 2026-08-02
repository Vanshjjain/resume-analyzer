import os
import shutil
from fastapi import UploadFile
from app.core.config import settings

def save_uploaded_file(file: UploadFile, resume_id: int, version: str) -> str:
    # Ensure upload directory exists
    upload_dir = settings.UPLOAD_DIR
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    # Standardize filename format
    filename = f"resume_{resume_id}_{version}_{file.filename}"
    # Sanitize filename
    filename = "".join([c for c in filename if c.isalpha() or c.isdigit() or c in (".", "_", "-")]).rstrip()
    
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return file_path
