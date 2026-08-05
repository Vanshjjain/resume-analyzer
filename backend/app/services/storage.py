import os
import shutil
import tempfile
from typing import Optional, Tuple
from fastapi import UploadFile
from app.core.config import settings
from app.core.supabase import get_supabase_client

def get_storage_type() -> str:
    """Returns 'supabase' if Supabase credentials are set, otherwise 'local'."""
    supabase = get_supabase_client()
    return "supabase" if supabase is not None else "local"

def save_uploaded_file(file: UploadFile, resume_id: int, version: str) -> str:
    """
    Saves uploaded file to Supabase Storage if configured, otherwise to local upload directory.
    Returns the file reference string (local file path or Supabase storage object key).
    """
    filename = f"resume_{resume_id}_{version}_{file.filename}"
    filename = "".join([c for c in filename if c.isalpha() or c.isdigit() or c in (".", "_", "-")]).rstrip()

    # Read bytes from file
    file.file.seek(0)
    file_bytes = file.file.read()
    file.file.seek(0)

    supabase = get_supabase_client()
    if supabase is not None:
        bucket = settings.SUPABASE_STORAGE_BUCKET or "resumes"
        storage_path = f"uploads/{filename}"
        
        # Determine content type
        content_type = "application/pdf" if filename.endswith(".pdf") else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        try:
            # Upload to Supabase Storage bucket
            supabase.storage.from_(bucket).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            return f"supabase://{bucket}/{storage_path}"
        except Exception as e:
            print(f"Supabase Storage upload error: {e}. Falling back to local storage.")

    # Fallback / Default: Local Storage
    upload_dir = settings.UPLOAD_DIR
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    return file_path

def get_file_content(file_path: str) -> bytes:
    """
    Retrieves the raw bytes of a file from either Supabase Storage or local filesystem.
    """
    if file_path.startswith("supabase://"):
        parts = file_path.replace("supabase://", "").split("/", 1)
        bucket = parts[0]
        storage_path = parts[1]
        
        supabase = get_supabase_client()
        if supabase:
            res = supabase.storage.from_(bucket).download(storage_path)
            return res

        raise RuntimeError("Supabase credentials not configured to read file.")
    else:
        with open(file_path, "rb") as f:
            return f.read()

def prepare_local_file_for_parsing(file_path: str) -> Tuple[str, bool]:
    """
    Ensures a local file exists for PyMuPDF/docx extractors.
    Returns (local_file_path, is_temporary).
    """
    if file_path.startswith("supabase://"):
        file_bytes = get_file_content(file_path)
        ext = ".pdf" if file_path.lower().endswith(".pdf") else ".docx"
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
        temp_file.write(file_bytes)
        temp_file.close()
        return temp_file.name, True
    else:
        return file_path, False

def get_file_public_url(file_path: str) -> str:
    """
    Returns a public URL if stored in Supabase, or relative path if stored locally.
    """
    if file_path.startswith("supabase://"):
        parts = file_path.replace("supabase://", "").split("/", 1)
        bucket = parts[0]
        storage_path = parts[1]
        
        supabase = get_supabase_client()
        if supabase:
            try:
                return supabase.storage.from_(bucket).get_public_url(storage_path)
            except Exception:
                pass
        return file_path
    return file_path

def delete_stored_file(file_path: str) -> bool:
    """
    Deletes the file from Supabase Storage or local filesystem.
    """
    try:
        if file_path.startswith("supabase://"):
            parts = file_path.replace("supabase://", "").split("/", 1)
            bucket = parts[0]
            storage_path = parts[1]
            
            supabase = get_supabase_client()
            if supabase:
                supabase.storage.from_(bucket).remove([storage_path])
                return True
        else:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
    return False
