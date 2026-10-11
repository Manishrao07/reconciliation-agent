import { initialMockData } from './mockData';

const STORAGE_KEY = 'aequitas_demo_store_v2';

const getStore = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // fallback
    }
  }
  const initial = JSON.parse(JSON.stringify(initialMockData));
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
      return {
        id: 1,
        email: payload.email,
        full_name: payload.name,
        role: payload.role,
        is_active: true
      };
    } catch {
      return {
        id: 1,
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
    const newId = (store.runs && store.runs.length > 0 ? store.runs[0].id : 18) + 1;
    const newRun = {
      id: newId,
      status: "COMPLETED",
      total_records: 198,
      match_rate: 73.23,
      started_at: new Date(Date.now() - 3000).toISOString(),
      completed_at: new Date().toISOString()
    };
    store.runs.unshift(newRun);
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
    const disc = (store.discrepancies || []).find(d => d.id === Number(id));
    if (disc) {
      disc.status = "RESOLVED";
      disc.action_status = "APPROVED";
      if (disc.action) disc.action.status = "APPROVED";
      
      // Append audit log
      store.auditLogs.unshift({
        id: Date.now(),
        action: "ACTION_APPROVED",
        entity_type: "CorrectiveAction",
        entity_id: disc.id,
        user_id: 1,
        old_value: { status: "PENDING" },
        new_value: { status: "APPROVED", comments: comments || "Approved via Command Center" },
        timestamp: new Date().toISOString()
      });
      saveStore(store);
    }
    return { message: "Action approved", approval_id: Date.now() };
  },

  rejectDiscrepancy: async (id, comments = "") => {
    const store = getStore();
    const disc = (store.discrepancies || []).find(d => d.id === Number(id));
    if (disc) {
      disc.status = "REJECTED";
      disc.action_status = "REJECTED";
      if (disc.action) disc.action.status = "REJECTED";
      
      // Append audit log
      store.auditLogs.unshift({
        id: Date.now(),
        action: "ACTION_REJECTED",
        entity_type: "CorrectiveAction",
        entity_id: disc.id,
        user_id: 1,
        old_value: { status: "PENDING" },
        new_value: { status: "REJECTED", comments: comments || "Rejected" },
        timestamp: new Date().toISOString()
      });
      saveStore(store);
    }
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
  }
};
