import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await authApi.getUser();
      if (response.success && response.data?.user) {
        setState({
          user: response.data.user as User,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        localStorage.removeItem('auth_token');
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } catch {
      localStorage.removeItem('auth_token');
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authApi.login(email, password);
      if (response.success) {
        await checkAuth();
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async () => {
    await authApi.logout();
    setState({ user: null, isLoading: false, isAuthenticated: false });
    navigate('/admin/login');
  };

  return {
    ...state,
    login,
    logout,
    checkAuth,
  };
}

