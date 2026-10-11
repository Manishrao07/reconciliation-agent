import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './views/DashboardView';
import UploadRunView from './views/UploadRunView';
import ApprovalsView from './views/ApprovalsView';
import AuditView from './views/AuditView';
import AgentDecisionsView from './views/AgentDecisionsView';
import LoginModal from './components/LoginModal';
import SettingsModal from './components/SettingsModal';
import { api, getToken, removeToken } from './services/api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("UI Error caught by boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#F87171' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>View Render Error</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            {this.state.error ? this.state.error.message : 'An unexpected rendering error occurred.'}
          </p>
          <button 
            className="btn btn-secondary" 
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Reset View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Check existing session
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setLoadingAuth(false);
        return;
      }
      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (err) {
        console.warn("Session check failed, clearing token", err);
        removeToken();
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };

    initAuth();

    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener("auth_expired", handleAuthExpired);
    return () => window.removeEventListener("auth_expired", handleAuthExpired);
  }, []);

  const handleLogout = () => {
    removeToken();
    setUser(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  if (loadingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="status-dot active" style={{ width: 14, height: 14, marginBottom: '1rem' }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Initializing Aequitas Security Context...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* If not logged in, show Login Modal */}
      {!user && (
        <LoginModal onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Main Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Router */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        <ErrorBoundary>
          {activeTab === 'dashboard' && (
            <DashboardView 
              onGoToUpload={() => setActiveTab('upload')} 
              onGoToApprovals={() => setActiveTab('approvals')} 
            />
          )}

          {activeTab === 'upload' && (
            <UploadRunView 
              onRunCompleted={() => setActiveTab('approvals')} 
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsView user={user} />
          )}

          {activeTab === 'audit' && (
            <AuditView />
          )}

          {activeTab === 'agent' && (
            <AgentDecisionsView />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border-subtle)', 
        padding: '1.25rem 2rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        fontSize: '0.785rem',
        color: 'var(--text-dim)',
        background: 'rgba(8, 12, 21, 0.7)'
      }}>
        <span>Aequitas Autonomous Financial Reconciliation Engine &copy; 2026. SOC2 & SOX Compliant.</span>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <span>Gemini Flash &bull; Groq Fallback &bull; Deterministic Hash</span>
          <span 
            style={{ color: 'var(--accent-indigo)', cursor: 'pointer' }}
            onClick={() => setIsSettingsOpen(true)}
          >
            Gateway Config
          </span>
        </div>
      </footer>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}
