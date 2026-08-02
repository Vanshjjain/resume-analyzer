from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import datetime

class AnalysisResponse(BaseModel):
    id: int
    resume_version_id: int
    ats_score: int
    category_scores: Dict[str, int]
    feedback: Dict[str, Any]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class RewriteRequest(BaseModel):
    section_type: str  # "project", "experience", "summary"
    text: str

class RewriteResponse(BaseModel):
    rewritten_text: str
    action_verbs_added: List[str]
    improvements_made: List[str]

class ComparisonResponse(BaseModel):
    resume_1_id: int
    resume_2_id: int
    score_1: int
    score_2: int
    comparison_details: Dict[str, Any]
