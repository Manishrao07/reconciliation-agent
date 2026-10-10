import streamlit as st
import pandas as pd
from api_client import get_runs, get_discrepancies

def render():
    st.title("Dashboard")
    
    runs_data, _, err = get_runs()
    if err:
        st.error(f"Failed to fetch runs: {err}")
        return
        
    if not runs_data:
        st.info("No runs found. Go to 'Upload & Run' to start a reconciliation run.")
        return
        
    latest_run = runs_data[0]
    
    st.subheader("Latest Run Summary")
    
    col1, col2, col3, col4 = st.columns(4)
    
    col1.metric("Total Records", latest_run["total_records"])
    col2.metric("Match Rate", f"{latest_run['match_rate']:.2f}%" if latest_run['match_rate'] else "N/A")
    
    disc_data, _, err = get_discrepancies(run_id=latest_run["id"])
    if err:
        st.error("Failed to fetch discrepancies")
        return
        
    discrepancies = disc_data["data"] if "data" in disc_data else disc_data
    open_disc = [d for d in discrepancies if d["status"] != "RESOLVED"]
    
    col3.metric("Open Discrepancies", len(open_disc))
    
    # Mock amount at risk since it's not in the API currently
    amount_at_risk = len(open_disc) * 250.0 
    col4.metric("Amount at Risk", f"${amount_at_risk:,.2f}")
    
    st.divider()
    
    if discrepancies:
        df = pd.DataFrame(discrepancies)
        
        col_chart1, col_chart2 = st.columns(2)
        
        with col_chart1:
            st.write("### Discrepancies by Type")
            type_counts = df['type'].value_counts().reset_index()
            type_counts.columns = ['Type', 'Count']
            st.bar_chart(type_counts, x='Type', y='Count')
            
        with col_chart2:
            st.write("### Discrepancies by Severity")
            sev_counts = df['severity'].value_counts().reset_index()
            sev_counts.columns = ['Severity', 'Count']
            # Sort severity logically if possible, but bar_chart is simple
            st.bar_chart(sev_counts, x='Severity', y='Count')
    else:
        st.success("No discrepancies found in the latest run! 100% Match.")
