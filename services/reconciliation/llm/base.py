import json
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple
from pydantic import BaseModel, ValidationError

class ResolutionExplanation(BaseModel):
    explanation: str

class BaseLLMProvider(ABC):
    def __init__(self):
        self.max_retries = 3

    @abstractmethod
    def _generate(self, prompt: str) -> str:
        pass

    def explain_discrepancy(self, context: Dict[str, Any]) -> Tuple[str, int]:
        prompt = f"""
        You are a financial reconciliation expert. Explain this discrepancy in plain English.
        Context:
        Type: {context.get('type')}
        Description: {context.get('description')}
        Suggested Action: {context.get('suggested_action')}
        Order Amount: {context.get('order_amount')}
        Payment Amount: {context.get('payment_amount')}
        Refund Amount: {context.get('refund_amount')}
        Order ID: {context.get('order_id')}
        Payment ID: {context.get('payment_id')}
        
        Respond ONLY with a JSON object like: {{"explanation": "your plain English explanation here"}}
        """
        
        start_time = time.time()
        for attempt in range(self.max_retries):
            try:
                result_str = self._generate(prompt)
                
                # Cleanup markdown formatting if present
                if result_str.startswith("```json"):
                    result_str = result_str[7:]
                if result_str.startswith("```"):
                    result_str = result_str[3:]
                if result_str.endswith("```"):
                    result_str = result_str[:-3]
                    
                parsed = json.loads(result_str.strip())
                validated = ResolutionExplanation(**parsed)
                latency = int((time.time() - start_time) * 1000)
                return validated.explanation, latency
            except (json.JSONDecodeError, ValidationError) as e:
                if attempt == self.max_retries - 1:
                    latency = int((time.time() - start_time) * 1000)
                    return f"Explanation unavailable. (Fallback: {context.get('description')})", latency
            except Exception:
                if attempt == self.max_retries - 1:
                    latency = int((time.time() - start_time) * 1000)
                    return f"Explanation unavailable due to timeout/error. (Fallback: {context.get('description')})", latency
        
        return "Explanation unavailable.", int((time.time() - start_time) * 1000)
