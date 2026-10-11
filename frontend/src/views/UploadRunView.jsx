import React, { useState } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  FileSpreadsheet, 
  Play, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { api } from '../services/api';

export default function UploadRunView({ onRunCompleted }) {
  const [files, setFiles] = useState({
    orders: null,
    drcs: null,
    payments: null,
    refunds: null,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [error, setError] = useState(null);
  const [activeRun, setActiveRun] = useState(null);
  const [runStage, setRunStage] = useState(0); // 0: idle, 1: ingesting, 2: matching, 3: llm, 4: complete

  const handleFileChange = (type, file) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  // 1-Click Sample Dataset Loader: Generates standard valid reconciliation CSVs on the fly
  const loadDemoData = async () => {
    setError(null);
    setUploadStatusText('Preparing sample fintech datasets...');

    const sampleOrders = `order_id,amount,currency,order_date,customer_id\nORD-101,150.00,USD,2026-10-10,CUST-01\nORD-102,450.50,USD,2026-10-10,CUST-02\nORD-103,1200.00,USD,2026-10-10,CUST-03\nORD-104,89.99,USD,2026-10-10,CUST-04\nORD-105,310.00,USD,2026-10-10,CUST-05`;
    const sampleDrcs = `drc_id,order_id,amount,fee,net_amount,drc_date\nDRC-101,ORD-101,150.00,4.50,145.50,2026-10-10\nDRC-102,ORD-102,450.50,13.50,437.00,2026-10-10\nDRC-103,ORD-103,1200.00,36.00,1164.00,2026-10-10\nDRC-104,ORD-104,89.99,2.70,87.29,2026-10-10\nDRC-105,ORD-105,310.00,9.30,300.70,2026-10-10`;
    const samplePayments = `payment_id,order_id,amount,method,status,payment_date\nPAY-101,ORD-101,150.00,STRIPE,SETTLED,2026-10-10\nPAY-102,ORD-102,450.50,PAYPAL,SETTLED,2026-10-10\nPAY-103,ORD-103,1150.00,WIRE,SETTLED,2026-10-10\nPAY-104,ORD-104,89.99,STRIPE,SETTLED,2026-10-10\nPAY-105,ORD-105,310.00,STRIPE,SETTLED,2026-10-10\nPAY-106,ORD-105,310.00,STRIPE,SETTLED,2026-10-10`;
    const sampleRefunds = `refund_id,order_id,amount,reason,refund_date\nREF-101,ORD-102,50.00,PARTIAL_RETURN,2026-10-10`;

    setFiles({
      orders: new File([sampleOrders], "orders.csv", { type: "text/csv" }),
      drcs: new File([sampleDrcs], "drcs.csv", { type: "text/csv" }),
      payments: new File([samplePayments], "payments.csv", { type: "text/csv" }),
      refunds: new File([sampleRefunds], "refunds.csv", { type: "text/csv" }),
    });

    setUploadStatusText('Sample datasets loaded into slots! Click "Trigger Autonomous Reconciliation" to execute.');
  };

  const uploadAndRun = async () => {
    if (!files.orders || !files.drcs || !files.payments || !files.refunds) {
      setError("Please provide all 4 CSV datasets (Orders, DRCs, Payments, Refunds) before running.");
      return;
    }

    try {
      setError(null);
      setUploading(true);

      // Upload each file
      setUploadStatusText("Uploading Orders CSV...");
      await api.uploadCSV("orders", files.orders);

      setUploadStatusText("Uploading DRCs Settlement CSV...");
      await api.uploadCSV("drcs", files.drcs);

      setUploadStatusText("Uploading Payment Gateway Logs...");
      await api.uploadCSV("payments", files.payments);

      setUploadStatusText("Uploading Refunds & Adjustments...");
      await api.uploadCSV("refunds", files.refunds);

      // Trigger run
      setUploadStatusText("Triggering Multi-Engine Reconciliation Pipeline...");
      const runRes = await api.startRun();
      const runId = runRes.run_id;

      setActiveRun({ id: runId, status: "RUNNING" });
      setRunStage(1);

      // Poll status
      pollRunStatus(runId);
    } catch (err) {
      console.error("Run failure:", err);
      setError(err.message || "Failed to execute pipeline");
      setUploading(false);
    }
  };

  const pollRunStatus = (runId) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const runData = await api.getRun(runId);
        setActiveRun(runData);

        if (attempts >= 1 && attempts < 3) setRunStage(1);
        else if (attempts >= 3 && attempts < 5) setRunStage(2);
        else if (attempts >= 5 && attempts < 7) setRunStage(3);
        else if (attempts >= 7) setRunStage(4);

        if (runData.status === "COMPLETED" || runData.status === "FAILED") {
          clearInterval(interval);
          setRunStage(5);
          setUploading(false);
        }
      } catch (err) {
        clearInterval(interval);
        setError("Error monitoring run status");
        setUploading(false);
      }
    }, 1500);
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Data Ingestion & Autonomous Execution
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Upload raw end-of-day transaction journals to execute 4-way reconciliation
          </p>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={loadDemoData}
          disabled={uploading}
          style={{ borderColor: 'var(--accent-indigo)' }}
        >
          <Sparkles size={16} color="var(--accent-indigo)" />
          <span>Load Demo Datasets</span>
        </button>
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
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Quadrant File Dropzones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { key: 'orders', label: '1. Orders Journal', desc: 'Internal OMS e-commerce order book' },
          { key: 'drcs', label: '2. DRCs (Settlements)', desc: 'Daily reconciliation reports from PSP' },
          { key: 'payments', label: '3. Payment Gateways', desc: 'Stripe, PayPal, Adyen capture feeds' },
          { key: 'refunds', label: '4. Refunds & Reversals', desc: 'Chargebacks, disputes, credit notes' },
        ].map((slot) => {
          const file = files[slot.key];
          return (
            <div 
              key={slot.key}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                border: file ? '1px solid var(--accent-indigo)' : '1px dashed var(--border-medium)',
                background: file ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-surface-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '190px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>{slot.label}</span>
                  {file ? (
                    <CheckCircle2 size={18} color="var(--accent-emerald)" />
                  ) : (
                    <FileSpreadsheet size={18} color="var(--text-dim)" />
                  )}
                </div>
                <p style={{ fontSize: '0.785rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>{slot.desc}</p>
              </div>

              <div>
                {file ? (
                  <div style={{ 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: 'var(--radius-sm)', 
                    background: 'var(--bg-surface-elevated)', 
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                      {file.name}
                    </span>
                    <span className="mono-num" style={{ color: 'var(--text-dim)' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ) : (
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <UploadCloud size={14} />
                    <span>Select CSV</span>
                    <input 
                      type="file" 
                      accept=".csv" 
                      style={{ display: 'none' }} 
                      onChange={(e) => e.target.files && handleFileChange(slot.key, e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action CTA Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
            Ready for Cross-Matching
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {uploadStatusText || "Deterministic fuzzy comparison & autonomous AI exception resolution"}
          </span>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={uploadAndRun} 
          disabled={uploading}
          style={{ padding: '0.8rem 1.75rem', fontSize: '0.95rem' }}
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="spin-anim" />
              <span>Processing Pipeline...</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>Trigger Autonomous Reconciliation</span>
            </>
          )}
        </button>
      </div>

      {/* Live Pipeline Tracker & Stage Monitor */}
      {activeRun && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                Pipeline Execution: Run #{activeRun.id}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Multi-pass validation engine active
              </span>
            </div>

            <span className={`pill ${activeRun.status === 'COMPLETED' ? 'pill-success' : 'pill-warning'}`}>
              {activeRun.status}
            </span>
          </div>

          {/* Stepper Progress */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { stage: 1, title: '1. Schema & Cleaning', desc: 'Type normalization' },
              { stage: 2, title: '2. Exact Match', desc: '1-to-1 hash validation' },
              { stage: 3, title: '3. Fuzzy & Variance', desc: 'Tolerance policy check' },
              { stage: 4, title: '4. LLM Root Cause', desc: 'Gemini/Groq explanation' },
            ].map((s) => {
              const isPast = runStage > s.stage;
              const isCurrent = runStage === s.stage;
              return (
                <div 
                  key={s.stage}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'rgba(99, 102, 241, 0.15)' : (isPast ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface-elevated)'),
                    border: isCurrent ? '1px solid var(--accent-indigo)' : (isPast ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)'),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isCurrent ? 'var(--accent-indigo)' : (isPast ? 'var(--accent-emerald)' : 'var(--text-muted)') }}>
                      {s.title}
                    </span>
                    {isPast && <CheckCircle2 size={14} color="var(--accent-emerald)" />}
                    {isCurrent && <Loader2 size={14} className="spin-anim" color="var(--accent-indigo)" />}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{s.desc}</span>
                </div>
              );
            })}
          </div>

          {/* Finished Outcome Card */}
          {activeRun.status === 'COMPLETED' && (
            <div style={{ 
              padding: '1.25rem', 
              background: 'rgba(16, 185, 129, 0.08)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#34D399', display: 'block' }}>
                  Reconciliation Pipeline Completed Successfully!
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Ingested: <b className="mono-num" style={{ color: '#FFFFFF' }}>{activeRun.total_records}</b> | 
                  Match Rate: <b className="mono-num" style={{ color: '#34D399' }}>{Number(activeRun.match_rate).toFixed(2)}%</b>
                </span>
              </div>

              <button className="btn btn-success" onClick={onRunCompleted}>
                <span>Inspect Exceptions in Approvals</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {activeRun.status === 'FAILED' && (
            <div style={{ 
              padding: '1.25rem', 
              background: 'rgba(239, 68, 68, 0.08)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F87171', display: 'block' }}>
                  Pipeline Execution Failed
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Please inspect Audit Logs or server logs for details.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
