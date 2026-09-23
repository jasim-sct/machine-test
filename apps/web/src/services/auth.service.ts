import { api } from './api';
import { AuthResponse, LoginDto, RegisterDto, UpdateProfileDto, UserDto } from '@saas/shared';

export const authService = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/register', data);
  },

  getProfile: async (): Promise<UserDto> => {
    return api.get<UserDto>('/users/me');
  },

  updateProfile: async (data: UpdateProfileDto): Promise<UserDto> => {
    return api.patch<UserDto>('/users/me', data);
  },
};
