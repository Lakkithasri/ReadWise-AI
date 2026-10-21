import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Path to backend root
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file explicitly
load_dotenv(BASE_DIR / ".env")

class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./readwise.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    )

    @property
    def cors_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def has_gemini_key(self) -> bool:
        if not self.GEMINI_API_KEY or self.GEMINI_API_KEY.startswith("your_"):
            # Check os.environ and reload from disk if possible
            for p in [BASE_DIR / ".env", Path.cwd() / ".env", Path.cwd() / "backend" / ".env"]:
                if p.exists():
                    load_dotenv(p, override=True)
            candidate = os.getenv("GEMINI_API_KEY", "").strip()
            if candidate and not candidate.startswith("your_"):
                self.GEMINI_API_KEY = candidate
        return bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip() and not self.GEMINI_API_KEY.startswith("your_"))

    def reload(self):
        """Force reload environment variables from disk."""
        for p in [BASE_DIR / ".env", Path.cwd() / ".env", Path.cwd() / "backend" / ".env"]:
            if p.exists():
                load_dotenv(p, override=True)
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
        self.GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./readwise.db").strip()

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
