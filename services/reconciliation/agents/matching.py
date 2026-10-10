import time
from typing import Dict, Any, List
from decimal import Decimal
from sqlalchemy.orm import Session
from datetime import timedelta
from db.models import Order, Payment, DRC, Refund, AgentDecision
from core.config import settings

class MatchingAgent:
    def __init__(self, db: Session, run_id: int):
        self.db = db
        self.run_id = run_id
        
    def execute(self) -> Dict[str, Any]:
        start_time = time.time()
        
        # Load all open data
        orders = self.db.query(Order).all()
        payments = self.db.query(Payment).all()
        
        # Simple rule: group payments by order_id, or by matching amount and close date
        # But for this simple implementation, payments with an order_id are directly matched.
        # Orphan payments have no order_id. We'll leave them as is, Anomaly agent will catch them.
        # Also need to map DRCs and Refunds
        
        drcs = self.db.query(DRC).all()
        refunds = self.db.query(Refund).all()
        
        matched_data = {}
        for order in orders:
            matched_data[order.id] = {
                "order": order,
                "payments": [],
                "drcs": [],
                "refunds": []
            }
            
        orphan_payments = []
            
        for payment in payments:
            if payment.order_id and payment.order_id in matched_data:
                matched_data[payment.order_id]["payments"].append(payment)
            else:
                orphan_payments.append(payment)
                
        for drc in drcs:
            if drc.order_id in matched_data:
                matched_data[drc.order_id]["drcs"].append(drc)
                
        # Refunds belong to payments
        for refund in refunds:
            found = False
            for order_id, data in matched_data.items():
                for p in data["payments"]:
                    if p.id == refund.payment_id:
                        data["refunds"].append(refund)
                        found = True
                        break
                if found:
                    break

        latency = int((time.time() - start_time) * 1000)
        
        decision = AgentDecision(
            run_id=self.run_id,
            agent_name="MatchingAgent",
            input_data={"orders_count": len(orders), "payments_count": len(payments)},
            reasoning={"rule": "Group by order_id or mark as orphan"},
            output_data={"matched_groups": len(matched_data), "orphans": len(orphan_payments)},
            confidence=100.0,
            latency_ms=latency
        )
        self.db.add(decision)
        
        return {
            "matched_data": matched_data,
            "orphan_payments": orphan_payments
        }
