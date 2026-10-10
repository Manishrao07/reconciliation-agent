import time
from typing import Dict, Any, List
from decimal import Decimal
from sqlalchemy.orm import Session
from datetime import timedelta
from db.models import Discrepancy, DiscrepancyTypeEnum, SeverityEnum, AgentDecision
from core.config import settings

class AnomalyAgent:
    def __init__(self, db: Session, run_id: int):
        self.db = db
        self.run_id = run_id
        
    def execute(self, matched_results: Dict[str, Any]) -> List[Discrepancy]:
        start_time = time.time()
        discrepancies = []
        
        matched_data = matched_results["matched_data"]
        orphan_payments = matched_results["orphan_payments"]
        
        tol = Decimal(str(settings.AMOUNT_TOLERANCE))
        date_window = timedelta(days=settings.DATE_WINDOW_DAYS)
        
        for order_id, data in matched_data.items():
            order = data["order"]
            payments = data["payments"]
            drcs = data["drcs"]
            refunds = data["refunds"]
            
            # 1. Duplicate Payments
            # Same amount, and date within window or same reference
            duplicates = set()
            for i in range(len(payments)):
                for j in range(i + 1, len(payments)):
                    p1 = payments[i]
                    p2 = payments[j]
                    if abs(p1.amount - p2.amount) <= tol:
                        if p1.reference == p2.reference or abs(p1.date - p2.date) <= date_window:
                            duplicates.add(p2) # mark p2 as duplicate
                            
            for dup in duplicates:
                discrepancies.append(Discrepancy(
                    run_id=self.run_id,
                    type=DiscrepancyTypeEnum.DUPLICATE_PAYMENT,
                    severity=SeverityEnum.HIGH,
                    description=f"Duplicate payment detected for amount {dup.amount}",
                    related_order_id=order.id,
                    related_payment_id=dup.id,
                    status="OPEN"
                ))
                
            # Filter out duplicates for total paid calculation (assume we keep the first valid one)
            valid_payments = [p for p in payments if p not in duplicates]
            total_paid = sum((p.amount for p in valid_payments), Decimal('0'))
            
            if valid_payments:
                # 2. Overpayments
                if total_paid - order.amount > tol:
                    discrepancies.append(Discrepancy(
                        run_id=self.run_id,
                        type=DiscrepancyTypeEnum.OVERPAYMENT,
                        severity=SeverityEnum.MEDIUM,
                        description=f"Overpayment. Expected {order.amount}, got {total_paid}",
                        related_order_id=order.id,
                        related_payment_id=valid_payments[0].id if valid_payments else None,
                        status="OPEN"
                    ))
                    
                # 3. Underpayments
                elif order.amount - total_paid > tol:
                    discrepancies.append(Discrepancy(
                        run_id=self.run_id,
                        type=DiscrepancyTypeEnum.UNDERPAYMENT,
                        severity=SeverityEnum.MEDIUM,
                        description=f"Underpayment. Expected {order.amount}, got {total_paid}",
                        related_order_id=order.id,
                        related_payment_id=valid_payments[0].id if valid_payments else None,
                        status="OPEN"
                    ))
            
            # 4. Missing DRC
            if len(drcs) == 0 and len(payments) > 0:
                discrepancies.append(Discrepancy(
                    run_id=self.run_id,
                    type=DiscrepancyTypeEnum.MISSING_DRC,
                    severity=SeverityEnum.LOW,
                    description=f"Payment received but no DRC found",
                    related_order_id=order.id,
                    status="OPEN"
                ))
                
            # 6. Excess Refund
            for p in valid_payments:
                total_refunded = sum((r.amount for r in refunds if r.payment_id == p.id), Decimal('0'))
                if total_refunded - p.amount > tol:
                    discrepancies.append(Discrepancy(
                        run_id=self.run_id,
                        type=DiscrepancyTypeEnum.EXCESS_REFUND,
                        severity=SeverityEnum.HIGH,
                        description=f"Refund {total_refunded} exceeds payment {p.amount}",
                        related_order_id=order.id,
                        related_payment_id=p.id,
                        status="OPEN"
                    ))
                    
        # 5. Orphan Payments
        for op in orphan_payments:
            discrepancies.append(Discrepancy(
                run_id=self.run_id,
                type=DiscrepancyTypeEnum.ORPHAN_PAYMENT,
                severity=SeverityEnum.HIGH,
                description=f"Payment {op.amount} has no matching order",
                related_payment_id=op.id,
                status="OPEN"
            ))
            
        latency = int((time.time() - start_time) * 1000)
        
        decision = AgentDecision(
            run_id=self.run_id,
            agent_name="AnomalyAgent",
            input_data={"groups": len(matched_data), "orphans": len(orphan_payments)},
            reasoning={"rules": ["DUPLICATE_PAYMENT", "OVERPAYMENT", "UNDERPAYMENT", "MISSING_DRC", "ORPHAN_PAYMENT", "EXCESS_REFUND"]},
            output_data={"discrepancies_found": len(discrepancies)},
            confidence=100.0,
            latency_ms=latency
        )
        self.db.add(decision)
        
        return discrepancies
