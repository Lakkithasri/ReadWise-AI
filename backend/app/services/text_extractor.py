import io
import re
from typing import Tuple
from pypdf import PdfReader

def clean_extracted_text(text: str) -> str:
    """Normalize whitespace and remove excessive blank lines."""
    if not text:
        return ""
    # Normalize carriage returns and tabs
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Replace sequences of 3+ newlines with 2 newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove excessive horizontal spaces
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()

def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extract text from TXT bytes trying common encodings."""
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
    for enc in encodings:
        try:
            raw_text = file_bytes.decode(enc)
            return clean_extracted_text(raw_text)
        except UnicodeDecodeError:
            continue
    # Fallback with replacement
    return clean_extracted_text(file_bytes.decode("utf-8", errors="replace"))

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, int]:
    """
    Extract text from PDF file bytes.
    Returns (extracted_text, page_count).
    """
    try:
        stream = io.BytesIO(file_bytes)
        reader = PdfReader(stream)
        page_count = len(reader.pages)
        if page_count == 0:
            raise ValueError("The provided PDF contains no pages.")
        
        extracted_pages = []
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_pages.append(f"--- Page {idx + 1} ---\n{page_text.strip()}")
        
        combined_text = "\n\n".join(extracted_pages)
        cleaned = clean_extracted_text(combined_text)
        if not cleaned:
            raise ValueError("Could not extract any selectable text from this PDF. It may contain scanned images only.")
        return cleaned, page_count
    except Exception as e:
        raise ValueError(f"Failed to process PDF: {str(e)}")

def compute_text_stats(text: str) -> Tuple[int, int]:
    """Calculate word count and character count."""
    cleaned = text.strip()
    char_count = len(cleaned)
    words = re.findall(r"\b\w+\b", cleaned)
    word_count = len(words)
    return word_count, char_count
