import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import AuthLayout, { AuthError, AuthField, AuthSubmit } from './AuthLayout.js';

/**
 * Where an invitation link lands (?email=&token=): the new person chooses a
 * password and is signed in. `accept(payload)` posts it to the kit's
 * collaboration accept route and resolves to its data (token, user, …);
 * `onSignedIn(data)` takes it from there.
 */
export default function AcceptInvitePage({
  layout: Layout = AuthLayout,
  accept,
  onSignedIn,
  signInPath = '/sign-in',
  title = 'You’re invited',
  subtitle = 'Choose a password to finish setting up your access.',
}) {
  const [params] = useSearchParams();
  const { signedIn } = useAuth();
  const email = params.get('email') || '';
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmation) {
      setError('The passwords don’t match.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const data = await accept({ email, token, password, password_confirmation: confirmation });
      onSignedIn?.(signedIn(data));
    } catch (err) {
      setError(err.response?.data?.errors?.password?.[0] || err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout
      title={title}
      subtitle={subtitle}
      footer={<>Already set up? <Link to={signInPath} className="font-medium text-accent-strong hover:underline">Sign in</Link></>}
    >
      {!email || !token ? (
        <AuthError>
          This invitation link is incomplete. Open the link from your email again, or ask for a new invitation.
        </AuthError>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AuthError>{error}</AuthError>
          <AuthField id="invite-email" label="Email" value={email} readOnly />
          <AuthField id="invite-password" label="Password" type="password" autoComplete="new-password" minLength={8} required
            placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
          <AuthField id="invite-password-confirm" label="Confirm password" type="password" autoComplete="new-password" minLength={8} required
            placeholder="Type it again" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
          <div className="pt-2">
            <AuthSubmit loading={saving}>Set password &amp; continue</AuthSubmit>
          </div>
        </form>
      )}
    </Layout>
  );
}
