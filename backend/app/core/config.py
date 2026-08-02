from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./resume_analyzer.db"
    SECRET_KEY: str = "457efc464b0f027818e38d73b069d678e0db9668fa64188bcf36a0fb4905bb65"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_CLIENT_ID: Optional[str] = None
    UPLOAD_DIR: str = "./uploads"

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        extra = "ignore"

settings = Settings()
