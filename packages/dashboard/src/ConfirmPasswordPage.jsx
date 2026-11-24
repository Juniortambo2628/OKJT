import { useState } from 'react';
import { useAuth } from './AuthContext.js';
import AuthLayout, { AuthError, AuthField, AuthSubmit } from './AuthLayout.js';

/**
 * Before something sensitive: the signed-in person types their password
 * again. `onConfirmed()` carries on (e.g. back where they were going).
 */
export default function ConfirmPasswordPage({
  layout: Layout = AuthLayout,
  onConfirmed,
  title = 'Confirm it’s you',
  subtitle = 'This is a secure area. Please confirm your password to carry on.',
  footer,
  submitLabel = 'Confirm',
  idPrefix = 'confirm',
}) {
  const { confirmPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await confirmPassword(password);
    setLoading(false);
    if (result.success) {
      onConfirmed?.();
      return;
    }
    setError(result.errors?.password?.[0] || result.message);
    setPassword('');
  };

  return (
    <Layout title={title} subtitle={subtitle} footer={footer}>
      <AuthError>{error}</AuthError>
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id={`${idPrefix}-password`} label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
        <div className="pt-2">
          <AuthSubmit loading={loading}>{loading ? 'Checking…' : submitLabel}</AuthSubmit>
        </div>
      </form>
    </Layout>
  );
}
