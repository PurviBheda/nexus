import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import CORS_ORIGINS
from app.api.routes import evidence, investigations, ai

app = FastAPI(
    title="NEXUS — Multimodal Evidence Intelligence API",
    description="Multimodal Evidence Ingestion & NVIDIA AI Pipeline Intelligence System for NEXUS",
    version="1.1.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router Modules
app.include_router(evidence.router)
app.include_router(investigations.router)
app.include_router(ai.router)

@app.get("/")
async def root():
    return {
        "system": "NEXUS Multimodal Evidence Intelligence Agent",
        "status": "online",
        "stage": "nvidia_ai_pipeline",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
