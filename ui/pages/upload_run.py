import streamlit as st
import time
from api_client import upload_csv, start_run, get_run, get_discrepancies, get_discrepancy_detail

def render():
    st.title("Upload & Trigger Run")
    
    st.write("Upload the latest end-of-day CSV files.")
    
    col1, col2, col3, col4 = st.columns(4)
    file_orders = col1.file_uploader("Orders CSV", type="csv")
    file_drcs = col2.file_uploader("DRCs CSV", type="csv")
    file_payments = col3.file_uploader("Payments CSV", type="csv")
    file_refunds = col4.file_uploader("Refunds CSV", type="csv")
    
    if st.button("Upload All & Start Run"):
        if not (file_orders and file_drcs and file_payments and file_refunds):
            st.warning("Please upload all 4 CSV files before starting.")
            return
            
        with st.spinner("Uploading files..."):
            _, _, err = upload_csv("orders", file_orders)
            if err: st.error(f"Orders upload failed: {err}"); return
            _, _, err = upload_csv("drcs", file_drcs)
            if err: st.error(f"DRCs upload failed: {err}"); return
            _, _, err = upload_csv("payments", file_payments)
            if err: st.error(f"Payments upload failed: {err}"); return
            _, _, err = upload_csv("refunds", file_refunds)
            if err: st.error(f"Refunds upload failed: {err}"); return
            
        st.success("All files uploaded successfully!")
        
        with st.spinner("Triggering Reconciliation Run..."):
            data, _, err = start_run()
            if err:
                st.error(f"Failed to start run: {err}")
                return
            
            run_id = data["run_id"]
            st.session_state["current_run_id"] = run_id
            
    if "current_run_id" in st.session_state:
        run_id = st.session_state["current_run_id"]
        st.write(f"### Run Status: #{run_id}")
        
        status_placeholder = st.empty()
        
        # Poll for completion
        completed = False
        while not completed:
            run_data, _, err = get_run(run_id)
            if err:
                status_placeholder.error("Failed to fetch run status")
                break
            
            status = run_data["status"]
            status_placeholder.info(f"Current Status: **{status}**")
            
            if status in ["COMPLETED", "FAILED"]:
                completed = True
            else:
                time.sleep(2)
                
        if completed and status == "COMPLETED":
            st.success(f"Run completed! Match Rate: {run_data['match_rate']:.2f}%")
            
            st.write("### Discrepancies Found")
            disc_data, _, err = get_discrepancies(run_id=run_id)
            if err:
                st.error("Could not fetch discrepancies")
            else:
                discrepancies = disc_data["data"]
                if not discrepancies:
                    st.write("No discrepancies found.")
                else:
                    for d in discrepancies:
                        with st.expander(f"{d['type']} - {d['severity']} (ID: {d['id']})"):
                            st.write(f"**Description:** {d['description']}")
                            st.write(f"**Status:** {d['status']}")
                            if st.button(f"Why was this flagged? (ID: {d['id']})", key=f"why_{d['id']}"):
                                detail, _, d_err = get_discrepancy_detail(d['id'])
                                if d_err:
                                    st.error("Failed to load details.")
                                else:
                                    action = detail.get("action")
                                    if action:
                                        st.write("#### Agent Explanation & Evidence")
                                        
                                        source = action.get("explanation_source", "template")
                                        label = "Gemini" if source == "gemini" else ("Mock" if source == "mock" else "Template fallback")
                                        st.caption(f"Explained by: {label}")
                                        
                                        st.info(action["llm_explanation"])
                                        st.write(f"**Rule triggered:** Policy mapping for {d['type']}")
                                        st.write(f"**Suggested Action:** {action['suggested_action']} (Requires: {action['required_role']})")
                                    else:
                                        st.write("No corrective action generated yet.")
