import { PROD_URL } from "@/api/auth";
import { FigmaUser } from "@/stores/figma-data-store";
import axios, { AxiosResponse } from "axios";

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

export const validateFigmaToken = async (token: string): Promise<AxiosResponse<FigmaUser>> => {
  return axios.get(`https://api.figma.com/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeFigmaToken = (id: string): Promise<AxiosResponse<any>> => {
  return axios.get(`${PROD_URL}/figma/logout?userId=${id}`);
};