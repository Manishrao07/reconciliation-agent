import { initialMockData } from './mockData';

const STORAGE_KEY = 'aequitas_recon_v10';

const getStore = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // fallback
    }
  }
  // Start with clean slate: 0 runs, 0 discrepancies, awaiting first run
  const initial = {
    runs: [],
    discrepancies: [],
    agentDecisions: [],
    auditLogs: []
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveStore = (store) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const mockStorage = {
  checkHealth: async () => {
    return { status: "demo_mode", mode: "Interactive Cloud Showcase" };
  },

  login: async (email, password) => {
    let role = "FINANCE_MANAGER";
    let name = "Finance Manager";
    if (email.includes("admin")) {
      role = "ADMIN";
      name = "System Admin";
    } else if (email.includes("auditor")) {
      role = "AUDITOR";
      name = "Lead Auditor";
    }
    const token = "demo-jwt-" + btoa(JSON.stringify({ email, role, name }));
    localStorage.setItem("aequitas_token", token);
    return { access_token: token, token_type: "bearer" };
  },

  getMe: async () => {
    const token = localStorage.getItem("aequitas_token") || "";
    try {
      const payload = JSON.parse(atob(token.replace("demo-jwt-", "")));
      const id = payload.role === 'ADMIN' ? 1 : (payload.role === 'FINANCE_MANAGER' ? 2 : 3);
      return {
        id,
        email: payload.email,
        full_name: payload.name,
        role: payload.role,
        is_active: true
      };
    } catch {
      return {
        id: 2,
        email: "manager@example.com",
        full_name: "Finance Manager",
        role: "FINANCE_MANAGER",
        is_active: true
      };
    }
  },

  getRuns: async () => {
    const store = getStore();
    return store.runs || [];
  },

  getRun: async (runId) => {
    const store = getStore();
    const run = (store.runs || []).find(r => r.id === Number(runId));
    if (run) return run;
    return {
      id: Number(runId),
      status: "COMPLETED",
      total_records: 198,
      match_rate: 73.23,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };
  },

  startRun: async () => {
    const store = getStore();
    const currentUser = await mockStorage.getMe();
    const creatorId = (currentUser && currentUser.id) ? currentUser.id : 2;
    const creatorRole = (currentUser && currentUser.role) ? currentUser.role : 'FINANCE_MANAGER';
    const newId = (store.runs && store.runs.length > 0 ? store.runs[0].id : 0) + 1;
    const newRun = {
      id: newId,
      status: "COMPLETED",
      total_records: 198,
      match_rate: 73.23,
      user_id: creatorId,
      creator_role: creatorRole,
      started_at: new Date(Date.now() - 3000).toISOString(),
      completed_at: new Date().toISOString()
    };
    store.runs.unshift(newRun);

    // Refresh and link discrepancies for this new run
    const freshDiscrepancies = JSON.parse(JSON.stringify(initialMockData.discrepancies || []));
    freshDiscrepancies.forEach(d => {
      d.run_id = newId;
    });
    store.discrepancies = freshDiscrepancies;

    // Link agent decisions to this new run
    const freshDecisions = JSON.parse(JSON.stringify(initialMockData.agentDecisions || []));
    freshDecisions.forEach(dec => {
      dec.run_id = newId;
    });
    store.agentDecisions = freshDecisions;

    // Append audit log for the ingestion run
    if (!store.auditLogs) store.auditLogs = [];
    store.auditLogs.unshift({
      id: Date.now(),
      action: "RECONCILIATION_RUN_COMPLETED",
      entity_type: "ReconciliationRun",
      entity_id: newId,
      user_id: creatorId,
      old_value: { status: "INGESTING" },
      new_value: { status: "COMPLETED", total_records: 198, match_rate: 73.23, discrepancies_detected: freshDiscrepancies.length },
      timestamp: new Date().toISOString()
    });

    saveStore(store);
    return { message: "Run triggered", run_id: newId };
  },

  uploadCSV: async (type, file) => {
    return { message: `${type} uploaded`, filename: file.name, rows_processed: 198 };
  },

  getDiscrepancies: async (params = {}) => {
    const store = getStore();
    let items = [...(store.discrepancies || [])];

    if (params.run_id) {
      items = items.filter(d => d.run_id === Number(params.run_id));
    }
    if (params.type) {
      items = items.filter(d => d.type === params.type);
    }
    if (params.severity && params.severity !== 'ALL') {
      items = items.filter(d => d.severity === params.severity);
    }
    if (params.status && params.status !== 'ALL') {
      items = items.filter(d => d.status === params.status);
    }
    if (params.action_status) {
      if (params.action_status === 'PENDING') {
        items = items.filter(d => d.action_status === 'PENDING');
      } else if (params.action_status === 'APPROVED') {
        items = items.filter(d => d.action_status === 'APPROVED');
      } else if (params.action_status === 'REJECTED') {
        items = items.filter(d => d.action_status === 'REJECTED');
      }
    }

    const limit = Number(params.limit) || 100;
    const skip = Number(params.skip) || 0;
    const paged = items.slice(skip, skip + limit);

    return {
      total: items.length,
      skip,
      limit,
      data: paged
    };
  },

  getDiscrepancyDetail: async (id) => {
    const store = getStore();
    const disc = (store.discrepancies || []).find(d => d.id === Number(id));
    if (disc) return disc;
    return {
      id: Number(id),
      type: "OVERPAYMENT",
      severity: "MEDIUM",
      description: "Overpayment detected",
      status: "OPEN",
      action: {
        id: 999,
        suggested_action: "ISSUE_REFUND",
        llm_explanation: "Payment exceeded the order total. Corrective refund recommended.",
        explanation_source: "groq",
        status: "APPROVED",
        required_role: "NONE"
      }
    };
  },

  approveDiscrepancy: async (id, comments = "") => {
    const store = getStore();
    const currentUser = await mockStorage.getMe();
    const disc = (store.discrepancies || []).find(d => d.id === Number(id));
    if (!disc) {
      throw new Error("Discrepancy not found");
    }

    // 1. Auditor is read-only
    if (currentUser.role === 'AUDITOR') {
      throw new Error("Auditor role is read-only and cannot approve actions.");
    }

    // 2. Maker-checker policy: proposer cannot approve their own action
    const run = (store.runs || []).find(r => r.id === disc.run_id);
    if (run && run.user_id && run.user_id === currentUser.id) {
      throw new Error("Maker-Checker Policy Violation: You initiated this reconciliation run (Maker) and cannot approve your own actions. An independent reviewer (Checker) must approve.");
    }

    // 3. Role threshold check
    const requiredRole = (disc.action && disc.action.required_role) || disc.required_role || 'FINANCE_MANAGER';
    if (requiredRole === 'ADMIN' && currentUser.role !== 'ADMIN') {
      throw new Error("Insufficient Authority: This high-threshold action requires ADMIN authorization.");
    }

    disc.status = "RESOLVED";
    disc.action_status = "APPROVED";
    if (disc.action) disc.action.status = "APPROVED";
    
    // Append audit log
    if (!store.auditLogs) store.auditLogs = [];
    store.auditLogs.unshift({
      id: Date.now(),
      action: "ACTION_APPROVED",
      entity_type: "CorrectiveAction",
      entity_id: disc.id,
      user_id: currentUser.id,
      old_value: { status: "PENDING" },
      new_value: { status: "APPROVED", comments: comments || "Approved via Command Center" },
      timestamp: new Date().toISOString()
    });
    saveStore(store);
    return { message: "Action approved", approval_id: Date.now() };
  },

  rejectDiscrepancy: async (id, comments = "") => {
    const store = getStore();
    const currentUser = await mockStorage.getMe();
    const disc = (store.discrepancies || []).find(d => d.id === Number(id));
    if (!disc) {
      throw new Error("Discrepancy not found");
    }

    if (currentUser.role === 'AUDITOR') {
      throw new Error("Auditor role is read-only and cannot reject actions.");
    }

    const run = (store.runs || []).find(r => r.id === disc.run_id);
    if (run && run.user_id && run.user_id === currentUser.id) {
      throw new Error("Maker-Checker Policy Violation: You initiated this reconciliation run (Maker) and cannot reject your own actions.");
    }

    // Role threshold check
    const requiredRole = (disc.action && disc.action.required_role) || disc.required_role || 'FINANCE_MANAGER';
    if (requiredRole === 'ADMIN' && currentUser.role !== 'ADMIN') {
      throw new Error("Insufficient Authority: This high-threshold action requires ADMIN authorization.");
    }

    disc.status = "REJECTED";
    disc.action_status = "REJECTED";
    if (disc.action) disc.action.status = "REJECTED";

    if (!store.auditLogs) store.auditLogs = [];
    store.auditLogs.unshift({
      id: Date.now(),
      action: "ACTION_REJECTED",
      entity_type: "CorrectiveAction",
      entity_id: disc.id,
      user_id: currentUser.id,
      old_value: { status: "PENDING" },
      new_value: { status: "REJECTED", comments: comments || "Rejected" },
      timestamp: new Date().toISOString()
    });
    saveStore(store);
    return { message: "Action rejected", approval_id: Date.now() };
  },

  getAuditLogs: async (limit = 50, action = null) => {
    const store = getStore();
    let logs = store.auditLogs || [];
    if (action && action !== 'ALL') {
      logs = logs.filter(l => l.action === action);
    }
    return logs.slice(0, Number(limit) || 50);
  },

  getAgentDecisions: async (limit = 50) => {
    const store = getStore();
    return (store.agentDecisions || []).slice(0, Number(limit) || 50);
  },

  resetToCleanState: async () => {
    const initial = {
      runs: [],
      discrepancies: [],
      agentDecisions: [],
      auditLogs: []
    };
    saveStore(initial);
    return { message: "Store reset to clean state" };
  }
};
