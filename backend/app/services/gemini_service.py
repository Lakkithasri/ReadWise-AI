import json
import re
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from app.config import settings

def get_gemini_client() -> genai.Client:
    """Initialize and return the official google-genai Client."""
    if not settings.has_gemini_key:
        raise ValueError(
            "Google Gemini API key is missing. Please configure GEMINI_API_KEY in backend/.env "
            "or via the Settings page."
        )
    return genai.Client(api_key=settings.GEMINI_API_KEY)

def chunk_text_if_needed(text: str, max_chars: int = 40000) -> str:
    """
    Safely truncate or select representative sections if text exceeds model token limits.
    For standard articles (under ~10,000 words), text is passed entirely.
    """
    if len(text) <= max_chars:
        return text
    
    # Take beginning, middle, and end with clear demarcations
    chunk_size = max_chars // 3
    first_part = text[:chunk_size]
    mid_start = (len(text) // 2) - (chunk_size // 2)
    mid_part = text[mid_start : mid_start + chunk_size]
    last_part = text[-chunk_size:]
    
    return (
        f"{first_part}\n\n[... Content condensed for context window ...]\n\n"
        f"{mid_part}\n\n[... Content condensed for context window ...]\n\n"
        f"{last_part}"
    )

def extract_json_from_response(text: str) -> Dict[str, Any]:
    """Extract JSON block from markdown fences or text."""
    text = text.strip()
    # Match markdown code block ```json ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        clean_json = match.group(1).strip()
    else:
        clean_json = text
        
    try:
        return json.loads(clean_json)
    except json.JSONDecodeError:
        # Try to find first { and last }
        start = clean_json.find("{")
        end = clean_json.rfind("}")
        if start != -1 and end != -1:
            return json.loads(clean_json[start : end + 1])
        raise ValueError(f"Could not parse valid JSON from AI response: {text[:200]}...")

def generate_three_level_summaries(text: str, title: str, author: str = "Unknown") -> Dict[str, str]:
    """
    Generate Quick (~50 words), Standard (~150 words), and Detailed (~300 words) summaries
    using Gemini 3.8 Flash.
    """
    client = get_gemini_client()
    safe_text = chunk_text_if_needed(text)

    prompt = f"""
You are an expert academic tutor and research scientist.
Generate three distinct levels of summaries for the following reading:
Title: {title}
Author: {author}

Source Text:
\"\"\"
{safe_text}
\"\"\"

Requirements:
1. Quick Summary: Approximately 50 words. A concise executive snapshot of the main thesis and core conclusion.
2. Standard Summary: Approximately 150 words. A balanced overview explaining the problem, methodology or rationale, key findings, and significance.
3. Detailed Summary: Approximately 300 words. An in-depth breakdown covering important concepts, nuanced explanations, technical terms explained simply, and broader implications.
4. Preserves context, technical fidelity, and qualifications. Does not invent citations or false facts.
5. You MUST return ONLY valid JSON in this exact structure:
{{
  "quick_summary": "...",
  "standard_summary": "...",
  "detailed_summary": "..."
}}
"""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json"
        )
    )
    
    if not response or not response.text:
        raise ValueError("Received empty response from Gemini API.")
        
    data = extract_json_from_response(response.text)
    return {
        "quick_summary": data.get("quick_summary", "").strip(),
        "standard_summary": data.get("standard_summary", "").strip(),
        "detailed_summary": data.get("detailed_summary", "").strip(),
        "model_name": settings.GEMINI_MODEL
    }

def generate_study_cards(text: str, title: str) -> Dict[str, Any]:
    """
    Generate 5-10 key ideas, flashcards, 5 discussion questions, and 3 application questions.
    """
    client = get_gemini_client()
    safe_text = chunk_text_if_needed(text)

    prompt = f"""
Analyze the following academic reading:
Title: {title}

Source Text:
\"\"\"
{safe_text}
\"\"\"

Generate study materials strictly grounded in this source text:
1. Key Ideas (5 to 8 items): Each with a title and clear explanatory breakdown.
2. Flashcards (6 to 10 items): Front/Question and Back/Answer testing key concepts and definitions.
3. Discussion Questions (5 items): High-level analytical questions examining theoretical implications or debates.
4. Application Questions (3 items): Real-world problem scenarios requiring the reader to apply concepts from the text.

You MUST respond strictly with valid JSON in this format:
{{
  "key_ideas": [
    {{"title": "...", "explanation": "..."}}
  ],
  "flashcards": [
    {{"question": "...", "answer": "..."}}
  ],
  "discussion_questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5"
  ],
  "application_questions": [
    "App Question 1",
    "App Question 2",
    "App Question 3"
  ]
}}
"""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    if not response or not response.text:
        raise ValueError("Received empty response from Gemini API.")

    return extract_json_from_response(response.text)

def generate_recall_quiz(text: str, title: str) -> List[Dict[str, str]]:
    """
    Generate 3-5 open-ended recall questions with reference rubric answers.
    """
    client = get_gemini_client()
    safe_text = chunk_text_if_needed(text)

    prompt = f"""
Create 4 open-ended recall test questions for a student testing their memory of this reading without notes:
Title: {title}

Source Text:
\"\"\"
{safe_text}
\"\"\"

Each question must:
- Test conceptual understanding rather than trivial trivia.
- Require the student to articulate the concept in their own words.
- Provide a clear, source-grounded reference answer listing essential criteria.

Return strictly valid JSON:
{{
  "questions": [
    {{
      "question": "...",
      "reference_answer": "..."
    }}
  ]
}}
"""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json"
        )
    )

    if not response or not response.text:
        raise ValueError("Received empty response from Gemini API.")

    data = extract_json_from_response(response.text)
    return data.get("questions", [])

def evaluate_recall_answer(
    question: str, 
    reference_answer: str, 
    user_response: str, 
    source_text: str
) -> Dict[str, Any]:
    """
    Grade a student's answer in their own words using source-grounded criteria.
    Returns score (0-100), constructive feedback, correct concepts, and missing concepts.
    """
    client = get_gemini_client()
    safe_text = chunk_text_if_needed(source_text, max_chars=15000)

    prompt = f"""
You are an academic examiner evaluating a student's recall answer.
Grade strictly and fairly based on the source material.

Question: {question}
Reference Answer / Key Criteria: {reference_answer}
Student Answer: \"\"\"{user_response}\"\"\"

Excerpt from Source Material:
\"\"\"
{safe_text}
\"\"\"

Instructions:
1. Assign a numerical score between 0 and 100 based on factual accuracy, depth of understanding, and presence of core concepts.
2. Identify which correct concepts the student successfully demonstrated.
3. Identify which critical concepts or qualifications were missing or inaccurate.
4. Provide constructive feedback explaining what was good and how to improve understanding.

Return strictly valid JSON:
{{
  "score": 85,
  "feedback": "...",
  "correct_concepts": ["concept 1", "concept 2"],
  "missing_concepts": ["concept 3"]
}}
"""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json"
        )
    )

    if not response or not response.text:
        raise ValueError("Received empty response from Gemini API.")

    return extract_json_from_response(response.text)

def verify_claim_against_source(claim: str, source_text: str) -> Dict[str, Any]:
    """
    Check whether a statement or summary claim is supported, contradicted, or unsupported by the source text.
    """
    client = get_gemini_client()
    safe_text = chunk_text_if_needed(source_text, max_chars=20000)

    prompt = f"""
You are a rigorous academic fact-checker.
Examine this claim against the provided source text:

Claim to verify: \"\"\"{claim}\"\"\"

Source Text:
\"\"\"
{safe_text}
\"\"\"

Instructions:
1. Determine the status:
   - "supported": The claim is directly substantiated by statements in the source text.
   - "contradicted": The claim makes assertions that directly conflict with the source text.
   - "unsupported": The source text does not mention or contain evidence for this claim.
2. Quote the exact excerpt from the source text that provides evidence (or empty string if none found).
3. If unsupported or contradicted, formulate the factual correction based strictly on what the source says.
4. Provide objective explanatory notes.

Return strictly valid JSON:
{{
  "status": "supported",
  "source_excerpt": "...",
  "correction": "...",
  "notes": "..."
}}
"""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json"
        )
    )

    if not response or not response.text:
        raise ValueError("Received empty response from Gemini API.")

    return extract_json_from_response(response.text)

def run_custom_prompt(
    prompt_template: str, 
    system_instruction: str, 
    reading_content: str, 
    custom_input: Optional[str] = None
) -> str:
    """
    Execute a prompt template against a reading for the Prompt Engineering Lab.
    """
    client = get_gemini_client()
    safe_text = chunk_text_if_needed(reading_content)

    formatted_prompt = prompt_template.replace("{{text}}", safe_text).replace("{{input}}", custom_input or "")
    if "{{text}}" not in prompt_template:
        formatted_prompt += f"\n\nSource Text:\n{safe_text}"
        if custom_input:
            formatted_prompt += f"\n\nAdditional Input: {custom_input}"

    config_args = {"temperature": 0.3}
    if system_instruction and system_instruction.strip():
        config_args["system_instruction"] = system_instruction.strip()

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=formatted_prompt,
        config=types.GenerateContentConfig(**config_args)
    )

    if not response or not response.text:
        raise ValueError("Received empty response from Gemini API.")

    return response.text.strip()

def answer_reading_chat(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    context_text: Optional[str] = None,
    reading_title: Optional[str] = None
) -> str:
    """
    Conversational AI Study Tutor supporting multi-turn dialogue with student context.
    """
    client = get_gemini_client()
    
    system_instruction = (
        "You are ReadWise AI's interactive academic study companion and personal reading tutor. "
        "Help students understand difficult concepts, clarify complex theories, construct analogies, "
        "and formulate Socratic inquiry questions. Keep responses clear, academically grounded, "
        "engaging, and concise (under 200 words unless in-depth explanation is requested). "
        "Adhere strictly to academic honesty and encourage active recall."
    )
    if reading_title:
        system_instruction += f"\n\nActive Reading: {reading_title}"
    if context_text:
        excerpt = chunk_text_if_needed(context_text, max_chars=12000)
        system_instruction += f"\n\nSource Material Excerpt for Context:\n\"\"\"\n{excerpt}\n\"\"\""

    # Assemble conversation context
    conversation_prompt = ""
    if history:
        for turn in history[-6:]:  # Keep recent 6 turns for context
            role = "Student" if turn.get("role") in ["user", "student"] else "Tutor"
            conversation_prompt += f"{role}: {turn.get('text', '')}\n\n"
    
    conversation_prompt += f"Student: {message}\nTutor:"

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=conversation_prompt,
        config=types.GenerateContentConfig(
            temperature=0.4,
            system_instruction=system_instruction
        )
    )

    if not response or not response.text:
        raise ValueError("Received empty response from Gemini API.")

    return response.text.strip()
