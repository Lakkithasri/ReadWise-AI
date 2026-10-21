import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.seed_data import seed_database
from app.services.scoring_service import heuristic_grade_recall, calculate_seven_day_schedule
from app.services.text_extractor import compute_text_stats, clean_extracted_text

# Use in-memory SQLite with StaticPool so tables persist across session queries
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db=db, force=True)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "ReadWise AI"

def test_readings_list_seeded():
    response = client.get("/api/readings")
    assert response.status_code == 200
    readings = response.json()
    # At least 5 readings seeded
    assert len(readings) >= 5
    first = readings[0]
    assert "title" in first
    assert "word_count" in first
    assert first["word_count"] > 0

def test_create_and_delete_reading():
    payload = {
        "title": "Test Reading on Cognitive Load",
        "author": "John Sweller",
        "source_url": "https://example.com/cognitive-load",
        "topic": "Psychology",
        "reading_date": "2026-10-16",
        "status": "unread",
        "content": "Cognitive load theory explains the limits of working memory during complex learning tasks."
    }
    create_res = client.post("/api/readings", json=payload)
    assert create_res.status_code == 200
    new_reading = create_res.json()
    assert new_reading["title"] == payload["title"]
    assert new_reading["word_count"] > 5
    reading_id = new_reading["id"]

    # Retrieve workspace
    ws_res = client.get(f"/api/readings/{reading_id}/workspace")
    assert ws_res.status_code == 200
    ws_data = ws_res.json()
    assert ws_data["reading"]["id"] == reading_id
    assert "notes" in ws_data

    # Delete
    del_res = client.delete(f"/api/readings/{reading_id}")
    assert del_res.status_code == 200

    # Ensure 404 after deletion
    get_res = client.get(f"/api/readings/{reading_id}")
    assert get_res.status_code == 404

def test_heuristic_recall_scoring():
    q = "What is active recall?"
    ref = "Active recall is the practice of retrieving information from memory without looking at notes, strengthening neural retrieval pathways."
    
    # Good student answer
    good_student = "It means retrieving facts from your memory without consulting study notes, which reinforces neural pathways."
    grade_good = heuristic_grade_recall(q, ref, good_student)
    assert grade_good["score"] >= 50.0
    assert len(grade_good["correct_concepts"]) > 0

    # Empty answer
    grade_empty = heuristic_grade_recall(q, ref, "")
    assert grade_empty["score"] == 0.0

def test_seven_day_schedule_calculation():
    now = datetime(2026, 10, 16, 12, 0, 0, tzinfo=timezone.utc)
    scheduled = calculate_seven_day_schedule(now)
    delta = scheduled - now
    assert delta.days == 7

def test_recall_due_tests():
    due_res = client.get("/api/recall/due")
    assert due_res.status_code == 200
    due_data = due_res.json()
    assert "count" in due_data
    assert "due_tests" in due_data

def test_learning_comparison_metrics():
    exp_res = client.get("/api/experiments/comparison")
    assert exp_res.status_code == 200
    data = exp_res.json()
    assert "summary" in data
    assert "session_points" in data
    assert len(data["session_points"]) > 0
    assert "methodology_disclaimer" in data

def test_dashboard_analytics():
    dash_res = client.get("/api/analytics/dashboard")
    assert dash_res.status_code == 200
    stats = dash_res.json()
    assert stats["total_readings"] >= 5
    assert stats["saved_summaries"] >= 5
    assert stats["total_flashcards"] > 0
    assert "experiment_metrics" in stats
