import { Check } from 'lucide-react';
import { Container, PillLink, SectionHeading } from './ui.js';
import { SECTION_OFFSET } from './SectionNav.js';

/**
 * Plan cards. Each plan: `{ id, name, price, tagline, lines, cta: { to, label }, highlight }`,
 * already worded (prices, limits): where they come from is the project's business.
 * `footnote` sits under the cards.
 */
export default function PricingSection({ id = 'pricing', eyebrow = 'Pricing', title, text, plans, footnote }) {
  return (
    <section id={id} className={`${SECTION_OFFSET} py-24`}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          text={text}
        />
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col overflow-hidden rounded-[2rem] p-8 sm:p-10 ${plan.highlight
                ? 'bg-ink text-white shadow-[0_40px_80px_-40px_color-mix(in_srgb,var(--color-ink)_80%,transparent)]'
                : 'border border-line bg-white'}`}
            >
              {plan.highlight && <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-soft/20 blur-2xl" aria-hidden="true" />}
              <div className={`text-xs font-semibold uppercase tracking-[0.2em] ${plan.highlight ? 'text-accent-soft' : 'text-accent'}`}>{plan.name}</div>
              <div className={`mt-3 font-display text-3xl font-light tracking-tight sm:text-4xl ${plan.highlight ? 'text-white' : 'text-ink'}`}>{plan.price}</div>
              <div className={`mt-2 text-sm ${plan.highlight ? 'text-white/70' : 'text-soft'}`}>{plan.tagline}</div>
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {plan.lines.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${plan.highlight ? 'bg-white/10 text-accent-soft' : 'bg-tint text-accent'}`}>
                      <Check className="h-3 w-3" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <PillLink to={plan.cta.to} variant={plan.highlight ? 'light' : 'dark'} className="mt-10">{plan.cta.label}</PillLink>
            </div>
          ))}
        </div>
        {footnote && (
          <div className="mt-8 text-center text-sm text-soft">
            {footnote}
          </div>
        )}
      </Container>
    </section>
  );
}
