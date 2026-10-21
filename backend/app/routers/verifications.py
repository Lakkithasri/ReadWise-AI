from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import VerificationRecord, Reading
from app.schemas import (
    VerificationRecordResponse, VerificationRecordCreate, VerificationRecordUpdate
)
from app.services.gemini_service import verify_claim_against_source
from app.config import settings

router = APIRouter(prefix="/api/verifications", tags=["Verification Lab"])

def utc_now():
    return datetime.now(timezone.utc)

@router.get("", response_model=List[VerificationRecordResponse])
def get_verifications(
    status: Optional[str] = Query(None),
    reading_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(VerificationRecord)
    if status and status.lower() != "all":
        query = query.filter(VerificationRecord.status == status.lower())
    if reading_id:
        query = query.filter(VerificationRecord.reading_id == reading_id)
    return query.order_by(VerificationRecord.verified_at.desc()).all()

@router.post("", response_model=VerificationRecordResponse)
def create_verification(
    payload: VerificationRecordCreate, 
    auto_check: bool = Query(False),
    db: Session = Depends(get_db)
):
    reading = db.query(Reading).filter(Reading.id == payload.reading_id).first()
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")

    status = payload.status
    source_excerpt = payload.source_excerpt or ""
    correction = payload.correction or ""
    notes = payload.notes or ""

    if auto_check and settings.has_gemini_key:
        try:
            ai_check = verify_claim_against_source(
                claim=payload.claim_text,
                source_text=reading.content
            )
            status = ai_check.get("status", status)
            source_excerpt = ai_check.get("source_excerpt", source_excerpt)
            correction = ai_check.get("correction", correction)
            notes = ai_check.get("notes", notes)
        except Exception:
            pass  # keep user provided values

    record = VerificationRecord(
        reading_id=payload.reading_id,
        claim_text=payload.claim_text,
        source_excerpt=source_excerpt,
        external_url=payload.external_url,
        status=status,
        correction=correction,
        notes=notes,
        verified_at=utc_now()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.put("/{id}", response_model=VerificationRecordResponse)
def update_verification(id: int, payload: VerificationRecordUpdate, db: Session = Depends(get_db)):
    rec = db.query(VerificationRecord).filter(VerificationRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Verification record not found.")

    if payload.status is not None:
        rec.status = payload.status
    if payload.source_excerpt is not None:
        rec.source_excerpt = payload.source_excerpt
    if payload.external_url is not None:
        rec.external_url = payload.external_url
    if payload.correction is not None:
        rec.correction = payload.correction
    if payload.notes is not None:
        rec.notes = payload.notes

    rec.verified_at = utc_now()
    db.commit()
    db.refresh(rec)
    return rec

@router.delete("/{id}")
def delete_verification(id: int, db: Session = Depends(get_db)):
    rec = db.query(VerificationRecord).filter(VerificationRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Verification record not found.")
    db.delete(rec)
    db.commit()
    return {"status": "success", "message": "Verification record deleted."}

@router.get("/report")
def get_verification_report(db: Session = Depends(get_db)):
    """Summary report of verified claims, contradictions, and unresolved statements."""
    records = db.query(VerificationRecord).all()
    
    total = len(records)
    supported = sum(1 for r in records if r.status == "supported")
    unsupported = sum(1 for r in records if r.status == "unsupported")
    contradicted = sum(1 for r in records if r.status == "contradicted")
    outdated = sum(1 for r in records if r.status == "outdated")
    unverified = sum(1 for r in records if r.status == "unverified")

    return {
        "total_claims_audited": total,
        "counts": {
            "supported": supported,
            "unsupported": unsupported,
            "contradicted": contradicted,
            "outdated": outdated,
            "unverified": unverified
        },
        "flagged_issues_count": unsupported + contradicted + outdated + unverified,
        "records": [
            {
                "id": r.id,
                "reading_title": r.reading.title if r.reading else "Reading",
                "claim": r.claim_text,
                "status": r.status,
                "correction": r.correction,
                "source_excerpt": r.source_excerpt,
                "external_url": r.external_url,
                "verified_at": r.verified_at
            }
            for r in records
        ]
    }
