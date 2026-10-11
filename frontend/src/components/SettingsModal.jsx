import React, { useState } from 'react';
import { Settings, Server, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { getApiBaseUrl, setCustomApiUrl, api } from '../services/api';

export default function SettingsModal({ onClose }) {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [pingStatus, setPingStatus] = useState(null); // 'checking' | 'success' | 'failed'
  const [pingError, setPingError] = useState(null);

  const handleTestConnection = async () => {
    setPingStatus('checking');
    setPingError(null);
    try {
      // Temporarily save to test
      setCustomApiUrl(apiUrl);
      await api.checkHealth();
      setPingStatus('success');
    } catch (err) {
      setPingStatus('failed');
      setPingError(err.message || 'Unable to connect to endpoint');
    }
  };

  const handleSave = () => {
    setCustomApiUrl(apiUrl);
    onClose();
    window.location.reload();
  };

  const handleReset = () => {
    setCustomApiUrl(null);
    setApiUrl('http://localhost:8000');
    setPingStatus(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: 'var(--radius-md)', 
            background: 'var(--bg-surface-elevated)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--accent-indigo)' 
          }}>
            <Settings size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>API Gateway Connection</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure remote or local FastAPI backend</span>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">FastAPI Backend Endpoint URL</label>
          <input
            type="text"
            className="input-field"
            value={apiUrl}
            onChange={(e) => {
              setApiUrl(e.target.value);
              setPingStatus(null);
            }}
            placeholder="http://localhost:8000 or https://api.yourdomain.com"
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            When deployed to Vercel, point this to your hosted backend (or ngrok/Railway URL).
          </span>
        </div>

        {/* Ping status */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleTestConnection}
            disabled={pingStatus === 'checking'}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            {pingStatus === 'checking' ? <Loader2 size={14} className="spin-anim" /> : <RefreshCw size={14} />}
            <span>Test Health Ping</span>
          </button>

          {pingStatus === 'success' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              Connected (HTTP 200 OK)
            </span>
          )}

          {pingStatus === 'failed' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-rose)', fontSize: '0.8rem', fontWeight: 600 }}>
              <XCircle size={16} />
              Connection Failed
            </span>
          )}
        </div>

        {pingError && (
          <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#F87171', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', marginBottom: '1rem' }}>
            {pingError}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleReset}
            style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}
          >
            Reset Default
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
