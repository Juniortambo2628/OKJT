import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { SiteLayout } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import api, { errorMessage } from '../lib/api';
import { live, useContact, useServices, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

const field = 'w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-soft">{label}</span>
      {children}
      {error && <span role="alert" className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}

export default function Contact() {
  const { setting } = useSettings();
  const contact = useContact();
  const { data: services } = useServices();
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const submit = handleSubmit(async (values) => {
    setFailure('');
    try {
      await api.post('/consultation-requests', values);
      setSent(true);
      reset();
    } catch (error) {
      setFailure(errorMessage(error, 'Your message could not be sent. Please email us instead.'));
    }
  });

  const details = [
    { icon: Mail, label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
    { icon: Phone, label: 'Phone', value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, '')}` },
    { icon: MapPin, label: 'Studio', value: contact.address },
  ];

  return (
    <SiteLayout overlay cta={false}>
      <PageHero
        media={setting('hero_contact_media') || DEFAULT_HERO}
        eyebrow="Start a project"
        title="Share what <br />needs building."
        text="Describe the platform, the people it should serve and the timeline. Every brief receives a reply with next steps."
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Contact' }]}
      />
      <Section id="message" media={setting('bg_contact_form')}>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="rounded-[2rem] glass p-6 sm:p-10 lg:col-span-8">
            {sent ? (
              <div className="py-12 text-center" role="status">
                <CheckCircle2 className="mx-auto h-12 w-12 text-positive" aria-hidden="true" />
                <h2 className="mt-4 !font-display text-3xl !font-light !text-ink">Thank you. Your brief is in.</h2>
                <p className="mx-auto mt-3 max-w-md text-soft">A reply with next steps will reach {contact.email ? 'you' : 'your inbox'} within two business days.</p>
                <button type="button" onClick={() => setSent(false)} className="mt-8 text-sm font-semibold text-accent hover:text-accent-strong">Send another message</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-5">
                <h2 className="!font-display text-3xl !font-light !text-ink">Tell us about the project</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="First name" error={errors.first_name?.message}>
                    <input className={field} autoComplete="given-name" {...register('first_name', { required: 'Your first name, please.' })} />
                  </Field>
                  <Field label="Last name" error={errors.last_name?.message}>
                    <input className={field} autoComplete="family-name" {...register('last_name', { required: 'Your last name, please.' })} />
                  </Field>
                </div>
                <Field label="Email" error={errors.email?.message}>
                  <input type="email" className={field} autoComplete="email" {...register('email', { required: 'An email address to reply to.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'That email address doesn’t look right.' } })} />
                </Field>
                <Field label="What is it about?">
                  <select className={field} defaultValue="" {...register('subject')}>
                    <option value="">A new platform</option>
                    {live(services).map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                    <option value="Something else">Something else</option>
                  </select>
                </Field>
                <Field label="Your brief" error={errors.message?.message}>
                  <textarea rows={6} className={field} placeholder="Who will use it, what it should do, and when you need it." {...register('message', { required: 'A few lines about the project.' })} />
                </Field>
                {failure && <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{failure}</p>}
                <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-full bg-fill px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-on-ink transition-colors hover:bg-fill-hover disabled:opacity-60 sm:w-auto">
                  {isSubmitting ? 'Sending…' : 'Send the brief'}
                </button>
              </form>
            )}
          </div>
          <aside id="details" className="space-y-4 lg:col-span-4">
            {details.map(({ icon: Icon, label, value, href }) => {
              const body = (
                <>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tone-100 text-accent"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0"><span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{label}</span><span className="block truncate text-ink">{value}</span></span>
                </>
              );
              return href
                ? <a key={label} href={href} className="flex items-center gap-4 rounded-[1.5rem] glass p-5 transition-colors hover:border-accent/50">{body}</a>
                : <div key={label} className="flex items-center gap-4 rounded-[1.5rem] glass p-5">{body}</div>;
            })}
            <div className="rounded-[1.5rem] border border-accent/30 bg-panel p-6 text-body">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">What happens next</div>
              <ol className="mt-3 space-y-2 text-sm opacity-90">
                <li>1. The brief is read and the people it serves are mapped.</li>
                <li>2. A short call to fill the gaps.</li>
                <li>3. A technical and financial proposal within two business days.</li>
              </ol>
            </div>
          </aside>
        </div>
      </Section>
    </SiteLayout>
  );
}
