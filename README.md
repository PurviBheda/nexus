# NEXUS — Multimodal Evidence Intelligence Agent

NEXUS is an AI-powered enterprise investigation platform for multimodal evidence analysis (PDF documents, audio recordings, video streams, and post-collision photos).

## Repository Architecture

```
nexus/
├── frontend/             # React + Vite + Tailwind CSS v4 Frontend (Figma UI)
│   ├── src/
│   │   ├── components/  # Layout, Dashboard, Evidence, and UI components
│   │   ├── pages/       # Application screens (Upload, Evidence, Dashboard, etc.)
│   │   ├── services/    # API client connecting to FastAPI backend
│   │   ├── types/       # TypeScript interface definitions
│   │   └── data/        # Seed datasets for CASE-001
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
└── backend/              # Python FastAPI Backend (Multimodal Ingestion)
    ├── app/
    │   ├── api/         # Routes for evidence upload & investigation queries
    │   ├── core/        # Configuration, allowed MIME types, CORS settings
    │   ├── models/      # Data models
    │   ├── schemas/     # Pydantic validation schemas
    │   └── services/    # File validation, metadata parsing, & ingestion
    ├── storage/
    │   ├── uploads/     # Physical evidence storage organized by case
    │   └── processed/   # Storage for AI processing pipeline
    ├── requirements.txt
    └── README.md
```

## Quick Start

### 1. Backend Service
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
