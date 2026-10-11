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
        response = requests.post(url, json=payload, timeout=6.0)
        if response.status_code == 429:
            raise Exception("Gemini rate limit 429 hit")
        response.raise_for_status()
        
        data = response.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as e:
            raise Exception(f"Unexpected response format: {data}") from e

class GroqLLMProvider(BaseLLMProvider):
    def __init__(self):
        super().__init__()
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set")
        self.api_key = settings.GROQ_API_KEY

    def _generate(self, prompt: str) -> str:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "model": "openai/gpt-oss-20b",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=6.0)
        response.raise_for_status()
        data = response.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            raise Exception(f"Unexpected response format: {data}") from e

class FallbackLLMProvider(BaseLLMProvider):
    def __init__(self, primary: BaseLLMProvider, fallback: BaseLLMProvider):
        super().__init__()
        self.primary = primary
        self.fallback = fallback
        self.primary_cooldown_until = 0

    def _generate(self, prompt: str) -> str:
        import time
        if time.time() < self.primary_cooldown_until:
            return self.fallback._generate(prompt)

        try:
            return self.primary._generate(prompt)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Primary LLM failed: {e}. Falling back to Groq...")
            self.primary_cooldown_until = time.time() + 60
            return self.fallback._generate(prompt)

    def explain_discrepancy(self, context: dict) -> tuple[str, int, str, str]:
        import time
        start_time = time.time()
        now = time.time()
        
        # If primary is on cooldown, route directly to Groq fallback
        if now < self.primary_cooldown_until:
            try:
                explanation, latency, _, err = self.fallback.explain_discrepancy(context)
                return explanation, latency, "groq", ""
            except Exception as e2:
                latency_ms = int((time.time() - start_time) * 1000)
                template_text = f"The customer paid {context.get('payment_amount', 'N/A')} which differs from the order amount of {context.get('order_amount', 'N/A')} for order {context.get('order_id', 'N/A')}. Action '{context.get('suggested_action', 'MANUAL_REVIEW')}' is recommended."
                return template_text, latency_ms, "template", str(e2)

        try:
            explanation, latency, source, err = self.primary.explain_discrepancy(context)
            if source == "template" and err:
                raise Exception(err)
            return explanation, latency, "gemini", ""
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Primary LLM failed ({e}), cooling down primary and falling back to Groq...")
            self.primary_cooldown_until = time.time() + 60
            try:
                explanation, latency, _, err = self.fallback.explain_discrepancy(context)
                return explanation, latency, "groq", ""
            except Exception as e2:
                logger.error(f"Fallback LLM also failed: {e2}")
                latency_ms = int((time.time() - start_time) * 1000)
                template_text = f"The customer paid {context.get('payment_amount', 'N/A')} which differs from the order amount of {context.get('order_amount', 'N/A')} for order {context.get('order_id', 'N/A')}. Action '{context.get('suggested_action', 'MANUAL_REVIEW')}' is recommended."
                return template_text, latency_ms, "template", str(e2)

class FailingLLMProvider(BaseLLMProvider):
    """Used when GEMINI is requested but key is missing."""
    def _generate(self, prompt: str) -> str:
        raise Exception("API key missing. Falling back.")

def get_llm_provider() -> BaseLLMProvider:
    if settings.LLM_PROVIDER.lower() == "gemini":
        gemini = GeminiLLMProvider() if settings.GEMINI_API_KEY else FailingLLMProvider()
        
        if settings.GROQ_API_KEY:
            groq = GroqLLMProvider()
            return FallbackLLMProvider(primary=gemini, fallback=groq)
            
        return gemini
    return MockLLMProvider()
