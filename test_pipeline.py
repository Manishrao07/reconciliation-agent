from db.database import SessionLocal
from services.reconciliation.pipeline import execute_reconciliation_run
from db.models import ReconciliationRun

db = SessionLocal()
run = execute_reconciliation_run(db, user_id=1, run_id=None)
print("Saved total_records:", run.total_records)
print("Saved match_rate:", run.match_rate)
db.close()
