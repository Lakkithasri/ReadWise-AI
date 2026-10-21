import re
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List

def calculate_seven_day_schedule(from_date: datetime = None) -> datetime:
    """Calculate the exact scheduled date 7 days into the future."""
    if from_date is None:
        from_date = datetime.now(timezone.utc)
    return from_date + timedelta(days=7)

def extract_key_terms(text: str) -> List[str]:
    """Extract significant keywords/concepts from a text snippet."""
    stopwords = {
        "the", "and", "or", "to", "a", "an", "in", "on", "at", "by", "for", "with",
        "about", "against", "between", "into", "through", "during", "before", "after",
        "above", "below", "from", "up", "down", "is", "are", "was", "were", "be",
        "been", "being", "have", "has", "had", "do", "does", "did", "this", "that",
        "these", "those", "it", "its", "they", "them", "their", "we", "us", "our",
        "which", "who", "whom", "what", "where", "when", "why", "how", "all", "any",
        "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor",
        "not", "only", "own", "same", "so", "than", "too", "very", "can", "will", "just",
        "without", "means", "looking", "practice", "take", "make", "also", "using"
    }
    words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
    meaningful = [w for w in words if w not in stopwords]
    
    # Return unique terms preserve order
    seen = set()
    unique = []
    for w in meaningful:
        # Simple stemming: strip trailing s, ing, ed
        stem = re.sub(r"(?:ing|ed|es|s)$", "", w)
        if len(stem) >= 3 and stem not in seen:
            seen.add(stem)
            unique.append(w)
    return unique[:10]

def heuristic_grade_recall(
    question: str, 
    reference_answer: str, 
    user_response: str
) -> Dict[str, Any]:
    """
    Fallback grading engine when AI API is unavailable or offline.
    Uses reference answer overlap, keyword detection, and response completeness.
    """
    cleaned_user = user_response.strip().lower()
    if not cleaned_user:
        return {
            "score": 0.0,
            "feedback": "No answer provided. Please articulate your recollection of the material.",
            "correct_concepts": [],
            "missing_concepts": extract_key_terms(reference_answer)[:4]
        }
    
    ref_terms = extract_key_terms(reference_answer)
    matched_terms = []
    missing_terms = []

    for term in ref_terms:
        stem = re.sub(r"(?:ing|ed|es|s)$", "", term)
        if term in cleaned_user or (len(stem) >= 3 and stem in cleaned_user):
            matched_terms.append(term)
        else:
            missing_terms.append(term)

    # Calculate proportion
    total_terms = max(len(ref_terms), 1)
    overlap_ratio = len(matched_terms) / total_terms
    
    # Word count factor (depth)
    user_word_count = len(re.findall(r"\b\w+\b", user_response))
    depth_factor = min(user_word_count / 20.0, 1.0)  # scale up to 20 words

    raw_score = (overlap_ratio * 65.0) + (depth_factor * 35.0)
    score = round(min(max(raw_score, 10.0), 100.0), 1)

    if score >= 75:
        feedback = "Excellent recall! You captured the essential concepts and explained them clearly."
    elif score >= 55:
        feedback = "Good retention. You touched upon several key principles, though some specific details or qualifications were missed."
    else:
        feedback = "Fair attempt. Review the reference answer to strengthen key conceptual nuances and terminology."

    return {
        "score": score,
        "feedback": feedback,
        "correct_concepts": matched_terms[:5],
        "missing_concepts": missing_terms[:5]
    }
