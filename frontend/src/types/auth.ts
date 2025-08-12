export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'PRODUCTION' | 'MANAGER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
