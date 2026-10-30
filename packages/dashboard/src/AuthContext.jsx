import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

/**
 * Who is signed in, and every way of signing in and out, against
 * okjt/laravel-kit's routes (/login, /verify-2fa, /register, /email/*,
 * /auth/google, /logout, /user) through `api` (axios-like, resolving to the
 * response body). The token is kept in localStorage as `auth_token`; the
 * app's API client sends it.
 *
 * Whatever the server hands back beside `token` and `user` (e.g. the
 * workspaces you can open) is kept on `user`. `extend(value, { setUser })`
 * adds the project's own fields to what useAuth() returns.
 */
export function AuthProvider({ api, extend, children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // True right after this person chose to sign out (vs. never having signed in).
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await api.get('/user');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('auth_token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      
      if (response.data.requires_verification) {
        return {
          success: false,
          requires_verification: true,
          email: response.data.email,
          message: response.data.message || 'Please verify your email before signing in.',
        };
      }

      if (response.data.requires_2fa) {
        return { 
          success: true, 
          requires_2fa: true, 
          email: response.data.email 
        };
      }

      const { token, user, ...extra } = response.data;
      localStorage.setItem('auth_token', token);
      setUser({ ...user, ...extra });
      setIsAuthenticated(true);
      return { success: true, ...extra };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const verify2fa = async (email, code) => {
    try {
      const response = await api.post('/verify-2fa', { email, code });
      const { token, user, ...extra } = response.data;
      localStorage.setItem('auth_token', token);
      setUser({ ...user, ...extra });
      setIsAuthenticated(true);
      return { success: true, ...extra };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid 2FA code' 
      };
    }
  };

  /** Sign up. Unverified until the emailed link is opened. */
  const register = async (data) => {
    try {
      const response = await api.post('/register', data);
      const payload = response.data;
      if (payload.requires_verification) {
        return {
          success: false,
          requires_verification: true,
          email: payload.email,
          message: payload.message,
        };
      }
      const { token, user, ...extra } = payload;
      localStorage.setItem('auth_token', token);
      setUser({ ...user, ...extra });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Sign-up failed',
        errors: error.response?.data?.errors || {},
      };
    }
  };

  /** Resend the verification email (signed-in, or for an address mid-sign-up). */
  const resendVerification = async (email) => {
    try {
      await api.post('/email/resend', email ? { email } : {});
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Could not resend — try again.' };
    }
  };

  /** Finish email verification from the link the SPA was sent to. */
  const verifyEmail = async ({ id, hash }) => {
    try {
      const response = await api.post('/email/verify', { id, hash });
      const { token, user, message: _message, email_verified: _verified, ...extra } = response.data;
      if (token) {
        localStorage.setItem('auth_token', token);
        setUser({ ...user, ...extra });
        setIsAuthenticated(true);
      } else {
        await checkAuth();
      }
      return { success: true, message: response.data?.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Verification link is invalid or expired.' };
    }
  };

  /** Sign in with Google: send the browser to the backend, finish via /auth/google. */
  const loginWithGoogle = async (code) => {
    try {
      const response = await api.post('/auth/google', { code });
      if (response.data.requires_2fa) {
        return { success: true, requires_2fa: true, email: response.data.email };
      }
      const { token, user, ...extra } = response.data;
      localStorage.setItem('auth_token', token);
      setUser({ ...user, ...extra });
      setIsAuthenticated(true);
      return { success: true, ...extra };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google sign-in failed',
      };
    }
  };

  /** Sign in with a token issued elsewhere (e.g. accepting a collaborator invite); `extra` is kept on the user. */
  const loginWithToken = (token, authUser, extra = {}) => {
    localStorage.setItem('auth_token', token);
    setUser({ ...authUser, ...extra });
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      // Forget everything loaded while signed in (an unpublished site's
      // content included), so nothing outlives the session.
      queryClient.clear();
      setUser(null);
      setIsAuthenticated(false);
      setSignedOut(true);
    }
  };

  const base = {
    user,
    loading,
    isAuthenticated,
    signedOut,
    login,
    register,
    verify2fa,
    loginWithToken,
    loginWithGoogle,
    resendVerification,
    verifyEmail,
    logout,
    checkAuth,
  };
  const value = extend ? { ...base, ...extend(base, { setUser }) } : base;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
