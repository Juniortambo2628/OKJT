import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

/**
 * Who is signed in, and every way of signing in and out, against
 * okjt/laravel-kit's routes (/login, /verify-2fa, /register, /email/*,
 * /auth/google, /logout, /user) through `api` (axios-like, resolving to the
 * response body).
 *
 * `mode` matches the server's okjt.auth.mode: 'token' (the default) keeps
 * the bearer token in localStorage as `auth_token` for the app's API client
 * to send; 'session' keeps nothing, the session cookie signs them in.
 *
 * A two-step sign-in answers { requires_2fa, email, challenge }: hand the
 * challenge to verify2fa(challenge, code).
 *
 * Whatever the server hands back beside `token` and `user` (e.g. the
 * workspaces you can open) is kept on `user`. `extend(value, { setUser })`
 * adds the project's own fields to what useAuth() returns.
 */
export function AuthProvider({ api, extend, mode = 'token', children }) {
  const session = mode === 'session';
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // True right after this person chose to sign out (vs. never having signed in).
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Keeps (or, in session mode, ignores) the token from a sign-in answer.
  const keepToken = (token) => {
    if (!session && token) localStorage.setItem('auth_token', token);
  };
  const forgetToken = () => {
    if (!session) localStorage.removeItem('auth_token');
  };

  const checkAuth = async () => {
    if (session || localStorage.getItem('auth_token')) {
      try {
        const response = await api.get('/user');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch {
        forgetToken();
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  // A sign-in answer: { requires_verification } or { requires_2fa, email,
  // challenge }, or { token?, user, …extra } (signed in).
  const answer = (response) => {
    const data = response.data ?? {};
    if (data.requires_verification) {
      return {
        success: false,
        requires_verification: true,
        email: data.email,
        message: data.message || response.message || 'Please verify your email before signing in.',
      };
    }
    if (data.requires_2fa) {
      return { success: true, requires_2fa: true, email: data.email, challenge: data.challenge };
    }
    return signedIn(data);
  };
  const failure = (error, fallback) => ({
    success: false,
    message: error.response?.data?.message || fallback,
    errors: error.response?.data?.errors || {},
  });

  /** Email and password; `options.remember` keeps them signed in (session mode). */
  const login = async (email, password, options = {}) => {
    try {
      const response = await api.post('/login', { email, password, ...(options.remember ? { remember: true } : {}) });
      return answer(response);
    } catch (error) {
      return failure(error, 'Login failed');
    }
  };

  /** The second step: the challenge from the first, and a code (or a recovery code). */
  const verify2fa = async (challenge, code) => {
    try {
      const response = await api.post('/verify-2fa', { challenge, code });
      return answer(response);
    } catch (error) {
      return failure(error, 'Invalid 2FA code');
    }
  };

  /** Email me a sign-in code (the same answer whether or not the address exists). */
  const requestLoginCode = async (email) => {
    try {
      const response = await api.post('/login-code', { email });
      return { success: true, message: response.message ?? response.data?.message };
    } catch (error) {
      return failure(error, 'Could not send a code — try again.');
    }
  };

  /** Sign in with the emailed code. */
  const verifyLoginCode = async (email, code) => {
    try {
      const response = await api.post('/login-code/verify', { email, code });
      return answer(response);
    } catch (error) {
      return failure(error, 'That sign-in code is invalid or expired.');
    }
  };

  /** Email a password reset link. */
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/forgot-password', { email });
      return { success: true, message: response.message ?? response.data?.message };
    } catch (error) {
      return failure(error, 'Could not send the link — try again.');
    }
  };

  /** Choose a new password: { token, email, password, password_confirmation }. */
  const resetPassword = async (data) => {
    try {
      const response = await api.post('/reset-password', data);
      return { success: true, message: response.message ?? response.data?.message };
    } catch (error) {
      return failure(error, 'Could not reset the password — try again.');
    }
  };

  /** Type the password again before something sensitive. */
  const confirmPassword = async (password) => {
    try {
      await api.post('/confirm-password', { password });
      return { success: true };
    } catch (error) {
      return failure(error, 'That password is incorrect.');
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
      signedIn(payload);
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
  /** The emailed link's parts: { id, hash, expires, signature }. */
  const verifyEmail = async ({ id, hash, expires, signature }) => {
    try {
      const response = await api.post('/email/verify', { id, hash, expires, signature });
      const { token, user, message: _message, email_verified: _verified, ...extra } = response.data;
      if (token || (session && user)) {
        keepToken(token);
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
      return answer(response);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google sign-in failed',
      };
    }
  };

  /** Sign in with a token issued elsewhere (e.g. accepting a collaborator invite); `extra` is kept on the user. */
  const loginWithToken = (token, authUser, extra = {}) => {
    keepToken(token);
    setUser({ ...authUser, ...extra });
    setIsAuthenticated(true);
  };

  /** Sign in with a server answer ({ token, user, …extra }); returns { success, …extra } like login(). */
  const signedIn = ({ token, user: authUser, ...extra }) => {
    loginWithToken(token, authUser, extra);
    return { success: true, ...extra };
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      forgetToken();
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
    requestLoginCode,
    verifyLoginCode,
    forgotPassword,
    resetPassword,
    confirmPassword,
    mode,
    loginWithToken,
    signedIn,
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
