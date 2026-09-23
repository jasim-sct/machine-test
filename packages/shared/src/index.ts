export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface AuthResponse {
  accessToken: string;
  user: UserDto;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
}

export const SOCKET_EVENTS = {
  USER_SUSPENDED: 'user:suspended',
} as const;

export * from './types/form';

