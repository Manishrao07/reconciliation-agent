import csv
from datetime import datetime, timezone
import os

os.makedirs('demo_data/test_thresholds', exist_ok=True)

# 1. Orders
orders = [
    {"order_id": "TEST_AUTO", "customer_name": "Bob", "amount": "500.00", "currency": "USD", "status": "DELIVERED", "date": "2026-10-10T10:00:00Z"},
    {"order_id": "TEST_MANAGER", "customer_name": "Alice", "amount": "5000.00", "currency": "USD", "status": "DELIVERED", "date": "2026-10-10T10:00:00Z"},
    {"order_id": "TEST_ADMIN", "customer_name": "Charlie", "amount": "60000.00", "currency": "USD", "status": "DELIVERED", "date": "2026-10-10T10:00:00Z"}
]

with open('demo_data/test_thresholds/orders.csv', 'w') as f:
    writer = csv.DictWriter(f, fieldnames=orders[0].keys())
    writer.writeheader()
    writer.writerows(orders)

# 2. DRCs
drcs = [
    {"drc_id": "DRC_AUTO", "order_id": "TEST_AUTO", "status": "MATCHED", "date": "2026-10-10T10:00:00Z"},
    {"drc_id": "DRC_MANAGER", "order_id": "TEST_MANAGER", "status": "MATCHED", "date": "2026-10-10T10:00:00Z"},
    {"drc_id": "DRC_ADMIN", "order_id": "TEST_ADMIN", "status": "MATCHED", "date": "2026-10-10T10:00:00Z"}
]
with open('demo_data/test_thresholds/drcs.csv', 'w') as f:
    writer = csv.DictWriter(f, fieldnames=drcs[0].keys())
    writer.writeheader()
    writer.writerows(drcs)

# 3. Payments (We will create OVERPAYMENTS so they trigger anomalies)
payments = [
    {"payment_id": "PAY_AUTO", "order_id": "TEST_AUTO", "amount": "550.00", "currency": "USD", "reference": "REF1", "date": "2026-10-10T10:00:00Z"},
    {"payment_id": "PAY_MANAGER", "order_id": "TEST_MANAGER", "amount": "5500.00", "currency": "USD", "reference": "REF2", "date": "2026-10-10T10:00:00Z"},
    {"payment_id": "PAY_ADMIN", "order_id": "TEST_ADMIN", "amount": "65000.00", "currency": "USD", "reference": "REF3", "date": "2026-10-10T10:00:00Z"}
]
with open('demo_data/test_thresholds/payments.csv', 'w') as f:
    writer = csv.DictWriter(f, fieldnames=payments[0].keys())
    writer.writeheader()
    writer.writerows(payments)

# 4. Refunds (Empty)
with open('demo_data/test_thresholds/refunds.csv', 'w') as f:
    writer = csv.DictWriter(f, fieldnames=["refund_id", "payment_id", "amount", "currency", "reason", "date"])
    writer.writeheader()

print("CSV files generated in demo_data/test_thresholds/")
