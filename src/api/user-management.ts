import { api } from "./client";

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

export interface IRequest {
  createdAt: string;
  currentRoles: IRole[];
  email: string;
  message: null | string;
  modifiedAt: string;
  requestId: number;
  requestedRole: string;
  username: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED";
}

export interface IBasePagination {
  totalElements: number;
  totalPages: number;
  number: number;
  last: boolean;
}

export interface IRequestList extends IBasePagination {
  content: IRequest[];
}

export interface IUserList extends IBasePagination {
  content: ICurrentUser[];
}

export const userManagementApi = {
  getUsers: (
    pageNumber: number,
    pageSize: number,
    role: string | null,
    search?: string
  ) => {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    if (role) params.append("role", role);
    if (search) params.append("searchKey", search);
    return api<IUserList>(`/user?${params}`);
  },

  getRoles: () => api<IRole[]>("/role"),

  updateUserRoles: (username: string, roleIds: string[]) =>
    api<boolean>(`/user/${username}/role`, {
      method: "PUT",
      body: JSON.stringify(roleIds),
    }),

  getUserRequests: (
    pageNumber: number,
    pageSize: number,
    status: string | null,
    search?: string
  ) => {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    if (status) params.append("status", status.toUpperCase());
    if (search) params.append("searchKey", search);
    return api<IRequestList>(`/role-request?${params}`);
  },

  updateUserRequest: (
    requestId: number,
    data: { status: string; message: string }
  ) =>
    api<boolean>(`/role-request/${requestId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  generateRoleRequest: (roleId: string) =>
    api<boolean>("/role-request", {
      method: "POST",
      body: roleId,
      headers: { "Content-Type": "text/plain" },
    }),
};
