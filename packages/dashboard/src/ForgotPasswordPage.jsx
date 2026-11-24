import { useState } from 'react';
import { useAuth } from './AuthContext.js';
import AuthLayout, { AuthError, AuthField, AuthSubmit } from './AuthLayout.js';

/**
 * Forgotten password: the address to send a reset link to. The answer is
 * the same whether or not the address has an account. The link opens the
 * ResetPasswordPage (okjt.auth.password_reset.path on the server).
 */
export default function ForgotPasswordPage({
  layout: Layout = AuthLayout,
  title = 'Forgot your password?',
  subtitle = 'Tell us your email address and we’ll send you a link to choose a new one.',
  footer,
  email: initialEmail = '',
  submitLabel = 'Email me a reset link',
  idPrefix = 'forgot',
}) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await forgotPassword(email);
    if (result.success) setSent(result.message || 'If that address has an account, a reset link is on its way.');
    else setError(result.errors?.email?.[0] || result.message);
    setLoading(false);
  };

  return (
    <Layout title={title} subtitle={subtitle} footer={footer}>
      {sent && <div role="status" className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">{sent}</div>}
      <AuthError>{error}</AuthError>
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id={`${idPrefix}-email`} label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        <div className="pt-2">
          <AuthSubmit loading={loading}>{loading ? 'Sending…' : submitLabel}</AuthSubmit>
        </div>
      </form>
    </Layout>
  );
}
