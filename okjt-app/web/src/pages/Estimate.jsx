import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Container, Eyebrow, PillLink } from '@okjt/site';
import JourneyPage from '../components/Journey';
import { useContact, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';
import { defaultAnswers, estimate, estimatorConfig, usd } from '../lib/estimator';

const submitClass = 'inline-flex items-center justify-center rounded-full bg-fill px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-on-ink transition-colors hover:bg-fill-hover';

const FAQS = [
  { q: 'Is this a quote?', a: 'No, it is a starting range for planning and budgeting. After a short conversation, every project gets one fixed price in its proposal, within two business days.' },
  { q: 'Why a range?', a: 'The same feature can be simple or involved. The low end is a lean version; the high end allows for more polish and more edge cases. The proposal settles where your project sits.' },
  { q: 'How is it paid?', a: 'In four milestones: 40% to start, 20% at the first deployment, 20% when the scope is complete and 20% at handover, in US dollars by Wise or PayPal.' },
];

/** One question: its options as radio cards. */
function Question({ question, value, onChange }) {
  return (
    <fieldset className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-soft">{question.label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => (
          <label key={option.id} className="block cursor-pointer">
            <input type="radio" name={question.id} value={option.id} checked={value === option.id} onChange={() => onChange(question.id, option.id)} className="peer sr-only" />
            <span className="block h-full rounded-2xl border border-line bg-paper px-4 py-3 transition-colors hover:border-accent/50 peer-checked:border-accent peer-checked:bg-accent/10 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">
              <span className="block text-sm font-semibold text-ink">{option.label}</span>
              {option.hint && <span className="mt-0.5 block text-xs text-soft">{option.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** /tools/estimate: a price range, a timeline and a scope outline from eight questions. */
export default function Estimate() {
  const { setting, json } = useSettings();
  const contact = useContact();
  const config = estimatorConfig(json('estimator_config', null));
  const [answers, setAnswers] = useState(() => defaultAnswers(config));
  const result = useMemo(() => estimate(config, answers), [config, answers]);
  const choose = (id, option) => setAnswers((a) => ({ ...a, [id]: option }));

  const briefLink = `/contact?${new URLSearchParams({
    budget: result.budget,
    ...(result.timeline ? { timeline: result.timeline } : {}),
    message: `From the cost estimator (${usd(result.low)} – ${usd(result.high)}, about ${result.weeksLow}–${result.weeksHigh} weeks):\n${result.chosen.map((c) => `- ${c}`).join('\n')}\n\nAbout the project: `,
  })}#form`;

  return (
    <JourneyPage
      hero={{
        media: setting('hero_services_media') || DEFAULT_HERO,
        eyebrow: 'Free Tool',
        title: 'What will it <br />cost to build?',
        text: 'Eight quick questions give a price range in US dollars, a timeline and an outline of the work. Use it to plan a budget before the first conversation.',
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'Cost estimator' }],
      }}
      faqs={FAQS}
    >
      <Container className="py-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <form className="glass-strong space-y-6 rounded-[2rem] p-6 sm:p-10 lg:col-span-7" onSubmit={(e) => e.preventDefault()} aria-label="Your project">
            {config.questions.map((q) => <Question key={q.id} question={q} value={answers[q.id]} onChange={choose} />)}
          </form>

          <aside className="glass-strong rounded-[2rem] p-6 sm:p-8 lg:sticky lg:top-28 lg:col-span-5" aria-live="polite">
            <Eyebrow>Your estimate</Eyebrow>
            <div className="mt-3 !font-display text-4xl !font-light leading-tight tracking-tight text-ink sm:text-5xl">{usd(result.low)} – {usd(result.high)}</div>
            <p className="mt-2 text-soft">
              {result.rushShort
                ? `About ${result.weeksLow} to ${result.weeksHigh} weeks for all of it. Within six weeks means a smaller first version, at a rush rate.`
                : `About ${result.weeksLow} to ${result.weeksHigh} weeks${result.rush ? ', at a rush rate' : ''}.`}
            </p>
            {result.scope.length > 0 && (
              <ul className="mt-6 space-y-2 text-sm text-body">
                {result.scope.map((line) => (
                  <li key={line} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />{line}</li>
                ))}
              </ul>
            )}
            <p className="mt-6 text-xs leading-relaxed text-muted">A starting range, not a quote. Every project gets one fixed price in its proposal{setting('starting_price') ? `; projects start from ${setting('starting_price')}` : ''}.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={briefLink} className={submitClass}>Send This as a Brief</Link>
              {contact.booking && <PillLink to="/book" variant="outline">Book a Call</PillLink>}
            </div>
            <p className="mt-4 text-sm text-soft">See <Link to="/how-we-work" className="font-semibold text-accent hover:text-accent-strong">how projects are run and paid</Link>.</p>
          </aside>
        </div>
      </Container>
    </JourneyPage>
  );
}
