import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthError, AuthField, AuthLayout, AuthSubmit } from '@okjt/dashboard';
import api, { errorMessage, getToken } from '../lib/api';
import { signIn } from './auth';
import { clipFor } from '../lib/media';
import { DEFAULT_HERO } from '../lib/defaults';

const brand = <img src="/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png" alt="OKJTech" className="h-8 w-auto" />;

const clip = clipFor(DEFAULT_HERO);

/** The panel beside the form on desktop. */
const aside = (
  <div className="relative hidden overflow-hidden rounded-[1.6rem] bg-ink-deep lg:block">
    <video className="absolute inset-0 h-full w-full object-cover opacity-50" src={clip.src} poster={clip.poster} autoPlay muted loop playsInline aria-hidden="true" />
    <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/40 to-transparent" />
    <div className="absolute inset-x-10 bottom-10">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">OKJTech dashboard</div>
      <p className="mt-3 font-display text-3xl font-light leading-tight text-ink">Everything the website says, in one place.</p>
    </div>
  </div>
);

export function SignIn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (getToken()) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError('');
    setLoading(true);
    try {
      const user = await signIn(form.get('email'), form.get('password'));
      if (!user?.is_admin && user?.is_admin !== undefined) setError('This account can’t open the dashboard.');
      navigate(params.get('next') || '/admin', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Those details didn’t match an account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="The OKJTech dashboard: pages, projects, insights and enquiries." brand={brand} aside={aside}
      footer={<Link to="/admin/forgot-password" className="hover:text-ink">Forgotten your password?</Link>}>
      <form onSubmit={submit} className="space-y-4">
        {error && <AuthError>{error}</AuthError>}
        <AuthField id="email" name="email" type="email" label="Email" autoComplete="username" required />
        <AuthField id="password" name="password" type="password" label="Password" autoComplete="current-password" required />
        <AuthSubmit loading={loading}>Sign in</AuthSubmit>
      </form>
    </AuthLayout>
  );
}

export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/password/reset', { email: new FormData(e.currentTarget).get('email') });
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout title="Reset your password" subtitle="We’ll email you a link to choose a new one." brand={brand} footer={<Link to="/admin/login" className="hover:text-ink">Back to sign in</Link>}>
      {sent ? <p className="text-body">If that address has an account, a reset link is on its way.</p> : (
        <form onSubmit={submit} className="space-y-4">
          {error && <AuthError>{error}</AuthError>}
          <AuthField id="email" name="email" type="email" label="Email" autoComplete="username" required />
          <AuthSubmit loading={loading}>Send the link</AuthSubmit>
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError('');
    try {
      await api.post('/password/reset/confirm', {
        token: params.get('token'),
        email: form.get('email'),
        password: form.get('password'),
        password_confirmation: form.get('password_confirmation'),
      });
      navigate('/admin/login', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout title="Choose a new password" brand={brand} footer={<Link to="/admin/login" className="hover:text-ink">Back to sign in</Link>}>
      <form onSubmit={submit} className="space-y-4">
        {error && <AuthError>{error}</AuthError>}
        <AuthField id="email" name="email" type="email" label="Email" defaultValue={params.get('email') || ''} autoComplete="username" required />
        <AuthField id="password" name="password" type="password" label="New password" autoComplete="new-password" required />
        <AuthField id="password_confirmation" name="password_confirmation" type="password" label="The new password again" autoComplete="new-password" required />
        <AuthSubmit loading={loading}>Save the password</AuthSubmit>
      </form>
    </AuthLayout>
  );
}
