from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Reading, Summary, Flashcard, RecallTest, VerificationRecord, ExperimentSession
)
from app.schemas import AnalyticsSummary

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Dashboard"])

def utc_now():
    return datetime.now(timezone.utc)

@router.get("/dashboard", response_model=AnalyticsSummary)
def get_dashboard_analytics(db: Session = Depends(get_db)):
    now = utc_now()

    total_readings = db.query(Reading).count()
    completed_readings = db.query(Reading).filter(Reading.status == "completed").count()
    saved_summaries = db.query(Summary).count()
    
    flashcards = db.query(Flashcard).all()
    total_flashcards = len(flashcards)
    flashcards_reviewed = sum(1 for f in flashcards if f.review_count > 0)

    # Tests due: scheduled_for <= now and status == 'pending'
    recall_tests_due = db.query(RecallTest).filter(
        RecallTest.status == "pending",
        RecallTest.scheduled_for <= now
    ).count()

    completed_tests = db.query(RecallTest).filter(
        RecallTest.status == "completed",
        RecallTest.overall_score.isnot(None)
    ).all()
    
    if completed_tests:
        avg_score = round(sum(t.overall_score for t in completed_tests) / len(completed_tests), 1)
    else:
        avg_score = 0.0

    # Verification issues needing review: status is not supported
    verification_issues_pending = db.query(VerificationRecord).filter(
        VerificationRecord.status.in_(["unverified", "contradicted", "unsupported", "outdated"])
    ).count()

    # Recent activity synthesis
    activity = []
    recent_readings = db.query(Reading).order_by(Reading.updated_at.desc()).limit(3).all()
    for r in recent_readings:
        activity.append({
            "type": "reading",
            "title": f"Added reading: {r.title}",
            "timestamp": r.updated_at,
            "badge": r.topic
        })

    recent_tests = db.query(RecallTest).filter(RecallTest.status == "completed").order_by(RecallTest.completed_at.desc()).limit(3).all()
    for t in recent_tests:
        activity.append({
            "type": "test",
            "title": f"Completed {t.test_type.replace('_', ' ')} test ({t.overall_score}%)",
            "timestamp": t.completed_at,
            "badge": f"{t.overall_score}%"
        })

    # Sort combined activity
    activity.sort(key=lambda x: x["timestamp"] if x["timestamp"] else datetime.min.replace(tzinfo=timezone.utc), reverse=True)

    # Quick experiment metrics for dashboard preview
    experiments = db.query(ExperimentSession).all()
    norm_scores = [e.initial_score for e in experiments if e.method == "normal"]
    ai_scores = [e.initial_score for e in experiments if e.method == "ai_assisted"]

    exp_preview = {
        "normal_avg": round(sum(norm_scores)/len(norm_scores), 1) if norm_scores else 0.0,
        "ai_avg": round(sum(ai_scores)/len(ai_scores), 1) if ai_scores else 0.0,
        "total_experiments": len(experiments)
    }

    return AnalyticsSummary(
        total_readings=total_readings,
        completed_readings=completed_readings,
        saved_summaries=saved_summaries,
        flashcards_reviewed=flashcards_reviewed,
        total_flashcards=total_flashcards,
        recall_tests_due=recall_tests_due,
        average_recall_score=avg_score,
        verification_issues_pending=verification_issues_pending,
        recent_activity=activity[:5],
        experiment_metrics=exp_preview
    )
