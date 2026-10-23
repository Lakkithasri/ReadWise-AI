# ReadWise-AI
AI-powered reading assistant for smart summaries, flashcards, recall tests, and learning analytics.

# ReadWise AI — Full-Stack AI Reading and Note-Taking System
**College Capstone Project (100 Marks Rubric)**

> ReadWise AI is a complete, production-grade web application built to augment academic reading, retention, and critical synthesis using **FastAPI**, **SQLite/SQLAlchemy**, **Google Gemini 3.8 Flash SDK**, **React (Vite + TypeScript)**, and **Recharts**.

---

## 🌟 Executive Summary & Key Highlights

Unlike static prototypes or mock simulations, **ReadWise AI** is a fully functional full-stack system designed according to cognitive science and learning psychology principles:
- **Dual-Pane Study Workspace**: View original academic papers on the left while taking personal notes and generating AI summaries on the right.
- **Multi-Level Summaries**: 3 distinct summary levels generated via Google Gemini:
  - **Quick Summary (~50 words)**: Main thesis and primary takeaway.
  - **Standard Summary (~150 words)**: Problem statement, methodology, findings, and significance.
  - **Detailed Summary (~300 words)**: Conceptual breakdown, technical terms explained simply, caveats, and qualifications.
- **Active Recall & Spaced Repetition**: 
  - Study with interactive 3D-flip flashcards and 1–5 confidence ratings.
  - Conduct source-grounded open-ended recall tests without notes.
  - Automatic database-backed **7-day recall test scheduling** to counter the Ebbinghaus forgetting curve.
- **Empirical Learning Experiment**: Log and visualize Normal vs. AI-Assisted reading sessions using interactive **Recharts** (retention change, reading duration, recall accuracy).
- **Epistemic Vigilance & Verification Lab**: Audit AI statements against source text to detect hallucinations, tag claims as *supported*, *unsupported*, or *contradicted*, and record factual corrections.
- **Prompt Engineering Laboratory**: Save, version (v1, v2...), execute, and rate prompts on *Clarity*, *Accuracy*, *Completeness*, and *Usefulness*.
- **Metacognitive Reflection Journal**: 5 structured self-evaluation questions to avoid cognitive offloading and summary overdependence.
- **AI Tools & Ethics**: Full documentation of 4 free-tier tools (ChatGPT, Google Gemini, Google NotebookLM, Notion/Obsidian), live external workflow logs, and an academic ethics manifesto.
- **Pre-Seeded Academic Dataset**: Bundled with 5 real academic texts ready for immediate evaluation:
  1. *Attention Is All You Need (Transformer Architecture)* — AI / Computer Science
  2. *Spaced Repetition & The Forgetting Curve in Cognitive Science* — Psychology
  3. *Critical Reading & Epistemic Vigilance in the Age of AI* — Education & Epistemology
  4. *Ethical Governance and Academic Integrity in Generative AI* — AI Ethics & Policy
  5. *Deep Work: Focus, Attention Residue, and Deep Reading* — Productivity & Cognitive Science

---

## 🏗️ Architectural Overview

```
ReadWise AI
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application setup, CORS, lifespan, router registry
│   │   ├── config.py             # App settings, Gemini API key, environment loader
│   │   ├── database.py           # SQLAlchemy SQLite engine & session generator
│   │   ├── models.py             # 12 SQLAlchemy ORM models (Readings, Summaries, Tests, etc.)
│   │   ├── schemas.py            # Pydantic v2 schemas for request validation & responses
│   │   ├── seed_data.py          # 5 complete academic papers with rich study materials
│   │   ├── services/
│   │   │   ├── gemini_service.py # Official google-genai client (Gemini 3.8 Flash), chunking, scoring
│   │   │   ├── text_extractor.py # PDF (pypdf) & TXT upload extraction with word counting
│   │   │   └── scoring_service.py# Ground-truth concept scoring & 7-day schedule math
│   │   └── routers/              # 10 modular REST API routers (/api/...)
│   │       ├── readings.py
│   │       ├── summaries.py
│   │       ├── cards.py
│   │       ├── recall.py
│   │       ├── experiments.py
│   │       ├── verifications.py
│   │       ├── prompts.py
│   │       ├── reflections.py
│   │       ├── tools_ethics.py
│   │       ├── analytics.py
│   │       └── settings.py
│   ├── tests/
│   │   └── test_api.py           # Pytest test suite (100% passing)
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Environment variables template
│   └── .env                      # Local runtime configuration
└── frontend/
    ├── package.json              # React 18, Vite, Tailwind CSS, Recharts, Lucide
    ├── vite.config.ts            # Vite proxy forwarding /api to http://127.0.0.1:8000
    ├── tailwind.config.js        # Navy / Royal Blue theme & typography
    └── src/
        ├── api/client.ts         # Typed API client for all backend endpoints
        ├── types/index.ts        # TypeScript domain models
        ├── components/           # Sidebar, Header, Modals, 3D Flashcard runner
        └── pages/                # All 11 fully functional views
            ├── Dashboard.tsx
            ├── ReadingLibrary.tsx
            ├── ReadingWorkspace.tsx
            ├── SummariesView.tsx
            ├── IdeaCardsView.tsx
            ├── RecallTestsView.tsx
            ├── LearningComparisonView.tsx
            ├── VerificationLabView.tsx
            ├── PromptLibraryView.tsx
            ├── ReflectionJournalView.tsx
            ├── AIToolsAndEthicsView.tsx
            └── SettingsView.tsx
```

---

## 🚀 Quickstart: Running ReadWise AI

### Option A: 1-Click Desktop Shortcut (Easiest)
Simply double-click the **ReadWise AI** shortcut on your Desktop!
- It automatically launches the FastAPI backend and Vite frontend.
- It automatically opens your web browser at `http://localhost:5173`.

### Option B: 1-Click Batch Script
Double-click `start_app.bat` inside the project folder.
- When you are finished, double-click `stop_app.bat` to cleanly shut down both servers.

### Option C: Manual Terminal Start
### Prerequisites
- **Python**: 3.10+ (tested on Python 3.14)
- **Node.js**: v18+ (tested on Node v24)
- **Git** / Terminal

#### 1. Start the Backend
Open a terminal in the project directory:
```bash
# Navigate to project root
cd "c:\Users\abila\Videos\Screen Recordings\AI reading and note taking system"

# Activate Python virtual environment
# Windows PowerShell:
.\backend\venv\Scripts\Activate.ps1
# Or Windows Command Prompt:
.\backend\venv\Scripts\activate.bat

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```
Backend will be live at: `http://127.0.0.1:8000` (Interactive API docs at `http://127.0.0.1:8000/docs`).

### 2. Start the Frontend
Open a second terminal window:
```bash
cd "c:\Users\abila\Videos\Screen Recordings\AI reading and note taking system\frontend"

# Launch Vite development server
npm run dev
```
Frontend will be live at: `http://127.0.0.1:5173`.

---

## 🔑 Gemini API Key Configuration

ReadWise AI works **both offline** (using pre-seeded academic data and local heuristics) and **online with live AI**:
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. You can add it in either of two ways:
   - **Method A (Web UI)**: Click the **"Add API Key"** button in the header or navigate to **Settings**, paste your key, and click **Update**.
   - **Method B (.env file)**: Open `backend/.env` and set:
     ```env
     GEMINI_API_KEY=AIzaSyYourActualKeyHere
     GEMINI_MODEL=gemini-3.8-flash
     ```
3. Restart the server or update live from Settings.

---

## 🧪 Running Automated Tests

Run the full backend test suite covering database persistence, 7-day recall scheduling, scoring rubrics, and REST endpoints:
```bash
.\backend\venv\Scripts\pytest backend\tests\test_api.py -v
```
All 8 test modules will execute and report `PASSED`.

To verify the frontend TypeScript compilation and bundling:
```bash
cd frontend
npm run build
```

---

## 🧭 Navigation & Feature Walkthrough

| Tab | Feature Area | Description |
|---|---|---|
| 1 | **Dashboard** | Real database KPIs (readings, summaries, due tests, average recall, pending claims), due test banner, learning comparison mini-chart. |
| 2 | **Reading Library** | Filter by discipline & status, search full texts, add readings via paste or PDF/TXT upload, word/character counters. |
| 3 | **Study Workspace** | Dual-pane interface: original paper on left; 3 summary tiers, independent personal notes, flashcards, questions, and claims on right. |
| 4 | **AI Summaries** | Side-by-side comparison of Quick (~50w), Standard (~150w), and Detailed (~300w) summaries with word-count verification & inline editing. |
| 5 | **Idea Cards & Flashcards** | 3D flip card study mode with 1–5 confidence ratings (Again, Hard, Good, Easy, Mastered) and favorite tagging. |
| 6 | **7-Day Recall Tests** | Closed-note exam runner. Answers graded against source criteria. Automatically schedules 7-day follow-up. |
| 7 | **Learning Comparison** | Recharts bar charts comparing Normal vs. AI-Assisted reading duration, initial recall, and 7-day retention decay. |
| 8 | **Verification Lab** | Hallucination defense: audit statements against source excerpts, classify as supported/contradicted/unsupported, record corrections. |
| 9 | **Prompt Library** | Versioned prompt engineering lab. Execute prompt variations against papers and grade output across 4 quality dimensions. |
| 10 | **Reflection Journal** | Metacognitive journal addressing 5 critical questions regarding understanding, retention, and cognitive dependence. |
| 11 | **AI Tools & Ethics** | Profiles of ChatGPT, Gemini, NotebookLM, Notion/Obsidian, workflow log, and academic integrity manifesto. |
| 12 | **Settings** | Configure Gemini API key, select model (`gemini-3.8-flash`), toggle light/dark theme, and 1-click re-seed database. |

---

## 🛡️ Academic Integrity & Responsible AI Declaration

- **Privacy**: All notes, readings, and reflections reside strictly in your local SQLite database (`readwise.db`). No user data is sent to external servers other than prompt text submitted to the user's own configured Google Gemini API key.
- **Copyright**: This software is intended for personal research and educational fair use. It does not bypass paywalls or redistribute proprietary textbooks without authorization.
- **Attribution**: All AI-generated materials are visibly demarcated with model tags (`gemini-3.8-flash`) to ensure academic honesty.
- **Hallucination Defense**: AI outputs must never be accepted uncritically. The built-in **Verification Lab** trains students in epistemic vigilance and empirical source-grounding.

---
*Created for College Capstone Evaluation (100 Marks)*
