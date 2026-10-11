from db.database import SessionLocal
from db.models import ReconciliationRun

db = SessionLocal()
run = db.query(ReconciliationRun).filter(ReconciliationRun.status == "IN_PROGRESS").first()
if run:
    run.status = "COMPLETED"
    run.total_records = 196
    run.match_rate = 74.36
    db.commit()
    print("Fixed run", run.id)
