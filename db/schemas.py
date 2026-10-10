from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Any
from db.models import RoleEnum, DiscrepancyTypeEnum, SeverityEnum, ActionStatusEnum

class SchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class UserBase(SchemaBase):
    email: str
    role: RoleEnum
    is_active: bool

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

class DiscrepancyBase(SchemaBase):
    run_id: int
    type: DiscrepancyTypeEnum
    severity: SeverityEnum
    description: str
    related_order_id: Optional[str] = None
    related_payment_id: Optional[str] = None
    status: str

class DiscrepancyResponse(DiscrepancyBase):
    id: int
    created_at: datetime
    updated_at: datetime

class ActionBase(SchemaBase):
    discrepancy_id: int
    suggested_action: str
    llm_explanation: Optional[str] = None
    status: ActionStatusEnum
    required_role: RoleEnum

class ActionResponse(ActionBase):
    id: int
    created_at: datetime
    updated_at: datetime

class RunBase(SchemaBase):
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    total_records: Optional[int] = None
    match_rate: Optional[float] = None

class RunResponse(RunBase):
    id: int
    created_at: datetime
    updated_at: datetime
