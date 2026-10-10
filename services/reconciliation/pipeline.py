from datetime import datetime, timezone
from sqlalchemy.orm import Session
from db.models import ReconciliationRun, Order, Discrepancy
from services.audit import log_audit_action
from services.reconciliation.agents.matching import MatchingAgent
from services.reconciliation.agents.anomaly import AnomalyAgent
from services.reconciliation.agents.resolution import ResolutionAgent

def execute_reconciliation_run(db: Session, user_id: int = None, run_id: int = None):
    if run_id:
        run = db.query(ReconciliationRun).filter(ReconciliationRun.id == run_id).first()
        run.status = "IN_PROGRESS"
    else:
        run = ReconciliationRun(status="IN_PROGRESS", user_id=user_id)
        db.add(run)
        
    db.commit()
    db.refresh(run)
    
    log_audit_action(
        db=db,
        action="RUN_START",
        entity_type="ReconciliationRun",
        entity_id=str(run.id),
        user_id=user_id,
        new_value={"status": "IN_PROGRESS"}
    )
    
    try:
        total_records = db.query(Order).count()
        
        # 2. Matching Agent
        matching_agent = MatchingAgent(db, run.id)
        matched_results = matching_agent.execute()
        
        # 3. Anomaly Agent
        anomaly_agent = AnomalyAgent(db, run.id)
        discrepancies = anomaly_agent.execute(matched_results)
        
        # Flush to get IDs for discrepancies
        for d in discrepancies:
            db.add(d)
        db.commit()
        
        # Refresh to get IDs
        for d in discrepancies:
            db.refresh(d)
            
        # 4. Resolution Agent
        resolution_agent = ResolutionAgent(db, run.id)
        actions = resolution_agent.execute(discrepancies)
        
        for a in actions:
            db.add(a)
        db.commit()
        
        # Refresh to get IDs
        for a in actions:
            db.refresh(a)
            log_audit_action(
                db=db,
                action="ACTION_PROPOSED",
                entity_type="CorrectiveAction",
                entity_id=str(a.id),
                user_id=user_id,
                new_value={"suggested_action": a.suggested_action, "required_role": a.required_role.value}
            )
            if a.status.value == "APPROVED":
                log_audit_action(
                    db=db,
                    action="ACTION_APPROVED",
                    entity_type="CorrectiveAction",
                    entity_id=str(a.id),
                    user_id=None,
                    new_value={"comments": "Auto-approved (< 1,000 threshold)"}
                )
        
        # 5. Finalize run
        run.status = "COMPLETED"
        run.completed_at = datetime.now(timezone.utc)
        run.total_records = total_records
        
        if total_records > 0:
            match_rate = ((total_records - len(discrepancies)) / total_records) * 100
            run.match_rate = max(0, match_rate)
        else:
            run.match_rate = 100.0
            
        db.commit()
        
        log_audit_action(
            db=db,
            action="RUN_FINISH",
            entity_type="ReconciliationRun",
            entity_id=str(run.id),
            user_id=user_id,
            new_value={"status": "COMPLETED", "discrepancies": len(discrepancies)}
        )
        
        return run
        
    except Exception as e:
        run.status = "FAILED"
        run.completed_at = datetime.now(timezone.utc)
        db.commit()
        
        log_audit_action(
            db=db,
            action="RUN_FAILED",
            entity_type="ReconciliationRun",
            entity_id=str(run.id),
            user_id=user_id,
            new_value={"error": str(e)}
        )
        raise e
