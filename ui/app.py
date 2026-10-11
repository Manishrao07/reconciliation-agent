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
            if status == 401 or "Incorrect username or password" in str(err):
                st.error("Invalid email or password")
            else:
                st.error(f"Login failed: {err}")
        else:
            st.session_state["token"] = data["access_token"]
            me_data, me_status, me_err = get_me()
            if me_err:
                st.error(f"Failed to fetch user info: {me_err}")
                st.session_state["token"] = None
            else:
                st.session_state["user"] = me_data
                st.success("Logged in successfully!")
                st.rerun()

def do_logout():
    st.session_state["token"] = None
    st.session_state["user"] = None
    st.rerun()

if not st.session_state["token"]:
    do_login()
    st.stop()
else:
    user = st.session_state["user"]
    st.sidebar.write(f"Logged in as **{user['email']}** ({user['role']})")
    if st.sidebar.button("Logout"):
        do_logout()
        
    pages = ["Dashboard", "Upload & Run", "Approval Queue & Audit"]
    
    if user['role'] == "AUDITOR":
        pages.remove("Upload & Run")
        
    selection = st.sidebar.radio("Navigation", pages)
    
    if selection == "Dashboard":
        import views.dashboard as dashboard
        dashboard.render()
    elif selection == "Upload & Run":
        import views.upload_run as upload_run
        upload_run.render()
    elif selection == "Approval Queue & Audit":
        import views.approvals_audit as approvals_audit
        approvals_audit.render()
