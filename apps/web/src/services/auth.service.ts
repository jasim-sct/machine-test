import { api, setAccessToken } from './api';
import { AuthResponse, LoginDto, RegisterDto, UpdateProfileDto, UserDto } from '@saas/shared';

export const authService = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    if (res?.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    if (res?.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const res = await api.post<{ accessToken: string }>('/auth/refresh');
    if (res?.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  logout: async (): Promise<{ message: string }> => {
    try {
      return await api.post<{ message: string }>('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  getProfile: async (): Promise<UserDto> => {
    return api.get<UserDto>('/users/me');
  },

  updateProfile: async (data: UpdateProfileDto): Promise<UserDto> => {
    return api.patch<UserDto>('/users/me', data);
  },
};
