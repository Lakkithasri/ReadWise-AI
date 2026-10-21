from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Reading, Summary, PersonalNote, IdeaCard, Flashcard, DiscussionQuestion, VerificationRecord
from app.schemas import ReadingResponse, ReadingCreate, ReadingUpdate
from app.services.text_extractor import extract_text_from_pdf, extract_text_from_txt, compute_text_stats

router = APIRouter(prefix="/api/readings", tags=["Readings"])

def utc_now():
    return datetime.now(timezone.utc)

@router.get("", response_model=List[ReadingResponse])
def get_readings(
    topic: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Reading)
    if topic and topic.lower() != "all":
        query = query.filter(Reading.topic.ilike(f"%{topic}%"))
    if status and status.lower() != "all":
        query = query.filter(Reading.status == status.lower())
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Reading.title.ilike(search_fmt)) |
            (Reading.author.ilike(search_fmt)) |
            (Reading.content.ilike(search_fmt))
        )
    return query.order_by(Reading.created_at.desc()).all()

@router.post("", response_model=ReadingResponse)
def create_reading(payload: ReadingCreate, db: Session = Depends(get_db)):
    word_count, char_count = compute_text_stats(payload.content)
    reading = Reading(
        title=payload.title,
        author=payload.author or "Unknown",
        source_url=payload.source_url,
        topic=payload.topic or "General",
        reading_date=payload.reading_date or datetime.now().strftime("%Y-%m-%d"),
        status=payload.status or "unread",
        completion_date=payload.completion_date,
        content=payload.content,
        word_count=word_count,
        char_count=char_count,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # Initialize empty PersonalNote record
    note = PersonalNote(reading_id=reading.id, user_notes="", key_concepts="[]")
    db.add(note)
    db.commit()

    return reading

@router.post("/upload", response_model=ReadingResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    author: Optional[str] = Form("Unknown"),
    source_url: Optional[str] = Form(None),
    topic: Optional[str] = Form("General"),
    reading_date: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    filename = file.filename.lower()
    file_bytes = await file.read()
    
    if filename.endswith(".pdf"):
        try:
            content, pages = extract_text_from_pdf(file_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
    elif filename.endswith(".txt") or filename.endswith(".md"):
        content = extract_text_from_txt(file_bytes)
    else:
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file format. Please upload a PDF, TXT, or Markdown document."
        )

    if not content or len(content.strip()) < 10:
        raise HTTPException(
            status_code=400, 
            detail="The uploaded file contains insufficient extractable text."
        )

    word_count, char_count = compute_text_stats(content)
    reading = Reading(
        title=title,
        author=author or "Unknown",
        source_url=source_url,
        topic=topic or "General",
        reading_date=reading_date or datetime.now().strftime("%Y-%m-%d"),
        status="unread",
        content=content,
        word_count=word_count,
        char_count=char_count,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    note = PersonalNote(reading_id=reading.id, user_notes="", key_concepts="[]")
    db.add(note)
    db.commit()

    return reading

@router.get("/{id}", response_model=ReadingResponse)
def get_reading(id: int, db: Session = Depends(get_db)):
    reading = db.query(Reading).filter(Reading.id == id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")
    return reading

@router.put("/{id}", response_model=ReadingResponse)
def update_reading(id: int, payload: ReadingUpdate, db: Session = Depends(get_db)):
    reading = db.query(Reading).filter(Reading.id == id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")
    
    update_data = payload.model_dump(exclude_unset=True)
    if "content" in update_data and update_data["content"]:
        word_count, char_count = compute_text_stats(update_data["content"])
        reading.word_count = word_count
        reading.char_count = char_count
    
    for key, val in update_data.items():
        setattr(reading, key, val)
        
    reading.updated_at = utc_now()
    db.commit()
    db.refresh(reading)
    return reading

@router.delete("/{id}")
def delete_reading(id: int, db: Session = Depends(get_db)):
    reading = db.query(Reading).filter(Reading.id == id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")
    db.delete(reading)
    db.commit()
    return {"status": "success", "message": f"Reading '{reading.title}' deleted successfully."}

@router.get("/{id}/workspace")
def get_reading_workspace(id: int, db: Session = Depends(get_db)):
    """Fetch complete workspace bundle for study mode."""
    reading = db.query(Reading).filter(Reading.id == id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")
    
    summary = db.query(Summary).filter(Summary.reading_id == id).first()
    note = db.query(PersonalNote).filter(PersonalNote.reading_id == id).first()
    idea_cards = db.query(IdeaCard).filter(IdeaCard.reading_id == id).all()
    flashcards = db.query(Flashcard).filter(Flashcard.reading_id == id).all()
    questions = db.query(DiscussionQuestion).filter(DiscussionQuestion.reading_id == id).all()
    verifications = db.query(VerificationRecord).filter(VerificationRecord.reading_id == id).all()

    import json
    parsed_concepts = []
    if note and note.key_concepts:
        try:
            parsed_concepts = json.loads(note.key_concepts)
        except Exception:
            parsed_concepts = [c.strip() for c in note.key_concepts.split(",") if c.strip()]

    return {
        "reading": {
            "id": reading.id,
            "title": reading.title,
            "author": reading.author,
            "source_url": reading.source_url,
            "topic": reading.topic,
            "reading_date": reading.reading_date,
            "status": reading.status,
            "completion_date": reading.completion_date,
            "content": reading.content,
            "word_count": reading.word_count,
            "char_count": reading.char_count,
            "created_at": reading.created_at,
        },
        "summary": {
            "id": summary.id if summary else None,
            "quick_summary": summary.quick_summary if summary else "",
            "standard_summary": summary.standard_summary if summary else "",
            "detailed_summary": summary.detailed_summary if summary else "",
            "model_name": summary.model_name if summary else "gemini-3.8-flash",
            "is_ai_generated": summary.is_ai_generated if summary else False,
            "updated_at": summary.updated_at if summary else None
        } if summary else None,
        "notes": {
            "user_notes": note.user_notes if note else "",
            "key_concepts": parsed_concepts,
            "updated_at": note.updated_at if note else None
        },
        "idea_cards": [
            {
                "id": c.id, 
                "title": c.title, 
                "explanation": c.explanation, 
                "card_type": c.card_type, 
                "is_favorite": c.is_favorite
            } for c in idea_cards
        ],
        "flashcards": [
            {
                "id": f.id, 
                "question": f.question, 
                "answer": f.answer, 
                "confidence_rating": f.confidence_rating, 
                "review_count": f.review_count, 
                "last_reviewed_at": f.last_reviewed_at
            } for f in flashcards
        ],
        "questions": [
            {
                "id": q.id, 
                "question": q.question, 
                "question_type": q.question_type, 
                "user_answer": q.user_answer
            } for q in questions
        ],
        "verifications": [
            {
                "id": v.id, 
                "claim_text": v.claim_text, 
                "source_excerpt": v.source_excerpt, 
                "external_url": v.external_url, 
                "status": v.status, 
                "correction": v.correction, 
                "notes": v.notes, 
                "verified_at": v.verified_at
            } for v in verifications
        ]
    }
