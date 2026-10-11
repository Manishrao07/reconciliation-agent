import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Zap, 
  Gauge, 
  RefreshCw, 
  Code2, 
  ChevronDown, 
  ChevronUp,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

export default function AgentDecisionsView() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAgentDecisions(50);
      setDecisions(data || []);
    } catch (err) {
      console.error("Failed to load agent decisions:", err);
      setError(err.message || "Failed to load agent decisions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    } catch {
      return ts;
    }
  };

  const renderJsonOrString = (val) => {
    if (!val) return 'None';
    if (typeof val === 'object') {
      return JSON.stringify(val, null, 2);
    }
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(val);
    }
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            AI Agent Decision Engine Transparency
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Inspect real-time chain of thought, model latency, prompt contexts, and confidence scores
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchDecisions} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
          <span>Refresh Decisions</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading AI decision traces...
        </div>
      ) : decisions.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
          <BrainCircuit size={48} color="var(--accent-indigo)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            No Agent Decisions Recorded Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Trigger a reconciliation run on "Ingest & Run" to populate autonomous model traces.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {decisions.map((dec) => {
            const isExpanded = expandedId === dec.id;
            return (
              <div 
                key={dec.id}
                className="glass-panel"
                style={{
                  borderLeft: '4px solid var(--accent-violet)',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: 'var(--radius-sm)', 
                      background: 'rgba(139, 92, 246, 0.15)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--accent-violet)'
                    }}>
                      <Cpu size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {dec.agent_name || 'ReconciliationLLMAgent'}
                      </span>
                      <span className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '8px' }}>
                        Run #{dec.run_id} | Trace #{dec.id}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {dec.confidence !== null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                        <Gauge size={14} color="var(--accent-emerald)" />
                        <span style={{ color: 'var(--text-dim)' }}>Confidence:</span>
                        <span className="mono-num" style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                          {Number(dec.confidence).toFixed(1)}%
                        </span>
                      </div>
                    )}

                    {dec.latency_ms !== null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                        <Zap size={14} color="var(--accent-amber)" />
                        <span style={{ color: 'var(--text-dim)' }}>Latency:</span>
                        <span className="mono-num" style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>
                          {dec.latency_ms} ms
                        </span>
                      </div>
                    )}

                    <span className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {formatTimestamp(dec.created_at)}
                    </span>
                  </div>
                </div>

                {/* Reasoning summary */}
                <div style={{ 
                  background: 'rgba(14, 21, 38, 0.85)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1rem 1.25rem',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                    Reasoning & Policy Alignment:
                  </span>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {typeof dec.reasoning === 'object' ? JSON.stringify(dec.reasoning, null, 2) : dec.reasoning}
                  </p>
                </div>

                {/* Toggle Raw JSON payload */}
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setExpandedId(isExpanded ? null : dec.id)}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  <Code2 size={13} />
                  <span>{isExpanded ? 'Hide Raw Input/Output Context' : 'View Full Context Payload (JSON)'}</span>
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {isExpanded && (
                  <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: '#05070D', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        INPUT DATA
                      </span>
                      <pre className="mono-num" style={{ fontSize: '0.75rem', color: '#94A3B8', overflowX: 'auto', maxHeight: '200px' }}>
                        {renderJsonOrString(dec.input_data)}
                      </pre>
                    </div>

                    <div style={{ background: '#05070D', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        OUTPUT DATA
                      </span>
                      <pre className="mono-num" style={{ fontSize: '0.75rem', color: '#34D399', overflowX: 'auto', maxHeight: '200px' }}>
                        {renderJsonOrString(dec.output_data)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
