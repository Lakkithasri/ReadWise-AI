from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.routers import (
    readings, summaries, cards, recall, experiments, 
    verifications, prompts, reflections, tools_ethics, analytics, 
    settings as app_settings, chat
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    Base.metadata.create_all(bind=engine)
    
    # Automatically seed initial dataset if database is newly initialized
    db = SessionLocal()
    try:
        seed_database(db=db, force=False)
    finally:
        db.close()
    yield

app = FastAPI(
    title="ReadWise AI API",
    description="Real Full-Stack AI Reading and Note-Taking System with Google Gemini",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(readings.router)
app.include_router(summaries.router)
app.include_router(cards.router)
app.include_router(recall.router)
app.include_router(experiments.router)
app.include_router(verifications.router)
app.include_router(prompts.router)
app.include_router(reflections.router)
app.include_router(tools_ethics.router)
app.include_router(analytics.router)
app.include_router(app_settings.router)
app.include_router(chat.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "ReadWise AI",
        "has_gemini_key": settings.has_gemini_key,
        "gemini_model": settings.GEMINI_MODEL
    }
