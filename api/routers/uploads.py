import io
import csv
from decimal import Decimal, InvalidOperation
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from db.database import get_db
from db.models import Customer, Order, DRC, Payment, Refund
from api.dependencies import get_current_user
from services.audit import log_audit_action

router = APIRouter(prefix="/upload", tags=["Uploads"])

MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB

def validate_file(file: UploadFile):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted")
    # Read up to MAX_FILE_SIZE + 1
    content = file.file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
    file.file.seek(0)
    return content.decode("utf-8")

def parse_decimal(value: str, row_num: int, col_name: str) -> Decimal:
    try:
        return Decimal(value)
    except InvalidOperation:
        raise ValueError(f"Row {row_num}: Invalid amount format for {col_name} - {value}")

def parse_date(value: str, row_num: int) -> datetime:
    try:
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ")
    except ValueError:
        raise ValueError(f"Row {row_num}: Invalid date format, expected YYYY-MM-DDTHH:MM:SSZ")

@router.post("/orders")
def upload_orders(file: UploadFile = File(...), db: Session = Depends(get_db), user = Depends(get_current_user)):
    content = validate_file(file)
    reader = csv.DictReader(io.StringIO(content))
    expected_cols = {'order_id', 'customer_name', 'amount', 'currency', 'status', 'date'}
    if not reader.fieldnames or not expected_cols.issubset(set(reader.fieldnames)):
        raise HTTPException(status_code=400, detail=f"Invalid columns. Expected: {expected_cols}")
        
    row_num = 1
    processed = 0
    errors = []
    
    for row in reader:
        row_num += 1
        try:
            amount = parse_decimal(row['amount'], row_num, 'amount')
            date_val = parse_date(row['date'], row_num)
            
            cust_name = row['customer_name'].strip()
            if not cust_name:
                raise ValueError(f"Row {row_num}: customer_name is required")
                
            # Auto-create or fetch customer
            customer = db.query(Customer).filter(Customer.name == cust_name).first()
            if not customer:
                cust_id = f"CUST_{int(datetime.now().timestamp() * 1000)}_{row_num}"
                customer = Customer(id=cust_id, name=cust_name)
                db.add(customer)
                db.flush()
                
            order_id = row['order_id'].strip()
            if not order_id:
                raise ValueError(f"Row {row_num}: order_id is required")
                
            existing = db.query(Order).filter(Order.id == order_id).first()
            if not existing:
                order = Order(
                    id=order_id,
                    customer_id=customer.id,
                    amount=amount,
                    currency=row['currency'].strip(),
                    status=row['status'].strip(),
                    date=date_val
                )
                db.add(order)
                processed += 1
                
        except ValueError as e:
            errors.append(str(e))
            continue

    db.commit()
    log_audit_action(db, "UPLOAD_CSV", "Order", None, user.id, new_value={"filename": file.filename, "rows_processed": processed, "errors": len(errors)})
    
    return {"message": "Upload complete", "processed": processed, "errors": errors}

@router.post("/drcs")
def upload_drcs(file: UploadFile = File(...), db: Session = Depends(get_db), user = Depends(get_current_user)):
    content = validate_file(file)
    reader = csv.DictReader(io.StringIO(content))
    expected_cols = {'drc_id', 'order_id', 'status', 'date'}
    if not reader.fieldnames or not expected_cols.issubset(set(reader.fieldnames)):
        raise HTTPException(status_code=400, detail=f"Invalid columns. Expected: {expected_cols}")
        
    row_num = 1
    processed = 0
    errors = []
    
    for row in reader:
        row_num += 1
        try:
            date_val = parse_date(row['date'], row_num)
            drc_id = row['drc_id'].strip()
            
            existing = db.query(DRC).filter(DRC.id == drc_id).first()
            if not existing:
                drc = DRC(
                    id=drc_id,
                    order_id=row['order_id'].strip(),
                    status=row['status'].strip(),
                    date=date_val
                )
                db.add(drc)
                processed += 1
                
        except ValueError as e:
            errors.append(str(e))
            continue

    db.commit()
    log_audit_action(db, "UPLOAD_CSV", "DRC", None, user.id, new_value={"filename": file.filename, "rows_processed": processed, "errors": len(errors)})
    
    return {"message": "Upload complete", "processed": processed, "errors": errors}

@router.post("/payments")
def upload_payments(file: UploadFile = File(...), db: Session = Depends(get_db), user = Depends(get_current_user)):
    content = validate_file(file)
    reader = csv.DictReader(io.StringIO(content))
    expected_cols = {'payment_id', 'order_id', 'amount', 'currency', 'reference', 'date'}
    if not reader.fieldnames or not expected_cols.issubset(set(reader.fieldnames)):
        raise HTTPException(status_code=400, detail=f"Invalid columns. Expected: {expected_cols}")
        
    row_num = 1
    processed = 0
    errors = []
    
    for row in reader:
        row_num += 1
        try:
            amount = parse_decimal(row['amount'], row_num, 'amount')
            date_val = parse_date(row['date'], row_num)
            
            payment_id = row['payment_id'].strip()
            order_id = row['order_id'].strip() if row['order_id'].strip() else None
            
            existing = db.query(Payment).filter(Payment.id == payment_id).first()
            if not existing:
                payment = Payment(
                    id=payment_id,
                    order_id=order_id,
                    amount=amount,
                    currency=row['currency'].strip(),
                    reference=row['reference'].strip(),
                    date=date_val
                )
                db.add(payment)
                processed += 1
                
        except ValueError as e:
            errors.append(str(e))
            continue

    db.commit()
    log_audit_action(db, "UPLOAD_CSV", "Payment", None, user.id, new_value={"filename": file.filename, "rows_processed": processed, "errors": len(errors)})
    
    return {"message": "Upload complete", "processed": processed, "errors": errors}

@router.post("/refunds")
def upload_refunds(file: UploadFile = File(...), db: Session = Depends(get_db), user = Depends(get_current_user)):
    content = validate_file(file)
    reader = csv.DictReader(io.StringIO(content))
    expected_cols = {'refund_id', 'payment_id', 'amount', 'currency', 'reason', 'date'}
    if not reader.fieldnames or not expected_cols.issubset(set(reader.fieldnames)):
        raise HTTPException(status_code=400, detail=f"Invalid columns. Expected: {expected_cols}")
        
    row_num = 1
    processed = 0
    errors = []
    
    for row in reader:
        row_num += 1
        try:
            amount = parse_decimal(row['amount'], row_num, 'amount')
            date_val = parse_date(row['date'], row_num)
            
            refund_id = row['refund_id'].strip()
            
            existing = db.query(Refund).filter(Refund.id == refund_id).first()
            if not existing:
                refund = Refund(
                    id=refund_id,
                    payment_id=row['payment_id'].strip(),
                    amount=amount,
                    currency=row['currency'].strip(),
                    reason=row['reason'].strip(),
                    date=date_val
                )
                db.add(refund)
                processed += 1
                
        except ValueError as e:
            errors.append(str(e))
            continue

    db.commit()
    log_audit_action(db, "UPLOAD_CSV", "Refund", None, user.id, new_value={"filename": file.filename, "rows_processed": processed, "errors": len(errors)})
    
    return {"message": "Upload complete", "processed": processed, "errors": errors}
