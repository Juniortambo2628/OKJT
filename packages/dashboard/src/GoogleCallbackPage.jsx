import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import AuthLayout, { AuthError } from './AuthLayout.js';
import TwoFactorForm from './TwoFactorForm.js';

/**
 * Where Google sign-in comes back to (okjt.auth.social.return_path): swaps
 * the one-time `code` for the usual token, or asks for the two-step code.
 * `onSignedIn(result)` takes it from there; return a message to show instead.
 */
export default function GoogleCallbackPage({ layout: Layout = AuthLayout, onSignedIn, signInPath = '/sign-in' }) {
  const [params] = useSearchParams();
  const { loginWithGoogle, verify2fa } = useAuth();
  const [error, setError] = useState(null);
  const [needs2fa, setNeeds2fa] = useState(false);
  const [emailFor2fa, setEmailFor2fa] = useState('');
  const [code2fa, setCode2fa] = useState('');
  const [loading, setLoading] = useState(true);

  const code = params.get('code');

  useEffect(() => {
    if (!code) {
      setError('Missing sign-in code — start again from the sign-in page.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await loginWithGoogle(code);
      if (cancelled) return;
      if (result.requires_2fa) {
        setNeeds2fa(true);
        setEmailFor2fa(result.email);
        setLoading(false);
        return;
      }
      if (result.success) {
        const problem = onSignedIn?.(result);
        if (typeof problem === 'string') {
          setError(problem);
          setLoading(false);
        }
        return;
      }
      setError(result.message);
      setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handle2fa = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await verify2fa(emailFor2fa, code2fa);
    if (result.success) {
      const problem = onSignedIn?.(result);
      if (typeof problem === 'string') setError(problem);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  if (needs2fa) {
    return (
      <Layout
        title="Two-step verification"
        subtitle="Enter the 6-digit code from your authenticator app to finish signing in."
      >
        <AuthError>{error}</AuthError>
        <TwoFactorForm id="google-2fa-code" code={code2fa} onCode={setCode2fa} loading={loading} onSubmit={handle2fa} />
      </Layout>
    );
  }

  return (
    <Layout title="Signing you in" subtitle="Finishing your Google sign-in…">
      <AuthError>{error}</AuthError>
      {!error && <p className="text-sm text-muted">Hang tight.</p>}
      {error && (
        <a href={signInPath} className="inline-flex text-sm font-semibold text-body underline underline-offset-4">
          Back to sign in
        </a>
      )}
    </Layout>
  );
}
