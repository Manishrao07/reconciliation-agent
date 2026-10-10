import os
import csv
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from db.models import Base, User, RoleEnum
from core.config import settings
from core.security import get_password_hash

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed():
    random.seed(42)
    # Make idempotent: if data exists, just skip or truncate
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE TABLE refunds, payments, drcs, orders, customers CASCADE"))
        
    db = SessionLocal()
    # 0. Users
    users = [
        {"email": "admin@example.com", "role": RoleEnum.ADMIN},
        {"email": "manager@example.com", "role": RoleEnum.FINANCE_MANAGER},
        {"email": "auditor@example.com", "role": RoleEnum.AUDITOR},
    ]
    hashed_pwd = get_password_hash(settings.SEED_DEMO_PASSWORD)
    for u in users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            db.add(User(email=u["email"], hashed_password=hashed_pwd, role=u["role"]))
    db.commit()

    # 1. Customers
    customers = []
    for i in range(1, 21):
        customers.append({"id": f"CUST{i:03d}", "name": f"Customer {i}"})
        
    # Write Customers CSV (for reference, though not strictly required, requirements ask for 4 CSVs: Orders, DRCs, Payments, Refunds)
    # But user said: "Orders CSV includes a customer_name column. On upload, look up or auto-create the customer."
    # So we don't need a customer CSV, we just need to embed customer_name in the Orders CSV.

    orders_data = []
    drcs_data = []
    payments_data = []
    refunds_data = []

    # Let's generate ~200 orders
    base_date = datetime.now(timezone.utc) - timedelta(days=30)
    
    # Scenarios to plant:
    # 1. Normal (Matched) - 150
    # 2. Duplicate payment - 10
    # 3. Overpayment - 10
    # 4. Underpayment - 10
    # 5. Missing DRC - 10
    # 6. Orphan payment - 5 (no order)
    # 7. Excess refund - 5

    counts = {
        "normal": 150,
        "duplicate_payment": 10,
        "overpayment": 10,
        "underpayment": 10,
        "missing_drc": 10,
        "orphan_payment": 5,
        "excess_refund": 5
    }

    order_idx = 1
    payment_idx = 1
    refund_idx = 1

    def make_order(idx, amount, cust_name):
        return {
            "order_id": f"ORD{idx:04d}",
            "customer_name": cust_name,
            "amount": amount,
            "currency": "USD",
            "status": "DELIVERED",
            "date": (base_date + timedelta(hours=idx)).strftime("%Y-%m-%dT%H:%M:%SZ")
        }
    
    def make_drc(idx):
        return {
            "drc_id": f"DRC{idx:04d}",
            "order_id": f"ORD{idx:04d}",
            "status": "CONFIRMED",
            "date": (base_date + timedelta(hours=idx, minutes=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
        }

    def make_payment(p_idx, o_idx, amount):
        return {
            "payment_id": f"PAY{p_idx:04d}",
            "order_id": f"ORD{o_idx:04d}" if o_idx else "",
            "amount": amount,
            "currency": "USD",
            "reference": f"REF{p_idx:04d}",
            "date": (base_date + timedelta(hours=o_idx or 100, minutes=45)).strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        
    def make_refund(r_idx, p_idx, amount):
        return {
            "refund_id": f"REF{r_idx:04d}",
            "payment_id": f"PAY{p_idx:04d}",
            "amount": amount,
            "currency": "USD",
            "reason": "Customer Request",
            "date": (base_date + timedelta(hours=p_idx or 100, minutes=60)).strftime("%Y-%m-%dT%H:%M:%SZ")
        }

    # 1. Normal
    for _ in range(counts["normal"]):
        amt = round(random.uniform(50.0, 500.0), 2)
        c_name = random.choice(customers)["name"]
        orders_data.append(make_order(order_idx, amt, c_name))
        drcs_data.append(make_drc(order_idx))
        payments_data.append(make_payment(payment_idx, order_idx, amt))
        order_idx += 1
        payment_idx += 1
        
    # 2. Duplicate Payment
    for _ in range(counts["duplicate_payment"]):
        amt = round(random.uniform(50.0, 500.0), 2)
        c_name = random.choice(customers)["name"]
        orders_data.append(make_order(order_idx, amt, c_name))
        drcs_data.append(make_drc(order_idx))
        payments_data.append(make_payment(payment_idx, order_idx, amt))
        payment_idx += 1
        payments_data.append(make_payment(payment_idx, order_idx, amt)) # Duplicate
        payment_idx += 1
        order_idx += 1

    # 3. Overpayment
    for _ in range(counts["overpayment"]):
        amt = round(random.uniform(50.0, 500.0), 2)
        c_name = random.choice(customers)["name"]
        orders_data.append(make_order(order_idx, amt, c_name))
        drcs_data.append(make_drc(order_idx))
        payments_data.append(make_payment(payment_idx, order_idx, amt + 50.0)) # Overpaid by 50
        payment_idx += 1
        order_idx += 1

    # 4. Underpayment
    for _ in range(counts["underpayment"]):
        amt = round(random.uniform(100.0, 500.0), 2)
        c_name = random.choice(customers)["name"]
        orders_data.append(make_order(order_idx, amt, c_name))
        drcs_data.append(make_drc(order_idx))
        payments_data.append(make_payment(payment_idx, order_idx, amt - 50.0)) # Underpaid by 50
        payment_idx += 1
        order_idx += 1

    # 5. Missing DRC
    for _ in range(counts["missing_drc"]):
        amt = round(random.uniform(50.0, 500.0), 2)
        c_name = random.choice(customers)["name"]
        orders_data.append(make_order(order_idx, amt, c_name))
        # No DRC appended!
        payments_data.append(make_payment(payment_idx, order_idx, amt))
        payment_idx += 1
        order_idx += 1
        
    # 6. Orphan payment
    for _ in range(counts["orphan_payment"]):
        amt = round(random.uniform(50.0, 500.0), 2)
        payments_data.append(make_payment(payment_idx, None, amt))
        payment_idx += 1

    # 7. Excess refund
    for _ in range(counts["excess_refund"]):
        amt = round(random.uniform(50.0, 500.0), 2)
        c_name = random.choice(customers)["name"]
        orders_data.append(make_order(order_idx, amt, c_name))
        drcs_data.append(make_drc(order_idx))
        payments_data.append(make_payment(payment_idx, order_idx, amt))
        refunds_data.append(make_refund(refund_idx, payment_idx, amt + 100.0)) # Refund > Payment
        payment_idx += 1
        order_idx += 1
        refund_idx += 1

    # Save to CSV files
    os.makedirs("demo_data", exist_ok=True)
    
    def write_csv(filename, data, fieldnames):
        with open(filename, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
            
    write_csv("demo_data/orders.csv", orders_data, ["order_id", "customer_name", "amount", "currency", "status", "date"])
    write_csv("demo_data/drcs.csv", drcs_data, ["drc_id", "order_id", "status", "date"])
    write_csv("demo_data/payments.csv", payments_data, ["payment_id", "order_id", "amount", "currency", "reference", "date"])
    write_csv("demo_data/refunds.csv", refunds_data, ["refund_id", "payment_id", "amount", "currency", "reason", "date"])

    # Generate expected_results.md
    with open("demo_data/expected_results.md", "w") as f:
        f.write("# Expected Reconciliation Results\n\n")
        f.write("This file is automatically generated by the seed script. It lists the exact number of anomalies planted in the demo dataset.\n\n")
        f.write(f"- **Total Orders**: {len(orders_data)}\n")
        f.write(f"- **Total DRCs**: {len(drcs_data)}\n")
        f.write(f"- **Total Payments**: {len(payments_data)}\n")
        f.write(f"- **Total Refunds**: {len(refunds_data)}\n\n")
        
        f.write("## Expected Discrepancies\n\n")
        f.write(f"| Discrepancy Type | Expected Count | Severity | Suggested Action |\n")
        f.write(f"|---|---|---|---|\n")
        f.write(f"| DUPLICATE_PAYMENT | {counts['duplicate_payment']} | HIGH | REVERSE_PAYMENT |\n")
        f.write(f"| OVERPAYMENT | {counts['overpayment']} | MEDIUM | ISSUE_REFUND |\n")
        f.write(f"| UNDERPAYMENT | {counts['underpayment']} | MEDIUM | REQUEST_FUNDS |\n")
        f.write(f"| MISSING_DRC | {counts['missing_drc']} | LOW | REQUEST_DOCUMENT |\n")
        f.write(f"| ORPHAN_PAYMENT | {counts['orphan_payment']} | HIGH | INVESTIGATE_ORPHAN |\n")
        f.write(f"| EXCESS_REFUND | {counts['excess_refund']} | HIGH | ESCALATE |\n\n")
        
        f.write(f"**Total Discrepancies Expected**: {sum(counts.values()) - counts['normal']}\n")

    print(f"Data generated successfully in demo_data/ directory.")

if __name__ == "__main__":
    seed()
