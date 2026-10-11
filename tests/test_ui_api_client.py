import pytest
from unittest.mock import patch, MagicMock

# mock streamlit
import sys
st_mock = MagicMock()
sys.modules['streamlit'] = st_mock
st_mock.session_state = {}

sys.path.append('ui')
from api_client import login

@patch('api_client.requests.post')
def test_login_success(mock_post):
    mock_res = MagicMock()
    mock_res.ok = True
    mock_res.status_code = 200
    mock_res.json.return_value = {"access_token": "token123", "token_type": "bearer"}
    mock_post.return_value = mock_res
    
    data, status, err = login("admin@example.com", "password")
    
    assert err is None
    assert status == 200
    assert data["access_token"] == "token123"

@patch('api_client.requests.post')
def test_login_api_down(mock_post):
    import requests
    mock_post.side_effect = requests.exceptions.ConnectionError("API down")
    
    data, status, err = login("admin@example.com", "password")
    
    assert data is None
    assert status == 503
    assert err == "Cannot reach the API. Please try again."

if __name__ == "__main__":
    test_login_success()
    test_login_api_down()
    print("UI tests passed!")
