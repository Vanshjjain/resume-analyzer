from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import datetime

class JobMatchRequest(BaseModel):
    job_description: str

class JobMatchResponse(BaseModel):
    match_percentage: int
    ats_compatibility: int
    missing_keywords: List[str]
    missing_technical_skills: List[str]
    suggestions: List[str]

class JobRecommendationResponse(BaseModel):
    id: int
    resume_version_id: int
    role_name: str
    match_percentage: int
    fit_reason: str
    missing_skills: List[str]
    learning_roadmap: Dict[str, Any]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SkillGapResponse(BaseModel):
    id: int
    resume_version_id: int
    target_role: str
    current_skills: List[str]
    missing_skills: List[str]
    learning_priority: List[str]
    learning_resources: List[Dict[str, str]]
    estimated_time: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True
