import { api } from "@/api/client";
import { BASE_URL } from "@/lib/constants";


export interface IAuth {
  accessToken: string;
}

export async function getAccessToken(userId: string): Promise<IAuth> {
  return api<IAuth>(`/figma/access_token?userId=${encodeURIComponent(userId)}`);
}

export interface IStateCodeResponse {
  state: string;
  userId: string;
}


export const handleAllowFigmaPermission = (state: string): void => {
  const authorizationUrl =
    "https://www.figma.com/oauth?" +
    "response_type=code" +
    "&client_id=iQVYzmXcwgP3NaGTc40Waz" +
    `&redirect_uri=${BASE_URL}/figma/callback` +
    `&state=${state}` +
    "&scope=current_user:read,file_comments:read,file_content:read,file_metadata:read,file_versions:read,file_variables:read,library_assets:read,library_content:read,team_library_content:read,file_dev_resources:read,projects:read,webhooks:read,webhooks:write";

  window.open(authorizationUrl, "_blank");
};
/**
 * Validates the token by calling the figma state endpoint.
 * Use this to check if the user added a valid token.
 */
export async function getStateCode(
  userId: string,
  token: string
): Promise<IStateCodeResponse> {
  const url = `${BASE_URL}/figma/state?userId=${encodeURIComponent(userId)}`;
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
