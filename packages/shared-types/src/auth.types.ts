import type { UserId } from './id.types';

export type UserRole = 'demandeur' | 'aidant' | 'admin';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'demandeur' | 'aidant';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: UserId;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface MeResponse extends AuthUser {}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}
