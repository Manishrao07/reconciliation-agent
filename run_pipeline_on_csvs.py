import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from db.models import Customer, Order, DRC, Payment, Refund, Discrepancy
from services.reconciliation.pipeline import execute_reconciliation_run
from core.config import settings
from datetime import datetime

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def load_csvs(db):
    print("Loading CSVs...")
    
    # 1. Orders
    df_orders = pd.read_csv("demo_data/orders.csv")
    for _, row in df_orders.iterrows():
        # Auto-create customer
        cust_name = row['customer_name']
        customer = db.query(Customer).filter(Customer.name == cust_name).first()
        if not customer:
            # Generate a simple ID
            cust_id = f"CUST_{len(db.query(Customer).all()) + 1}"
            customer = Customer(id=cust_id, name=cust_name)
            db.add(customer)
            db.commit()
            
        order = Order(
            id=row['order_id'],
            customer_id=customer.id,
            amount=row['amount'],
            currency=row['currency'],
            status=row['status'],
            date=datetime.strptime(row['date'], "%Y-%m-%dT%H:%M:%SZ")
        )
        db.add(order)
        
    db.commit()
    
    # 2. DRCs
    df_drcs = pd.read_csv("demo_data/drcs.csv")
    for _, row in df_drcs.iterrows():
        drc = DRC(
            id=row['drc_id'],
            order_id=row['order_id'],
            status=row['status'],
            date=datetime.strptime(row['date'], "%Y-%m-%dT%H:%M:%SZ")
        )
        db.add(drc)
    db.commit()
    
    # 3. Payments
    df_payments = pd.read_csv("demo_data/payments.csv")
    for _, row in df_payments.iterrows():
        payment = Payment(
            id=row['payment_id'],
            order_id=row['order_id'] if pd.notna(row['order_id']) else None,
            amount=row['amount'],
            currency=row['currency'],
            reference=row['reference'],
            date=datetime.strptime(row['date'], "%Y-%m-%dT%H:%M:%SZ")
        )
        db.add(payment)
    db.commit()
    
    # 4. Refunds
    df_refunds = pd.read_csv("demo_data/refunds.csv")
    for _, row in df_refunds.iterrows():
        refund = Refund(
            id=row['refund_id'],
            payment_id=row['payment_id'],
            amount=row['amount'],
            currency=row['currency'],
            reason=row['reason'] if pd.notna(row['reason']) else "",
            date=datetime.strptime(row['date'], "%Y-%m-%dT%H:%M:%SZ")
        )
        db.add(refund)
    db.commit()
    print("CSVs loaded.")

def run():
    db = SessionLocal()
    try:
        # Truncate tables for fresh run (except users)
        with engine.begin() as conn:
            conn.execute(text("TRUNCATE TABLE refunds, payments, drcs, orders, customers CASCADE"))
            conn.execute(text("TRUNCATE TABLE corrective_actions, discrepancies, agent_decisions, reconciliation_runs CASCADE"))
        
        load_csvs(db)
        
        print("Executing reconciliation run...")
        run_record = execute_reconciliation_run(db, user_id=None)
        
        print(f"Run completed in status {run_record.status}. Match rate: {run_record.match_rate}%")
        
        discrepancies = db.query(Discrepancy).filter(Discrepancy.run_id == run_record.id).all()
        
        counts = {}
        for d in discrepancies:
            counts[d.type.value] = counts.get(d.type.value, 0) + 1
            
        print("\n--- Discrepancies Found ---")
        print(f"{'Type':<20} | Count")
        print("-" * 30)
        for k, v in counts.items():
            print(f"{k:<20} | {v}")
            
        print(f"\nTotal Discrepancies: {len(discrepancies)}")
            
    finally:
        db.close()

if __name__ == "__main__":
    run()
