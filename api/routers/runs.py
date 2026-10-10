from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import ReconciliationRun
from api.dependencies import get_current_user
from services.reconciliation.pipeline import execute_reconciliation_run

router = APIRouter(prefix="/runs", tags=["Runs"])

def bg_reconciliation_run(db_generator, user_id: int, run_id: int):
    # Execute in a new session since it runs in background
    db = next(db_generator())
    try:
        execute_reconciliation_run(db, user_id=user_id, run_id=run_id)
    except Exception as e:
        print(f"Background run failed: {e}")
    finally:
        db.close()

@router.post("")
def trigger_run(background_tasks: BackgroundTasks, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Create the run record first so we can return its ID immediately
    run = ReconciliationRun(status="QUEUED", user_id=user.id)
    db.add(run)
    db.commit()
    db.refresh(run)
    
    # We must pass a db generator so background task can get a fresh session
    background_tasks.add_task(bg_reconciliation_run, get_db, user.id, run.id)
    
    return {"message": "Run triggered", "run_id": run.id}

@router.get("/{run_id}")
def get_run_status(run_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    run = db.query(ReconciliationRun).filter(ReconciliationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
        
    return {
        "id": run.id,
        "status": run.status,
        "started_at": run.started_at,
        "completed_at": run.completed_at,
        "total_records": run.total_records,
        "match_rate": run.match_rate
    }

@router.get("")
def list_runs(db: Session = Depends(get_db), user = Depends(get_current_user)):
    runs = db.query(ReconciliationRun).order_by(ReconciliationRun.id.desc()).limit(10).all()
    return [
        {
            "id": r.id,
            "status": r.status,
            "started_at": r.started_at,
            "completed_at": r.completed_at,
            "total_records": r.total_records,
            "match_rate": r.match_rate
        } for r in runs
    ]
