import { useQuery, useQueryClient } from '@tanstack/react-query';
import api, { TOKEN_KEY, getToken, unwrap } from '../lib/api';

/** The signed-in person ({ id, name, email, is_admin }), or null. */
export function useAdminUser() {
  const token = getToken();
  return useQuery({
    queryKey: ['admin-user', token],
    queryFn: () => api.get('/user').then((res) => unwrap(res.data)),
    enabled: Boolean(token),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export async function signIn(email, password) {
  const { data } = await api.post('/login', { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  return unwrap(data.user);
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return async () => {
    try { await api.post('/logout'); } catch { /* the token is dropped either way */ }
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* nothing kept */ }
    queryClient.clear();
    window.location.assign('/admin/login');
  };
}
