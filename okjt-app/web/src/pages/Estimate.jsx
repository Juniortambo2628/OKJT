import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Container, Eyebrow, PillLink } from '@okjt/site';
import { StepFlow } from '@okjt/ui';
import JourneyPage from '../components/Journey';
import { useContact, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';
import { defaultAnswers, estimate, estimatorConfig, usd } from '../lib/estimator';

const submitClass = 'inline-flex items-center justify-center gap-2 rounded-full bg-fill px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-on-ink transition-colors hover:bg-fill-hover';
const backClass = 'inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-soft transition-colors hover:bg-tint hover:text-ink disabled:invisible';
/** How long a choice stays on screen before the wizard moves on, so the visitor sees it register. */
const ADVANCE_MS = 280;

const FAQS = [
  { q: 'Is this a quote?', a: 'No, it is a starting range for planning and budgeting. After a short conversation, every project gets one fixed price in its proposal, within two business days.' },
  { q: 'Why a range?', a: 'The same feature can be simple or involved. The low end is a lean version; the high end allows for more polish and more edge cases. The proposal settles where your project sits.' },
  { q: 'How is it paid?', a: 'In four milestones: 40% to start, 20% at the first deployment, 20% when the scope is complete and 20% at handover, in US dollars by Wise or PayPal.' },
];

/** One question, its options as large radio cards. Choosing one moves the wizard on. */
function QuestionStep({ question, value, onChoose, headingRef }) {
  return (
    <fieldset>
      <legend ref={headingRef} tabIndex={-1} className="!font-display text-2xl !font-light leading-tight tracking-tight text-ink outline-none sm:text-3xl">{question.label}</legend>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => (
          <label key={option.id} className="block cursor-pointer">
            <input type="radio" name={question.id} value={option.id} checked={value === option.id} onChange={() => onChoose(question.id, option.id)} className="peer sr-only" />
            <span className="flex h-full items-start gap-3 rounded-2xl border border-line bg-paper px-4 py-4 transition-colors hover:border-accent/50 peer-checked:border-accent peer-checked:bg-accent/10 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${value === option.id ? 'border-accent bg-accent text-white' : 'border-line-strong'}`} aria-hidden="true">
                {value === option.id && <CheckCircle2 className="h-3.5 w-3.5" />}
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{option.label}</span>
                {option.hint && <span className="mt-0.5 block text-xs text-soft">{option.hint}</span>}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** The last step: every answer, each with a way back to change it. */
function ReviewStep({ config, answers, goTo, headingRef }) {
  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="!font-display text-2xl !font-light leading-tight tracking-tight !text-ink outline-none sm:text-3xl">Your answers</h2>
      <dl className="mt-6 divide-y divide-line/70 rounded-2xl border border-line bg-paper">
        {config.questions.map((q, i) => {
          const option = q.options.find((o) => o.id === answers[q.id]) ?? q.options[0];
          return (
            <div key={q.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-soft">{q.short || q.label}</dt>
                <dd className="mt-0.5 text-sm text-ink">{option.label}</dd>
              </div>
              <button type="button" onClick={() => goTo(i, { review: true })} className="shrink-0 text-sm font-semibold text-accent hover:text-accent-strong">Change<span className="sr-only"> {q.short || q.label}</span></button>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/** The estimate and what to do with it: beside the wizard on wide screens, at its end on phones. */
function EstimateCard({ config, result, briefLink, contact, setting, done }) {
  return (
    <div aria-live="polite">
      <Eyebrow>{done ? 'Your estimate' : 'Estimate so far'}</Eyebrow>
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
      {done && (
        <>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={briefLink} className={submitClass}>Send This as a Brief</Link>
            {contact.booking && <PillLink to="/book" variant="outline">Book a Call</PillLink>}
          </div>
          <p className="mt-4 text-sm text-soft">See <Link to="/how-we-work" className="font-semibold text-accent hover:text-accent-strong">how projects are run and paid</Link>.</p>
        </>
      )}
      {!done && config && <p className="mt-4 text-sm text-soft">Answer the rest to send it as a brief.</p>}
    </div>
  );
}

/** /tools/estimate: a step-by-step wizard giving a price range, a timeline and a scope outline. */
export default function Estimate() {
  const { setting, json } = useSettings();
  const contact = useContact();
  const config = estimatorConfig(json('estimator_config', null));
  const total = config.questions.length;
  const [answers, setAnswers] = useState(() => defaultAnswers(config));
  const [step, setStep] = useState(0); // 0 … total-1: questions; total: review
  const [answered, setAnswered] = useState(0); // furthest step reached, so Next only goes where the visitor has been
  const result = useMemo(() => estimate(config, answers), [config, answers]);
  const heading = useRef(null);
  const advance = useRef(null);
  const started = useRef(false);
  const fromReview = useRef(false); // a Change from the review step returns there once answered

  const goTo = (n, { review = false } = {}) => { clearTimeout(advance.current); fromReview.current = review; setStep(Math.max(0, Math.min(total, n))); };
  const choose = (id, option) => {
    setAnswers((a) => ({ ...a, [id]: option }));
    setAnswered((n) => Math.max(n, step + 1));
    clearTimeout(advance.current);
    const back = fromReview.current;
    fromReview.current = false;
    advance.current = setTimeout(() => setStep((s) => (back ? total : Math.min(total, s + 1))), ADVANCE_MS);
  };
  useEffect(() => () => clearTimeout(advance.current), []);
  // Move focus to each new step's heading (not on first load), so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (!started.current) { started.current = true; return; }
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  const done = step === total;
  const steps = [...config.questions.map((q) => q.short || q.label), 'Estimate'];
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
          <div id="estimator" className="glass-strong rounded-[2rem] p-6 sm:p-10 lg:col-span-7">
            <StepFlow steps={steps} cursor={step + 1} />
            <div className="mt-8 min-h-[18rem]">
              {done
                ? <ReviewStep config={config} answers={answers} goTo={goTo} headingRef={heading} />
                : <QuestionStep question={config.questions[step]} value={step < answered ? answers[config.questions[step].id] : null} onChoose={choose} headingRef={heading} />}
            </div>
            {/* Phones: the running figure, since the full estimate sits below the wizard. */}
            {!done && <p className="mt-6 text-sm text-soft lg:hidden" aria-live="polite">Estimate so far: <span className="font-semibold text-ink">{usd(result.low)} – {usd(result.high)}</span></p>}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5">
              <button type="button" onClick={() => goTo(step - 1)} disabled={step === 0} className={backClass}><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back</button>
              {!done && (
                step < answered
                  ? <button type="button" onClick={() => goTo(step + 1)} className={submitClass}>{step === total - 1 ? 'See the Estimate' : 'Next'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
                  : <span className="text-sm text-muted">Choose an answer to continue</span>
              )}
              {done && <button type="button" onClick={() => { setAnswers(defaultAnswers(config)); setAnswered(0); goTo(0); }} className="text-sm font-semibold text-accent hover:text-accent-strong">Start Again</button>}
            </div>
          </div>

          <aside className={`glass-strong rounded-[2rem] p-6 sm:p-8 lg:sticky lg:top-28 lg:col-span-5 ${done ? '' : 'hidden lg:block'}`}>
            <EstimateCard config={config} result={result} briefLink={briefLink} contact={contact} setting={setting} done={done} />
          </aside>
        </div>
      </Container>
    </JourneyPage>
  );
}
