from typing import List, Optional, Dict
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Reading
from app.config import settings
from app.services.gemini_service import answer_reading_chat

router = APIRouter(prefix="/api/chat", tags=["AI Chat Tutor"])

class ChatTurn(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatTurn]] = []
    reading_id: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    model: str
    reading_title: Optional[str] = None

@router.post("/message", response_model=ChatResponse)
def handle_chat_message(payload: ChatRequest, db: Session = Depends(get_db)):
    """
    Generate an academic AI tutor response using Gemini 3.8 Flash,
    optionally incorporating context from the active reading.
    """
    clean_msg = payload.message.strip()
    if not clean_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    context_text = None
    reading_title = None

    if payload.reading_id:
        reading = db.query(Reading).filter(Reading.id == payload.reading_id).first()
        if reading:
            reading_title = reading.title
            context_text = reading.content_text

    if not settings.has_gemini_key:
        return ChatResponse(
            response=(
                "I am your ReadWise AI Academic Tutor. To enable live conversational AI responses, "
                "please ensure your Google Gemini API key is configured in the Settings page or backend/.env file."
            ),
            model="unconfigured",
            reading_title=reading_title
        )

    try:
        history_dicts = [{"role": t.role, "text": t.text} for t in payload.history]
        reply = answer_reading_chat(
            message=clean_msg,
            history=history_dicts,
            context_text=context_text,
            reading_title=reading_title
        )
        return ChatResponse(
            response=reply,
            model=settings.GEMINI_MODEL,
            reading_title=reading_title
        )
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            fallback = "I've hit the Gemini free-tier rate limit (15 RPM). Please wait 30 seconds and try again."
        elif "API_KEY" in error_msg.upper():
            fallback = "Your Gemini API key appears invalid or expired. Please check your key in the Settings page."
        else:
            fallback = f"Encountered an issue communicating with the AI model: {error_msg}"

        return ChatResponse(
            response=fallback,
            model=settings.GEMINI_MODEL,
            reading_title=reading_title
        )
