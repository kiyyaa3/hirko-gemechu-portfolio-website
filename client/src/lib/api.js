const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const BASE_PATH = import.meta.env.BASE_PATH || "";

export function assetUrl(path) {
  const value = String(path || "").trim();
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (/^[\w.-]+\.[a-z]{2,}([/:?#]|$)/i.test(value)) return `https://${value}`;
  if (!value.startsWith("/")) return API_URL ? `${API_URL}/${value}` : `${BASE_PATH}/${value}`;
  if (!API_URL && value.startsWith("/")) return `${BASE_PATH}${value}`;
  return `${API_URL}${value}`;
}

export async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

export function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
