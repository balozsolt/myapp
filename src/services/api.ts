// services/api.ts — All HTTP calls to the backend
// Automatically attaches the JWT token from localStorage to every request.

const BASE_URL = "http://localhost:3001/api";

export interface PasswordEntry {
  id: number;
  appName: string;
  url: string;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

// Builds headers for every request — includes the JWT if one exists
function getHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// If the backend returns 401, the token has expired — send user to login
function handleUnauthorized(status: number): void {
  if (status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  }
}

export async function fetchPasswords(): Promise<PasswordEntry[]> {
  const res = await fetch(`${BASE_URL}/passwords`, {
    headers: getHeaders(),
  });
  handleUnauthorized(res.status);
  if (!res.ok) throw new Error("Failed to fetch passwords");
  return res.json();
}

export async function createPassword(
  data: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt">
): Promise<PasswordEntry> {
  const res = await fetch(`${BASE_URL}/passwords`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  handleUnauthorized(res.status);
  if (!res.ok) throw new Error("Failed to create password");
  return res.json();
}

export async function updatePassword(
  id: number,
  data: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt">
): Promise<PasswordEntry> {
  const res = await fetch(`${BASE_URL}/passwords/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  handleUnauthorized(res.status);
  if (!res.ok) throw new Error("Failed to update password");
  return res.json();
}

export async function deletePassword(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/passwords/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  handleUnauthorized(res.status);
  if (!res.ok) throw new Error("Failed to delete password");
}