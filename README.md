# AI Resume Analyzer & Career Assistant Hub

A production-ready, full-stack SaaS web application designed to grade resume compliance against Applicant Tracking System (ATS) parsing models, structure career growth roadmaps, evaluate skill gaps, and generate customized interview prep guides.

---

## 🚀 Tech Stack

### Frontend
- **React.js (v18+)** with **TypeScript** & **Vite**
- **Tailwind CSS (v4)** for premium fluid responsive designs
- **Framer Motion** for smooth glassmorphic page transitions
- **Recharts** for interactive metric trend dashboards
- **React Router** for protected workspace layouts routing
- **TanStack Query** (React Query) & **Axios** for API integrations

### Backend
- **FastAPI** (Python 3.10+) as the high-performance core REST API
- **SQLAlchemy** ORM for relational schemas tracking
- **Pydantic** for rigorous data payloads validation
- **Uvicorn** as the ASGI production web server

### Database & Storage
- **SQLite** configured by default for zero-configuration startup
- **PostgreSQL** supported out-of-the-box (via changing `DATABASE_URL` env variable)
- **Local Filesystem** storage with custom S3/Cloudinary ready APIs

### Parsers & AI
- **PyMuPDF (fitz)** & **pdfplumber** for high-accuracy PDF text mining
- **python-docx** for Word Document XML extraction
- **OpenAI GPT-4** (with local NLP regex fallbacks for zero-key startups)

---

## ⚡ Core Features

1. **Authentication Workspace:** JWT secure flow, password hashing via bcrypt, user profiles, and mock Google sign-ins.
2. **Interactive Analytics Dashboard:** grading trend visualizations, competence maps, and recent action logs tracking.
3. **ATS Auditing Engine:** Evaluates formatting, verbs, technical/soft skill keywords, and yields overall score gauges, missing sections, and keyword warnings.
4. **AI Bullet-Point Rewriter:** Live bullet rewriter swapping passive verbs with active power verbs and inserting metrics.
5. **Side-by-Side Comparison:** Comparative audit mapping deltas in scores, added skills, and winner suggestions.
6. **JD Matcher Highlights:** Visual match highlights (green for match, red for gaps) matching resume texts to job posts.
7. **Roadmaps Planner:** Generates custom 3-stage study trackers, Priority skill gaps, and learning links.
8. **Interview prep QA Flashcards:** Category tags (Technical, Behavior, HR) with expandable flashcards for outlines.
9. **Downloadable PDF Audits:** Custom generated PDFs containing analysis charts and career prep resources.
10. **Admin Telemetry Portal:** Lists all users, log logs, system-wide score averages, and allows role toggling.

---

## 🛠️ Local Setup Guide

### 1. Backend API Server Setup
Make sure you have Python 3.10+ installed.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
The backend API documentation will be available at `http://localhost:8000/docs` (Swagger UI).

### 2. Frontend React Workspace Setup
Make sure you have Node.js (v18+) and npm installed.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
Open `http://localhost:5173` in your browser to access the application.

---

## 🔑 Environment Variables (`backend/.env`)

Ensure the following variables are customized in your local backend environment:

- `DATABASE_URL`: Set database path. Defaults to `sqlite:///./resume_analyzer.db`.
- `SECRET_KEY`: High-entropy key used for JWT encryption signatures.
- `OPENAI_API_KEY`: (Optional) Insert your OpenAI API Key to enable actual GPT-4 resume audits and rewrites. Leaving this blank routes analysis dynamically to the local heuristic NLP engine.
