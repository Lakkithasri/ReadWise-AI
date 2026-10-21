from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Reading schemas
class ReadingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    author: Optional[str] = "Unknown"
    source_url: Optional[str] = None
    topic: Optional[str] = "General"
    reading_date: Optional[str] = ""
    status: Optional[str] = "unread"
    completion_date: Optional[str] = None
    content: str = Field(..., min_length=1)

class ReadingCreate(ReadingBase):
    pass

class ReadingUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    source_url: Optional[str] = None
    topic: Optional[str] = None
    reading_date: Optional[str] = None
    status: Optional[str] = None
    completion_date: Optional[str] = None
    content: Optional[str] = None

class ReadingResponse(ReadingBase):
    id: int
    word_count: int
    char_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Summary schemas
class SummaryBase(BaseModel):
    quick_summary: str
    standard_summary: str
    detailed_summary: str
    is_ai_generated: bool = True
    model_name: Optional[str] = "gemini-3.8-flash"

class SummaryCreate(SummaryBase):
    reading_id: int

class SummaryUpdate(BaseModel):
    quick_summary: Optional[str] = None
    standard_summary: Optional[str] = None
    detailed_summary: Optional[str] = None

class SummaryResponse(SummaryBase):
    id: int
    reading_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Note schemas
class NoteUpdate(BaseModel):
    user_notes: str
    key_concepts: Optional[List[str]] = []

class NoteResponse(BaseModel):
    id: int
    reading_id: int
    user_notes: str
    key_concepts: List[str]
    updated_at: datetime

    class Config:
        from_attributes = True

# Idea Card schemas
class IdeaCardBase(BaseModel):
    title: str
    explanation: str
    is_favorite: bool = False
    card_type: str = "idea"

class IdeaCardCreate(IdeaCardBase):
    reading_id: int

class IdeaCardResponse(IdeaCardBase):
    id: int
    reading_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Flashcard schemas
class FlashcardBase(BaseModel):
    question: str
    answer: str
    confidence_rating: int = 3
    review_count: int = 0

class FlashcardCreate(FlashcardBase):
    reading_id: int

class FlashcardReview(BaseModel):
    confidence_rating: int = Field(..., ge=1, le=5)

class FlashcardResponse(FlashcardBase):
    id: int
    reading_id: int
    last_reviewed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Discussion Question schemas
class DiscussionQuestionBase(BaseModel):
    question: str
    question_type: str = "discussion"
    user_answer: Optional[str] = ""

class DiscussionQuestionCreate(DiscussionQuestionBase):
    reading_id: int

class DiscussionQuestionAnswer(BaseModel):
    user_answer: str

class DiscussionQuestionResponse(DiscussionQuestionBase):
    id: int
    reading_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Recall Test schemas
class RecallTestItemResponse(BaseModel):
    id: int
    question: str
    reference_answer: str
    user_response: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    correct_concepts: Optional[List[str]] = None
    missing_concepts: Optional[List[str]] = None

    class Config:
        from_attributes = True

class RecallTestResponse(BaseModel):
    id: int
    reading_id: int
    title: str
    test_type: str
    scheduled_for: datetime
    completed_at: Optional[datetime] = None
    status: str
    overall_score: Optional[float] = None
    created_at: datetime
    items: List[RecallTestItemResponse] = []

    class Config:
        from_attributes = True

class RecallSubmissionItem(BaseModel):
    item_id: int
    user_response: str

class RecallSubmission(BaseModel):
    answers: List[RecallSubmissionItem]

# Experiment Session schemas
class ExperimentSessionCreate(BaseModel):
    reading_id: int
    method: str  # normal or ai_assisted
    start_time: datetime
    completion_time: datetime
    duration_minutes: float
    initial_score: float
    seven_day_score: Optional[float] = None
    confidence_rating: int = Field(3, ge=1, le=5)
    observations: Optional[str] = ""

class ExperimentSessionResponse(ExperimentSessionCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Verification Record schemas
class VerificationRecordBase(BaseModel):
    claim_text: str
    source_excerpt: Optional[str] = ""
    external_url: Optional[str] = None
    status: str = "unverified"
    correction: Optional[str] = ""
    notes: Optional[str] = ""

class VerificationRecordCreate(VerificationRecordBase):
    reading_id: int

class VerificationRecordUpdate(BaseModel):
    source_excerpt: Optional[str] = None
    external_url: Optional[str] = None
    status: Optional[str] = None
    correction: Optional[str] = None
    notes: Optional[str] = None

class VerificationRecordResponse(VerificationRecordBase):
    id: int
    reading_id: int
    verified_at: datetime

    class Config:
        from_attributes = True

# Prompt Library schemas
class PromptVersionResponse(BaseModel):
    id: int
    prompt_id: int
    version_number: int
    template_text: str
    system_instruction: str
    created_at: datetime

    class Config:
        from_attributes = True

class PromptTemplateBase(BaseModel):
    title: str
    category: str = "summary"
    description: Optional[str] = ""

class PromptTemplateCreate(PromptTemplateBase):
    initial_template_text: str
    system_instruction: Optional[str] = ""

class PromptVersionCreate(BaseModel):
    template_text: str
    system_instruction: Optional[str] = ""

class PromptTestRunCreate(BaseModel):
    reading_id: int
    custom_input: Optional[str] = None

class PromptTestRunRating(BaseModel):
    clarity_rating: int = Field(..., ge=1, le=5)
    accuracy_rating: int = Field(..., ge=1, le=5)
    completeness_rating: int = Field(..., ge=1, le=5)
    usefulness_rating: int = Field(..., ge=1, le=5)
    notes: Optional[str] = ""

class PromptTestRunResponse(BaseModel):
    id: int
    prompt_version_id: int
    reading_id: int
    output_text: str
    clarity_rating: int
    accuracy_rating: int
    completeness_rating: int
    usefulness_rating: int
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PromptTemplateResponse(PromptTemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    versions: List[PromptVersionResponse] = []

    class Config:
        from_attributes = True

# Reflection schemas
class ReflectionBase(BaseModel):
    reading_id: Optional[int] = None
    date: str
    did_ai_help: str
    remember_without_notes: str
    deep_thinking_vs_dependence: str
    misunderstood_concepts: str
    future_changes: str
    general_notes: Optional[str] = ""
    ai_suggestions: Optional[str] = None

class ReflectionCreate(ReflectionBase):
    pass

class ReflectionResponse(ReflectionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# AI Tool Log schemas
class AIToolLogBase(BaseModel):
    tool_name: str
    task_performed: str
    prompt_used: Optional[str] = ""
    input_data: Optional[str] = ""
    output_received: Optional[str] = ""
    corrections: Optional[str] = ""
    strengths_observed: Optional[str] = ""
    limitations_observed: Optional[str] = ""
    privacy_notes: Optional[str] = ""

class AIToolLogCreate(AIToolLogBase):
    pass

class AIToolLogResponse(AIToolLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Generation Request schemas
class GenerateSummaryRequest(BaseModel):
    reading_id: int
    regenerate: bool = False

class GenerateCardsRequest(BaseModel):
    reading_id: int

class GenerateRecallTestRequest(BaseModel):
    reading_id: int
    test_type: str = "initial"

# Analytics Dashboard Response
class AnalyticsSummary(BaseModel):
    total_readings: int
    completed_readings: int
    saved_summaries: int
    flashcards_reviewed: int
    total_flashcards: int
    recall_tests_due: int
    average_recall_score: float
    verification_issues_pending: int
    recent_activity: List[Dict[str, Any]]
    experiment_metrics: Dict[str, Any]
