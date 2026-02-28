import { BASE_URL } from "@/lib/constants";
import { useFigmaDataStore } from "@/stores/figma-data-store";

const BASE = import.meta.env.VITE_API_BASE ?? BASE_URL;

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


export async function apiForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { ...getAuthHeader() },
    body,
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

export async function apiCustom<T>(
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

  const contentType = res.headers.get("content-type");

  let body: any = null;

  if (contentType?.includes("application/json")) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  } else {
    body = await res.text().catch(() => null);
  }

  // For 422 the server returns the full result body (e.g. ValidationResult with hasErrors=true)
  // Treat it as a successful response so callers can inspect the body normally.
  if (res.status === 422 && body !== null) {
    return body as T;
  }

  // Normal error handling for all other non-ok status codes
  if (!res.ok) {
    const message =
      body?.message ||
      body?.error ||
      res.statusText ||
      "Something went wrong";

    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return body as T;
}