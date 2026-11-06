import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';
import JourneyPage from '../components/Journey';
import { HOW_IT_STARTS } from '../lib/faqs';
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

/** The brief form, sent to the dashboard's Enquiries. */
function ContactForm() {
  const contact = useContact();
  const { data: services } = useServices();
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState('');
  const [params] = useSearchParams();
  const similar = params.get('project');
  // From a case study's "Request Similar Work": the brief starts from that project.
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: similar ? { subject: '', message: `I'd like something similar to ${similar}. ` } : {},
  });

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

  return (
          <div id="form" className="glass-strong rounded-[2rem] p-6 sm:p-10">
            {sent ? (
              <div className="py-12 text-center" role="status">
                <CheckCircle2 className="mx-auto h-12 w-12 text-positive" aria-hidden="true" />
                <h2 className="mt-4 !font-display text-3xl !font-light !text-ink">Thank you. Your brief is in.</h2>
                <p className="mx-auto mt-3 max-w-md text-soft">A reply with next steps will reach {contact.email ? 'you' : 'your inbox'} within two business days.</p>
                <button type="button" onClick={() => setSent(false)} className="mt-8 text-sm font-semibold text-accent hover:text-accent-strong">Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-5">
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
                  {isSubmitting ? 'Sending…' : 'Send the Brief'}
                </button>
              </form>
            )}
          </div>
  );
}

export default function Contact() {
  const { setting } = useSettings();
  const contact = useContact();
  return (
    <JourneyPage
      hero={{
        media: setting('hero_contact_media') || DEFAULT_HERO,
        eyebrow: 'Start a Project',
        title: 'Share what <br />needs building.',
        text: 'Describe the platform, the people it should serve and the timeline. Every brief receives a reply with next steps.',
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'Contact' }],
      }}
      glance={[
        [contact.email, 'email'],
        [contact.phone, 'phone'],
        [contact.address, 'studio'],
        ['2 days', 'to a proposal'],
      ]}
      label="Getting in touch"
      chapters={[
        {
          id: 'brief',
          navLabel: 'Your brief',
          when: 'Step one',
          title: 'Tell us about the project',
          intro: 'Who will use it, what it should do, and when you need it. A few lines is enough to start.',
          aside: <ContactForm />,
          steps: [
            { title: 'Email', text: contact.email },
            { title: 'Phone', text: contact.phone },
            { title: 'Studio', text: contact.address },
          ],
          tip: 'Prefer email? Write to ' + contact.email + ' and the brief is read the same day.',
        },
        {
          id: 'next',
          navLabel: 'What happens next',
          when: 'After you send it',
          title: 'What happens next',
          intro: 'The same short path for every project, from brief to proposal.',
          steps: HOW_IT_STARTS,
          details: ['A technical and financial proposal within two business days', 'Clear stages and a realistic path to launch', 'One point of contact from start to finish'],
          detailsLabel: 'What you receive',
        },
      ]}
    />
  );
}
