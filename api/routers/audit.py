from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import AuditLog
from api.dependencies import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("")
def list_audit_logs(
    action: str = None,
    entity_type: str = None,
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    user = Depends(get_current_user) # Only authenticated users can view logs
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
        
    logs = query.order_by(AuditLog.id.desc()).limit(limit).all()
    
    return [
        {
            "id": l.id,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "user_id": l.user_id,
            "old_value": l.old_value,
            "new_value": l.new_value,
            "timestamp": l.timestamp
        }
        for l in logs
    ]

@router.get("/agent-decisions")
def list_agent_decisions(
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    from db.models import AgentDecision
    decisions = db.query(AgentDecision).order_by(AgentDecision.id.desc()).limit(limit).all()
    
    return [
        {
            "id": d.id,
            "run_id": d.run_id,
            "agent_name": d.agent_name,
            "input_data": d.input_data,
            "reasoning": d.reasoning,
            "output_data": d.output_data,
            "confidence": d.confidence,
            "latency_ms": d.latency_ms,
            "created_at": d.created_at
        }
        for d in decisions
    ]
