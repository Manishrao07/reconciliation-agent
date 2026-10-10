from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from db.models import AuditLog

def log_audit_action(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    user_id: Optional[int] = None,
    old_value: Optional[Dict[str, Any]] = None,
    new_value: Optional[Dict[str, Any]] = None
):
    """
    Append-only audit log. No rows should ever be updated or deleted.
    """
    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        old_value=old_value,
        new_value=new_value
    )
    db.add(audit_entry)
    db.commit()
    return audit_entry
