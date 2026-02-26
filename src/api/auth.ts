export const PROD_URL = "https://cddb3.uici.i.mercedes-benz.com/cddb/api";

export interface IStateCodeResponse {
  state: string;
  userId: string;
}

/**
 * Validates the token by calling the figma state endpoint.
 * Use this to check if the user added a valid token.
 */
export async function getStateCode(
  userId: string,
  token: string
): Promise<IStateCodeResponse> {
  const url = `${PROD_URL}/figma/state?userId=${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
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
  return res.json() as Promise<IStateCodeResponse>;
}

/**
 * Opens the CDDB access token page in a new tab so the user can obtain or refresh their token.
 */
export function getRefreshToken(): void {
  const url = `https://cddb3.uici.i.mercedes-benz.com/cddb/user/access_token`;
  window.open(url, "_blank");
}
