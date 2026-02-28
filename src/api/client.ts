import { useFigmaDataStore } from "@/stores/figma-data-store";

const BASE = import.meta.env.VITE_API_BASE ?? "https://cddb3.uici.i.mercedes-benz.com/cddb/api";

function getAuthHeader(): Record<string, string> {
  const token = useFigmaDataStore.getState().data?.cddbToken;
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
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    let message = text;
    try {
      const json = JSON.parse(text) as { error?: string };
      if (typeof json?.error === "string") message = json.error;
    } catch {
      /* use raw text */
    }
    throw new Error(message);
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}
