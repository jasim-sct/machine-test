import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthResponse, LoginDto, RegisterDto, UserDto, UserStatus } from '@saas/shared';
import { authService } from '../../services/auth.service';

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginDto) => Promise<AuthResponse>;
  register: (data: RegisterDto) => Promise<AuthResponse>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<UserDto>;
  logout: () => void;
  handleSuspended: (userEmail?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const userRef = useRef<UserDto | null>(null);
  userRef.current = user;

  const handleSuspended = useCallback(
    (userEmail?: string) => {
      const emailToPersist =
        userEmail ||
        userRef.current?.email ||
        localStorage.getItem('last_user_email') ||
        '';
      if (emailToPersist) {
        sessionStorage.setItem('suspended_email', emailToPersist);
      }
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      navigate('/account-suspended', { replace: true });
    },
    [navigate],
  );

  // Initialize and validate token on mount only
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        if (isMounted) {
          if (profile.status === UserStatus.SUSPENDED) {
            handleSuspended(profile.email);
            return;
          }
          setUser(profile);
          setToken(savedToken);
          localStorage.setItem('last_user_email', profile.email);
        }
      } catch (err: any) {
        console.warn('Failed to restore session:', err?.message);
        if (err?.statusCode === 403 || err?.message?.includes('suspended')) {
          handleSuspended();
        } else if (err?.statusCode === 401) {
          // Token is explicitly expired or invalid
          localStorage.removeItem('token');
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    // Listen for custom suspension event dispatched by API client
    const onSuspended = () => {
      handleSuspended();
    };
    window.addEventListener('saas:account-suspended', onSuspended);

    return () => {
      isMounted = false;
      window.removeEventListener('saas:account-suspended', onSuspended);
    };
  }, [handleSuspended]);

  const login = async (credentials: LoginDto): Promise<AuthResponse> => {
    const res = await authService.login(credentials);
    localStorage.setItem('token', res.accessToken);
    localStorage.setItem('last_user_email', res.user.email);
    setToken(res.accessToken);
    setUser(res.user);
    return res;
  };

  const register = async (data: RegisterDto): Promise<AuthResponse> => {
    const res = await authService.register(data);
    localStorage.setItem('token', res.accessToken);
    localStorage.setItem('last_user_email', res.user.email);
    setToken(res.accessToken);
    setUser(res.user);
    return res;
  };

  const updateProfile = async (data: { name?: string; email?: string }): Promise<UserDto> => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    if (updated.email) {
      localStorage.setItem('last_user_email', updated.email);
    }
    return updated;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateProfile,
        logout,
        handleSuspended,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
