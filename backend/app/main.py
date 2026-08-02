from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, resumes, analysis, jobs, interview, admin
import os

# Initialize database tables on startup (no need for complex Alembic runs for local startup)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Failed to initialize database tables: {e}")

# Ensure local upload directories exist
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)

app = FastAPI(
    title="AI Resume Analyzer & Career Assistant API",
    description="Comprehensive backend API for evaluating resume compliance, skill structures, and preparation pathways.",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "*"  # Fallback wildcard for local testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire routers
app.include_router(auth.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "AI Resume Analyzer Backend",
        "database": settings.DATABASE_URL.split("://")[0]
    }
