from core.config import settings
from services.reconciliation.llm.base import BaseLLMProvider
from services.reconciliation.llm.mock import MockLLMProvider
import requests

class GeminiLLMProvider(BaseLLMProvider):
    def __init__(self):
        super().__init__()
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set")
            
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL

    def _generate(self, prompt: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        import time
        time.sleep(0.5)
        
        import time
        max_retries = 5
        for i in range(max_retries):
            response = requests.post(url, json=payload, timeout=10.0)
            if response.status_code in (429, 503):
                if i < max_retries - 1:
                    time.sleep(0.5 if response.status_code == 503 else 2 * (i + 1))
                    continue
            response.raise_for_status()
            
            data = response.json()
            try:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError) as e:
                raise Exception(f"Unexpected response format: {data}") from e
                
        raise Exception("Max retries exceeded")

class FailingLLMProvider(BaseLLMProvider):
    """Used when GEMINI is requested but key is missing."""
    def _generate(self, prompt: str) -> str:
        raise Exception("API key missing. Falling back.")

def get_llm_provider() -> BaseLLMProvider:
    if settings.LLM_PROVIDER.lower() == "gemini":
        if settings.GEMINI_API_KEY:
            return GeminiLLMProvider()
        else:
            return FailingLLMProvider()
    return MockLLMProvider()
