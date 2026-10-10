import time
from typing import Dict, Any
from services.reconciliation.llm.base import BaseLLMProvider

class MockLLMProvider(BaseLLMProvider):
    def _generate(self, prompt: str) -> str:
        # We will parse the context out of the prompt roughly for a sensible mock response
        import re
        
        # Extract fields
        def extract(field):
            match = re.search(f"{field}: (.*)", prompt)
            return match.group(1).strip() if match else "unknown"
            
        type_ = extract("Type")
        o_id = extract("Order ID")
        p_id = extract("Payment ID")
        o_amt = extract("Order Amount")
        p_amt = extract("Payment Amount")
        action = extract("Suggested Action")

        if type_ == "DUPLICATE_PAYMENT":
            exp = f"We received multiple payments for order {o_id}. A duplicate payment of {p_amt} (Payment ID: {p_id}) was detected. Action '{action}' is recommended to resolve this."
        elif type_ == "OVERPAYMENT":
            exp = f"The customer paid {p_amt} which exceeds the order amount of {o_amt} for order {o_id}. Action '{action}' is recommended."
        elif type_ == "UNDERPAYMENT":
            exp = f"The customer paid {p_amt}, which is less than the required order amount of {o_amt} for order {o_id}. Action '{action}' is recommended."
        elif type_ == "MISSING_DRC":
            exp = f"Payment {p_id} was received for order {o_id}, but we have no Delivery/Receipt Confirmation (DRC) on file yet. Action '{action}' is recommended."
        elif type_ == "ORPHAN_PAYMENT":
            exp = f"We received a payment of {p_amt} (Payment ID: {p_id}) but it does not match any known order. Action '{action}' is recommended."
        elif type_ == "EXCESS_REFUND":
            exp = f"A refund was issued for payment {p_id} (order {o_id}) that exceeds the originally paid amount. Action '{action}' is recommended."
        else:
            exp = f"A discrepancy of type {type_} was detected for order {o_id}. Action '{action}' is recommended."

        # Simulate network latency
        time.sleep(0.1)
        
        return f'{{"explanation": "{exp}"}}'
