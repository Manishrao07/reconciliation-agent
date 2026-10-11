from db.database import SessionLocal
from db.models import CorrectiveAction
db = SessionLocal()
a = db.query(CorrectiveAction).first()
print(a.status)
print(type(a.status))
