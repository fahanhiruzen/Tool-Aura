import { PROD_URL } from "@/api/auth";

export interface IRole {
  id: string;
  name: string;
}

export interface ICurrentUser {
  email: string;
  id: string;
  roles: IRole[];
  username: string;
}

/**
 * Fetches the current CDDB user and roles using the given token.
 * Call in parallel when token is set/validated.
 */
export async function getCurrentUser(token: string): Promise<ICurrentUser> {
  const res = await fetch(`${PROD_URL}/user/current`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<ICurrentUser>;
}
