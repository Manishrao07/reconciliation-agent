import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, UserCheck, KeyRound } from 'lucide-react';
import { api } from '../services/api';

export default function LoginModal({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.login(email, password);
      const user = await api.getMe();
      onLoginSuccess(user);
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid credentials. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-icon-box" style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            AEQUITAS COMMAND
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Autonomous Financial Reconciliation Portal
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: 'var(--radius-md)', 
            color: '#F87171', 
            fontSize: '0.8rem', 
            marginBottom: '1.25rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Corporate Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input-field"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
              <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-field"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <KeyRound size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-anim" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <>
                <span>Enter Reconciliation Suite</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            Demo Access: <code style={{ color: 'var(--text-muted)' }}>manager@example.com</code> / <code style={{ color: 'var(--text-muted)' }}>admin@example.com</code> &bull; Pass: <code style={{ color: 'var(--text-muted)' }}>Demo#Pass123</code>
          </div>
        </form>
      </div>
    </div>
  );
}
