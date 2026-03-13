import { API_BASE_URL } from "./config";
import { HealthRecord } from "./types";

const tokenCache: Record<string, string> = {};

export async function getToken(userId: string): Promise<string> {
  if (tokenCache[userId]) return tokenCache[userId];
  const res = await fetch(`${API_BASE_URL}/auth/token?user_id=${encodeURIComponent(userId)}`, {
    method: "POST"
  });
  const data = await res.json();
  tokenCache[userId] = data.access_token;
  return tokenCache[userId];
}

export async function fetchAllHistory(limit = 200): Promise<HealthRecord[]> {
  const token = await getToken("demo_doctor_01");
  const res = await fetch(`${API_BASE_URL}/api/history?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return (data.records || []) as HealthRecord[];
}

export async function fetchUserHistory(userId: string, limit = 200): Promise<HealthRecord[]> {
  const token = await getToken(userId);
  const res = await fetch(`${API_BASE_URL}/api/history/${encodeURIComponent(userId)}?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return (data.records || []) as HealthRecord[];
}
