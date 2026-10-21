from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ExperimentSession, Reading
from app.schemas import ExperimentSessionResponse, ExperimentSessionCreate

router = APIRouter(prefix="/api/experiments", tags=["Learning Experiments"])

def utc_now():
    return datetime.now(timezone.utc)

@router.get("", response_model=List[ExperimentSessionResponse])
def get_experiment_sessions(db: Session = Depends(get_db)):
    return db.query(ExperimentSession).order_by(ExperimentSession.created_at.desc()).all()

@router.post("", response_model=ExperimentSessionResponse)
def log_experiment_session(payload: ExperimentSessionCreate, db: Session = Depends(get_db)):
    reading = db.query(Reading).filter(Reading.id == payload.reading_id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")
    
    session = ExperimentSession(
        reading_id=payload.reading_id,
        method=payload.method,
        start_time=payload.start_time,
        completion_time=payload.completion_time,
        duration_minutes=payload.duration_minutes,
        initial_score=payload.initial_score,
        seven_day_score=payload.seven_day_score,
        confidence_rating=payload.confidence_rating,
        observations=payload.observations or "",
        created_at=utc_now()
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/comparison")
def get_learning_comparison(db: Session = Depends(get_db)):
    """Compute empirical comparative metrics between Normal and AI-Assisted reading."""
    sessions = db.query(ExperimentSession).all()

    normal_sessions = [s for s in sessions if s.method == "normal"]
    ai_sessions = [s for s in sessions if s.method == "ai_assisted"]

    def avg(lst: List[float]) -> float:
        return round(sum(lst) / max(len(lst), 1), 1) if lst else 0.0

    normal_durations = [s.duration_minutes for s in normal_sessions]
    ai_durations = [s.duration_minutes for s in ai_sessions]

    normal_init_scores = [s.initial_score for s in normal_sessions]
    ai_init_scores = [s.initial_score for s in ai_sessions]

    normal_7d_scores = [s.seven_day_score for s in normal_sessions if s.seven_day_score is not None]
    ai_7d_scores = [s.seven_day_score for s in ai_sessions if s.seven_day_score is not None]

    # Individual sessions formatted for chart rendering
    session_points = []
    for s in sessions:
        session_points.append({
            "id": s.id,
            "title": s.reading.title[:25] + "..." if s.reading else f"Session #{s.id}",
            "method": "AI-Assisted" if s.method == "ai_assisted" else "Normal",
            "initial_score": s.initial_score,
            "seven_day_score": s.seven_day_score,
            "duration": s.duration_minutes,
            "confidence": s.confidence_rating,
            "retention_change": round(s.seven_day_score - s.initial_score, 1) if s.seven_day_score is not None else None
        })

    return {
        "summary": {
            "total_sessions": len(sessions),
            "normal_count": len(normal_sessions),
            "ai_count": len(ai_sessions),
            "avg_normal_duration": avg(normal_durations),
            "avg_ai_duration": avg(ai_durations),
            "avg_normal_initial_score": avg(normal_init_scores),
            "avg_ai_initial_score": avg(ai_init_scores),
            "avg_normal_7d_score": avg(normal_7d_scores),
            "avg_ai_7d_score": avg(ai_7d_scores),
        },
        "session_points": session_points,
        "methodology_disclaimer": (
            "These metrics represent personal empirical observations within your individual study sessions. "
            "They illustrate relative patterns in recall and study duration, but do not constitute "
            "scientifically controlled clinical proof of universal learning outcomes."
        )
    }
