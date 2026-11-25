import { useId, useState } from 'react';
import postJson from './postJson.js';

/**
 * ContactForm: the site's contact form, for laravel-kit's
 * ContactMessageController. Name, email, an optional topic, subject and
 * message; the server's own words for thanks, mistakes beside each field,
 * and "too many" are shown as they come. A hidden field (the honeypot) is
 * kept out of sight, out of the tab order and away from screen readers:
 * only a bot fills it.
 *
 *   <ContactForm />                                   // POST /api/contact
 *   <ContactForm topics={[{ value: 'bookings', label: 'Bookings' }]} />
 *   <ContactForm submit={(data) => api.post('/contact', data)} />
 *
 * @param {string} [endpoint='/api/contact']
 * @param {(data) => Promise<{ message?: string }>} [submit]  Send it yourself (resolve with the server's body; throw { status, errors, message })
 * @param {Array<string|{ value, label }>} [topics]
 * @param {boolean} [subject=true]  Ask for a subject
 * @param {string} [honeypot='website']  Must match okjt.contact.honeypot
 * @param {object} [labels]  { name, email, topic, subject, message, send, sending }
 */
const DEFAULT_LABELS = { name: 'Your name', email: 'Email', topic: 'What is it about?', subject: 'Subject', message: 'Message', send: 'Send message', sending: 'Sending…' };

const fieldClass = 'w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-body placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

export default function ContactForm({ endpoint = '/api/contact', submit, topics = [], subject = true, honeypot = 'website', labels = {}, className = '' }) {
  const words = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const [values, setValues] = useState({ name: '', email: '', topic: '', subject: '', message: '', [honeypot]: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ sending: false, done: null, problem: null });
  const options = topics.map((t) => (typeof t === 'string' ? { value: t, label: t } : t));
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const send = async (e) => {
    e.preventDefault();
    setErrors({});
    setState({ sending: true, done: null, problem: null });
    const data = Object.fromEntries(Object.entries(values).filter(([key, v]) => v !== '' || key === honeypot));
    try {
      const body = await (submit ? submit(data) : postJson(endpoint, data));
      setState({ sending: false, done: body?.message ?? body?.data?.message ?? "Thanks, we'll get back to you shortly.", problem: null });
      setValues({ name: '', email: '', topic: '', subject: '', message: '', [honeypot]: '' });
    } catch (err) {
      const fieldErrors = err?.errors ?? err?.response?.data?.errors ?? {};
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
      const status = err?.status ?? err?.response?.status;
      const problem = status === 429
        ? (err?.message ?? err?.response?.data?.message ?? 'Too many messages for now. Please try again in a few minutes.')
        : Object.keys(fieldErrors).length ? 'Please check the fields marked below.' : "Your message couldn't be sent. Please try again.";
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
  const describe = (name) => (errors[name] ? { 'aria-invalid': true, 'aria-describedby': `${id}-${name}-error` } : {});

  if (state.done) {
    return (
      <div role="status" className={`rounded-2xl border border-line bg-tint p-6 text-body ${className}`}>
        <p className="font-medium text-ink">{state.done}</p>
        <button type="button" onClick={() => setState({ sending: false, done: null, problem: null })} className="mt-3 text-sm font-semibold text-accent hover:text-accent-strong">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={send} noValidate className={`space-y-4 ${className}`}>
      {state.problem && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.problem}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {field('name', words.name, <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={100} value={values.name} onChange={set('name')} className={fieldClass} {...describe('name')} />)}
        {field('email', words.email, <input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={150} value={values.email} onChange={set('email')} className={fieldClass} {...describe('email')} />)}
      </div>
      {options.length > 0 && field('topic', words.topic, (
        <select id={`${id}-topic`} name="topic" value={values.topic} onChange={set('topic')} className={fieldClass} {...describe('topic')}>
          <option value="">—</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}
      {subject && field('subject', words.subject, <input id={`${id}-subject`} name="subject" maxLength={150} value={values.subject} onChange={set('subject')} className={fieldClass} {...describe('subject')} />)}
      {field('message', words.message, <textarea id={`${id}-message`} name="message" required rows={6} maxLength={4000} value={values.message} onChange={set('message')} className={`${fieldClass} resize-y`} {...describe('message')} />)}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Leave this empty<input name={honeypot} tabIndex={-1} autoComplete="off" value={values[honeypot]} onChange={set(honeypot)} /></label>
      </div>
      <button type="submit" disabled={state.sending} className="inline-flex items-center justify-center rounded-full bg-fill px-6 py-3 text-sm font-semibold text-on-ink transition-colors hover:bg-fill-hover disabled:opacity-60">
        {state.sending ? words.sending : words.send}
      </button>
    </form>
  );
}
