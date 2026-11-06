import axios from 'axios';

/**
 * The Laravel API, on the same domain under /api. Sends the dashboard's
 * token when someone is signed in; a 401 inside the dashboard sends them
 * back to the sign-in page.
 */
export const TOKEN_KEY = 'auth_token';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/admin/login')) {
      try { localStorage.removeItem(TOKEN_KEY); } catch { /* nothing kept */ }
      window.location.assign('/admin/login');
    }
    return Promise.reject(error);
  },
);

/** Laravel answers some lists bare and some as { data: [...] } (paginated or a resource). */
export const unwrap = (body) => (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body ? body.data : body);

/** The first validation message from a Laravel error, or the message, or a fallback. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;
  const first = data?.errors && Object.values(data.errors)[0];
  return (Array.isArray(first) ? first[0] : first) || data?.message || fallback;
}

export default api;
