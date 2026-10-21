from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Reading, Summary
from app.schemas import SummaryResponse, SummaryUpdate, GenerateSummaryRequest
from app.services.gemini_service import generate_three_level_summaries

router = APIRouter(prefix="/api/summaries", tags=["Summaries"])

def utc_now():
    return datetime.now(timezone.utc)

@router.get("/{reading_id}", response_model=SummaryResponse)
def get_summary(reading_id: int, db: Session = Depends(get_db)):
    summary = db.query(Summary).filter(Summary.reading_id == reading_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found for this reading.")
    return summary

@router.post("/generate", response_model=SummaryResponse)
def generate_summary(payload: GenerateSummaryRequest, db: Session = Depends(get_db)):
    reading = db.query(Reading).filter(Reading.id == payload.reading_id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")
    
    existing = db.query(Summary).filter(Summary.reading_id == payload.reading_id).first()
    if existing and not payload.regenerate:
        return existing
    
    try:
        gen_result = generate_three_level_summaries(
            text=reading.content,
            title=reading.title,
            author=reading.author
        )
    except ValueError as e:
        # Handles missing API key, rate limits, or empty response explicitly
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API generation failed: {str(e)}")

    if existing:
        existing.quick_summary = gen_result["quick_summary"]
        existing.standard_summary = gen_result["standard_summary"]
        existing.detailed_summary = gen_result["detailed_summary"]
        existing.model_name = gen_result.get("model_name", "gemini-3.8-flash")
        existing.is_ai_generated = True
        existing.updated_at = utc_now()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_summary = Summary(
            reading_id=reading.id,
            quick_summary=gen_result["quick_summary"],
            standard_summary=gen_result["standard_summary"],
            detailed_summary=gen_result["detailed_summary"],
            model_name=gen_result.get("model_name", "gemini-3.8-flash"),
            is_ai_generated=True,
            created_at=utc_now(),
            updated_at=utc_now()
        )
        db.add(new_summary)
        db.commit()
        db.refresh(new_summary)
        return new_summary

@router.put("/{reading_id}", response_model=SummaryResponse)
def update_summary(reading_id: int, payload: SummaryUpdate, db: Session = Depends(get_db)):
    summary = db.query(Summary).filter(Summary.reading_id == reading_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found.")
    
    if payload.quick_summary is not None:
        summary.quick_summary = payload.quick_summary
    if payload.standard_summary is not None:
        summary.standard_summary = payload.standard_summary
    if payload.detailed_summary is not None:
        summary.detailed_summary = payload.detailed_summary
    
    summary.updated_at = utc_now()
    db.commit()
    db.refresh(summary)
    return summary
