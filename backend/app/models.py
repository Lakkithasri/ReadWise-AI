from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    author = Column(String(255), default="Unknown")
    source_url = Column(String(512), nullable=True)
    topic = Column(String(100), default="General")
    reading_date = Column(String(50), default="")
    status = Column(String(50), default="unread")  # unread, reading, completed
    completion_date = Column(String(50), nullable=True)
    content = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    char_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    summary = relationship("Summary", back_populates="reading", uselist=False, cascade="all, delete-orphan")
    notes = relationship("PersonalNote", back_populates="reading", uselist=False, cascade="all, delete-orphan")
    idea_cards = relationship("IdeaCard", back_populates="reading", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="reading", cascade="all, delete-orphan")
    discussion_questions = relationship("DiscussionQuestion", back_populates="reading", cascade="all, delete-orphan")
    recall_tests = relationship("RecallTest", back_populates="reading", cascade="all, delete-orphan")
    experiment_sessions = relationship("ExperimentSession", back_populates="reading", cascade="all, delete-orphan")
    verifications = relationship("VerificationRecord", back_populates="reading", cascade="all, delete-orphan")
    reflections = relationship("Reflection", back_populates="reading")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("readings.id", ondelete="CASCADE"), nullable=False, unique=True)
    quick_summary = Column(Text, default="")         # ~50 words
    standard_summary = Column(Text, default="")      # ~150 words
    detailed_summary = Column(Text, default="")      # ~300 words
    is_ai_generated = Column(Boolean, default=True)
    model_name = Column(String(100), default="gemini-3.8-flash")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    reading = relationship("Reading", back_populates="summary")


class PersonalNote(Base):
    __tablename__ = "personal_notes"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("readings.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_notes = Column(Text, default="")
    key_concepts = Column(Text, default="[]")  # JSON encoded list of strings
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    reading = relationship("Reading", back_populates="notes")


class IdeaCard(Base):
    __tablename__ = "idea_cards"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("readings.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    is_favorite = Column(Boolean, default=False)
    card_type = Column(String(50), default="idea")  # idea, concept, finding
    created_at = Column(DateTime, default=utc_now)

    reading = relationship("Reading", back_populates="idea_cards")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("readings.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    confidence_rating = Column(Integer, default=3)  # 1 to 5
    review_count = Column(Integer, default=0)
    last_reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    reading = relationship("Reading", back_populates="flashcards")


class DiscussionQuestion(Base):
    __tablename__ = "discussion_questions"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("readings.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    question_type = Column(String(50), default="discussion")  # discussion, application
    user_answer = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)

    reading = relationship("Reading", back_populates="discussion_questions")


class RecallTest(Base):
    __tablename__ = "recall_tests"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("readings.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    test_type = Column(String(50), default="initial")  # initial, seven_day
    scheduled_for = Column(DateTime, nullable=False)   # Target date (initial=now, seven_day=now+7d)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="pending")     # pending, completed
    overall_score = Column(Float, nullable=True)       # 0.0 - 100.0
    created_at = Column(DateTime, default=utc_now)

    reading = relationship("Reading", back_populates="recall_tests")
    items = relationship("RecallTestItem", back_populates="test", cascade="all, delete-orphan")


class RecallTestItem(Base):
    __tablename__ = "recall_test_items"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("recall_tests.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    reference_answer = Column(Text, nullable=False)
    user_response = Column(Text, nullable=True)
    score = Column(Float, nullable=True)               # 0.0 - 100.0
    feedback = Column(Text, nullable=True)
    correct_concepts = Column(Text, nullable=True)     # JSON string array
    missing_concepts = Column(Text, nullable=True)     # JSON string array

    test = relationship("RecallTest", back_populates="items")


class ExperimentSession(Base):
    __tablename__ = "experiment_sessions"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("readings.id", ondelete="CASCADE"), nullable=False)
    method = Column(String(50), nullable=False)        # normal, ai_assisted
    start_time = Column(DateTime, default=utc_now)
    completion_time = Column(DateTime, default=utc_now)
    duration_minutes = Column(Float, default=15.0)
    initial_score = Column(Float, default=0.0)
    seven_day_score = Column(Float, nullable=True)
    confidence_rating = Column(Integer, default=3)     # 1 - 5
    observations = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)

    reading = relationship("Reading", back_populates="experiment_sessions")


class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("readings.id", ondelete="CASCADE"), nullable=False)
    claim_text = Column(Text, nullable=False)
    source_excerpt = Column(Text, default="")
    external_url = Column(String(512), nullable=True)
    status = Column(String(50), default="unverified")  # supported, unsupported, contradicted, outdated, unverified
    correction = Column(Text, default="")
    notes = Column(Text, default="")
    verified_at = Column(DateTime, default=utc_now)

    reading = relationship("Reading", back_populates="verifications")


class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="summary")
    description = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    versions = relationship("PromptVersion", back_populates="template", cascade="all, delete-orphan")


class PromptVersion(Base):
    __tablename__ = "prompt_versions"

    id = Column(Integer, primary_key=True, index=True)
    prompt_id = Column(Integer, ForeignKey("prompt_templates.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, default=1)
    template_text = Column(Text, nullable=False)
    system_instruction = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)

    template = relationship("PromptTemplate", back_populates="versions")
    runs = relationship("PromptTestRun", back_populates="version", cascade="all, delete-orphan")


class PromptTestRun(Base):
    __tablename__ = "prompt_test_runs"

    id = Column(Integer, primary_key=True, index=True)
    prompt_version_id = Column(Integer, ForeignKey("prompt_versions.id", ondelete="CASCADE"), nullable=False)
    reading_id = Column(Integer, ForeignKey("readings.id", ondelete="CASCADE"), nullable=False)
    output_text = Column(Text, nullable=False)
    clarity_rating = Column(Integer, default=4)       # 1 - 5
    accuracy_rating = Column(Integer, default=4)      # 1 - 5
    completeness_rating = Column(Integer, default=4)  # 1 - 5
    usefulness_rating = Column(Integer, default=4)    # 1 - 5
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)

    version = relationship("PromptVersion", back_populates="runs")
    reading = relationship("Reading")


class Reflection(Base):
    __tablename__ = "reflections"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("readings.id", ondelete="SET NULL"), nullable=True)
    date = Column(String(50), default="")
    did_ai_help = Column(Text, default="")
    remember_without_notes = Column(Text, default="")
    deep_thinking_vs_dependence = Column(Text, default="")
    misunderstood_concepts = Column(Text, default="")
    future_changes = Column(Text, default="")
    general_notes = Column(Text, default="")
    ai_suggestions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    reading = relationship("Reading", back_populates="reflections")


class AIToolLog(Base):
    __tablename__ = "ai_tool_logs"

    id = Column(Integer, primary_key=True, index=True)
    tool_name = Column(String(100), nullable=False)   # ChatGPT, Google Gemini, Google NotebookLM, Notion/Obsidian
    task_performed = Column(String(255), nullable=False)
    prompt_used = Column(Text, default="")
    input_data = Column(Text, default="")
    output_received = Column(Text, default="")
    corrections = Column(Text, default="")
    strengths_observed = Column(Text, default="")
    limitations_observed = Column(Text, default="")
    privacy_notes = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)
