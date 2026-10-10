from core.config import settings
from services.reconciliation.llm.base import BaseLLMProvider
from services.reconciliation.llm.mock import MockLLMProvider
import google.generativeai as genai
import openai

class GeminiLLMProvider(BaseLLMProvider):
    def __init__(self):
        super().__init__()
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def _generate(self, prompt: str) -> str:
        response = self.model.generate_content(prompt)
        return response.text

class OpenAILLMProvider(BaseLLMProvider):
    def __init__(self):
        super().__init__()
        openai.api_key = settings.OPENAI_API_KEY
        self.client = openai.Client(api_key=settings.OPENAI_API_KEY)

    def _generate(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        return response.choices[0].message.content

def get_llm_provider() -> BaseLLMProvider:
    if settings.LLM_PROVIDER.lower() == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider()
    elif settings.LLM_PROVIDER.lower() == "openai" and settings.OPENAI_API_KEY:
        return OpenAILLMProvider()
    return MockLLMProvider()
