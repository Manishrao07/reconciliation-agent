import os
import requests

API_URL = "http://localhost:8000"
headers = {"Authorization": "Bearer TEST_TOKEN"}

def login():
    res = requests.post(f"{API_URL}/api/v1/auth/login", data={"username": "admin@example.com", "password": "Demo#Pass123"})
    return res.json()["access_token"]

def upload_file(endpoint, filepath):
    with open(filepath, 'rb') as f:
        res = requests.post(f"{API_URL}/upload/{endpoint}", headers=headers, files={"file": f})
        print(f"Uploaded {filepath}:", res.json())

def start_run():
    res = requests.post(f"{API_URL}/runs", headers=headers)
    print("Started Run:", res.json())
    return res.json()["run_id"]

if __name__ == "__main__":
    token = login()
    headers = {"Authorization": f"Bearer {token}"}
    
    upload_file("orders", "demo_data/test_thresholds/orders.csv")
    upload_file("drcs", "demo_data/test_thresholds/drcs.csv")
    upload_file("payments", "demo_data/test_thresholds/payments.csv")
    upload_file("refunds", "demo_data/test_thresholds/refunds.csv")
    
    run_id = start_run()
    
    # Wait for completion
    import time
    while True:
        res = requests.get(f"{API_URL}/runs/{run_id}", headers=headers).json()
        print(f"Status: {res['status']}")
        if res['status'] in ['COMPLETED', 'FAILED']:
            break
        time.sleep(2)
