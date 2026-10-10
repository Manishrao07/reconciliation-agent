import sys
import subprocess
from sqlalchemy import create_engine, text
from core.config import settings

def main():
    print("--- 1. Testing alembic upgrade head ---")
    res = subprocess.run(["./venv/bin/alembic", "upgrade", "head"], capture_output=True, text=True)
    print(res.stdout)
    if res.stderr:
        print(res.stderr)
        
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")).fetchall()
        print(f"Tables in DB: {[t[0] for t in tables]}")
    
    print("\n--- 2. Testing seed script idempotency ---")
    print("Running seed script first time...")
    subprocess.run(["make", "seed"], capture_output=True)
    
    with engine.connect() as conn:
        users_count_1 = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        orders_count_1 = conn.execute(text("SELECT COUNT(*) FROM orders")).scalar()
        print(f"First run counts - Users: {users_count_1}, Orders: {orders_count_1}")
        
    print("Running seed script second time...")
    subprocess.run(["make", "seed"], capture_output=True)
    
    with engine.connect() as conn:
        users_count_2 = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        orders_count_2 = conn.execute(text("SELECT COUNT(*) FROM orders")).scalar()
        print(f"Second run counts - Users: {users_count_2}, Orders: {orders_count_2}")
        
    assert users_count_1 == users_count_2
    assert orders_count_1 == orders_count_2
    print("Idempotency verified!")
    
    print("\n--- 3. Testing audit_logs triggers ---")
    with engine.begin() as conn:
        conn.execute(text("INSERT INTO audit_logs (action, entity_type) VALUES ('TEST', 'TEST')"))
        log_id = conn.execute(text("SELECT id FROM audit_logs WHERE action = 'TEST' LIMIT 1")).scalar()
        
    print(f"Inserted audit_log with id {log_id}")
    
    try:
        with engine.begin() as conn:
            conn.execute(text(f"UPDATE audit_logs SET action = 'MODIFIED' WHERE id = {log_id}"))
        print("FAIL: Update should have raised an exception")
    except Exception as e:
        print("SUCCESS: Update blocked!")
        print(str(e).splitlines()[0])
        
    try:
        with engine.begin() as conn:
            conn.execute(text(f"DELETE FROM audit_logs WHERE id = {log_id}"))
        print("FAIL: Delete should have raised an exception")
    except Exception as e:
        print("SUCCESS: Delete blocked!")
    try:
        with engine.begin() as conn:
            conn.execute(text("TRUNCATE TABLE audit_logs"))
        print("FAIL: Truncate should have raised an exception")
    except Exception as e:
        print("SUCCESS: Truncate blocked!")
        print(str(e).splitlines()[0])

if __name__ == "__main__":
    main()
