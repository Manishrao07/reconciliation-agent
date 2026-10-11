// API Service for Autonomous Finance Reconciliation Engine

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

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // If unauthorized on protected endpoint, remove stale token
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
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
};

export const api = {
  // Health
  checkHealth: async () => {
    return request("/health");
  },

  // Auth
  login: async (email, password) => {
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
    return data;
  },

  getMe: async () => {
    return request("/api/v1/auth/me");
  },

  // Uploads
  uploadCSV: async (type, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request(`/upload/${type}`, {
      method: "POST",
      body: formData,
    });
  },

  // Reconciliation Runs
  startRun: async () => {
    return request("/runs", {
      method: "POST",
    });
  },

  getRuns: async () => {
    return request("/runs");
  },

  getRun: async (runId) => {
    return request(`/runs/${runId}`);
  },

  // Discrepancies
  getDiscrepancies: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.run_id) searchParams.append("run_id", params.run_id);
    if (params.type) searchParams.append("type", params.type);
    if (params.severity) searchParams.append("severity", params.severity);
    if (params.status) searchParams.append("status", params.status);
    if (params.action_status) searchParams.append("action_status", params.action_status);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.skip) searchParams.append("skip", params.skip);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return request(`/discrepancies${query}`);
  },

  getDiscrepancyDetail: async (id) => {
    return request(`/discrepancies/${id}`);
  },

  approveDiscrepancy: async (id, comments = "") => {
    return request(`/discrepancies/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ comments }),
    });
  },

  rejectDiscrepancy: async (id, comments = "") => {
    return request(`/discrepancies/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ comments }),
    });
  },

  // Audit & Agent Decisions
  getAuditLogs: async (limit = 50, action = null) => {
    const searchParams = new URLSearchParams();
    searchParams.append("limit", limit);
    if (action && action !== "ALL") searchParams.append("action", action);
    return request(`/audit?${searchParams.toString()}`);
  },

  getAgentDecisions: async (limit = 50) => {
    return request(`/audit/agent-decisions?limit=${limit}`);
  },
};
