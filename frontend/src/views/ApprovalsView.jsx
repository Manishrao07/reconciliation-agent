import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Filter, 
  RefreshCw, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Lock
} from 'lucide-react';
import { api } from '../services/api';

export default function ApprovalsView({ user }) {
  const [discrepancies, setDiscrepancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvalFilter, setApprovalFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'AUTO_APPROVED'
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [detailsMap, setDetailsMap] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [actionError, setActionError] = useState({});
  
  // Reject modal state
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectError, setRejectError] = useState(null);

  const fetchDiscrepancies = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 100 };
      if (approvalFilter === 'PENDING') params.action_status = 'PENDING';
      else if (approvalFilter === 'AUTO_APPROVED') params.action_status = 'APPROVED';
      if (severityFilter !== 'ALL') params.severity = severityFilter;

      const res = await api.getDiscrepancies(params);
      const items = res.data || res || [];
      setDiscrepancies(items);
    } catch (err) {
      console.error("Discrepancies load error:", err);
      setError(err.message || "Failed to load discrepancies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscrepancies();
  }, [approvalFilter, severityFilter]);

  const loadDetails = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!detailsMap[id] || !detailsMap[id].action) {
      try {
        const detail = await api.getDiscrepancyDetail(id);
        setDetailsMap(prev => ({ ...prev, [id]: detail }));
      } catch (err) {
        console.error("Failed to fetch detail for ID:", id, err);
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'approving' }));
      setActionError(prev => ({ ...prev, [id]: null }));
      await api.approveDiscrepancy(id, "Approved via React Command Center");
      await fetchDiscrepancies();
      // refresh detail
      const detail = await api.getDiscrepancyDetail(id);
      setDetailsMap(prev => ({ ...prev, [id]: detail }));
    } catch (err) {
      setActionError(prev => ({ ...prev, [id]: err.message }));
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectComment.trim()) {
      setRejectError("A comment explaining the rejection is required.");
      return;
    }
    const id = rejectModalItem.id;
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'rejecting' }));
      await api.rejectDiscrepancy(id, rejectComment.trim());
      setRejectModalItem(null);
      setRejectComment('');
      setRejectError(null);
      await fetchDiscrepancies();
      const detail = await api.getDiscrepancyDetail(id);
      setDetailsMap(prev => ({ ...prev, [id]: detail }));
    } catch (err) {
      setRejectError(`Rejection Failed: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const isAuditor = user?.role === 'AUDITOR';

  return (
    <div className="main-content">
      {/* View Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Exception Approval Queue & AI Explanations
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Multi-way transaction anomalies categorized with autonomous AI policy root-cause reasoning
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchDiscrepancies} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Auditor Read-only Banner */}
      {isAuditor && (
        <div style={{ 
          padding: '1rem 1.25rem', 
          background: 'rgba(6, 182, 212, 0.1)', 
          border: '1px solid rgba(6, 182, 212, 0.3)', 
          borderRadius: 'var(--radius-md)', 
          color: '#67E8F9', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Lock size={18} />
          <span><b>Auditor Governance Mode:</b> You have view-only access. Corrective actions can only be approved/rejected by Finance Managers or Admins.</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Filter:
          </span>
          {[
            { key: 'ALL', label: 'All Anomalies' },
            { key: 'PENDING', label: '⚠️ Needs Human Approval' },
            { key: 'AUTO_APPROVED', label: '✓ Auto-Approved (<$1k)' },
          ].map((item) => (
            <button
              key={item.key}
              className={`pill ${approvalFilter === item.key ? 'pill-indigo' : 'pill-neutral'}`}
              style={{ cursor: 'pointer', border: approvalFilter === item.key ? '1px solid var(--accent-indigo)' : undefined }}
              onClick={() => setApprovalFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Severity:
          </span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              className={`pill ${severityFilter === sev ? 'pill-warning' : 'pill-neutral'}`}
              style={{ cursor: 'pointer', border: severityFilter === sev ? '1px solid var(--accent-amber)' : undefined }}
              onClick={() => setSeverityFilter(sev)}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Items */}
      {loading && discrepancies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading exception approvals...
        </div>
      ) : discrepancies.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
          <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Zero Pending Exceptions!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            All ledger transactions in this filter have been reconciled or resolved.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {discrepancies.map((d) => {
            const isExpanded = expandedId === d.id;
            const detail = detailsMap[d.id];
            const action = detail?.action;

            const sevClass = d.severity === 'HIGH' ? 'pill-danger' : (d.severity === 'MEDIUM' ? 'pill-warning' : 'pill-cyan');
            const statusClass = d.status === 'OPEN' ? 'pill-warning' : (d.status === 'RESOLVED' ? 'pill-success' : 'pill-neutral');

            return (
              <div 
                key={d.id}
                className="glass-panel"
                style={{
                  borderLeft: `4px solid ${d.severity === 'HIGH' ? 'var(--accent-rose)' : 'var(--accent-indigo)'}`,
                  padding: '1.25rem 1.5rem',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="mono-num" style={{ fontWeight: 700, color: 'var(--accent-indigo)', fontSize: '0.85rem' }}>
                        ID #{d.id}
                      </span>
                      {d.run_id && (
                        <span className="pill pill-neutral" style={{ fontSize: '0.7rem' }}>
                          Run #{d.run_id}
                        </span>
                      )}
                      <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem' }}>
                        {d.type.replace(/_/g, ' ')}
                      </span>
                      <span className={`pill ${sevClass}`}>{d.severity}</span>
                      {d.action_status === 'PENDING' ? (
                        <span className="pill pill-warning" style={{ background: 'rgba(245, 158, 11, 0.25)', border: '1px solid var(--accent-amber)', color: '#FCD34D' }}>
                          ⏳ PENDING ({d.required_role || 'ADMIN'})
                        </span>
                      ) : d.action_status === 'APPROVED' ? (
                        <span className="pill pill-success" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--accent-emerald)', color: '#34D399' }}>
                          ✓ AUTO-APPROVED (&lt;$1K)
                        </span>
                      ) : d.action_status === 'REJECTED' ? (
                        <span className="pill pill-danger">
                          ✕ REJECTED
                        </span>
                      ) : (
                        <span className={`pill ${statusClass}`}>{d.status}</span>
                      )}
                      {d.related_order_id && (
                        <span className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Order: {d.related_order_id}
                        </span>
                      )}
                      {d.related_payment_id && (
                        <span className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Payment: {d.related_payment_id}
                        </span>
                      )}
                    </div>

                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                      {d.description}
                    </p>
                  </div>

                  <button 
                    className="btn btn-secondary" 
                    onClick={() => loadDetails(d.id)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    <BrainCircuit size={14} color="var(--accent-indigo)" />
                    <span>AI Reasoning</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Expanded AI Reasoning & Corrective Action Drawer */}
                {isExpanded && (
                  <div style={{ 
                    marginTop: '1.25rem', 
                    paddingTop: '1.25rem', 
                    borderTop: '1px solid var(--border-subtle)',
                    animation: 'slideUp 0.2s ease-out'
                  }}>
                    {!detail ? (
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Loading agent reasoning...</div>
                    ) : action ? (
                      <div>
                        {/* Agent Explanation Box */}
                        <div style={{ 
                          background: 'rgba(14, 21, 38, 0.9)', 
                          borderRadius: 'var(--radius-md)', 
                          padding: '1.25rem', 
                          border: '1px solid var(--border-subtle)',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Sparkles size={16} color="var(--accent-violet)" />
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>
                                Autonomous Agent Policy Reasoning
                              </span>
                            </div>
                            <span className="pill pill-indigo" style={{ fontSize: '0.7rem' }}>
                              {action.explanation_source === 'gemini' ? 'Google Gemini Flash' : (action.explanation_source === 'groq' ? 'Groq LLaMA / GPT' : 'Rule Policy Engine')}
                            </span>
                          </div>

                          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {action.llm_explanation}
                          </p>

                          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                            <span>Suggested Action: <b style={{ color: 'var(--text-main)' }}>{action.suggested_action}</b></span>
                            <span>Required Authority: <b style={{ color: 'var(--accent-indigo)' }}>{action.required_role}</b></span>
                            <span>Status: <b className={`pill ${action.status === 'APPROVED' ? 'pill-success' : (action.status === 'REJECTED' ? 'pill-danger' : 'pill-warning')}`}>{action.status}</b></span>
                          </div>
                        </div>

                        {action.status === 'APPROVED' && (
                          <div style={{ padding: '0.65rem 1rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', color: '#34D399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={16} />
                            <span><b>Action Approved & Resolved:</b> This corrective action has been verified, approved, and posted to the immutable audit ledger.</span>
                          </div>
                        )}

                        {/* Error Banner (e.g. Maker-Checker violation or insufficient authority) */}
                        {actionError[d.id] && (
                          <div style={{
                            marginBottom: '0.85rem',
                            padding: '0.75rem 1rem',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            borderRadius: 'var(--radius-md)',
                            color: '#FCA5A5',
                            fontSize: '0.825rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem'
                          }}>
                            <AlertTriangle size={16} color="#F87171" style={{ flexShrink: 0 }} />
                            <span>{actionError[d.id]}</span>
                          </div>
                        )}

                        {/* Interactive Approval / Rejection Action Controls */}
                        {!isAuditor && action.status === 'PENDING' && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button 
                              className="btn btn-danger"
                              onClick={() => setRejectModalItem(d)}
                              disabled={actionLoading[d.id]}
                              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                            >
                              <XCircle size={15} />
                              <span>Reject Action</span>
                            </button>

                            <button 
                              className="btn btn-success"
                              onClick={() => handleApprove(d.id)}
                              disabled={actionLoading[d.id]}
                              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                            >
                              <CheckCircle2 size={15} />
                              <span>Approve & Post</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        No pending corrective action registered for this discrepancy.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal with Mandatory Comment */}
      {rejectModalItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Reject Corrective Action (ID #{rejectModalItem.id})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Please state why this suggested action or adjustment is being rejected for the audit trail.
            </p>

            {rejectError && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#F87171', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                {rejectError}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Audit Rejection Reason *</label>
              <textarea
                className="input-field"
                rows={4}
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="e.g. Chargeback has already been settled via merchant portal, no manual debit required."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setRejectModalItem(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleRejectSubmit}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
