import time
from typing import List, Dict, Any
from decimal import Decimal
from sqlalchemy.orm import Session
from db.models import Discrepancy, CorrectiveAction, AgentDecision, RoleEnum, ActionStatusEnum, Order, Payment, Refund
from services.reconciliation.llm.real import get_llm_provider
from core.config import settings

class ResolutionAgent:
    def __init__(self, db: Session, run_id: int):
        self.db = db
        self.run_id = run_id
        self.llm = get_llm_provider()
        
    def _get_required_role(self, amount: Decimal) -> RoleEnum:
        if amount < Decimal(str(settings.AUTO_APPROVE_THRESHOLD)):
            return RoleEnum.NONE
        elif amount <= Decimal(str(settings.MANAGER_APPROVE_THRESHOLD)):
            return RoleEnum.FINANCE_MANAGER
        else:
            return RoleEnum.ADMIN
            
    def _determine_action(self, disc_type: str) -> str:
        actions = {
            "DUPLICATE_PAYMENT": "REVERSE_PAYMENT",
            "OVERPAYMENT": "ISSUE_REFUND",
            "UNDERPAYMENT": "REQUEST_FUNDS",
            "MISSING_DRC": "REQUEST_DOCUMENT",
            "ORPHAN_PAYMENT": "INVESTIGATE_ORPHAN",
            "EXCESS_REFUND": "ESCALATE"
        }
        return actions.get(disc_type, "MANUAL_REVIEW")

    def execute(self, discrepancies: List[Discrepancy]) -> List[CorrectiveAction]:
        start_time = time.time()
        actions = []
        
        for disc in discrepancies:
            # Gather context for LLM
            order = None
            if disc.related_order_id:
                order = self.db.query(Order).filter(Order.id == disc.related_order_id).first()
            payment = None
            if disc.related_payment_id:
                payment = self.db.query(Payment).filter(Payment.id == disc.related_payment_id).first()
                
            amount = Decimal('0')
            if payment:
                amount = payment.amount
            elif order:
                amount = order.amount
                
            suggested_action = self._determine_action(disc.type.value)
            required_role = self._get_required_role(amount)
            
            # If auto-approved, we can set status to APPROVED immediately, but usually it requires being picked up
            # Let's say if RoleEnum.NONE, status is APPROVED right away.
            status = ActionStatusEnum.APPROVED if required_role == RoleEnum.NONE else ActionStatusEnum.PENDING
            
            context = {
                "type": disc.type.value,
                "description": disc.description,
                "suggested_action": suggested_action,
                "order_amount": str(order.amount) if order else "N/A",
                "payment_amount": str(payment.amount) if payment else "N/A",
                "refund_amount": "N/A", # Simplicity
                "order_id": disc.related_order_id or "N/A",
                "payment_id": disc.related_payment_id or "N/A"
            }
            
            llm_explanation, latency = self.llm.explain_discrepancy(context)
            
            action = CorrectiveAction(
                discrepancy_id=disc.id, # We need disc.id, but disc is not flushed yet. We must flush discrepancies first in pipeline.
                suggested_action=suggested_action,
                llm_explanation=llm_explanation,
                status=status,
                required_role=required_role
            )
            actions.append(action)
            
        total_latency = int((time.time() - start_time) * 1000)
        
        decision = AgentDecision(
            run_id=self.run_id,
            agent_name="ResolutionAgent",
            input_data={"discrepancies": len(discrepancies)},
            reasoning={"rules": "Policy thresholds and mapping table"},
            output_data={"actions_generated": len(actions)},
            confidence=100.0,
            latency_ms=total_latency
        )
        self.db.add(decision)
        
        return actions
