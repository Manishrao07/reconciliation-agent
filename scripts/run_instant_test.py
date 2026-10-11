import os
import csv
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from db.database import SessionLocal, engine
from db.models import Customer, Order, DRC, Payment, Refund, ReconciliationRun, Discrepancy, CorrectiveAction, AgentDecision, AuditLog
from sqlalchemy import text
from services.reconciliation.pipeline import execute_reconciliation_run

def parse_date(d):
    return datetime.strptime(d, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)

def reset_and_run_test():
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE TABLE corrective_actions, discrepancies, agent_decisions, reconciliation_runs CASCADE"))
        conn.execute(text("TRUNCATE TABLE refunds, payments, drcs, orders, customers CASCADE"))
        
    db = SessionLocal()
    
    # Insert Customer
    c1 = Customer(id="C1", name="Bob")
    c2 = Customer(id="C2", name="Alice")
    c3 = Customer(id="C3", name="Charlie")
    db.add_all([c1, c2, c3])
    db.flush()
    
    # Read test thresholds
    def read_csv(filename):
        with open(filename, 'r') as f:
            return list(csv.DictReader(f))
            
    orders = read_csv('demo_data/test_thresholds/orders.csv')
    drcs = read_csv('demo_data/test_thresholds/drcs.csv')
    payments = read_csv('demo_data/test_thresholds/payments.csv')
    
    # 1. Orders
    cust_map = {"Bob": "C1", "Alice": "C2", "Charlie": "C3"}
    for o in orders:
        db.add(Order(id=o["order_id"], customer_id=cust_map[o["customer_name"]], amount=Decimal(o["amount"]), currency=o["currency"], status=o["status"], date=parse_date(o["date"])))
    db.flush()
    
    # 2. DRCs
    for d in drcs:
        db.add(DRC(id=d["drc_id"], order_id=d["order_id"], status=d["status"], date=parse_date(d["date"])))
        
    # 3. Payments
    for p in payments:
        db.add(Payment(id=p["payment_id"], order_id=p["order_id"], amount=Decimal(p["amount"]), currency=p["currency"], reference=p["reference"], date=parse_date(p["date"])))
        
    db.commit()
    
    # Trigger run
    print("Executing pipeline...")
    run = execute_reconciliation_run(db, user_id=1, run_id=None)
    print("Pipeline completed!")
    
    db.close()

if __name__ == "__main__":
    reset_and_run_test()
