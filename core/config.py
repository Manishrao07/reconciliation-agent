from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/reconciliation_db"
    TEST_DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/recon_test"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    LLM_PROVIDER: str = "mock"
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-flash-latest"
    GROQ_API_KEY: str | None = None
    SEED_DEMO_PASSWORD: str = "demo123"

    AUTO_APPROVE_THRESHOLD: float = 1000.00
    MANAGER_APPROVE_THRESHOLD: float = 50000.00
    AMOUNT_TOLERANCE: float = 0.05
    DATE_WINDOW_DAYS: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
