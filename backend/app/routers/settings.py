import os
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.seed_data import seed_database

router = APIRouter(prefix="/api/settings", tags=["Settings"])

class KeyUpdate(BaseModel):
    api_key: str
    model: str = "gemini-3.8-flash"

@router.get("/status")
def get_system_status(db: Session = Depends(get_db)):
    """Return backend status, API key readiness, active model, and database counts."""
    from app.models import Reading
    reading_count = db.query(Reading).count()

    if not settings.has_gemini_key:
        settings.reload()

    masked_key = ""
    if settings.has_gemini_key:
        k = settings.GEMINI_API_KEY.strip()
        masked_key = f"{k[:4]}...{k[-4:]}" if len(k) > 8 else "***"

    return {
        "status": "online",
        "has_gemini_key": settings.has_gemini_key,
        "masked_key": masked_key,
        "gemini_model": settings.GEMINI_MODEL,
        "environment": settings.ENVIRONMENT,
        "database_connected": True,
        "readings_count": reading_count
    }

@router.post("/key")
def update_api_key(payload: KeyUpdate):
    """Update API key and model at runtime."""
    clean_key = payload.api_key.strip()
    if not clean_key:
        raise HTTPException(status_code=400, detail="API key cannot be empty.")
    
    settings.GEMINI_API_KEY = clean_key
    settings.GEMINI_MODEL = payload.model.strip() or "gemini-3.8-flash"

    # Also update .env file on disk so it persists across restarts
    from app.config import BASE_DIR
    env_path = BASE_DIR / ".env"
    lines = []
    if env_path.exists():
        lines = env_path.read_text(encoding="utf-8").splitlines()
    
    new_lines = []
    has_key = False
    has_model = False
    for line in lines:
        if line.startswith("GEMINI_API_KEY="):
            new_lines.append(f"GEMINI_API_KEY={clean_key}")
            has_key = True
        elif line.startswith("GEMINI_MODEL="):
            new_lines.append(f"GEMINI_MODEL={settings.GEMINI_MODEL}")
            has_model = True
        else:
            new_lines.append(line)
            
    if not has_key:
        new_lines.append(f"GEMINI_API_KEY={clean_key}")
    if not has_model:
        new_lines.append(f"GEMINI_MODEL={settings.GEMINI_MODEL}")
        
    env_path.write_text("\n".join(new_lines), encoding="utf-8")

    return {
        "status": "success",
        "message": f"Gemini API key updated successfully. Active model: {settings.GEMINI_MODEL}."
    }

@router.post("/seed")
def trigger_seed_database(force: bool = False, db: Session = Depends(get_db)):
    """Seed the database with 5 complete academic readings and study records."""
    result = seed_database(db=db, force=force)
    return result
