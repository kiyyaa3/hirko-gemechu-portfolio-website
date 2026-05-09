const API_URL = import.meta.env.VITE_API_URL || "";
const BASE_PATH = import.meta.env.BASE_PATH || "";

export function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (!API_URL && path.startsWith("/")) return `${BASE_PATH}${path}`;
  return `${API_URL}${path}`;
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
