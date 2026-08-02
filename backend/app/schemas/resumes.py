from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import datetime

class ResumeVersionResponse(BaseModel):
    id: int
    resume_id: int
    version_name: str
    file_type: str
    file_size: str
    parsed_data: Optional[Dict[str, Any]] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    original_name: str
    created_at: datetime.datetime
    versions: List[ResumeVersionResponse] = []

    class Config:
        from_attributes = True
