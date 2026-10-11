import re
from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import Discrepancy

db = SessionLocal()
discs = db.query(Discrepancy).filter(Discrepancy.status == "OPEN").all()
total = 0.0
for d in discs:
    desc = d.description
    nums = [float(x) for x in re.findall(r"[-+]?\d*\.\d+|\d+", desc)]
    delta = 0.0
    if "Duplicate" in desc and nums: delta = nums[0]
    elif "Overpayment" in desc and len(nums) >= 2: delta = abs(nums[0] - nums[1])
    elif "Underpayment" in desc and len(nums) >= 2: delta = abs(nums[0] - nums[1])
    elif "Refund" in desc and len(nums) >= 2: delta = abs(nums[0] - nums[1])
    elif "no matching order" in desc and nums: delta = nums[0]
    total += delta
    print(f"{desc} -> {delta}")
print(f"Total: {total}")
