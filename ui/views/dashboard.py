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
    
    col1.metric("Total Records", latest_run["total_records"] if latest_run["total_records"] is not None else "-")
    match_rate = latest_run['match_rate']
    col2.metric("Match Rate", f"{float(match_rate):.2f}%" if match_rate is not None else "N/A")
    
    disc_data, _, err = get_discrepancies(run_id=latest_run["id"])
    if err:
        st.error("Failed to fetch discrepancies")
        return
        
    discrepancies = disc_data["data"] if "data" in disc_data else disc_data
    open_disc = [d for d in discrepancies if d["status"] != "RESOLVED"]
    
    col3.metric("Open Discrepancies", len(open_disc))
    
    # Extract delta amounts for Amount at Risk
    import re
    def get_delta(desc):
        nums = [float(x) for x in re.findall(r"[-+]?\d*\.\d+|\d+", desc)]
        if "Duplicate" in desc and nums: return nums[0]
        if "Overpayment" in desc and len(nums) >= 2: return abs(nums[0] - nums[1])
        if "Underpayment" in desc and len(nums) >= 2: return abs(nums[0] - nums[1])
        if "Refund" in desc and len(nums) >= 2: return abs(nums[0] - nums[1])
        if "no matching order" in desc and nums: return nums[0]
        return 0.0

    amount_at_risk = sum(get_delta(d['description']) for d in open_disc)
    col4.metric("Amount at Risk", f"${amount_at_risk:,.2f}")
    
    st.divider()
    
    if discrepancies:
        df = pd.DataFrame(discrepancies)
        
        # Clean names for readability
        def clean_name(name):
            return name.replace("_", " ").title()
        
        df['Type'] = df['type'].apply(clean_name)
        df['Severity'] = df['severity'].apply(clean_name)
        
        col_chart1, col_chart2 = st.columns(2)
        import altair as alt
        
        with col_chart1:
            st.write("### Discrepancies by Type")
            type_counts = df['Type'].value_counts().reset_index()
            type_counts.columns = ['Type', 'Count']
            chart1 = alt.Chart(type_counts).mark_bar().encode(
                x=alt.X('Count:Q', title='Count'),
                y=alt.Y('Type:N', sort='-x', title='', axis=alt.Axis(labelAngle=0)),
                tooltip=['Type', 'Count']
            )
            text1 = chart1.mark_text(align='left', baseline='middle', dx=3).encode(text='Count:Q')
            st.altair_chart(chart1 + text1, use_container_width=True)
            
        with col_chart2:
            st.write("### Discrepancies by Severity")
            sev_counts = df['Severity'].value_counts().reset_index()
            sev_counts.columns = ['Severity', 'Count']
            chart2 = alt.Chart(sev_counts).mark_bar(color='#E69F00').encode(
                x=alt.X('Count:Q', title='Count'),
                y=alt.Y('Severity:N', sort=['High', 'Medium', 'Low'], title='', axis=alt.Axis(labelAngle=0)),
                tooltip=['Severity', 'Count']
            )
            text2 = chart2.mark_text(align='left', baseline='middle', dx=3).encode(text='Count:Q')
            st.altair_chart(chart2 + text2, use_container_width=True)
    else:
        st.success("No discrepancies found in the latest run! 100% Match.")
