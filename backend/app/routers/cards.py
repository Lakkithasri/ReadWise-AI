import json
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Reading, IdeaCard, Flashcard, DiscussionQuestion, PersonalNote
from app.schemas import (
    IdeaCardResponse, IdeaCardCreate, FlashcardResponse, FlashcardCreate,
    FlashcardReview, DiscussionQuestionResponse, DiscussionQuestionAnswer,
    GenerateCardsRequest, NoteResponse, NoteUpdate
)
from app.services.gemini_service import generate_study_cards

router = APIRouter(prefix="/api/cards", tags=["Cards & Study Material"])

def utc_now():
    return datetime.now(timezone.utc)

@router.post("/generate")
def generate_cards_and_questions(payload: GenerateCardsRequest, db: Session = Depends(get_db)):
    reading = db.query(Reading).filter(Reading.id == payload.reading_id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")

    try:
        materials = generate_study_cards(text=reading.content, title=reading.title)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API study materials generation failed: {str(e)}")

    # Clear previous generated cards to prevent duplicates if regenerating
    db.query(IdeaCard).filter(IdeaCard.reading_id == reading.id).delete()
    db.query(Flashcard).filter(Flashcard.reading_id == reading.id).delete()
    db.query(DiscussionQuestion).filter(DiscussionQuestion.reading_id == reading.id).delete()

    created_ideas = []
    for idea in materials.get("key_ideas", []):
        card = IdeaCard(
            reading_id=reading.id,
            title=idea.get("title", "Key Idea"),
            explanation=idea.get("explanation", ""),
            card_type="idea",
            created_at=utc_now()
        )
        db.add(card)
        created_ideas.append(card)

    created_flashcards = []
    for fc in materials.get("flashcards", []):
        flashcard = Flashcard(
            reading_id=reading.id,
            question=fc.get("question", ""),
            answer=fc.get("answer", ""),
            confidence_rating=3,
            review_count=0,
            created_at=utc_now()
        )
        db.add(flashcard)
        created_flashcards.append(flashcard)

    created_questions = []
    for dq in materials.get("discussion_questions", []):
        db.add(DiscussionQuestion(
            reading_id=reading.id,
            question=dq if isinstance(dq, str) else dq.get("question", ""),
            question_type="discussion",
            user_answer="",
            created_at=utc_now()
        ))

    for aq in materials.get("application_questions", []):
        db.add(DiscussionQuestion(
            reading_id=reading.id,
            question=aq if isinstance(aq, str) else aq.get("question", ""),
            question_type="application",
            user_answer="",
            created_at=utc_now()
        ))

    db.commit()
    return {
        "status": "success",
        "ideas_count": len(created_ideas),
        "flashcards_count": len(created_flashcards),
        "questions_count": len(materials.get("discussion_questions", [])) + len(materials.get("application_questions", []))
    }

# Idea Cards Endpoints
@router.get("/ideas/{reading_id}", response_model=List[IdeaCardResponse])
def get_idea_cards(reading_id: int, db: Session = Depends(get_db)):
    return db.query(IdeaCard).filter(IdeaCard.reading_id == reading_id).all()

@router.post("/ideas", response_model=IdeaCardResponse)
def create_idea_card(payload: IdeaCardCreate, db: Session = Depends(get_db)):
    card = IdeaCard(
        reading_id=payload.reading_id,
        title=payload.title,
        explanation=payload.explanation,
        is_favorite=payload.is_favorite,
        card_type=payload.card_type,
        created_at=utc_now()
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

@router.put("/ideas/{id}/favorite")
def toggle_favorite_card(id: int, db: Session = Depends(get_db)):
    card = db.query(IdeaCard).filter(IdeaCard.id == id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Idea card not found.")
    card.is_favorite = not card.is_favorite
    db.commit()
    return {"id": card.id, "is_favorite": card.is_favorite}

@router.delete("/ideas/{id}")
def delete_idea_card(id: int, db: Session = Depends(get_db)):
    card = db.query(IdeaCard).filter(IdeaCard.id == id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Idea card not found.")
    db.delete(card)
    db.commit()
    return {"status": "success", "message": "Card deleted."}

# Flashcards Endpoints
@router.get("/flashcards/{reading_id}", response_model=List[FlashcardResponse])
def get_flashcards(reading_id: int, db: Session = Depends(get_db)):
    return db.query(Flashcard).filter(Flashcard.reading_id == reading_id).all()

@router.post("/flashcards", response_model=FlashcardResponse)
def create_flashcard(payload: FlashcardCreate, db: Session = Depends(get_db)):
    fc = Flashcard(
        reading_id=payload.reading_id,
        question=payload.question,
        answer=payload.answer,
        confidence_rating=payload.confidence_rating,
        review_count=0,
        created_at=utc_now()
    )
    db.add(fc)
    db.commit()
    db.refresh(fc)
    return fc

@router.post("/flashcards/{id}/review", response_model=FlashcardResponse)
def review_flashcard(id: int, payload: FlashcardReview, db: Session = Depends(get_db)):
    fc = db.query(Flashcard).filter(Flashcard.id == id).first()
    if not fc:
        raise HTTPException(status_code=404, detail="Flashcard not found.")
    fc.confidence_rating = payload.confidence_rating
    fc.review_count += 1
    fc.last_reviewed_at = utc_now()
    db.commit()
    db.refresh(fc)
    return fc

@router.delete("/flashcards/{id}")
def delete_flashcard(id: int, db: Session = Depends(get_db)):
    fc = db.query(Flashcard).filter(Flashcard.id == id).first()
    if not fc:
        raise HTTPException(status_code=404, detail="Flashcard not found.")
    db.delete(fc)
    db.commit()
    return {"status": "success", "message": "Flashcard deleted."}

# Discussion Questions Endpoints
@router.get("/questions/{reading_id}", response_model=List[DiscussionQuestionResponse])
def get_questions(reading_id: int, db: Session = Depends(get_db)):
    return db.query(DiscussionQuestion).filter(DiscussionQuestion.reading_id == reading_id).all()

@router.put("/questions/{id}/answer", response_model=DiscussionQuestionResponse)
def answer_discussion_question(id: int, payload: DiscussionQuestionAnswer, db: Session = Depends(get_db)):
    q = db.query(DiscussionQuestion).filter(DiscussionQuestion.id == id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found.")
    q.user_answer = payload.user_answer
    db.commit()
    db.refresh(q)
    return q

# Personal Notes Endpoints
@router.get("/notes/{reading_id}", response_model=NoteResponse)
def get_personal_notes(reading_id: int, db: Session = Depends(get_db)):
    note = db.query(PersonalNote).filter(PersonalNote.reading_id == reading_id).first()
    if not note:
        note = PersonalNote(reading_id=reading_id, user_notes="", key_concepts="[]")
        db.add(note)
        db.commit()
        db.refresh(note)
    
    concepts = []
    if note.key_concepts:
        try:
            concepts = json.loads(note.key_concepts)
        except Exception:
            concepts = [c.strip() for c in note.key_concepts.split(",") if c.strip()]
    return NoteResponse(
        id=note.id,
        reading_id=note.reading_id,
        user_notes=note.user_notes,
        key_concepts=concepts,
        updated_at=note.updated_at
    )

@router.put("/notes/{reading_id}", response_model=NoteResponse)
def update_personal_notes(reading_id: int, payload: NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(PersonalNote).filter(PersonalNote.reading_id == reading_id).first()
    if not note:
        note = PersonalNote(reading_id=reading_id)
        db.add(note)
    
    note.user_notes = payload.user_notes
    note.key_concepts = json.dumps(payload.key_concepts or [])
    note.updated_at = utc_now()
    db.commit()
    db.refresh(note)

    return NoteResponse(
        id=note.id,
        reading_id=note.reading_id,
        user_notes=note.user_notes,
        key_concepts=payload.key_concepts or [],
        updated_at=note.updated_at
    )
