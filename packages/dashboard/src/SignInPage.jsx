import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from './AuthContext.js';
import AuthLayout, { AuthError, AuthField, AuthSubmit } from './AuthLayout.js';
import TwoFactorForm from './TwoFactorForm.js';
import { loginWithPasskey, passkeysSupported } from './passkeys.js';

/**
 * Signing in: email and password, a passkey, or `google` (e.g. a
 * GoogleButton); then verifying the email address or a two-step code when
 * the server asks. `onSignedIn(result)` takes it from there (where to go);
 * return a message to show instead, e.g. when this person has no access here.
 * `layout` is the project's AuthLayout (its logo and panel).
 */
export default function SignInPage({
  layout: Layout = AuthLayout,
  onSignedIn,
  title = 'Welcome back',
  subtitle,
  footer,
  forgotHint,
  google,
  idPrefix = 'sign-in',
}) {
  const { login, verify2fa, resendVerification, signedIn } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [is2faRequired, setIs2faRequired] = useState(false);
  const [emailFor2fa, setEmailFor2fa] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [needsVerification, setNeedsVerification] = useState(null);
  const [resendState, setResendState] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const done = (result) => {
    const problem = onSignedIn?.(result);
    if (typeof problem === 'string') setError(problem);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    const result = await login(data.email, data.password);

    if (result.requires_verification) {
      setNeedsVerification(result.email);
      setError(null);
    } else if (result.success) {
      if (result.requires_2fa) {
        setIs2faRequired(true);
        setEmailFor2fa(result.email);
      } else {
        done(result);
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendState('sending');
    const result = await resendVerification(needsVerification);
    setResendState(result.success ? 'sent' : result.message);
  };

  const handlePasskey = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithPasskey();
      if (result.requires_verification) {
        setNeedsVerification(result.email);
        return;
      }
      if (result.requires_2fa) {
        setIs2faRequired(true);
        setEmailFor2fa(result.email);
        return;
      }
      done(signedIn(result));
    } catch (err) {
      setError(err.message || 'Passkey sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handle2faVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await verify2fa(emailFor2fa, twoFactorCode);

    if (result.success) {
      done(result);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  if (needsVerification) {
    return (
      <Layout
        title="Verify your email"
        subtitle="One quick step — we sent a verification link so we know this address is yours."
        footer={<button type="button" onClick={() => { setNeedsVerification(null); setResendState(null); }} className="hover:text-body">← Back to sign in</button>}
      >
        <p className="text-sm text-muted mb-4">
          Open <strong className="text-body">{needsVerification}</strong> and click the link we just sent. After that, sign in as usual.
        </p>
        {resendState === 'sent' && (
          <p className="text-sm text-green-700 mb-4">Sent — check your inbox (and spam, just in case).</p>
        )}
        {typeof resendState === 'string' && resendState !== 'sent' && resendState !== 'sending' && (
          <p className="text-sm text-red-600 mb-4">{resendState}</p>
        )}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendState === 'sending'}
          className="text-sm font-semibold text-accent-strong hover:underline disabled:opacity-50"
        >
          {resendState === 'sending' ? 'Sending…' : 'Resend the email'}
        </button>
      </Layout>
    );
  }

  if (is2faRequired) {
    return (
      <Layout
        title="Two-step verification"
        subtitle="Enter the 6-digit code from your authenticator app to finish signing in."
        footer={<button type="button" onClick={() => { setIs2faRequired(false); setError(null); }} className="hover:text-body">← Use a different account</button>}
      >
        <AuthError>{error}</AuthError>
        <TwoFactorForm id={`${idPrefix}-2fa`} code={twoFactorCode} onCode={setTwoFactorCode} loading={loading} onSubmit={handle2faVerify} />
      </Layout>
    );
  }

  return (
    <Layout title={title} subtitle={subtitle} footer={footer}>
      <AuthError>{error}</AuthError>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <AuthField
          id={`${idPrefix}-email`}
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />
        <AuthField
          id={`${idPrefix}-password`}
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Type your password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
        />
        {forgotHint && <div className="text-xs text-faint text-right -mt-1">{forgotHint}</div>}
        <div className="pt-2">
          <AuthSubmit loading={loading}>{loading ? 'Signing in…' : 'Sign in'}</AuthSubmit>
        </div>
      </form>
      <div className="relative my-5" aria-hidden="true">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-tone-200" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-faint">or</span></div>
      </div>
      {passkeysSupported() && (
        <button
          type="button"
          onClick={handlePasskey}
          disabled={loading}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-full border border-tone-200 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-tone-50 disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
          </svg>
          Sign in with a passkey
        </button>
      )}
      {google}
    </Layout>
  );
}
