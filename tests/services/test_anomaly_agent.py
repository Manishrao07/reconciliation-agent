import pytest
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from unittest.mock import MagicMock
from db.models import Order, Payment, Refund
from services.reconciliation.agents.anomaly import AnomalyAgent
from core.config import settings

@pytest.fixture
def mock_db():
    db = MagicMock()
    return db

def make_order(amount: float):
    return Order(id="ORD1", amount=Decimal(str(amount)), currency="USD", date=datetime.now(timezone.utc))

def make_payment(id_str: str, amount: float, date: datetime, ref: str = ""):
    return Payment(id=id_str, order_id="ORD1", amount=Decimal(str(amount)), currency="USD", date=date, reference=ref)

def test_duplicate_and_overpayment_rule_avoid_double_counting(mock_db):
    agent = AnomalyAgent(mock_db, run_id=1)
    # Order for 100, two identical payments of 100
    order = make_order(100.0)
    d1 = datetime.now(timezone.utc)
    p1 = make_payment("P1", 100.0, d1, "REF1")
    p2 = make_payment("P2", 100.0, d1, "REF1") # Exact duplicate

    matched_results = {
        "matched_data": {
            "ORD1": {"order": order, "payments": [p1, p2], "drcs": ["mock_drc"], "refunds": []}
        },
        "orphan_payments": []
    }
    
    discrepancies = agent.execute(matched_results)
    
    types = [d.type.value for d in discrepancies]
    assert "DUPLICATE_PAYMENT" in types
    assert "OVERPAYMENT" not in types, "Duplicate payment was double-counted, causing a false overpayment!"

def test_payment_amount_boundary_tolerance(mock_db):
    agent = AnomalyAgent(mock_db, run_id=1)
    # Order for 100, paid 100.05
    # Tolerance is 0.05
    # Should NOT be flagged as overpayment because diff <= tol
    order = make_order(100.0)
    p = make_payment("P1", 100.0 + settings.AMOUNT_TOLERANCE, datetime.now(timezone.utc))
    
    matched_results = {
        "matched_data": {
            "ORD1": {"order": order, "payments": [p], "drcs": ["mock_drc"], "refunds": []}
        },
        "orphan_payments": []
    }
    
    discrepancies = agent.execute(matched_results)
    assert len(discrepancies) == 0, f"Expected 0 discrepancies, got {len(discrepancies)}"

def test_payment_date_boundary_tolerance(mock_db):
    agent = AnomalyAgent(mock_db, run_id=1)
    order = make_order(100.0)
    d1 = datetime.now(timezone.utc)
    d2 = d1 + timedelta(days=settings.DATE_WINDOW_DAYS)
    
    p1 = make_payment("P1", 100.0, d1)
    p2 = make_payment("P2", 100.0, d2)
    # They differ exactly by date_window, they should be flagged as duplicates
    
    matched_results = {
        "matched_data": {
            "ORD1": {"order": order, "payments": [p1, p2], "drcs": ["mock_drc"], "refunds": []}
        },
        "orphan_payments": []
    }
    
    discrepancies = agent.execute(matched_results)
    types = [d.type.value for d in discrepancies]
    assert "DUPLICATE_PAYMENT" in types

def test_partial_payments_summing_to_order(mock_db):
    agent = AnomalyAgent(mock_db, run_id=1)
    # 500 + 500 on a 1,000 order, 2 days apart, different refs -> NO discrepancy
    order = make_order(1000.0)
    d1 = datetime.now(timezone.utc)
    p1 = make_payment("P1", 500.0, d1, "REF1")
    p2 = make_payment("P2", 500.0, d1 + timedelta(days=2), "REF2")
    
    matched_results = {
        "matched_data": {
            "ORD1": {"order": order, "payments": [p1, p2], "drcs": ["mock_drc"], "refunds": []}
        },
        "orphan_payments": []
    }
    
    discrepancies = agent.execute(matched_results)
    assert len(discrepancies) == 0

def test_identical_payments_over_order(mock_db):
    agent = AnomalyAgent(mock_db, run_id=1)
    # 1000 + 1000 on a 1000 order, 2 days apart, different refs -> 1 DUPLICATE_PAYMENT, 0 overpayment
    order = make_order(1000.0)
    d1 = datetime.now(timezone.utc)
    p1 = make_payment("P1", 1000.0, d1, "REF1")
    p2 = make_payment("P2", 1000.0, d1 + timedelta(days=2), "REF2")
    
    matched_results = {
        "matched_data": {
            "ORD1": {"order": order, "payments": [p1, p2], "drcs": ["mock_drc"], "refunds": []}
        },
        "orphan_payments": []
    }
    
    discrepancies = agent.execute(matched_results)
    types = [d.type.value for d in discrepancies]
    assert types.count("DUPLICATE_PAYMENT") == 1
    assert "OVERPAYMENT" not in types

def test_same_reference_far_apart(mock_db):
    agent = AnomalyAgent(mock_db, run_id=1)
    # 1000 + 1000 with same reference, far apart dates -> 1 DUPLICATE_PAYMENT
    order = make_order(1000.0)
    d1 = datetime.now(timezone.utc)
    p1 = make_payment("P1", 1000.0, d1, "SAmEREF")
    p2 = make_payment("P2", 1000.0, d1 + timedelta(days=50), "SAmEREF")
    
    matched_results = {
        "matched_data": {
            "ORD1": {"order": order, "payments": [p1, p2], "drcs": ["mock_drc"], "refunds": []}
        },
        "orphan_payments": []
    }
    
    discrepancies = agent.execute(matched_results)
    types = [d.type.value for d in discrepancies]
    assert types.count("DUPLICATE_PAYMENT") == 1

def test_three_identical_payments(mock_db):
    agent = AnomalyAgent(mock_db, run_id=1)
    # three identical payments -> 2 duplicates
    order = make_order(1000.0)
    d1 = datetime.now(timezone.utc)
    p1 = make_payment("P1", 1000.0, d1, "REF1")
    p2 = make_payment("P2", 1000.0, d1, "REF1")
    p3 = make_payment("P3", 1000.0, d1, "REF1")
    
    matched_results = {
        "matched_data": {
            "ORD1": {"order": order, "payments": [p1, p2, p3], "drcs": ["mock_drc"], "refunds": []}
        },
        "orphan_payments": []
    }
    
    discrepancies = agent.execute(matched_results)
    types = [d.type.value for d in discrepancies]
    assert types.count("DUPLICATE_PAYMENT") == 2
    assert "OVERPAYMENT" not in types

def test_refund_equal_to_payment(mock_db):
    agent = AnomalyAgent(mock_db, run_id=1)
    order = make_order(100.0)
    p1 = make_payment("P1", 100.0, datetime.now(timezone.utc))
    r1 = Refund(id="R1", payment_id="P1", amount=Decimal('100.00'), currency="USD", date=datetime.now(timezone.utc))
    
    matched_results = {
        "matched_data": {
            "ORD1": {"order": order, "payments": [p1], "drcs": ["mock_drc"], "refunds": [r1]}
        },
        "orphan_payments": []
    }
    
    discrepancies = agent.execute(matched_results)
    types = [d.type.value for d in discrepancies]
    assert "EXCESS_REFUND" not in types

def test_600_plus_600_on_1000_order(mock_db):
    agent = AnomalyAgent(mock_db, run_id=1)
    # 600 + 600 on a 1,000 order (different references, within date window)
    order = make_order(1000.0)
    d1 = datetime.now(timezone.utc)
    p1 = make_payment("P1", 600.0, d1, "REF1")
    p2 = make_payment("P2", 600.0, d1, "REF2")
    
    matched_results = {
        "matched_data": {
            "ORD1": {"order": order, "payments": [p1, p2], "drcs": ["mock_drc"], "refunds": []}
        },
        "orphan_payments": []
    }
    
    discrepancies = agent.execute(matched_results)
    types = [d.type.value for d in discrepancies]
    assert types.count("OVERPAYMENT") == 1
    assert "DUPLICATE_PAYMENT" not in types
    assert "UNDERPAYMENT" not in types
