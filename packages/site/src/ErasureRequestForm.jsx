import { useId, useState } from 'react';
import postJson from './postJson.js';

/**
 * ErasureRequestForm: asks for someone's data to be deleted, for
 * laravel-kit's PrivacyController (request). Name, and an email or a phone
 * number to find them by (one is enough), and anything that helps find them.
 * The server's own words for thanks (with the date it will be dealt with by),
 * mistakes beside each field, and "too many" are shown as they come. A hidden
 * field (the honeypot) only a bot fills in. For the privacy page.
 *
 *   <ErasureRequestForm />                          // POST /api/erasure-requests
 *   <ErasureRequestForm phone={false} />            // email only
 *   <ErasureRequestForm submit={(data) => api.post('/erasure-requests', data)} />
 *
 * @param {string} [endpoint='/api/erasure-requests']
 * @param {(data) => Promise<{ message?: string }>} [submit]  Send it yourself (resolve with the server's body; throw { status, errors, message })
 * @param {boolean} [phone=true]  Offer a phone number as well as email
 * @param {string} [honeypot='website']  Must match okjt.privacy.honeypot
 * @param {object} [labels]  { name, email, phone, details, either, send, sending }
 */
const DEFAULT_LABELS = {
  name: 'Your name',
  email: 'Email',
  phone: 'Phone',
  details: 'Anything that helps us find your data (optional)',
  either: 'Give the email or phone number you used with us; one is enough.',
  send: 'Ask for my data to be deleted',
  sending: 'Sending…',
};

const fieldClass = 'w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-body placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

export default function ErasureRequestForm({ endpoint = '/api/erasure-requests', submit, phone = true, honeypot = 'website', labels = {}, className = '' }) {
  const words = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const empty = { name: '', email: '', phone: '', details: '', [honeypot]: '' };
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ sending: false, done: null, problem: null });
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const send = async (e) => {
    e.preventDefault();
    setErrors({});
    setState({ sending: true, done: null, problem: null });
    const data = Object.fromEntries(Object.entries(values).filter(([key, v]) => v !== '' || key === honeypot));
    try {
      const body = await (submit ? submit(data) : postJson(endpoint, data));
      setState({ sending: false, done: body?.message ?? "We've received your request.", problem: null });
      setValues(empty);
    } catch (err) {
      const fieldErrors = err?.errors ?? err?.response?.data?.errors ?? {};
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
      const status = err?.status ?? err?.response?.status;
      const problem = status === 429
        ? (err?.message ?? err?.response?.data?.message ?? 'Too many requests for now. Please try again later.')
        : Object.keys(fieldErrors).length ? 'Please check the fields marked below.' : "Your request couldn't be sent. Please try again.";
      setState({ sending: false, done: null, problem });
    }
  };

  const field = (name, label, control) => (
    <div>
      <label htmlFor={`${id}-${name}`} className="mb-1.5 block text-sm font-medium text-body">{label}</label>
      {control}
      {errors[name] && <p id={`${id}-${name}-error`} className="mt-1 text-sm text-red-600">{errors[name]}</p>}
    </div>
  );
  const describe = (name, extra) => {
    const ids = [errors[name] && `${id}-${name}-error`, extra].filter(Boolean).join(' ');
    return { ...(errors[name] ? { 'aria-invalid': true } : {}), ...(ids ? { 'aria-describedby': ids } : {}) };
  };

  if (state.done) {
    return (
      <div role="status" className={`rounded-2xl border border-line bg-tint p-6 text-body ${className}`}>
        <p className="font-medium text-ink">{state.done}</p>
      </div>
    );
  }

  const hint = phone ? `${id}-either` : undefined;
  return (
    <form onSubmit={send} noValidate className={`space-y-4 ${className}`}>
      {state.problem && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.problem}</p>}
      {field('name', words.name, <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={120} value={values.name} onChange={set('name')} className={fieldClass} {...describe('name')} />)}
      {phone && <p id={hint} className="text-sm text-soft">{words.either}</p>}
      <div className={phone ? 'grid gap-4 sm:grid-cols-2' : ''}>
        {field('email', words.email, <input id={`${id}-email`} name="email" type="email" autoComplete="email" required={!phone} maxLength={191} value={values.email} onChange={set('email')} className={fieldClass} {...describe('email', hint)} />)}
        {phone && field('phone', words.phone, <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={50} value={values.phone} onChange={set('phone')} className={fieldClass} {...describe('phone', hint)} />)}
      </div>
      {field('details', words.details, <textarea id={`${id}-details`} name="details" rows={4} maxLength={2000} value={values.details} onChange={set('details')} className={`${fieldClass} resize-y`} {...describe('details')} />)}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Leave this empty<input name={honeypot} tabIndex={-1} autoComplete="off" value={values[honeypot]} onChange={set(honeypot)} /></label>
      </div>
      <button type="submit" disabled={state.sending} className="inline-flex items-center justify-center rounded-full bg-fill px-6 py-3 text-sm font-semibold text-on-ink transition-colors hover:bg-fill-hover disabled:opacity-60">
        {state.sending ? words.sending : words.send}
      </button>
    </form>
  );
}
