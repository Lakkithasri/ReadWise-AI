from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Reflection, Reading
from app.schemas import ReflectionResponse, ReflectionCreate
from app.config import settings

router = APIRouter(prefix="/api/reflections", tags=["Reflection Journal"])

def utc_now():
    return datetime.now(timezone.utc)

@router.get("", response_model=List[ReflectionResponse])
def get_reflections(
    reading_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Reflection)
    if reading_id:
        query = query.filter(Reflection.reading_id == reading_id)
    return query.order_by(Reflection.created_at.desc()).all()

@router.post("", response_model=ReflectionResponse)
def create_reflection(payload: ReflectionCreate, db: Session = Depends(get_db)):
    reflection = Reflection(
        reading_id=payload.reading_id,
        date=payload.date or datetime.now().strftime("%Y-%m-%d"),
        did_ai_help=payload.did_ai_help,
        remember_without_notes=payload.remember_without_notes,
        deep_thinking_vs_dependence=payload.deep_thinking_vs_dependence,
        misunderstood_concepts=payload.misunderstood_concepts,
        future_changes=payload.future_changes,
        general_notes=payload.general_notes or "",
        ai_suggestions=payload.ai_suggestions,
        created_at=utc_now()
    )
    db.add(reflection)
    db.commit()
    db.refresh(reflection)
    return reflection

@router.get("/{id}", response_model=ReflectionResponse)
def get_reflection(id: int, db: Session = Depends(get_db)):
    ref = db.query(Reflection).filter(Reflection.id == id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Reflection entry not found.")
    return ref

@router.delete("/{id}")
def delete_reflection(id: int, db: Session = Depends(get_db)):
    ref = db.query(Reflection).filter(Reflection.id == id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Reflection entry not found.")
    db.delete(ref)
    db.commit()
    return {"status": "success", "message": "Reflection deleted."}

@router.post("/suggestions")
def generate_reflection_prompts(reading_id: int, db: Session = Depends(get_db)):
    """Suggest tailored metacognitive reflection prompts based on reading title and topic."""
    reading = db.query(Reading).filter(Reading.id == reading_id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")

    suggestions = [
        f"How does the core concept in '{reading.title}' connect with topics from your previous coursework?",
        f"When reading about {reading.topic}, did you verify whether the summary captured all technical caveats?",
        "If you had to teach this chapter to a beginner without consulting notes, which concept would be hardest to explain?",
        "Did you experience the 'fluency heuristic'—assuming you understood simply because the text was clearly written?",
        "What specific active recall question would you write for a spaced repetition review next week?"
    ]

    return {"suggestions": suggestions}
