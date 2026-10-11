// API Service for Autonomous Finance Reconciliation Engine
import { mockStorage } from './mockStorage';

export const getApiBaseUrl = () => {
  const custom = localStorage.getItem("aequitas_api_url");
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/$/, "");
  }
  return import.meta.env.VITE_API_URL || "http://localhost:8000";
};

export const setCustomApiUrl = (url) => {
  if (url) {
    localStorage.setItem("aequitas_api_url", url.trim());
  } else {
    localStorage.removeItem("aequitas_api_url");
  }
};

export const getToken = () => localStorage.getItem("aequitas_token");
export const setToken = (token) => localStorage.setItem("aequitas_token", token);
export const removeToken = () => localStorage.removeItem("aequitas_token");

let isMockMode = false;
export const isDemoModeActive = () => isMockMode;

const request = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const token = getToken();

  const headers = {
    ...options.headers,
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Do not set Content-Type if FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Add timeout of 3.5s so cloud visitors don't hang if localhost is unreachable
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.status === 401) {
      if (!endpoint.includes("/auth/login")) {
        removeToken();
        window.dispatchEvent(new Event("auth_expired"));
      }
    }

    const contentType = response.headers.get("content-type");
    let data = null;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = data && data.detail ? (typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)) : (typeof data === "string" ? data : response.statusText);
      throw new Error(errorMsg || `HTTP error ${response.status}`);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const data = await request("/health");
      isMockMode = false;
      return data;
    } catch {
      isMockMode = true;
      return mockStorage.checkHealth();
    }
  },

  // Auth
  login: async (email, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const data = await request("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (data.access_token) {
        setToken(data.access_token);
      }
      isMockMode = false;
      return data;
    } catch {
      isMockMode = true;
      return mockStorage.login(email, password);
    }
  },

  getMe: async () => {
    try {
      const user = await request("/api/v1/auth/me");
      isMockMode = false;
      return user;
    } catch {
      isMockMode = true;
      return mockStorage.getMe();
    }
  },

  // Uploads
  uploadCSV: async (type, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await request(`/upload/${type}`, {
        method: "POST",
        body: formData,
      });
      isMockMode = false;
      return res;
    } catch {
      isMockMode = true;
      return mockStorage.uploadCSV(type, file);
    }
  },

  // Reconciliation Runs
  startRun: async () => {
    try {
      const res = await request("/runs", { method: "POST" });
      isMockMode = false;
      return res;
    } catch {
      isMockMode = true;
      return mockStorage.startRun();
    }
  },

  getRuns: async () => {
    try {
      const res = await request("/runs");
      isMockMode = false;
      return res;
    } catch {
      isMockMode = true;
      return mockStorage.getRuns();
    }
  },

  getRun: async (runId) => {
    try {
      const res = await request(`/runs/${runId}`);
      isMockMode = false;
      return res;
    } catch {
      isMockMode = true;
      return mockStorage.getRun(runId);
    }
  },

  // Discrepancies
  getDiscrepancies: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.run_id) searchParams.append("run_id", params.run_id);
      if (params.type) searchParams.append("type", params.type);
      if (params.severity) searchParams.append("severity", params.severity);
      if (params.status) searchParams.append("status", params.status);
      if (params.action_status) searchParams.append("action_status", params.action_status);
      if (params.limit) searchParams.append("limit", params.limit);
      if (params.skip) searchParams.append("skip", params.skip);

      const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
      const res = await request(`/discrepancies${query}`);
      isMockMode = false;
      return res;
    } catch {
      isMockMode = true;
      return mockStorage.getDiscrepancies(params);
    }
  },

  getDiscrepancyDetail: async (id) => {
    try {
      const res = await request(`/discrepancies/${id}`);
      isMockMode = false;
      return res;
    } catch {
      isMockMode = true;
      return mockStorage.getDiscrepancyDetail(id);
    }
  },

  approveDiscrepancy: async (id, comments = "") => {
    try {
      const res = await request(`/discrepancies/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ comments }),
      });
      isMockMode = false;
      return res;
    } catch {
      isMockMode = true;
      return mockStorage.approveDiscrepancy(id, comments);
    }
  },

  rejectDiscrepancy: async (id, comments = "") => {
    try {
      const res = await request(`/discrepancies/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ comments }),
      });
      isMockMode = false;
      return res;
    } catch {
      isMockMode = true;
      return mockStorage.rejectDiscrepancy(id, comments);
    }
  },

  // Audit & Agent Decisions
  getAuditLogs: async (limit = 50, action = null) => {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("limit", limit);
      if (action && action !== "ALL") searchParams.append("action", action);
      const res = await request(`/audit?${searchParams.toString()}`);
      isMockMode = false;
      return res;
    } catch {
      isMockMode = true;
      return mockStorage.getAuditLogs(limit, action);
    }
  },

  getAgentDecisions: async (limit = 50) => {
    try {
      const res = await request(`/audit/agent-decisions?limit=${limit}`);
      isMockMode = false;
      return res;
    } catch {
      isMockMode = true;
      return mockStorage.getAgentDecisions(limit);
    }
  },
};
