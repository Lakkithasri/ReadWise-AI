from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AIToolLog
from app.schemas import AIToolLogResponse, AIToolLogCreate

router = APIRouter(prefix="/api/tools-ethics", tags=["AI Tools & Ethics"])

def utc_now():
    return datetime.now(timezone.utc)

@router.get("/tools")
def get_documented_tools():
    """Detailed architectural and academic profiles of the 4 free-tier study tools."""
    return [
        {
            "id": "chatgpt",
            "name": "ChatGPT (OpenAI)",
            "integration_type": "External Workflow (Manual / Web)",
            "purpose": "Conceptual clarification, metaphorical explanations, Socratic dialogue, and prompt ideation.",
            "free_tier": "Free tier with GPT-4o mini and standard rate limits; no credit card required.",
            "tasks_performed": [
                "Drafting challenging application questions from academic source snippets.",
                "Translating complex mathematical notation into intuitive physical analogies.",
                "Socratic role-play to debate philosophical implications of readings."
            ],
            "strengths": "Fast conversational feedback, versatile reasoning across diverse domains, intuitive UI.",
            "limitations": "Free tier enforces dynamic hourly usage caps; knowledge cutoff considerations; risk of subtly hallucinated citations.",
            "privacy_considerations": "Do not enter non-anonymized student health/financial data. Use privacy controls to opt out of model training."
        },
        {
            "id": "gemini",
            "name": "Google Gemini (Google AI Studio)",
            "integration_type": "Direct In-App REST & SDK Integration (google-genai)",
            "purpose": "Native multi-level summarization engine (Quick, Standard, Detailed), flashcard extraction, and source-grounded recall grading.",
            "free_tier": "Free API access via Google AI Studio with up to 15 Requests Per Minute (RPM) and 1M token context window.",
            "tasks_performed": [
                "Full-document context ingestion without token truncation on academic PDFs.",
                "Programmatic 3-tier summary synthesis adhering strictly to word count targets.",
                "Automatic concept decomposition for active recall rubric grading."
            ],
            "strengths": "Massive 1M token window allows analyzing full research papers; native JSON structured output; low latency.",
            "limitations": "Free tier rate limits require client throttling; strict content safety filters may flag medical or political texts.",
            "privacy_considerations": "API keys must be secured in backend environment variables and never transmitted to the browser."
        },
        {
            "id": "notebooklm",
            "name": "Google NotebookLM (Google Labs)",
            "integration_type": "External Workflow (Manual Web Upload)",
            "purpose": "Source-grounded research notebook synthesis, cross-document comparison, and audio overview generation.",
            "free_tier": "Completely free preview on personal and Google Workspace accounts.",
            "tasks_performed": [
                "Uploading multiple PDF papers on spaced repetition to cross-reference conflicting findings.",
                "Generating clickable in-line citations that jump directly to exact PDF page numbers.",
                "Creating synthesized audio study overviews for auditory review."
            ],
            "strengths": "Zero-hallucination constraint strictly bounds answers to uploaded source documents; page-exact citations.",
            "limitations": "No public REST API available for programmatic backend integration; limited to 50 sources per notebook.",
            "privacy_considerations": "Uploaded files reside in user's Google Drive; enterprise accounts benefit from Google Workspace privacy agreements."
        },
        {
            "id": "notion_obsidian",
            "name": "Notion & Obsidian",
            "integration_type": "External Knowledge Management & Graph Repository",
            "purpose": "Building a persistent second brain, bidirectional concept linking, and long-term academic note curation.",
            "free_tier": "Obsidian is 100% free for personal local use; Notion provides a generous free tier for individuals.",
            "tasks_performed": [
                "Exporting ReadWise AI study cards into an interconnected Markdown knowledge graph.",
                "Creating bidirectional wikilinks between cognitive psychology models and AI architectures.",
                "Maintaining an immutable personal reading archive that survives browser and cache resets."
            ],
            "strengths": "Obsidian stores local plaintext Markdown with total user sovereignty; Notion offers rich database views and web clipping.",
            "limitations": "Requires disciplined manual curation; no native AI verification without third-party paid plugins.",
            "privacy_considerations": "Obsidian local vaults offer 100% offline data privacy with zero cloud exposure; Notion encrypts data in transit and at rest."
        }
    ]

@router.get("/guidelines")
def get_ethics_manifesto():
    """Comprehensive academic ethics manifesto with formal definitions and compliance rules."""
    return {
        "title": "Academic Integrity, Data Ethics, and Responsible AI Manifesto",
        "pillars": [
            {
                "id": "privacy",
                "category": "Privacy",
                "title": "1. Privacy Ethics & Data Sovereignty",
                "definition": "The moral and legal standard ensuring that a student's personal reading habits, uploaded proprietary texts, private annotations, and intellectual queries remain strictly confidential, untracked, and immune to unauthorized surveillance or model training ingestion.",
                "explanation": "In ReadWise AI, privacy is maintained through a local-first SQLite architecture. Uploaded reading texts, study notes, reflection entries, and recall answers reside solely in the user's local database. Gemini API credentials are maintained securely in backend environment variables and are never transmitted to or cached in public client-side browser storage.",
                "key_rules": [
                    "Zero unauthorized sharing or public indexing of student reading files or notes.",
                    "API keys and secret credentials are never exposed to browser memory or client bundles.",
                    "Do not enter personally identifiable health, financial, or sensitive student records into LLM prompts."
                ]
            },
            {
                "id": "copyright",
                "category": "Copyright",
                "title": "2. Copyright & Intellectual Property Protection",
                "definition": "The legal and normative framework protecting authors' and publishers' exclusive proprietary rights over original literary and scientific expressions, dictating the boundaries between lawful educational fair use and copyright infringement.",
                "explanation": "ReadWise AI is architected exclusively for personal educational analysis and private study. The system does not redistribute copyrighted publications, crawl paywalled journal repositories, or circumvent digital rights mechanisms. Users process only course materials they are legitimately authorized to read, open-access research, or personal lecture notes.",
                "key_rules": [
                    "Strict educational fair use: analyze documents only for personal critique, synthesis, and recall.",
                    "Never redistribute extracted textbook chapters, commercial study guides, or proprietary articles.",
                    "Respect open-access licenses (e.g., CC-BY, arXiv, PubMed Central) and acknowledge copyright holders."
                ]
            },
            {
                "id": "disclosure",
                "category": "Honest Disclosure",
                "title": "3. Honest Disclosure of AI Use & Academic Transparency",
                "definition": "The affirmative obligation of academic scholarship requiring learners to truthfully, explicitly, and comprehensively declare the scope, methodology, and tools employed when artificial intelligence contributes to reading, drafting, or study artifacts.",
                "explanation": "To preserve academic integrity, every AI-synthesized summary, extracted flashcard, and diagnostic rubric score in ReadWise AI is explicitly tagged with 'AI-Assisted' labels, model identifiers (e.g., gemini-3.8-flash), and timestamped audit logs. Students must never misrepresent AI-generated text as their own unassisted scholarship.",
                "key_rules": [
                    "Always declare AI assistance when incorporating AI-generated ideas into academic assignments.",
                    "Include tool names, specific prompts, and model versions in research methodologies.",
                    "Never pass off raw LLM syntheses or essays as original student cognitive work."
                ]
            },
            {
                "id": "limits",
                "category": "Limits of the Tools",
                "title": "4. The Limits of the Tools & Model Boundaries",
                "definition": "The foundational technological, statistical, and epistemological boundaries of generative language models, which generate plausible token sequences based on statistical distributions without authentic consciousness, factual understanding, or real-world verification.",
                "explanation": "Large Language Models frequently produce hallucinations (convincingly phrased yet completely fabricated citations, historical dates, or mathematical equations). They suffer from context-window truncation, training cutoff dates, inability to verify empirical truth independently, and sycophantic bias (agreeing with flawed user premises).",
                "key_rules": [
                    "Recognize that LLMs predict probability distributions, not verified objective truth.",
                    "Be vigilant against fabricated citations, fictional paper titles, and hallucinated mathematical proofs.",
                    "Never treat AI outputs as authoritative primary sources without human verification."
                ]
            },
            {
                "id": "cognitive_integrity",
                "category": "Cognitive Integrity",
                "title": "5. Mitigating Cognitive Atrophy & Summary Overdependence",
                "definition": "The conscious pedagogical effort to prevent cognitive degradation and passive learning illusions resulting from excessive reliance on automated summarization tools rather than deep textual engagement.",
                "explanation": "Reading automated summaries creates an 'illusion of competence' where learners confuse recognizing condensed points with genuine mastery. ReadWise AI counters this by enforcing active recall testing without notes, 7-day spaced retrieval intervals, and self-reflection logging to consolidate conceptual memory.",
                "key_rules": [
                    "Summaries are initial cognitive scaffolds, never complete replacements for reading primary texts.",
                    "Always perform closed-book active recall quizzes before relying on pre-packaged flashcards.",
                    "Engage in deep analytical critique rather than skimming bullet points."
                ]
            },
            {
                "id": "verification",
                "category": "Fact Verification",
                "title": "6. Epistemic Vigilance & Human Fact-Checking",
                "definition": "The rigorous standard of academic responsibility placing ultimate moral, intellectual, and factual accountability upon the human researcher to verify all AI-generated assertions against source literature.",
                "explanation": "Human-in-the-loop oversight is mandatory in modern AI-assisted research. ReadWise AI incorporates a dedicated Verification Lab that cross-examines claims directly against source text excerpts, ensuring students actively audit claims for unsupported leaps or factual contradictions before adoption.",
                "key_rules": [
                    "Cross-reference every key claim against original page numbers and primary source passages.",
                    "Audit AI outputs for omissions, subtle framing shifts, or contextual oversimplifications.",
                    "The student, not the AI model, bears 100% intellectual responsibility for final submissions."
                ]
            }
        ]
    }

@router.get("/logs", response_model=List[AIToolLogResponse])
def get_tool_logs(db: Session = Depends(get_db)):
    return db.query(AIToolLog).order_by(AIToolLog.created_at.desc()).all()

@router.post("/logs", response_model=AIToolLogResponse)
def create_tool_log(payload: AIToolLogCreate, db: Session = Depends(get_db)):
    log = AIToolLog(
        tool_name=payload.tool_name,
        task_performed=payload.task_performed,
        prompt_used=payload.prompt_used or "",
        input_data=payload.input_data or "",
        output_received=payload.output_received or "",
        corrections=payload.corrections or "",
        strengths_observed=payload.strengths_observed or "",
        limitations_observed=payload.limitations_observed or "",
        privacy_notes=payload.privacy_notes or "",
        created_at=utc_now()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
