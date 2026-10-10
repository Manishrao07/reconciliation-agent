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
        
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
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
                "related_payment_id": d.related_payment_id
            } for d in items
        ]
    }

@router.get("/{id}")
def get_discrepancy(id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    d = db.query(Discrepancy).filter(Discrepancy.id == id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Discrepancy not found")
        
    action = db.query(CorrectiveAction).filter(CorrectiveAction.discrepancy_id == d.id).first()
    
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
