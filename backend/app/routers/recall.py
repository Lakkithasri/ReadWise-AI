import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Reading, RecallTest, RecallTestItem
from app.schemas import (
    RecallTestResponse, RecallSubmission, GenerateRecallTestRequest
)
from app.services.gemini_service import generate_recall_quiz, evaluate_recall_answer
from app.services.scoring_service import heuristic_grade_recall, calculate_seven_day_schedule
from app.config import settings

router = APIRouter(prefix="/api/recall", tags=["Recall Tests"])

def utc_now():
    return datetime.now(timezone.utc)

@router.get("/tests", response_model=List[RecallTestResponse])
def get_recall_tests(
    reading_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(RecallTest)
    if reading_id:
        query = query.filter(RecallTest.reading_id == reading_id)
    if status and status.lower() != "all":
        query = query.filter(RecallTest.status == status.lower())
    
    tests = query.order_by(RecallTest.scheduled_for.asc()).all()
    # Format item JSON strings into arrays for schema
    result = []
    for t in tests:
        items = []
        for it in t.items:
            corr = []
            miss = []
            if it.correct_concepts:
                try:
                    corr = json.loads(it.correct_concepts)
                except Exception:
                    corr = [c.strip() for c in it.correct_concepts.split(",") if c.strip()]
            if it.missing_concepts:
                try:
                    miss = json.loads(it.missing_concepts)
                except Exception:
                    miss = [m.strip() for m in it.missing_concepts.split(",") if m.strip()]
            
            items.append({
                "id": it.id,
                "question": it.question,
                "reference_answer": it.reference_answer if t.status == "completed" else "Hidden until submission",
                "user_response": it.user_response,
                "score": it.score,
                "feedback": it.feedback,
                "correct_concepts": corr,
                "missing_concepts": miss
            })
        result.append({
            "id": t.id,
            "reading_id": t.reading_id,
            "title": t.title,
            "test_type": t.test_type,
            "scheduled_for": t.scheduled_for,
            "completed_at": t.completed_at,
            "status": t.status,
            "overall_score": t.overall_score,
            "created_at": t.created_at,
            "items": items
        })
    return result

@router.get("/due")
def get_due_tests(db: Session = Depends(get_db)):
    """Count and retrieve tests that are due or overdue."""
    now = utc_now()
    due_tests = db.query(RecallTest).filter(
        RecallTest.status == "pending",
        RecallTest.scheduled_for <= now
    ).order_by(RecallTest.scheduled_for.asc()).all()

    return {
        "count": len(due_tests),
        "due_tests": [
            {
                "id": t.id,
                "reading_id": t.reading_id,
                "title": t.title,
                "test_type": t.test_type,
                "scheduled_for": t.scheduled_for,
                "reading_title": t.reading.title if t.reading else "Reading"
            }
            for t in due_tests
        ]
    }

@router.post("/generate", response_model=RecallTestResponse)
def generate_new_test(payload: GenerateRecallTestRequest, db: Session = Depends(get_db)):
    reading = db.query(Reading).filter(Reading.id == payload.reading_id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")

    # Try AI generation first; fallback to heuristic questions if no API key
    questions_data = []
    if settings.has_gemini_key:
        try:
            questions_data = generate_recall_quiz(text=reading.content, title=reading.title)
        except Exception:
            questions_data = []

    if not questions_data:
        # Fallback starter questions grounded in text
        questions_data = [
            {
                "question": f"In your own words, what is the central thesis or key problem addressed in '{reading.title}'?",
                "reference_answer": f"Core problem, motivation, and conceptual conclusions presented by {reading.author}."
            },
            {
                "question": "What primary methodology, mechanism, or principle was introduced in this reading?",
                "reference_answer": "Key operational mechanism, theoretical framework, or empirical intervention."
            },
            {
                "question": "Explain one significant implication, qualification, or practical application discussed in the text.",
                "reference_answer": "Broader significance, limitations, or future application contexts."
            }
        ]

    test = RecallTest(
        reading_id=reading.id,
        title=f"Recall Test: {reading.title[:45]}...",
        test_type=payload.test_type,
        scheduled_for=utc_now(),
        status="pending",
        created_at=utc_now()
    )
    db.add(test)
    db.flush()

    test_items = []
    for qd in questions_data:
        item = RecallTestItem(
            test_id=test.id,
            question=qd["question"],
            reference_answer=qd["reference_answer"],
            user_response=None,
            score=None
        )
        db.add(item)
        test_items.append(item)

    db.commit()
    db.refresh(test)

    return {
        "id": test.id,
        "reading_id": test.reading_id,
        "title": test.title,
        "test_type": test.test_type,
        "scheduled_for": test.scheduled_for,
        "completed_at": test.completed_at,
        "status": test.status,
        "overall_score": test.overall_score,
        "created_at": test.created_at,
        "items": [
            {
                "id": it.id,
                "question": it.question,
                "reference_answer": "Hidden until submission",
                "user_response": None,
                "score": None,
                "feedback": None,
                "correct_concepts": [],
                "missing_concepts": []
            }
            for it in test_items
        ]
    }

@router.get("/tests/{id}")
def get_test_details(id: int, db: Session = Depends(get_db)):
    test = db.query(RecallTest).filter(RecallTest.id == id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Recall test not found.")

    items = []
    for it in test.items:
        corr = []
        miss = []
        if it.correct_concepts:
            try:
                corr = json.loads(it.correct_concepts)
            except Exception:
                corr = [it.correct_concepts]
        if it.missing_concepts:
            try:
                miss = json.loads(it.missing_concepts)
            except Exception:
                miss = [it.missing_concepts]
        items.append({
            "id": it.id,
            "question": it.question,
            "reference_answer": it.reference_answer if test.status == "completed" else "Hidden until submission",
            "user_response": it.user_response,
            "score": it.score,
            "feedback": it.feedback,
            "correct_concepts": corr,
            "missing_concepts": miss
        })

    return {
        "id": test.id,
        "reading_id": test.reading_id,
        "title": test.title,
        "test_type": test.test_type,
        "scheduled_for": test.scheduled_for,
        "completed_at": test.completed_at,
        "status": test.status,
        "overall_score": test.overall_score,
        "created_at": test.created_at,
        "items": items,
        "reading": {
            "id": test.reading.id,
            "title": test.reading.title,
            "author": test.reading.author,
            "topic": test.reading.topic
        }
    }

@router.post("/tests/{id}/submit")
def submit_recall_test(id: int, payload: RecallSubmission, db: Session = Depends(get_db)):
    test = db.query(RecallTest).filter(RecallTest.id == id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Recall test not found.")

    reading = test.reading
    total_score = 0.0
    graded_count = 0

    answers_map = {ans.item_id: ans.user_response for ans in payload.answers}

    for item in test.items:
        user_text = answers_map.get(item.id, "").strip()
        item.user_response = user_text

        # Try AI grading if key is configured, fallback to grounded heuristic
        eval_result = None
        if settings.has_gemini_key and len(user_text) > 0:
            try:
                eval_result = evaluate_recall_answer(
                    question=item.question,
                    reference_answer=item.reference_answer,
                    user_response=user_text,
                    source_text=reading.content
                )
            except Exception:
                eval_result = None

        if not eval_result:
            eval_result = heuristic_grade_recall(
                question=item.question,
                reference_answer=item.reference_answer,
                user_response=user_text
            )

        item.score = float(eval_result.get("score", 0.0))
        item.feedback = eval_result.get("feedback", "")
        item.correct_concepts = json.dumps(eval_result.get("correct_concepts", []))
        item.missing_concepts = json.dumps(eval_result.get("missing_concepts", []))

        total_score += item.score
        graded_count += 1

    overall = round(total_score / max(graded_count, 1), 1)
    test.overall_score = overall
    test.status = "completed"
    test.completed_at = utc_now()

    # Automatically schedule 7-day recall follow-up test if this was an initial test
    scheduled_7d_test = None
    if test.test_type == "initial":
        # Check if 7-day test already exists
        existing_7d = db.query(RecallTest).filter(
            RecallTest.reading_id == test.reading_id,
            RecallTest.test_type == "seven_day"
        ).first()

        if not existing_7d:
            seven_day_date = calculate_seven_day_schedule(test.completed_at)
            scheduled_7d_test = RecallTest(
                reading_id=test.reading_id,
                title=f"7-Day Spaced Recall: {reading.title[:40]}...",
                test_type="seven_day",
                scheduled_for=seven_day_date,
                status="pending",
                created_at=utc_now()
            )
            db.add(scheduled_7d_test)
            db.flush()

            # Create items for the 7-day test
            for it in test.items:
                db.add(RecallTestItem(
                    test_id=scheduled_7d_test.id,
                    question=it.question,
                    reference_answer=it.reference_answer,
                    user_response=None,
                    score=None
                ))

    # Mark reading as completed if not already
    if reading.status != "completed":
        reading.status = "completed"
        reading.completion_date = datetime.now().strftime("%Y-%m-%d")

    db.commit()
    db.refresh(test)

    return {
        "status": "success",
        "overall_score": test.overall_score,
        "completed_at": test.completed_at,
        "scheduled_7_day_test": {
            "id": scheduled_7d_test.id,
            "scheduled_for": scheduled_7d_test.scheduled_for
        } if scheduled_7d_test else None
    }
