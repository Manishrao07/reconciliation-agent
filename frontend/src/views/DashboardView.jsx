import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  RefreshCw, 
  TrendingUp, 
  ArrowUpRight,
  ShieldAlert,
  Play
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { MatchGauge, TypeBarChart, SeverityDonutChart } from '../components/Charts';
import { api } from '../services/api';

export default function DashboardView({ onGoToUpload, onGoToApprovals }) {
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const runsData = await api.getRuns();
      setRuns(runsData || []);

      if (runsData && runsData.length > 0) {
        const latestRunId = runsData[0].id;
        const discData = await api.getDiscrepancies({ run_id: latestRunId, limit: 100 });
        const items = discData.data || discData || [];
        setDiscrepancies(items);
      } else {
        setDiscrepancies([]);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const latestRun = runs.length > 0 ? runs[0] : null;

  // Extract delta amounts for "Amount at Risk"
  const extractAmountAtRisk = (discList) => {
    let total = 0;
    discList.forEach(d => {
      if (d.status === 'RESOLVED') return;
      const desc = d.description || '';
      const nums = (desc.match(/[-+]?\d*\.\d+|\d+/g) || []).map(Number);
      if (desc.includes("Duplicate") && nums.length > 0) total += nums[0];
      else if (desc.includes("Overpayment") && nums.length >= 2) total += Math.abs(nums[0] - nums[1]);
      else if (desc.includes("Underpayment") && nums.length >= 2) total += Math.abs(nums[0] - nums[1]);
      else if (desc.includes("Refund") && nums.length >= 2) total += Math.abs(nums[0] - nums[1]);
      else if (desc.includes("no matching order") && nums.length > 0) total += nums[0];
    });
    return total;
  };

  const openDiscrepancies = discrepancies.filter(d => d.status !== 'RESOLVED');
  const amountAtRisk = extractAmountAtRisk(discrepancies);

  // Group by Type
  const typeCountMap = {};
  discrepancies.forEach(d => {
    typeCountMap[d.type] = (typeCountMap[d.type] || 0) + 1;
  });
  const typeData = Object.keys(typeCountMap).map(type => ({
    type,
    count: typeCountMap[type]
  })).sort((a, b) => b.count - a.count);

  // Group by Severity
  const severityCountMap = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  openDiscrepancies.forEach(d => {
    const sev = (d.severity || 'LOW').toUpperCase();
    if (severityCountMap[sev] !== undefined) {
      severityCountMap[sev]++;
    }
  });

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    try {
      const date = new Date(ts);
      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="main-content">
      {/* Top Banner with Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Executive Reconciliation Cockpit
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Multi-way continuous matching & autonomous AI agent governance overview
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={onGoToUpload}>
            <Play size={16} />
            <span>New Ingestion Run</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem 1.25rem', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: 'var(--radius-md)', 
          color: '#FCA5A5', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="stat-grid">
        <StatCard
          title="Total Ingested Records"
          value={latestRun && latestRun.total_records ? latestRun.total_records.toLocaleString() : '0'}
          subtext={latestRun ? `Run #${latestRun.id} completed` : 'Awaiting first run'}
          icon={Database}
          accentColor="var(--accent-indigo)"
          glow="var(--glow-indigo)"
        />

        <StatCard
          title="Autonomous Match Rate"
          value={latestRun && latestRun.match_rate !== null ? `${Number(latestRun.match_rate).toFixed(1)}%` : '0.0%'}
          subtext="Target benchmark: >92.0%"
          icon={CheckCircle2}
          accentColor="var(--accent-emerald)"
          glow="var(--glow-emerald)"
        />

        <StatCard
          title="Pending Exceptions"
          value={openDiscrepancies.length}
          subtext={`${severityCountMap.HIGH} High Severity flagged`}
          icon={AlertTriangle}
          accentColor="var(--accent-amber)"
          glow="0 0 20px rgba(245, 158, 11, 0.2)"
        />

        <StatCard
          title="Capital at Risk"
          value={`$${amountAtRisk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Unreconciled delta variance"
          icon={DollarSign}
          accentColor="var(--accent-rose)"
          glow="var(--glow-rose)"
        />
      </div>

      {/* Center Row: Gauge & Visual Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Match Rate & Run Health Card */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', alignSelf: 'flex-start' }}>
            Latest Run Performance
          </h3>
          <MatchGauge rate={latestRun ? Number(latestRun.match_rate) : 0} size={150} />
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Status: <span className="pill pill-success">{latestRun ? latestRun.status : 'IDLE'}</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Started: {latestRun ? formatTimestamp(latestRun.started_at) : 'N/A'}
            </span>
          </div>
          {openDiscrepancies.length > 0 && (
            <button 
              className="btn btn-secondary" 
              onClick={onGoToApprovals}
              style={{ marginTop: '1rem', width: '100%', fontSize: '0.8rem' }}
            >
              <span>Review {openDiscrepancies.length} Pending Exceptions</span>
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>

        {/* Charts Matrix */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Discrepancies by Categorical Type
            </h3>
            <TypeBarChart data={typeData} />
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Severity Composition & Impact
            </h3>
            <SeverityDonutChart data={severityCountMap} />
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Runs Execution Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
              Reconciliation Pipeline Execution History
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Deterministic cross-checks between Orders, DRCs, Gateways & Bank Statements
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Status</th>
                <th>Started At</th>
                <th>Completed At</th>
                <th>Total Records</th>
                <th>Match Rate</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No reconciliation runs found. Start one by clicking "New Ingestion Run".
                  </td>
                </tr>
              ) : (
                runs.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="mono-num" style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>
                        #{r.id}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${r.status === 'COMPLETED' ? 'pill-success' : (r.status === 'RUNNING' ? 'pill-warning' : 'pill-danger')}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="mono-num" style={{ fontSize: '0.8rem' }}>
                      {formatTimestamp(r.started_at)}
                    </td>
                    <td className="mono-num" style={{ fontSize: '0.8rem' }}>
                      {formatTimestamp(r.completed_at)}
                    </td>
                    <td className="mono-num" style={{ fontWeight: 600 }}>
                      {r.total_records ? r.total_records.toLocaleString() : '-'}
                    </td>
                    <td>
                      <span 
                        className="mono-num" 
                        style={{ 
                          fontWeight: 700, 
                          color: Number(r.match_rate) >= 90 ? 'var(--accent-emerald)' : 'var(--accent-amber)' 
                        }}
                      >
                        {r.match_rate !== null ? `${Number(r.match_rate).toFixed(2)}%` : 'N/A'}
                      </span>
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
