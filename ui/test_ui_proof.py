import sys
from unittest.mock import patch, MagicMock

st_mock = MagicMock()
sys.modules['streamlit'] = st_mock
st_mock.session_state = {}

import api_client
import views.dashboard as dashboard

# Test Wrong Password
def test_wrong_password():
    print("Testing Wrong Password")
    st_mock.reset_mock()
    with patch('api_client.requests.post') as mock_post:
        mock_post.return_value.status_code = 401
        mock_post.return_value.ok = False
        api_client.login("admin@example.com", "wrong")
        # Since login calls handle_response(is_login=True), it should NOT call st.error("Session expired...")
        # Check that st_mock.error was NOT called with Session expired
        for call in st_mock.error.call_args_list:
            if "Session expired" in str(call):
                print("FAILED: Session expired was called!")
                return
        print("SUCCESS: Session expired was NOT called on login 401.")

def test_expired_token():
    print("Testing Expired Token")
    st_mock.reset_mock()
    with patch('api_client.requests.get') as mock_get:
        mock_get.return_value.status_code = 401
        mock_get.return_value.ok = False
        api_client.get_runs()
        # Should call Session expired
        found = False
        for call in st_mock.error.call_args_list:
            if "Session expired" in str(call):
                found = True
        if found:
            print("SUCCESS: Session expired was called on /runs 401.")
        else:
            print("FAILED: Session expired was NOT called.")

def test_dashboard_values():
    print("Testing Dashboard")
    st_mock.reset_mock()
    with patch('views.dashboard.get_runs') as mock_runs:
        with patch('views.dashboard.get_discrepancies') as mock_disc:
            mock_runs.return_value = ([{"id": 1, "total_records": 196, "match_rate": 74.36}], 200, None)
            mock_disc.return_value = ({"data": [
                {"id": 1, "status": "OPEN", "type": "OVERPAYMENT", "severity": "MEDIUM", "description": "Overpayment. Expected 100.0, got 250.0"}
            ]}, 200, None)
            
            def mock_columns(n):
                return [MagicMock() for _ in range(n)]
            st_mock.columns.side_effect = mock_columns
            
            dashboard.render()
            print("Dashboard Render SUCCESS")

if __name__ == "__main__":
    test_wrong_password()
    test_expired_token()
    test_dashboard_values()
