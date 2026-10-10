from sqlalchemy.orm import Session
from fastapi import HTTPException
from db.models import User, CorrectiveAction, Approval, ActionStatusEnum, RoleEnum, ReconciliationRun, Discrepancy
from services.audit import log_audit_action

def can_approve_action(user: User, action: CorrectiveAction, run: ReconciliationRun) -> bool:
    # 1. Auditor is read-only
    if user.role == RoleEnum.AUDITOR:
        return False
        
    # 2. Maker-checker: proposer cannot approve their own action
    if run.user_id == user.id:
        return False
        
    # 3. Check role threshold
    if action.required_role == RoleEnum.ADMIN and user.role != RoleEnum.ADMIN:
        return False
    if action.required_role == RoleEnum.FINANCE_MANAGER and user.role not in [RoleEnum.ADMIN, RoleEnum.FINANCE_MANAGER]:
        return False
        
    return True

def process_approval(
    db: Session, 
    action_id: int, 
    user: User, 
    status: str, # "APPROVED" or "REJECTED"
    comments: str = None
) -> Approval:
    
    if status == "REJECTED" and not comments:
        raise HTTPException(status_code=422, detail="Comment is required when rejecting an action")
        
    action = db.query(CorrectiveAction).filter(CorrectiveAction.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
        
    if action.status != ActionStatusEnum.PENDING:
        raise HTTPException(status_code=400, detail="Action is not pending")
        
    discrepancy = db.query(Discrepancy).filter(Discrepancy.id == action.discrepancy_id).first()
    run = db.query(ReconciliationRun).filter(ReconciliationRun.id == discrepancy.run_id).first()
    
    if not can_approve_action(user, action, run):
        raise HTTPException(status_code=403, detail="You do not have permission to approve/reject this action")
        
    # Proceed to record approval
    approval = Approval(
        action_id=action.id,
        approver_id=user.id,
        status=ActionStatusEnum[status],
        comments=comments
    )
    db.add(approval)
    
    action.status = ActionStatusEnum[status]
    db.commit()
    db.refresh(action)
    db.refresh(approval)
    
    log_audit_action(
        db=db,
        action="ACTION_APPROVED" if status == "APPROVED" else "ACTION_REJECTED",
        entity_type="CorrectiveAction",
        entity_id=str(action.id),
        user_id=user.id,
        new_value={"status": status, "comments": comments}
    )
    
    return approval
