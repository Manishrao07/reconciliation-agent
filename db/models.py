import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey, 
    DateTime, Numeric, Enum, JSON
)
from sqlalchemy.orm import relationship
from db.database import Base

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    FINANCE_MANAGER = "FINANCE_MANAGER"
    AUDITOR = "AUDITOR"
    NONE = "NONE"

class DiscrepancyTypeEnum(str, enum.Enum):
    DUPLICATE_PAYMENT = "DUPLICATE_PAYMENT"
    OVERPAYMENT = "OVERPAYMENT"
    UNDERPAYMENT = "UNDERPAYMENT"
    MISSING_DRC = "MISSING_DRC"
    ORPHAN_PAYMENT = "ORPHAN_PAYMENT"
    EXCESS_REFUND = "EXCESS_REFUND"

class SeverityEnum(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class ActionStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.AUDITOR, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Customer(Base):
    __tablename__ = "customers"
    id = Column(String, primary_key=True, index=True) # E.g., CUST001
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String, default="USD", nullable=False)
    status = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class DRC(Base):
    __tablename__ = "drcs"
    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    status = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Payment(Base):
    __tablename__ = "payments"
    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=True) # Nullable for orphans
    amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String, default="USD", nullable=False)
    reference = Column(String, nullable=True)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Refund(Base):
    __tablename__ = "refunds"
    id = Column(String, primary_key=True, index=True)
    payment_id = Column(String, ForeignKey("payments.id"), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String, default="USD", nullable=False)
    reason = Column(String, nullable=True)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class ReconciliationRun(Base):
    __tablename__ = "reconciliation_runs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, nullable=False, default="IN_PROGRESS")
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    total_records = Column(Integer, nullable=True)
    match_rate = Column(Numeric(5, 2), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Discrepancy(Base):
    __tablename__ = "discrepancies"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("reconciliation_runs.id"), nullable=False)
    type = Column(Enum(DiscrepancyTypeEnum), nullable=False)
    severity = Column(Enum(SeverityEnum), nullable=False)
    description = Column(String, nullable=False)
    related_order_id = Column(String, ForeignKey("orders.id"), nullable=True)
    related_payment_id = Column(String, ForeignKey("payments.id"), nullable=True)
    status = Column(String, default="OPEN", nullable=False) # OPEN, RESOLVED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"
    id = Column(Integer, primary_key=True, index=True)
    discrepancy_id = Column(Integer, ForeignKey("discrepancies.id"), nullable=False)
    suggested_action = Column(String, nullable=False)
    llm_explanation = Column(String, nullable=True)
    explanation_source = Column(String, default="template", nullable=False)
    status = Column(Enum(ActionStatusEnum), default=ActionStatusEnum.PENDING, nullable=False)
    required_role = Column(Enum(RoleEnum), default=RoleEnum.NONE, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Approval(Base):
    __tablename__ = "approvals"
    id = Column(Integer, primary_key=True, index=True)
    action_id = Column(Integer, ForeignKey("corrective_actions.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ActionStatusEnum), nullable=False) # APPROVED, REJECTED
    comments = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class AgentDecision(Base):
    __tablename__ = "agent_decisions"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("reconciliation_runs.id"), nullable=False)
    agent_name = Column(String, nullable=False)
    input_data = Column(JSON, nullable=True)
    reasoning = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    confidence = Column(Numeric(5, 2), nullable=True)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Null for system actions
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
