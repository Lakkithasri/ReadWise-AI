# ReadWise AI

ReadWise AI is a comprehensive, AI-assisted reading workspace and deliberate learning platform. It transforms passive reading into structured, active learning through automated key idea extraction, adaptive recall quizzes, reflective journaling, and experimental verification of AI accuracy.

---

## Architecture & System Overview

The platform uses a decoupled client-server architecture:

- **Frontend:** Single-page application built with React, TypeScript, and Vite, styled using Tailwind CSS with glassmorphism components.
- **Backend:** High-performance REST API built with FastAPI, utilizing SQLite and SQLAlchemy ORM for relational persistence.
- **AI Engine:** Google Gemini models integrated with structured prompt engineering for parsing, quiz evaluation, and fact-checking.

---

## Core Capabilities & Modules

1. **Reading Workspace & Document Intake**
   - Upload text documents, study materials, or long-form articles.
   - Text extraction and chunking pipeline designed for LLM context processing.

2. **Automated Summaries & Concept Flashcards**
   - Extracts core takeaways, key arguments, and counterpoints.
   - Generates bite-sized concept cards for spaced repetition and rapid revision.

3. **Active Recall & Assessment Engine**
   - Dynamically generates question sets (multiple choice, fill-in-the-blank, open-ended) based directly on the ingested source.
   - Automated grading and semantic feedback evaluating comprehension depth.

4. **Reflection Journaling**
   - Guided metacognitive prompts that challenge the reader to connect source concepts with real-world problems.
   - Tracks long-term thought development and topic synthesis.

5. **AI Tools & Ethics Lab (Verification Workspace)**
   - Side-by-side ground truth vs. AI summary verification.
   - Evaluates potential hallucinations, missing nuances, and model biases before saving study outputs.

6. **Analytics & Performance Tracking**
   - Tracks reading volume, study retention scores, and recall accuracy across sessions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy, Uvicorn |
| **Database** | SQLite (development) / PostgreSQL ready |
| **AI / LLM** | Google Gemini API |
| **Testing** | Pytest, FastAPI TestClient |

---

## Project Structure

```text
ReadWise-AI/
├── backend/
│   ├── app/
│   │   ├── routers/          # FastAPI route controllers (analytics, recall, chat, cards, etc.)
│   │   ├── services/         # Gemini LLM orchestration, text extraction & scoring logic
│   │   ├── models.py         # SQLAlchemy database models
│   │   ├── schemas.py        # Pydantic request & response schemas
│   │   ├── database.py       # DB engine & session initialization
│   │   └── main.py           # Application entrypoint
│   ├── tests/                # Automated API test suites
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Sample environment configuration
├── frontend/
│   ├── src/
│   │   ├── components/       # UI building blocks (Header, Sidebar, Modals, Logo)
│   │   ├── pages/            # Feature views (Workspace, Flashcards, Recall, Analytics)
│   │   ├── api/              # Axios/Fetch client layer
│   │   └── types/            # TypeScript interfaces and data models
│   ├── package.json          # Frontend packages & scripts
│   ├── tailwind.config.js    # Tailwind styling configuration
│   └── vite.config.ts        # Vite build setup
├── LICENSE
└── README.md
```
---

Getting Started
Prerequisites
Node.js 18+ & npm

Python 3.10+

Google Gemini API Key

Backend Setup
Navigate to the backend directory:

Bash
cd backend
Create a virtual environment:

Bash
python -m venv venv
Activate the environment:

Windows:

Bash
venv\Scripts\activate
macOS / Linux:

Bash
source venv/bin/activate
Install backend dependencies:

Bash
pip install -r requirements.txt
Set up environment variables:

Bash
cp .env.example .env
Open .env and add your Gemini credentials:

Code snippet
GEMINI_API_KEY=your_gemini_api_key_here
Run the FastAPI server:

Bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Interactive API documentation (Swagger UI) is available at http://localhost:8000/docs.

Frontend Setup
Navigate to the frontend directory:

Bash
cd frontend
Install node modules:

Bash
npm install
Run the development server:

Bash
npm run dev
Open http://localhost:5173 in your browser.

Running Tests
To run the backend integration tests:

Bash
cd backend
pytest

---

License
This project is licensed under the MIT License - see the LICENSE file for details.
