import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import AuthLayout, { AuthError } from './AuthLayout.js';

/**
 * Where the emailed verification link lands (/verify-email/:id/:hash): sends
 * its parts to the API, which signs the person straight in, then goes to `next`.
 */
export default function VerifyEmailPage({ layout: Layout = AuthLayout, next = '/', signInPath = '/sign-in' }) {
  const { id, hash } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await verifyEmail({ id, hash });
      if (cancelled) return;
      if (result.success) {
        setDone(true);
        // The token is stored; the app's sign-in guard takes it from here.
        setTimeout(() => navigate(next, { replace: true }), 1200);
      } else {
        setError(result.message);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, hash]);

  return (
    <Layout
      title={done ? 'Email verified' : 'Verifying…'}
      subtitle={done ? 'You’re all set — taking you in.' : 'One moment while we confirm your address.'}
    >
      <AuthError>{error}</AuthError>
      {error && (
        <a href={signInPath} className="inline-flex text-sm font-semibold text-body underline underline-offset-4">
          Back to sign in
        </a>
      )}
    </Layout>
  );
}
