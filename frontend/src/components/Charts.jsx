import React from 'react';

// Circular Progress Gauge for Match Rate
export function MatchGauge({ rate = 0, size = 130 }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validRate = isNaN(rate) ? 0 : Math.min(Math.max(rate, 0), 100);
  const strokeDashoffset = circumference - (validRate / 100) * circumference;

  let color = 'var(--accent-emerald)';
  if (validRate < 80) color = 'var(--accent-rose)';
  else if (validRate < 95) color = 'var(--accent-amber)';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF' }}>
          {validRate.toFixed(1)}%
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          MATCHED
        </span>
      </div>
    </div>
  );
}

// Interactive Horizontal Bar Chart for Discrepancy Types
export function TypeBarChart({ data = [] }) {
  // data: [{ type: 'DUPLICATE_PAYMENT', count: 4 }, ...]
  const max = Math.max(...data.map(d => d.count), 1);

  const cleanLabel = (text) => text.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  if (data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
        No discrepancy distribution data available.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {data.map((item, idx) => {
        const pct = Math.round((item.count / max) * 100);
        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 500 }}>{cleanLabel(item.type)}</span>
              <span className="mono-num" style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.count} items</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden'
            }}>
              <div 
                style={{ 
                  width: `${pct}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-violet))',
                  borderRadius: 'var(--radius-pill)',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Donut Chart for Severity Distribution
export function SeverityDonutChart({ data = { HIGH: 0, MEDIUM: 0, LOW: 0 } }) {
  const high = data.HIGH || 0;
  const med = data.MEDIUM || 0;
  const low = data.LOW || 0;
  const total = high + med + low;

  if (total === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
        Zero open discrepancies in this run! 🎉
      </div>
    );
  }

  const pHigh = Math.round((high / total) * 100);
  const pMed = Math.round((med / total) * 100);
  const pLow = Math.round((low / total) * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1.5rem', width: '100%' }}>
      {/* Visual Indicator Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-rose)' }} />
            <span>High Severity</span>
          </div>
          <span className="mono-num" style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>{high} ({pHigh}%)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-amber)' }} />
            <span>Medium Severity</span>
          </div>
          <span className="mono-num" style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>{med} ({pMed}%)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-cyan)' }} />
            <span>Low Severity</span>
          </div>
          <span className="mono-num" style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{low} ({pLow}%)</span>
        </div>
      </div>

      {/* Mini Multi-segment Bar */}
      <div style={{ width: '45%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ 
          width: '100%', 
          height: '24px', 
          borderRadius: 'var(--radius-md)', 
          display: 'flex', 
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)' 
        }}>
          {high > 0 && <div style={{ width: `${pHigh}%`, background: 'var(--accent-rose)' }} title={`High: ${high}`} />}
          {med > 0 && <div style={{ width: `${pMed}%`, background: 'var(--accent-amber)' }} title={`Med: ${med}`} />}
          {low > 0 && <div style={{ width: `${pLow}%`, background: 'var(--accent-cyan)' }} title={`Low: ${low}`} />}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total: <b className="mono-num" style={{ color: 'var(--text-main)' }}>{total}</b> open issues</span>
      </div>
    </div>
  );
}
