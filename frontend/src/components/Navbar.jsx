import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  UploadCloud, 
  CheckCircle2, 
  FileText, 
  BrainCircuit, 
  LogOut, 
  Settings, 
  Server,
  UserCheck
} from 'lucide-react';
import { api, getApiBaseUrl } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, user, onLogout, onOpenSettings }) {
  const [healthStatus, setHealthStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;
    const ping = async () => {
      try {
        const res = await api.checkHealth();
        if (mounted) {
          if (res && res.status === 'healthy') setHealthStatus('online');
          else setHealthStatus('demo');
        }
      } catch (err) {
        if (mounted) setHealthStatus('demo');
      }
    };
    ping();
    const interval = setInterval(ping, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'pill-danger';
      case 'FINANCE_MANAGER':
        return 'pill-indigo';
      case 'AUDITOR':
        return 'pill-cyan';
      default:
        return 'pill-neutral';
    }
  };

  return (
    <header className="header-container">
      {/* Brand */}
      <div className="brand-wrapper">
        <div className="brand-icon-box">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="brand-title">AEQUITAS <span style={{ color: 'var(--accent-indigo)', fontWeight: 400 }}>RECON</span></h1>
          <div className="brand-subtitle">Autonomous Financial Reconciliation Agent</div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="nav-tabs">
        <button 
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Layers size={16} />
          <span>Dashboard</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <UploadCloud size={16} />
          <span>Ingest & Run</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          <CheckCircle2 size={16} />
          <span>Approvals & Queue</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <FileText size={16} />
          <span>Audit Logs</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'agent' ? 'active' : ''}`}
          onClick={() => setActiveTab('agent')}
        >
          <BrainCircuit size={16} />
          <span>AI Decisions</span>
        </button>
      </nav>

      {/* Right User & System Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Backend Status indicator */}
        <div 
          onClick={onOpenSettings}
          title={`Backend: ${getApiBaseUrl()} (${healthStatus})`}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontSize: '0.75rem', 
            cursor: 'pointer',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <span className={`status-dot ${healthStatus === 'online' ? 'active' : 'busy'}`} />
          <span style={{ color: healthStatus === 'online' ? 'var(--text-main)' : 'var(--accent-indigo)', fontWeight: 500 }}>
            {healthStatus === 'online' ? 'API Live (Connected)' : 'Cloud Interactive Showcase'}
          </span>
        </div>

        {/* User Info Chip */}
        {user && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-card)',
            border: '1px solid var(--border-subtle)'
          }}>
            <UserCheck size={16} color="var(--accent-indigo)" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.1 }}>
                {user.full_name || user.email.split('@')[0]}
              </span>
              <span className={`pill ${getRoleBadgeClass(user.role)}`} style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem', marginTop: '2px' }}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Settings button */}
        <button 
          className="btn btn-secondary" 
          onClick={onOpenSettings}
          title="Configure API Endpoint"
          style={{ padding: '0.5rem', width: '36px', height: '36px' }}
        >
          <Settings size={16} />
        </button>

        {/* Logout */}
        <button 
          className="btn btn-secondary" 
          onClick={onLogout}
          title="Sign Out"
          style={{ padding: '0.5rem', width: '36px', height: '36px', color: 'var(--accent-rose)' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
