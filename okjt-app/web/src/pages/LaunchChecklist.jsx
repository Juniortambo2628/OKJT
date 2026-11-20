import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Container } from '@okjt/site';
import JourneyPage from '../components/Journey';
import { Busy, LoadError } from '../components/States';
import api, { errorMessage } from '../lib/api';
import { useContact, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

const KEY = 'okjt_launch_checklist';
const field = 'w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';
const submitClass = 'inline-flex items-center justify-center rounded-full bg-fill px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-on-ink transition-colors hover:bg-fill-hover disabled:opacity-60';

/** Ticked items, kept in this browser only. */
function useTicks() {
  const [ticks, setTicks] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; } });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(ticks)); } catch { /* this visit only */ } }, [ticks]);
  return [ticks, (id) => setTicks((t) => ({ ...t, [id]: !t[id] }))];
}

/** One section's items as a list of checkboxes, in the card a chapter's form usually sits in. */
function SectionCard({ section, ticks, toggle }) {
  const done = section.items.filter((i) => ticks[i.id]).length;
  return (
    <div className="glass-strong rounded-[2rem] p-6 sm:p-8">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-soft">{done} of {section.items.length} done</div>
      <ul className="space-y-4">
        {section.items.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer gap-3">
              <input type="checkbox" checked={!!ticks[item.id]} onChange={() => toggle(item.id)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)] [color-scheme:light]" />
              <span>
                <span className={`block text-sm font-semibold ${ticks[item.id] ? 'text-muted line-through' : 'text-ink'}`}>{item.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-soft">{item.text}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmailChecklist() {
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { subscribe: false } });
  const submit = handleSubmit(async (values) => {
    setFailure('');
    try {
      await api.post('/tools/launch-checklist/email', values);
      setSent(true);
    } catch (error) {
      setFailure(errorMessage(error, 'The email could not be sent. Please try again in a minute.'));
    }
  });
  if (sent) return <p role="status" className="text-soft">Sent. The whole checklist is on its way to your inbox.</p>;
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-soft">Email me the checklist</span>
        <input type="email" autoComplete="email" className={field} {...register('email', { required: 'An email address to send it to.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'That email address doesn’t look right.' } })} />
        {errors.email && <span role="alert" className="mt-1 block text-xs text-red-400">{errors.email.message}</span>}
      </label>
      <label className="flex items-start gap-3 text-sm text-soft">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--color-accent)] [color-scheme:light]" {...register('subscribe')} />
        <span>Also send me OKJTech’s occasional notes on building for African markets. Unsubscribe any time.</span>
      </label>
      {failure && <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{failure}</p>}
      <button type="submit" disabled={isSubmitting} className={submitClass}>{isSubmitting ? <Busy>Sending…</Busy> : 'Send the Checklist'}</button>
    </form>
  );
}

/** /tools/launch-checklist: what to settle before launching a platform in Kenya and the region. */
export default function LaunchChecklist() {
  const { setting } = useSettings();
  const contact = useContact();
  const query = useQuery({ queryKey: ['/tools/launch-checklist'], queryFn: () => api.get('/tools/launch-checklist').then((res) => res.data.data), staleTime: 60 * 60 * 1000 });
  const [ticks, toggle] = useTicks();
  const sections = query.data ?? [];
  const total = sections.reduce((n, s) => n + s.items.length, 0);
  const done = sections.reduce((n, s) => n + s.items.filter((i) => ticks[i.id]).length, 0);

  return (
    <JourneyPage
      loading={query.isLoading}
      hero={{
        media: setting('hero_services_media') || DEFAULT_HERO,
        eyebrow: 'Free Tool',
        title: 'Launching in <br />East Africa?',
        text: 'What to settle before a platform goes live in Kenya and the region: data protection, M-Pesa and card payments, slow phones and networks, WhatsApp, and launch day itself.',
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'Launch checklist' }],
        cta: contact.booking ? { to: '/book', label: 'Book a Call' } : { to: '/contact', label: 'Start a Project' },
        secondary: { to: '/tools/estimate', label: 'Estimate the Cost' },
      }}
      glance={total ? [[String(total), 'checks'], [String(sections.length), 'areas'], [`${done} of ${total}`, 'done so far'], ['Free', 'no sign-up']] : undefined}
      label="The checklist"
      chapters={sections.map((s, i) => ({
        id: s.id,
        navLabel: s.title,
        when: `${s.items.length} checks`,
        title: s.title,
        intro: s.intro,
        aside: <SectionCard section={s} ticks={ticks} toggle={toggle} />,
        tip: i === 0 ? 'A practical guide from building platforms in Kenya, not legal advice. For your own situation, check the Data Protection Commissioner’s guidance or ask a lawyer.' : undefined,
      }))}
      faqs={false}
    >
      {query.isError && <Container className="py-16"><LoadError what="the checklist" /></Container>}
      {sections.length > 0 && (
        <Container className="pb-24">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-strong rounded-[2rem] p-6 sm:p-10">
              <h2 className="!font-display text-3xl !font-light !text-ink">Building for this market?</h2>
              <p className="mt-3 text-soft">OKJTechnologies has built platforms in Kenya with M-Pesa payments, patient records and WhatsApp at their heart.</p>
              <p className="mt-4 text-sm text-soft">Check your current site with the <Link to="/tools/site-check" className="font-semibold text-accent hover:text-accent-strong">free site check</Link>, or <Link to="/tools/estimate" className="font-semibold text-accent hover:text-accent-strong">estimate what a new one would cost</Link>.</p>
            </div>
            <div className="glass-strong rounded-[2rem] p-6 sm:p-10"><EmailChecklist /></div>
          </div>
        </Container>
      )}
    </JourneyPage>
  );
}
