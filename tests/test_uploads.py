import pytest
from fastapi.testclient import TestClient
from decimal import Decimal
from api.main import app

client = TestClient(app)

def get_token(email: str):
    from core.config import settings
    response = client.post("/api/v1/auth/login", data={"username": email, "password": settings.SEED_DEMO_PASSWORD})
    return response.json()["access_token"]

def test_upload_orders_csv():
    token = get_token("admin@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    csv_content = """order_id,customer_name,amount,currency,status,date
ORD1,Alice,100.50,USD,DELIVERED,2023-10-01T10:00:00Z
ORD2,Bob,200.00,USD,PENDING,2023-10-02T10:00:00Z
"""
    files = {"file": ("orders.csv", csv_content, "text/csv")}
    response = client.post("/upload/orders", headers=headers, files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["processed"] == 2
    assert data["errors"] == []

def test_upload_payments_csv():
    token = get_token("admin@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    csv_content = """payment_id,order_id,amount,currency,reference,date
PAY1,ORD1,100.50,USD,REF123,2023-10-01T11:00:00Z
"""
    files = {"file": ("payments.csv", csv_content, "text/csv")}
    response = client.post("/upload/payments", headers=headers, files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["processed"] == 1

def test_upload_drc_csv():
    token = get_token("admin@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    csv_content = """drc_id,order_id,status,date
DRC1,ORD1,CONFIRMED,2023-10-01T10:30:00Z
"""
    files = {"file": ("drcs.csv", csv_content, "text/csv")}
    response = client.post("/upload/drcs", headers=headers, files=files)
    
    assert response.status_code == 200

def test_upload_refunds_csv():
    token = get_token("admin@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    csv_content = """refund_id,payment_id,amount,currency,reason,date
REF1,PAY1,10.00,USD,RETURN,2023-10-05T10:00:00Z
"""
    files = {"file": ("refunds.csv", csv_content, "text/csv")}
    response = client.post("/upload/refunds", headers=headers, files=files)
    
    assert response.status_code == 200
