import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, accentColor = 'var(--accent-indigo)', glow = 'var(--glow-indigo)' }) {
  return (
    <div 
      className="glass-panel stat-card"
      style={{
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: glow
      }}
    >
      <div className="stat-header">
        <span className="stat-label">{title}</span>
        {Icon && (
          <div className="stat-icon" style={{ background: `rgba(255, 255, 255, 0.05)`, color: accentColor }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="stat-value mono-num">
        {value}
      </div>

      {subtext && (
        <div className="stat-subtext">
          {subtext}
        </div>
      )}
    </div>
  );
}
