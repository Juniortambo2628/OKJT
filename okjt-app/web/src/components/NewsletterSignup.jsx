import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Mail } from 'lucide-react';
import { Eyebrow } from '@okjt/site';
import { Busy } from './States';
import api, { errorMessage } from '../lib/api';

const field = 'w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';
const submitClass = 'inline-flex items-center justify-center gap-2 rounded-full bg-fill px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-on-ink transition-colors hover:bg-fill-hover disabled:opacity-60';

/**
 * The newsletter signup: an email address and a consent tick. `source` records
 * where it was signed (one of the server's SubscriberController::SOURCES).
 * Every answer from the server reads the same, so the form shows the same
 * thanks whether or not the address was already on the list.
 */
export default function NewsletterSignup({ source, title = 'Notes on building for Africa', text }) {
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: '', consent: false } });
  const submit = handleSubmit(async (values) => {
    setFailure('');
    try {
      await api.post('/subscribe', { ...values, source });
      setDone(true);
    } catch (error) {
      setFailure(error?.response?.status === 429
        ? 'Too many tries from here. Please wait a few minutes and try again.'
        : errorMessage(error, 'The signup didn’t go through. Please try again in a minute.'));
    }
  });

  return (
    <div className="glass-strong grid gap-8 rounded-[2rem] p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
      <div>
        <Eyebrow>Newsletter</Eyebrow>
        <h2 className="mt-3 !font-display text-3xl !font-light leading-tight tracking-tight !text-ink sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-md text-soft">
          {text || 'About once a month: new insights on payments, data protection, slow phones and networks, and the free tools as they arrive. One email, nothing else.'}
        </p>
      </div>
      {done ? (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-line bg-paper px-5 py-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-sm text-body"><span className="font-semibold text-ink">You’re on the list.</span> A welcome email is on its way; if it doesn’t arrive, check the spam folder.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-soft">Email address</span>
            <input type="email" autoComplete="email" placeholder="you@company.com" className={field} {...register('email', { required: 'An email address to send it to.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'That email address doesn’t look right.' } })} />
            {errors.email && <span role="alert" className="mt-1 block text-xs text-red-400">{errors.email.message}</span>}
          </label>
          <label className="flex items-start gap-3 text-sm text-soft">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--color-accent)] [color-scheme:light]" {...register('consent', { required: 'Tick the box to agree to the emails.' })} />
            <span>Email me OKJTechnologies’ newsletter. Unsubscribe any time with the link in every email; see the <Link to="/privacy" className="font-semibold text-accent hover:text-accent-strong">privacy policy</Link>.</span>
          </label>
          {errors.consent && <span role="alert" className="-mt-2 block text-xs text-red-400">{errors.consent.message}</span>}
          {failure && <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{failure}</p>}
          <button type="submit" disabled={isSubmitting} className={submitClass}>
            {isSubmitting ? <Busy>Signing up…</Busy> : <><Mail className="h-4 w-4" aria-hidden="true" /> Sign Up</>}
          </button>
        </form>
      )}
    </div>
  );
}
