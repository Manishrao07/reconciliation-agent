import streamlit as st
from api_client import login, get_me

st.set_page_config(page_title="Reconciliation UI", layout="wide")

if "token" not in st.session_state:
    st.session_state["token"] = None
if "user" not in st.session_state:
    st.session_state["user"] = None

def do_login():
    st.title("Login")
    email = st.text_input("Email")
    password = st.text_input("Password", type="password")
    if st.button("Login"):
        data, status, err = login(email, password)
        if err:
            st.error(f"Login failed: {err}")
        else:
            st.session_state["token"] = data["access_token"]
            st.session_state["user"] = data["user"]
            st.success("Logged in successfully!")
            st.rerun()

def do_logout():
    st.session_state["token"] = None
    st.session_state["user"] = None
    st.rerun()

if not st.session_state["token"]:
    do_login()
else:
    user = st.session_state["user"]
    st.sidebar.write(f"Logged in as **{user['email']}** ({user['role']})")
    if st.sidebar.button("Logout"):
        do_logout()
        
    pages = ["Dashboard", "Upload & Run", "Approval Queue & Audit"]
    
    # Hide pages based on role if necessary
    # Example: Auditor doesn't need to upload or run? Well, requirements say "Hide pages/buttons the role cannot use".
    if user['role'] == "AUDITOR":
        # Auditor can probably view Dashboard and Audit, but maybe not Upload? Let's hide Upload & Run for Auditor.
        pages.remove("Upload & Run")
        
    selection = st.sidebar.radio("Navigation", pages)
    
    if selection == "Dashboard":
        import pages.dashboard as dashboard
        dashboard.render()
    elif selection == "Upload & Run":
        import pages.upload_run as upload_run
        upload_run.render()
    elif selection == "Approval Queue & Audit":
        import pages.approvals_audit as approvals_audit
        approvals_audit.render()
