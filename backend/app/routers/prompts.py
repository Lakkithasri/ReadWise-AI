from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PromptTemplate, PromptVersion, PromptTestRun, Reading
from app.schemas import (
    PromptTemplateResponse, PromptTemplateCreate, PromptVersionResponse,
    PromptVersionCreate, PromptTestRunCreate, PromptTestRunRating, PromptTestRunResponse
)
from app.services.gemini_service import run_custom_prompt
from app.config import settings

router = APIRouter(prefix="/api/prompts", tags=["Prompt Engineering Lab"])

def utc_now():
    return datetime.now(timezone.utc)

@router.get("", response_model=List[PromptTemplateResponse])
def get_prompts(db: Session = Depends(get_db)):
    return db.query(PromptTemplate).order_by(PromptTemplate.created_at.desc()).all()

@router.post("", response_model=PromptTemplateResponse)
def create_prompt_template(payload: PromptTemplateCreate, db: Session = Depends(get_db)):
    template = PromptTemplate(
        title=payload.title,
        category=payload.category,
        description=payload.description or "",
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(template)
    db.flush()

    initial_version = PromptVersion(
        prompt_id=template.id,
        version_number=1,
        template_text=payload.initial_template_text,
        system_instruction=payload.system_instruction or "",
        created_at=utc_now()
    )
    db.add(initial_version)
    db.commit()
    db.refresh(template)
    return template

@router.post("/{id}/versions", response_model=PromptVersionResponse)
def add_prompt_version(id: int, payload: PromptVersionCreate, db: Session = Depends(get_db)):
    template = db.query(PromptTemplate).filter(PromptTemplate.id == id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Prompt template not found.")

    latest_ver = db.query(PromptVersion).filter(
        PromptVersion.prompt_id == id
    ).order_by(PromptVersion.version_number.desc()).first()

    next_num = (latest_ver.version_number + 1) if latest_ver else 1

    version = PromptVersion(
        prompt_id=id,
        version_number=next_num,
        template_text=payload.template_text,
        system_instruction=payload.system_instruction or "",
        created_at=utc_now()
    )
    db.add(version)
    template.updated_at = utc_now()
    db.commit()
    db.refresh(version)
    return version

@router.post("/versions/{version_id}/run", response_model=PromptTestRunResponse)
def run_prompt_version(
    version_id: int, 
    payload: PromptTestRunCreate, 
    db: Session = Depends(get_db)
):
    version = db.query(PromptVersion).filter(PromptVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Prompt version not found.")

    reading = db.query(Reading).filter(Reading.id == payload.reading_id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")

    if not settings.has_gemini_key:
        raise HTTPException(
            status_code=400,
            detail="Gemini API Key is not configured. Please add your key in Settings to run prompt tests."
        )

    try:
        output_text = run_custom_prompt(
            prompt_template=version.template_text,
            system_instruction=version.system_instruction,
            reading_content=reading.content,
            custom_input=payload.custom_input
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Prompt run failed: {str(e)}")

    test_run = PromptTestRun(
        prompt_version_id=version.id,
        reading_id=reading.id,
        output_text=output_text,
        clarity_rating=4,
        accuracy_rating=4,
        completeness_rating=4,
        usefulness_rating=4,
        notes="",
        created_at=utc_now()
    )
    db.add(test_run)
    db.commit()
    db.refresh(test_run)
    return test_run

@router.post("/runs/{run_id}/rate", response_model=PromptTestRunResponse)
def rate_test_run(run_id: int, payload: PromptTestRunRating, db: Session = Depends(get_db)):
    run = db.query(PromptTestRun).filter(PromptTestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Prompt test run not found.")

    run.clarity_rating = payload.clarity_rating
    run.accuracy_rating = payload.accuracy_rating
    run.completeness_rating = payload.completeness_rating
    run.usefulness_rating = payload.usefulness_rating
    if payload.notes is not None:
        run.notes = payload.notes

    db.commit()
    db.refresh(run)
    return run

@router.get("/runs")
def get_prompt_runs(reading_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Fetch test runs for side-by-side comparison."""
    query = db.query(PromptTestRun)
    if reading_id:
        query = query.filter(PromptTestRun.reading_id == reading_id)
    runs = query.order_by(PromptTestRun.created_at.desc()).all()

    return [
        {
            "id": r.id,
            "version_id": r.prompt_version_id,
            "version_number": r.version.version_number if r.version else 1,
            "prompt_title": r.version.template.title if r.version and r.version.template else "Prompt",
            "prompt_text": r.version.template_text if r.version else "",
            "system_instruction": r.version.system_instruction if r.version else "",
            "reading_id": r.reading_id,
            "reading_title": r.reading.title if r.reading else "Reading",
            "output_text": r.output_text,
            "clarity_rating": r.clarity_rating,
            "accuracy_rating": r.accuracy_rating,
            "completeness_rating": r.completeness_rating,
            "usefulness_rating": r.usefulness_rating,
            "average_rating": round(
                (r.clarity_rating + r.accuracy_rating + r.completeness_rating + r.usefulness_rating) / 4.0, 
                1
            ),
            "notes": r.notes,
            "created_at": r.created_at
        }
        for r in runs
    ]
