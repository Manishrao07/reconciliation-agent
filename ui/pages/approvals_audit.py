import streamlit as st
import pandas as pd
from api_client import get_discrepancies, get_discrepancy_detail, approve_action, reject_action, get_audit_logs

def render():
    st.title("Approval Queue & Audit Logs")
    
    tab1, tab2 = st.tabs(["Approval Queue", "Audit Logs"])
    
    user = st.session_state["user"]
    
    with tab1:
        st.subheader("Pending Approvals")
        
        disc_data, _, err = get_discrepancies(status="PENDING")
        if err:
            st.error("Failed to fetch pending discrepancies")
        else:
            discrepancies = disc_data["data"] if "data" in disc_data else disc_data
            if not discrepancies:
                st.info("No pending approvals.")
            else:
                for d in discrepancies:
                    with st.expander(f"{d['type']} - {d['severity']} (ID: {d['id']})"):
                        detail, _, d_err = get_discrepancy_detail(d['id'])
                        if d_err or not detail.get("action"):
                            st.error("Failed to load action details.")
                            continue
                            
                        action = detail["action"]
                        st.write(f"**Description:** {d['description']}")
                        st.write(f"**Suggested Action:** {action['suggested_action']}")
                        st.write(f"**Required Role:** {action['required_role']}")
                        st.write(f"**Agent Explanation:** {action['llm_explanation']}")
                        
                        if user["role"] == "AUDITOR":
                            st.warning("Auditors are read-only and cannot approve/reject actions.")
                        else:
                            comment = st.text_input("Comment (Required for Reject)", key=f"comment_{d['id']}")
                            col_a, col_r = st.columns([1, 1])
                            with col_a:
                                if st.button("Approve", key=f"approve_{d['id']}", type="primary"):
                                    _, status, err_detail = approve_action(d['id'], comment)
                                    if err_detail:
                                        st.error(f"Approval Blocked: {err_detail}")
                                    else:
                                        st.success("Action Approved!")
                                        st.rerun()
                            with col_r:
                                if st.button("Reject", key=f"reject_{d['id']}"):
                                    if not comment:
                                        st.error("Comment is required to reject.")
                                    else:
                                        _, status, err_detail = reject_action(d['id'], comment)
                                        if err_detail:
                                            st.error(f"Rejection Blocked: {err_detail}")
                                        else:
                                            st.success("Action Rejected!")
                                            st.rerun()

    with tab2:
        st.subheader("Audit Logs Viewer")
        col_f1, col_f2 = st.columns(2)
        action_filter = col_f1.selectbox("Filter by Action", ["ALL", "LOGIN", "UPLOAD_CSV", "RUN_START", "RUN_FINISH", "ACTION_PROPOSED", "ACTION_APPROVED", "ACTION_REJECTED"])
        limit = col_f2.number_input("Limit", min_value=10, max_value=500, value=50)
        
        if st.button("Refresh Logs"):
            pass # just triggers rerun
            
        logs, _, err = get_audit_logs(limit=limit)
        if err:
            st.error("Failed to fetch audit logs")
        else:
            if action_filter != "ALL":
                logs = [l for l in logs if l["action"] == action_filter]
                
            if not logs:
                st.info("No logs found.")
            else:
                st.dataframe(
                    pd.DataFrame(logs),
                    column_config={
                        "timestamp": st.column_config.DatetimeColumn("Time", format="D MMM YYYY, h:mm a"),
                        "old_value": st.column_config.TextColumn("Old Value"),
                        "new_value": st.column_config.TextColumn("New Value")
                    },
                    hide_index=True
                )
