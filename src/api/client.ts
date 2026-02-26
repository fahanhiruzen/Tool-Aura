import { useAuthStore } from "@/stores/auth-store";

const BASE = import.meta.env.VITE_API_BASE ?? "https://cddb3.uici-int.i.mercedes-benz.com/cddb/api";

function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().token;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function api<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}
