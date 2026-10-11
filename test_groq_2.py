import sys
sys.path.append("/app")
from services.reconciliation.llm.real import GroqLLMProvider
provider = GroqLLMProvider()
print(provider.explain_discrepancy({"description": "Test"}))
