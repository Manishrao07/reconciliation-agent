import os
import requests
import streamlit as st

API_URL = os.getenv("API_URL", "http://localhost:8000")

def get_headers():
    token = st.session_state.get("token")
    if token:
        return {"Authorization": f"Bearer {token}"}
    return {}

def handle_response(res):
    if res.status_code == 401:
        st.session_state["token"] = None
        st.session_state["user"] = None
        st.error("Session expired. Please log in again.")
        st.stop()
    if not res.ok:
        try:
            detail = res.json().get("detail", "Unknown error")
        except:
            detail = res.text
        return None, res.status_code, detail
    return res.json(), res.status_code, None

def login(email, password):
    res = requests.post(f"{API_URL}/api/v1/auth/login", data={"username": email, "password": password})
    return handle_response(res)

def get_me():
    res = requests.get(f"{API_URL}/api/v1/auth/me", headers=get_headers())
    return handle_response(res)

def upload_csv(endpoint, file):
    files = {"file": (file.name, file, "text/csv")}
    res = requests.post(f"{API_URL}/upload/{endpoint}", files=files, headers=get_headers())
    return handle_response(res)

def start_run():
    res = requests.post(f"{API_URL}/runs", headers=get_headers())
    return handle_response(res)

def get_run(run_id):
    res = requests.get(f"{API_URL}/runs/{run_id}", headers=get_headers())
    return handle_response(res)

def get_runs():
    res = requests.get(f"{API_URL}/runs", headers=get_headers())
    return handle_response(res)

def get_discrepancies(run_id=None, status=None, type=None):
    params = {"limit": 100} # fetching up to 100 for simplicity
    if run_id: params["run_id"] = run_id
    if status: params["status"] = status
    if type: params["type"] = type
    res = requests.get(f"{API_URL}/discrepancies", params=params, headers=get_headers())
    return handle_response(res)

def get_discrepancy_detail(disc_id):
    res = requests.get(f"{API_URL}/discrepancies/{disc_id}", headers=get_headers())
    return handle_response(res)

def approve_action(disc_id, comments=""):
    res = requests.post(f"{API_URL}/discrepancies/{disc_id}/approve", json={"comments": comments}, headers=get_headers())
    return handle_response(res)

def reject_action(disc_id, comments=""):
    res = requests.post(f"{API_URL}/discrepancies/{disc_id}/reject", json={"comments": comments}, headers=get_headers())
    return handle_response(res)

def get_audit_logs(limit=50):
    # We don't have an audit endpoint! I'll need to create one!
    res = requests.get(f"{API_URL}/audit?limit={limit}", headers=get_headers())
    return handle_response(res)
