import pytest
from unittest.mock import MagicMock, patch
import json
from services.reconciliation.llm.real import GeminiLLMProvider, FailingLLMProvider
from services.reconciliation.llm.base import BaseLLMProvider
from core.config import settings

@pytest.fixture
def mock_gemini():
    with patch("services.reconciliation.llm.real.requests.post") as mock_post:
        yield mock_post

def test_gemini_success(mock_gemini, monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test_key")
    provider = GeminiLLMProvider()
    
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "candidates": [{"content": {"parts": [{"text": '{"explanation": "This is a test explanation."}'}]}}]
    }
    mock_gemini.return_value = mock_response
    
    explanation, latency, source, error = provider.explain_discrepancy({"description": "Test disc"})
    
    assert explanation == "This is a test explanation."
    assert latency >= 0
    assert source == "gemini"
    assert error == ""

def test_gemini_bad_json(mock_gemini, monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test_key")
    provider = GeminiLLMProvider()
    
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "candidates": [{"content": {"parts": [{"text": "not a json"}]}}]
    }
    mock_gemini.return_value = mock_response
    
    explanation, latency, source, error = provider.explain_discrepancy({"description": "Test disc fallback"})
    
    assert "Explanation unavailable" in explanation
    assert "Test disc fallback" in explanation
    assert source == "template"
    assert "Validation error" in error

def test_gemini_timeout(mock_gemini, monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test_key")
    provider = GeminiLLMProvider()
    
    # Make it raise an exception
    mock_gemini.side_effect = Exception("Timeout error")
    
    explanation, latency, source, error = provider.explain_discrepancy({"description": "Timeout description"})
    
    assert "Explanation unavailable due to timeout/error" in explanation
    assert "Timeout description" in explanation
    assert source == "template"
    assert "Exception: Timeout error" in error

def test_failing_provider():
    provider = FailingLLMProvider()
    explanation, latency, source, error = provider.explain_discrepancy({"description": "Should fail"})
    assert "Explanation unavailable due to timeout/error" in explanation
    assert "Should fail" in explanation
    assert source == "template"
    assert "Exception: API key missing" in error
