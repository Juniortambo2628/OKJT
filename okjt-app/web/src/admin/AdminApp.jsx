import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { ConfirmHost, PermissionsProvider } from '@okjt/ui';
import { DashboardProvider, DashboardShell } from '@okjt/dashboard';
import { getToken } from '../lib/api';
import { dashboard } from './dashboard.config';
import { RESOURCES } from './resources';
import { useAdminUser } from './auth';
import { ForgotPassword, ResetPassword, SignIn } from './SignIn';
import ResourcePage from './ResourcePage';
import Overview from './Overview';
import Settings from './Settings';
import Media from './Media';

const ALLOWED = { role: 'owner', isOwner: true, canEdit: true };

/** The dashboard for signed-in admins; everyone else goes to sign in. */
function Protected() {
  const location = useLocation();
  const { data: user, isLoading, isError } = useAdminUser();
  if (!getToken() || isError) return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (isLoading) return <div className="grid min-h-dvh place-items-center bg-paper text-sm text-tone-500">Opening the dashboard…</div>;
  if (user && user.is_admin === false) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
        <div><h1 className="text-2xl text-ink">This account can’t open the dashboard.</h1><p className="mt-2 text-tone-500">Ask an admin to give you access under People.</p></div>
      </div>
    );
  }
  return (
    <DashboardShell>
      <Routes>
        <Route index element={<Overview />} />
        {Object.entries(RESOURCES).map(([id, resource]) => (
          <Route key={id} path={id} element={<ResourcePage key={id} resource={resource} />} />
        ))}
        <Route path="media" element={<Media />} />
        <Route path="gallery" element={<Navigate to="/admin/media" replace />} />
        <Route path="settings" element={<Settings />} />
        {['content', 'legal', 'widgets', 'email'].map((old) => <Route key={old} path={old} element={<Navigate to="/admin/settings" replace />} />)}
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardShell>
  );
}

/** /admin/password-reset: the emailed link (with a token), or asking for one. */
function PasswordReset() {
  const [params] = useSearchParams();
  return params.get('token') ? <ResetPassword /> : <ForgotPassword />;
}

export default function AdminApp() {
  return (
    <PermissionsProvider value={ALLOWED}>
      <DashboardProvider dashboard={dashboard}>
        <Routes>
          <Route path="login" element={<SignIn />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="password-reset" element={<PasswordReset />} />
          <Route path="*" element={<Protected />} />
        </Routes>
        <ConfirmHost />
      </DashboardProvider>
    </PermissionsProvider>
  );
}
