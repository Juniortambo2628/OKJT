import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import AuthLayout, { AuthError, AuthField, AuthSubmit } from './AuthLayout.js';

/**
 * Where the reset link lands (/reset-password/:token?email=…): a new
 * password, twice. `token` and `email` come from the link unless given.
 * `onReset(result)` takes it from there (e.g. to sign-in, with result.message).
 */
export default function ResetPasswordPage({
  layout: Layout = AuthLayout,
  token: tokenProp,
  email: emailProp,
  onReset,
  title = 'Choose a new password',
  subtitle = 'Make it at least 8 characters. You’ll sign in with it from now on.',
  footer,
  submitLabel = 'Reset password',
  idPrefix = 'reset',
}) {
  const params = useParams();
  const [query] = useSearchParams();
  const token = tokenProp ?? params.token ?? '';
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(emailProp ?? query.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmation) {
      setErrors({ password_confirmation: 'The passwords don’t match.' });
      return;
    }
    setLoading(true);
    setError(null);
    setErrors({});
    const result = await resetPassword({ token, email, password, password_confirmation: confirmation });
    setLoading(false);
    if (result.success) {
      onReset?.(result);
      return;
    }
    const fieldErrors = Object.fromEntries(Object.entries(result.errors ?? {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
    setErrors(fieldErrors);
    if (!Object.keys(fieldErrors).length) setError(result.message);
  };

  if (!token) {
    return (
      <Layout title="This link is incomplete" subtitle="Open the link from the email again, or ask for a new one." footer={footer} />
    );
  }

  return (
    <Layout title={title} subtitle={subtitle} footer={footer}>
      <AuthError>{error}</AuthError>
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id={`${idPrefix}-email`} label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
        <AuthField id={`${idPrefix}-password`} label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required autoFocus />
        <AuthField id={`${idPrefix}-password-confirmation`} label="Confirm password" type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} error={errors.password_confirmation} required />
        <div className="pt-2">
          <AuthSubmit loading={loading}>{loading ? 'Saving…' : submitLabel}</AuthSubmit>
        </div>
      </form>
    </Layout>
  );
}
