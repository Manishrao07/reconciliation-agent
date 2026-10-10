import pytest
from decimal import Decimal
from datetime import datetime, timezone
from services.reconciliation.agents.matching import MatchingAgent
from services.reconciliation.agents.anomaly import AnomalyAgent
from db.models import Order, Payment, DRC, Refund, ReconciliationRun, DiscrepancyTypeEnum

def test_matching_rules(db_session):
    run = ReconciliationRun(status="IN_PROGRESS")
    import uuid
    uid = str(uuid.uuid4())[:8]
    
    from db.models import Customer
    c = Customer(id=f"C1_{uid}", name="C1")
    db_session.add(c)
    db_session.commit()
    
    # Matching rule 1: Order + DRC + Payment (exact match)
    o1 = Order(id=f"O1_{uid}", customer_id=f"C1_{uid}", amount=Decimal("100"), currency="USD", date=datetime.now(timezone.utc), status="DELIVERED")
    d1 = DRC(id=f"D1_{uid}", order_id=f"O1_{uid}", status="CONFIRMED", date=datetime.now(timezone.utc))
    p1 = Payment(id=f"P1_{uid}", order_id=f"O1_{uid}", amount=Decimal("100"), currency="USD", reference=f"REF1_{uid}", date=datetime.now(timezone.utc))
    
    db_session.add(o1)
    db_session.flush()
    db_session.add_all([d1, p1])
    db_session.commit()
    
    agent = MatchingAgent(db_session, run.id)
    matches = agent.execute()
    
    assert len(matches["matched_data"]) >= 1
    assert matches["matched_data"][f"O1_{uid}"]["order"].id == f"O1_{uid}"

def test_anomaly_rules(db_session):
    run = ReconciliationRun(status="IN_PROGRESS")
    db_session.add(run)
    db_session.commit()
    
    now = datetime.now(timezone.utc)
    import uuid
    uid = str(uuid.uuid4())[:8]
    from db.models import Customer
    c = Customer(id=f"C_{uid}", name="C")
    db_session.add(c)
    db_session.commit()
    
    # Setup mocked orders for each anomaly
    # 1. OVERPAYMENT
    o_over = Order(id=f"O_OVER_{uid}", customer_id=f"C_{uid}", amount=Decimal("100"), currency="USD", date=now, status="DELIVERED")
    d_over = DRC(id=f"D_OVER_{uid}", order_id=f"O_OVER_{uid}", status="CONFIRMED", date=now)
    p_over = Payment(id=f"P_OVER_{uid}", order_id=f"O_OVER_{uid}", amount=Decimal("150"), currency="USD", reference=f"REF_OVER_{uid}", date=now)
    
    # 2. UNDERPAYMENT
    o_under = Order(id=f"O_UNDER_{uid}", customer_id=f"C_{uid}", amount=Decimal("100"), currency="USD", date=now, status="DELIVERED")
    d_under = DRC(id=f"D_UNDER_{uid}", order_id=f"O_UNDER_{uid}", status="CONFIRMED", date=now)
    p_under = Payment(id=f"P_UNDER_{uid}", order_id=f"O_UNDER_{uid}", amount=Decimal("50"), currency="USD", reference=f"REF_UNDER_{uid}", date=now)
    
    # 3. MISSING_DRC
    o_nodrc = Order(id=f"O_NODRC_{uid}", customer_id=f"C_{uid}", amount=Decimal("100"), currency="USD", date=now, status="DELIVERED")
    p_nodrc = Payment(id=f"P_NODRC_{uid}", order_id=f"O_NODRC_{uid}", amount=Decimal("100"), currency="USD", reference=f"REF_NODRC_{uid}", date=now)
    
    # 4. ORPHAN_PAYMENT (No order)
    p_orphan = Payment(id=f"P_ORPHAN_{uid}", order_id=None, amount=Decimal("100"), currency="USD", reference=f"REF_ORPHAN_{uid}", date=now)
    
    # 5. EXCESS_REFUND
    o_ref = Order(id=f"O_REF_{uid}", customer_id=f"C_{uid}", amount=Decimal("100"), currency="USD", date=now, status="DELIVERED")
    d_ref = DRC(id=f"D_REF_{uid}", order_id=f"O_REF_{uid}", status="CONFIRMED", date=now)
    p_ref = Payment(id=f"P_REF_{uid}", order_id=f"O_REF_{uid}", amount=Decimal("100"), currency="USD", reference=f"REF_REF_{uid}", date=now)
    r_excess = Refund(id=f"R_EXCESS_{uid}", payment_id=f"P_REF_{uid}", amount=Decimal("150"), currency="USD", reason="", date=now)
    
    # 6. DUPLICATE_PAYMENT
    o_dup = Order(id=f"O_DUP_{uid}", customer_id=f"C_{uid}", amount=Decimal("100"), currency="USD", date=now, status="DELIVERED")
    d_dup = DRC(id=f"D_DUP_{uid}", order_id=f"O_DUP_{uid}", status="CONFIRMED", date=now)
    p_dup1 = Payment(id=f"P_DUP1_{uid}", order_id=f"O_DUP_{uid}", amount=Decimal("100"), currency="USD", reference=f"REF_DUP_{uid}", date=now)
    p_dup2 = Payment(id=f"P_DUP2_{uid}", order_id=f"O_DUP_{uid}", amount=Decimal("100"), currency="USD", reference=f"REF_DUP_{uid}", date=now)
    
    db_session.add_all([
        o_over, o_under, o_nodrc, o_ref, o_dup
    ])
    db_session.flush()
    db_session.add_all([
        d_over, p_over,
        d_under, p_under,
        p_nodrc,
        p_orphan,
        d_ref, p_ref,
        d_dup, p_dup1, p_dup2
    ])
    db_session.flush()
    db_session.add(r_excess)
    db_session.commit()
    
    m_agent = MatchingAgent(db_session, run.id)
    matches = m_agent.execute()
    
    a_agent = AnomalyAgent(db_session, run.id)
    discrepancies = a_agent.execute(matches)
    
    types = [d.type for d in discrepancies]
    assert DiscrepancyTypeEnum.OVERPAYMENT in types
    assert DiscrepancyTypeEnum.UNDERPAYMENT in types
    assert DiscrepancyTypeEnum.MISSING_DRC in types
    assert DiscrepancyTypeEnum.ORPHAN_PAYMENT in types
    assert DiscrepancyTypeEnum.EXCESS_REFUND in types
    assert DiscrepancyTypeEnum.DUPLICATE_PAYMENT in types

def test_audit_immutability(db_session):
    from db.models import AuditLog
    from sqlalchemy.exc import IntegrityError, InternalError
    from sqlalchemy import text
    
    log = AuditLog(action="TEST", entity_type="TEST")
    db_session.add(log)
    db_session.commit()
    
    # Test UPDATE blocked
    log.action = "HACKED"
    with pytest.raises(InternalError):
        db_session.commit()
    db_session.rollback()
    
    # Test DELETE blocked
    log = db_session.query(AuditLog).first()
    db_session.delete(log)
    with pytest.raises(InternalError):
        db_session.commit()
    db_session.rollback()
    
    # Test TRUNCATE blocked
    with pytest.raises(Exception):
        db_session.execute(text("TRUNCATE TABLE audit_logs"))
    db_session.rollback()

def test_pipeline_execution(db_session):
    from services.reconciliation.pipeline import execute_reconciliation_run
    from db.models import User, RoleEnum
    from core.security import get_password_hash
    
    # Create user
    from core.config import settings
    pwd = get_password_hash(settings.SEED_DEMO_PASSWORD)
    u = db_session.query(User).filter(User.email == "pipeline_test@example.com").first()
    if not u:
        u = User(email="pipeline_test@example.com", hashed_password=pwd, role=RoleEnum.ADMIN)
        db_session.add(u)
        db_session.commit()
        
    run = ReconciliationRun(status="QUEUED", user_id=u.id)
    db_session.add(run)
    db_session.commit()
    db_session.refresh(run)
    
    from unittest import mock
    from core.config import settings
    with mock.patch.object(settings, 'LLM_PROVIDER', 'mock'):
        execute_reconciliation_run(db_session, u.id, run.id)
    
    db_session.refresh(run)
    assert run.status == "COMPLETED"
