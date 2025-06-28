// client/src/lib/api.ts

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchDashboardStats(userId: string) {
  const res = await fetch(`${API_BASE}/stats/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return await res.json();
}

export async function fetchInterns(userId: string) {
  const res = await fetch(`${API_BASE}/interns/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch interns");
  return await res.json();
}
