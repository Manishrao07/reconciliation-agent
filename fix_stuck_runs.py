from db.database import SessionLocal
from db.models import ReconciliationRun, Order, Discrepancy

db = SessionLocal()
runs = db.query(ReconciliationRun).filter(ReconciliationRun.status == "IN_PROGRESS").all()
total_records = db.query(Order).count()

for run in runs:
    discrepancies = db.query(Discrepancy).filter(Discrepancy.run_id == run.id).count()
    if run.total_records is None:
        run.total_records = total_records
    if run.match_rate is None:
        if total_records > 0:
            match_rate = ((total_records - discrepancies) / total_records) * 100
            run.match_rate = max(0, match_rate)
        else:
            run.match_rate = 100.0

db.commit()
print("Fixed runs")
db.close()
