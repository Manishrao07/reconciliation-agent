import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.models import Discrepancy, DiscrepancyTypeEnum, CorrectiveAction
from services.reconciliation.agents.resolution import ResolutionAgent
from db.database import SessionLocal

def run():
    db = SessionLocal()
    from db.models import ReconciliationRun
    run = ReconciliationRun(status="COMPLETED")
    db.add(run)
    db.commit()
    db.refresh(run)

    disc1 = Discrepancy(
        run_id=run.id,
        type=DiscrepancyTypeEnum.ORPHAN_PAYMENT,
        severity="HIGH",
        description="Payment found without an order"
    )
    disc2 = Discrepancy(
        run_id=run.id,
        type=DiscrepancyTypeEnum.DUPLICATE_PAYMENT,
        severity="MEDIUM",
        description="Possible duplicate payment detected"
    )
    disc3 = Discrepancy(
        run_id=run.id,
        type=DiscrepancyTypeEnum.OVERPAYMENT,
        severity="LOW",
        description="Amount paid exceeds order total"
    )
    db.add_all([disc1, disc2, disc3])
    db.commit()
    
    agent = ResolutionAgent(db, run.id)
    actions = agent.execute([disc1, disc2, disc3])
    
    for a in actions:
        print(f"Source: {a.explanation_source}")
        print(f"Explanation: {a.llm_explanation}")

if __name__ == "__main__":
    run()
