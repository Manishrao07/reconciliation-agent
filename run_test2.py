import requests

API_URL = "http://localhost:8000"

res = requests.post(f"{API_URL}/auth/login", data={"username": "admin@example.com", "password": "Demo#Pass123"})
print(res.status_code)
print(res.text)
