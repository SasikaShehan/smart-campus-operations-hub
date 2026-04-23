const API_BASE_URL = "http://localhost:8084/api";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("campus_token");
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Only set Content-Type to application/json if we're not sending FormData
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: (url: string) => fetchWithAuth(url, { method: "GET" }),
  post: (url: string, body: any) => fetchWithAuth(url, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (url: string, body: any) => fetchWithAuth(url, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (url: string, body: any) => fetchWithAuth(url, { method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (url: string) => fetchWithAuth(url, { method: "DELETE" }),
};
