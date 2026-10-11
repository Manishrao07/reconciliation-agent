import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  Filter, 
  Clock, 
  User, 
  ChevronRight,
  Database
} from 'lucide-react';
import { api } from '../services/api';

export default function AuditView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [limit, setLimit] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAuditLogs(limit, actionFilter);
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(err.message || "Failed to load audit trail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, limit]);

  const formatPayload = (val) => {
    if (!val) return null;
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  const filteredLogs = logs.filter(l => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const oldStr = formatPayload(l.old_value)?.toLowerCase() || '';
    const newStr = formatPayload(l.new_value)?.toLowerCase() || '';
    return (
      (l.action && l.action.toLowerCase().includes(term)) ||
      (l.entity_type && l.entity_type.toLowerCase().includes(term)) ||
      (String(l.entity_id || '').toLowerCase().includes(term)) ||
      (String(l.user_id || '').toLowerCase().includes(term)) ||
      newStr.includes(term) ||
      oldStr.includes(term)
    );
  });

  const getActionBadge = (act) => {
    if (act.includes('APPROVED')) return 'pill-success';
    if (act.includes('REJECTED')) return 'pill-danger';
    if (act.includes('RUN')) return 'pill-indigo';
    if (act.includes('UPLOAD')) return 'pill-cyan';
    if (act.includes('LOGIN')) return 'pill-neutral';
    return 'pill-warning';
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Immutable Governance & Audit Trail
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            SOX & SOC2 compliant chronological ledger of all user modifications and autonomous agent events
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            className="input-field"
            style={{ width: '100%', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
            placeholder="Search by Action, Entity, User ID or payload change..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Action:</span>
            <select 
              className="input-field" 
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">User Login</option>
              <option value="UPLOAD_CSV">CSV Upload</option>
              <option value="RUN_START">Run Started</option>
              <option value="RUN_FINISH">Run Finished</option>
              <option value="ACTION_PROPOSED">Action Proposed</option>
              <option value="ACTION_APPROVED">Action Approved</option>
              <option value="ACTION_REJECTED">Action Rejected</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Limit:</span>
            <select 
              className="input-field" 
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity Target</th>
                <th>Actor User ID</th>
                <th>Audit Diff (Old vs New)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading audit stream...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                    No audit logs matching this criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id}>
                    <td className="mono-num" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '6px' }} />
                      {formatTimestamp(l.timestamp)}
                    </td>
                    <td>
                      <span className={`pill ${getActionBadge(l.action)}`}>
                        {l.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                        {l.entity_type || 'SYSTEM'} {l.entity_id ? `(#${l.entity_id})` : ''}
                      </span>
                    </td>
                    <td className="mono-num" style={{ fontSize: '0.8rem' }}>
                      {l.user_id ? `User #${l.user_id}` : 'Autonomous Agent'}
                    </td>
                    <td style={{ fontSize: '0.785rem', maxWidth: '380px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {l.old_value && (
                          <span style={{ color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                            - {formatPayload(l.old_value)}
                          </span>
                        )}
                        {l.new_value && (
                          <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                            + {formatPayload(l.new_value)}
                          </span>
                        )}
                        {!l.old_value && !l.new_value && (
                          <span style={{ color: 'var(--text-dim)' }}>No state mutation payload</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
