from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import datetime

class InterviewQuestionResponse(BaseModel):
    id: int
    resume_version_id: int
    target_role: str
    category: str
    question: str
    sample_answer: str
    difficulty: str
    evaluation_tips: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True
