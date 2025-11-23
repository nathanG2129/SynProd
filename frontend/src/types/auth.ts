export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'PRODUCTION' | 'MANAGER' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AcceptInviteRequest {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface InviteUserRequest {
  email: string;
  role: 'PRODUCTION' | 'MANAGER' | 'ADMIN';
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: 'PRODUCTION' | 'MANAGER' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}
