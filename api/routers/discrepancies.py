from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.database import get_db
from db.models import Discrepancy, CorrectiveAction
from api.dependencies import get_current_user
from services.approvals import process_approval

router = APIRouter(prefix="/discrepancies", tags=["Discrepancies"])

class ApprovalRequest(BaseModel):
    comments: Optional[str] = None

@router.get("")
def list_discrepancies(
    run_id: Optional[int] = None,
    type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    action_status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    query = db.query(Discrepancy)
    if run_id:
        query = query.filter(Discrepancy.run_id == run_id)
    if type:
        query = query.filter(Discrepancy.type == type)
    if severity:
        query = query.filter(Discrepancy.severity == severity)
    if status:
        query = query.filter(Discrepancy.status == status)
        
    items = query.order_by(Discrepancy.id.desc()).all()

    disc_ids = [d.id for d in items]
    actions_map = {}
    if disc_ids:
        actions = db.query(CorrectiveAction).filter(CorrectiveAction.discrepancy_id.in_(disc_ids)).all()
        for a in actions:
            actions_map[a.discrepancy_id] = a

    if action_status:
        if action_status == "PENDING":
            items = [d for d in items if d.id in actions_map and actions_map[d.id].status.value == "PENDING"]
        elif action_status == "APPROVED":
            items = [d for d in items if d.id in actions_map and actions_map[d.id].status.value == "APPROVED"]
        elif action_status == "REJECTED":
            items = [d for d in items if d.id in actions_map and actions_map[d.id].status.value == "REJECTED"]

    total = len(items)
    paged_items = items[skip : skip + limit]
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "data": [
            {
                "id": d.id,
                "run_id": d.run_id,
                "type": d.type,
                "severity": d.severity,
                "description": d.description,
                "status": d.status,
                "related_order_id": d.related_order_id,
                "related_payment_id": d.related_payment_id,
                "action_status": actions_map[d.id].status.value if d.id in actions_map else None,
                "required_role": actions_map[d.id].required_role.value if d.id in actions_map else None,
                "suggested_action": actions_map[d.id].suggested_action if d.id in actions_map else None
            } for d in paged_items
        ]
    }

@router.get("/{id}")
def get_discrepancy(id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    d = db.query(Discrepancy).filter(Discrepancy.id == id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Discrepancy not found")
        
    action = db.query(CorrectiveAction).filter(CorrectiveAction.discrepancy_id == d.id).first()
    if not action:
        # Generate on the fly so even historical/interrupted discrepancies receive full AI reasoning
        try:
            from services.reconciliation.agents.resolution import ResolutionAgent
            res_agent = ResolutionAgent(db, d.run_id)
            actions = res_agent.execute([d])
            if actions:
                db.add(actions[0])
                db.commit()
                db.refresh(actions[0])
                action = actions[0]
        except Exception as e:
            print(f"On-the-fly action generation failed: {e}")
    
    return {
        "id": d.id,
        "run_id": d.run_id,
        "type": d.type,
        "severity": d.severity,
        "description": d.description,
        "status": d.status,
        "action": {
            "id": action.id,
            "suggested_action": action.suggested_action,
            "llm_explanation": action.llm_explanation,
            "explanation_source": action.explanation_source,
            "status": action.status,
            "required_role": action.required_role
        } if action else None
    }

@router.post("/{id}/approve")
def approve_discrepancy(id: int, req: ApprovalRequest = None, db: Session = Depends(get_db), user = Depends(get_current_user)):
    action = db.query(CorrectiveAction).filter(CorrectiveAction.discrepancy_id == id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found for this discrepancy")
        
    comments = req.comments if req else None
    approval = process_approval(db, action.id, user, "APPROVED", comments)
    
    return {"message": "Action approved", "approval_id": approval.id}

@router.post("/{id}/reject")
def reject_discrepancy(id: int, req: ApprovalRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    action = db.query(CorrectiveAction).filter(CorrectiveAction.discrepancy_id == id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found for this discrepancy")
        
    approval = process_approval(db, action.id, user, "REJECTED", req.comments)
    
    return {"message": "Action rejected", "approval_id": approval.id}
