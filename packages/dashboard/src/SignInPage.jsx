import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from './AuthContext.js';
import AuthLayout, { AuthError, AuthField, AuthSubmit } from './AuthLayout.js';
import TwoFactorForm from './TwoFactorForm.js';
import { loginWithPasskey, passkeysSupported } from './passkeys.js';

/**
 * Signing in: email and password, a passkey, or `google` (e.g. a
 * GoogleButton); then verifying the email address or a two-step code (or a
 * recovery code) when the server asks. `onSignedIn(result)` takes it from
 * there (where to go); return a message to show instead, e.g. when this
 * person has no access here. `layout` is the project's AuthLayout (its logo
 * and panel).
 *
 * Optional: `remember` (a "Remember me" box), `forgotHint` (e.g. a link to
 * the ForgotPasswordPage, beside it), `emailCode` (a link to sign in with a
 * code sent by email instead), `status` (a note above the form, e.g. "Your
 * password has been reset."), `passkey` (false hides the passkey button; a
 * node replaces it), `labels` (the button and placeholder wording) and
 * `emailAutoComplete` ('username webauthn' for passkey autofill).
 */
const LABELS = {
  submit: 'Sign in',
  submitting: 'Signing in…',
  sendCode: 'Email me a code',
  verifyCode: 'Verify & sign in',
  emailPlaceholder: 'you@example.com',
  passwordPlaceholder: 'Type your password',
  remember: 'Remember me',
  useCode: 'Email me a sign-in code instead',
  usePassword: 'Use password instead',
};

export default function SignInPage({
  layout: Layout = AuthLayout,
  onSignedIn,
  title = 'Welcome back',
  subtitle,
  footer,
  forgotHint,
  remember: offerRemember = false,
  emailCode = false,
  status,
  passkey,
  labels: labelsIn,
  emailAutoComplete = 'email',
  google,
  idPrefix = 'sign-in',
}) {
  const labels = { ...LABELS, ...labelsIn };
  const { login, verify2fa, resendVerification, signedIn, requestLoginCode, verifyLoginCode } = useAuth();
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(status ?? null);
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(null);
  const [resendState, setResendState] = useState(null);
  // 'password', or 'code' (an emailed code); codeFor is the address it went to.
  const [method, setMethod] = useState('password');
  const [codeFor, setCodeFor] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailedCode, setEmailedCode] = useState('');

  const { register, handleSubmit, resetField, formState: { errors } } = useForm();

  const done = (result) => {
    const problem = onSignedIn?.(result);
    if (typeof problem === 'string') setError(problem);
  };

  // What the server answered to any first step.
  const settle = (result) => {
    if (result.requires_verification) {
      setNeedsVerification(result.email);
      setError(null);
    } else if (result.success) {
      if (result.requires_2fa) {
        setChallenge(result.challenge ?? '');
      } else {
        done(result);
      }
    } else {
      setError(result.errors?.code?.[0] || result.message);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    if (method === 'code') {
      if (!codeFor) {
        const result = await requestLoginCode(data.email);
        if (result.success) {
          setCodeFor(data.email);
          setNotice(result.message || 'If that address exists, a sign-in code is on its way.');
        } else {
          setError(result.message);
        }
      } else {
        setNotice(null);
        settle(await verifyLoginCode(codeFor, emailedCode));
      }
      setLoading(false);
      return;
    }

    settle(await login(data.email, data.password, offerRemember && rememberMe ? { remember: true } : {}));
    setLoading(false);
  };

  const switchMethod = () => {
    setMethod((m) => (m === 'password' ? 'code' : 'password'));
    setCodeFor(null);
    setError(null);
    setNotice(null);
    resetField('password');
    setEmailedCode('');
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
        setChallenge(result.challenge ?? '');
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

    const result = await verify2fa(challenge, twoFactorCode);

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

  if (challenge !== null) {
    return (
      <Layout
        title="Two-step verification"
        subtitle={useRecovery
          ? 'Enter one of the recovery codes you saved when you turned two-step sign-in on.'
          : 'Enter the 6-digit code from your authenticator app to finish signing in.'}
        footer={<button type="button" onClick={() => { setChallenge(null); setTwoFactorCode(''); setUseRecovery(false); setError(null); }} className="hover:text-body">← Use a different account</button>}
      >
        <AuthError>{error}</AuthError>
        <TwoFactorForm id={`${idPrefix}-2fa`} code={twoFactorCode} onCode={setTwoFactorCode} loading={loading} onSubmit={handle2faVerify} recovery={useRecovery} />
        <div className="mt-4 text-center">
          <button type="button" onClick={() => { setUseRecovery((r) => !r); setTwoFactorCode(''); setError(null); }} className="text-sm text-muted hover:text-body">
            {useRecovery ? 'Use your authenticator app instead' : 'Use a recovery code instead'}
          </button>
        </div>
      </Layout>
    );
  }

  const byCode = method === 'code';
  const passkeyButton = passkey !== undefined ? passkey : passkeysSupported() && (
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
  );

  return (
    <Layout title={title} subtitle={subtitle} footer={footer}>
      {notice && (
        <div role="status" className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">{notice}</div>
      )}
      <AuthError>{error}</AuthError>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <AuthField
          id={`${idPrefix}-email`}
          label="Email"
          type="email"
          autoComplete={emailAutoComplete}
          placeholder={labels.emailPlaceholder}
          readOnly={byCode && !!codeFor}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />
        {!byCode && (
          <AuthField
            id={`${idPrefix}-password`}
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder={labels.passwordPlaceholder}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
          />
        )}
        {byCode && codeFor && (
          <AuthField
            id={`${idPrefix}-code`}
            label="Sign-in code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            maxLength={6}
            autoFocus
            required
            value={emailedCode}
            onChange={(e) => setEmailedCode(e.target.value.replace(/\D/g, ''))}
          />
        )}
        {!byCode && offerRemember && (
          <div className="flex items-center justify-between gap-3 -mt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-line accent-[var(--okjt-auth-focus,var(--color-accent))]" />
              {labels.remember}
            </label>
            {forgotHint && <div className="text-sm text-muted">{forgotHint}</div>}
          </div>
        )}
        {!byCode && !offerRemember && forgotHint && <div className="text-xs text-faint text-right -mt-1">{forgotHint}</div>}
        <div className="pt-2">
          <AuthSubmit loading={loading}>
            {loading ? labels.submitting : !byCode ? labels.submit : codeFor ? labels.verifyCode : labels.sendCode}
          </AuthSubmit>
        </div>
      </form>
      {(passkeyButton || google) && (
        <>
          <div className="relative my-5" aria-hidden="true">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-tone-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[var(--okjt-auth-card,#fff)] px-3 text-faint">or</span></div>
          </div>
          {passkeyButton}
          {google}
        </>
      )}
      {emailCode && (
        <div className="mt-4 text-center">
          <button type="button" onClick={switchMethod} className="text-sm text-muted hover:text-body">
            {byCode ? labels.usePassword : labels.useCode}
          </button>
        </div>
      )}
    </Layout>
  );
}
