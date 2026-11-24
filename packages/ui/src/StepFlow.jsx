import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronRight } from 'lucide-react';
import { completionPct, hasProgress, primaryStep, stepsWithCursor } from './stepProgress.js';

/** A step's icon: a component (lucide) or an element. */
function StepIcon({ icon }) {
  if (!icon) return null;
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof && !icon.props)) {
    const Icon = icon;
    return <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
  }
  return icon;
}

const NUM = 'grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold';
const NUM_BY_STATE = {
  done: `${NUM} bg-accent text-white`,
  current: `${NUM} bg-accent text-white ring-4 ring-accent/20`,
  todo: `${NUM} bg-tone-100 text-tone-500`,
  unstated: `${NUM} bg-tone-100 text-tone-700`,
};
const TITLE_BY_STATE = {
  done: 'text-body',
  current: 'font-semibold text-body',
  todo: 'text-tone-500',
  unstated: 'text-body',
};

function Num({ step }) {
  return (
    <span className={NUM_BY_STATE[step.state]}>
      {step.state === 'done' ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : step.n}
    </span>
  );
}

/**
 * Reveal the docked bar once the page has scrolled past `revealAfter`, and
 * hide it while the footer is on screen so it never covers it.
 */
function useScrollReveal(enabled, revealAfter) {
  const [visible, setVisible] = useState(false);
  const footerVisible = useRef(false);
  useEffect(() => {
    if (!enabled) return undefined;
    const update = () => setVisible(window.scrollY > revealAfter && !footerVisible.current);
    const footer = document.querySelector('footer');
    const io = footer && typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => { footerVisible.current = entry.isIntersecting; update(); })
      : null;
    if (io) io.observe(footer);
    const onScroll = () => window.requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, [enabled, revealAfter]);
  return visible;
}

/**
 * StepFlow (F8, from TFE): a numbered run of steps with chevrons between them.
 *
 *   <StepFlow variant="inline" steps={['Details', 'Party', 'Confirm']} cursor={2} />
 *   <StepFlow variant="docked" label="How it works" steps={['Plan', 'Get a quote', 'Pay']} />
 *
 * `inline` sits in the page (a wizard's progress, with a thin completion bar);
 * `docked` is a pill fixed to the bottom of the screen that appears once the
 * page scrolls past `revealAfter` px and hides while the footer is on screen
 * (portalled to <body>, so a transformed ancestor can't move it).
 *
 * Progress is shown only when there is some: steps with no `state` and no
 * `cursor` explain a flow and mark nothing done or current (no bar is drawn).
 * Pass `cursor` (1-based; 0 = not started; past the end = all done) or a
 * `state` per step ('done' | 'current' | 'todo') to track one. Below `sm`
 * the run collapses to the current step with "Step 2 of 4", rather than a
 * row of bare numbers.
 *
 * Use it for gated steps. For sections a person may move between freely,
 * use Modal's `tabs` instead.
 *
 * @param {Array} steps   ['Title', …] or [{ title, icon?, hint?, state? }]
 * @param {number} [cursor]
 * @param {'inline'|'docked'} [variant='inline']
 * @param {node} [label]   a lead-in before the steps ("How it works")
 * @param {number} [revealAfter=320]
 * @param {string} [className]
 */
export default function StepFlow({ steps, cursor = null, variant = 'inline', label = null, revealAfter = 320, className = '' }) {
  const docked = variant === 'docked';
  const visible = useScrollReveal(docked, revealAfter);
  const list = stepsWithCursor(steps, cursor);
  if (!list.length) return null;

  const progress = hasProgress(list);
  const lead = primaryStep(list);
  const pct = progress ? completionPct(list) : 0;

  const bar = (
    <div
      className={[
        docked
          ? `fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-30 mx-auto w-fit max-w-[calc(100vw-1.5rem)] rounded-full border border-tone-200/70 bg-surface/85 px-4 py-2.5 shadow-lg backdrop-blur-xl transition duration-300 ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`
          : 'w-full',
        className,
      ].filter(Boolean).join(' ')}
      aria-hidden={docked && !visible ? 'true' : undefined}
      data-variant={docked ? 'docked' : 'inline'}
    >
      <div className="flex items-center gap-3">
        {label && <span className="hidden shrink-0 text-[length:max(11px,var(--okjt-min-text,0px))] font-semibold uppercase tracking-[0.15em] text-soft sm:inline">{label}</span>}
        <ol className="hidden flex-wrap items-center gap-x-2 gap-y-1 sm:flex">
          {list.map((step, i) => (
            <li key={step.n} className="flex items-center gap-2" data-state={step.state} aria-current={step.state === 'current' ? 'step' : undefined} title={step.hint || undefined}>
              <Num step={step} />
              <span className={`flex items-center gap-1.5 text-sm ${TITLE_BY_STATE[step.state]}`}>
                <StepIcon icon={step.icon} />
                {step.title}
              </span>
              {i < list.length - 1 && <ChevronRight className="h-4 w-4 shrink-0 text-tone-300" aria-hidden="true" />}
            </li>
          ))}
        </ol>
        {/* Phones: the step that matters, with where it sits in the run. */}
        {lead && (
          <span className="flex items-center gap-2 sm:hidden" data-state={lead.state}>
            <Num step={lead} />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-body">{lead.title}</span>
              <span className="text-[length:max(11px,var(--okjt-min-text,0px))] text-soft">Step {lead.n} of {list.length}</span>
            </span>
          </span>
        )}
      </div>
      {progress && !docked && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-tone-100" role="presentation">
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );

  if (!docked) return bar;
  if (typeof document === 'undefined') return null;
  return createPortal(bar, document.body);
}
