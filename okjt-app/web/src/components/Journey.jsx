import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Lightbulb } from 'lucide-react';
import { Container, Eyebrow, FaqSection, ImageCard, PillLink, SECTION_OFFSET, SectionHeading, SectionNav, SiteLayout } from '@okjt/site';
import PageHero from './PageHero';
import MediaFill from './MediaFill';
import Html from './Html';
import { FAQS } from '../lib/faqs';

/**
 * The frame of every public page, after Naoa's "For couples" and "For
 * planners" journeys: a tall hero with the page's numbers overlapping it,
 * a numbered bar of chapters, the chapters themselves (a picture held on the
 * left, the words, steps, fine print and a tip on the right), a toolkit of
 * photo cards with a wide card onward, and questions.
 */

/** The page's numbers at a glance, overlapping the hero: [[value, label]]. */
export function JourneyGlance({ glance }) {
  return (
    <div className="glass-strong rounded-[2rem] p-6 sm:p-10">
      <dl className={`grid grid-cols-2 gap-4 sm:gap-6 ${glance.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {glance.map(([value, label]) => (
          <div key={label} className="flex flex-col-reverse justify-end rounded-2xl bg-paper/50 p-5">
            <dt className="mt-1 text-sm text-soft">{label}</dt>
            <dd className={`break-words font-display font-light tracking-tight text-ink ${String(value).length > 14 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** A picture or clip in a browser frame, its address in the bar. */
function Frame({ media }) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 border-b border-line/70 px-4 py-2.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-accent/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 truncate rounded-full bg-paper/60 px-3 py-0.5 text-[11px] text-muted">{media.url || 'okjtech.co.ke'}</span>
      </div>
      <div className="relative aspect-[16/10]"><MediaFill src={media.src} /></div>
    </div>
  );
}

/**
 * One chapter. `media` ({ src, url }) or `aside` (any content, e.g. a form)
 * stays put on the left on wide screens; without either the words take the
 * width. `steps` ([{ title, text, to? }]), `body` (rich text), `details`
 * (fine print) and `tip` are all optional.
 */
export function JourneyChapter({ chapter, index, detailsLabel = 'The nitty-gritty', tipLabel = 'Good to know' }) {
  const side = chapter.aside || (chapter.media && <Frame media={chapter.media} />);
  return (
    <article id={chapter.id} className={`${SECTION_OFFSET} grid gap-8 border-t border-line py-14 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:gap-12 lg:py-16`}>
      {side && <div className="lg:sticky lg:top-40 lg:col-span-7 lg:self-start">{side}</div>}

      <div className={side ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-display text-4xl font-extralight text-accent-soft">{String(index + 1).padStart(2, '0')}</span>
          {chapter.when && <span className="rounded-full bg-fill px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-on-ink">{chapter.when}</span>}
        </div>
        <h2 className="mt-3 !font-display text-3xl !font-light tracking-tight !text-ink sm:text-4xl">{chapter.title}</h2>
        {chapter.intro && <div className="mt-3 leading-relaxed text-soft">{chapter.intro}</div>}
        {chapter.body && <Html html={chapter.body} className="mt-5" />}

        {chapter.steps?.length > 0 && (
          <ol className="glass mt-6 divide-y divide-line/60 rounded-3xl">
            {chapter.steps.map((step, i) => {
              const inner = (
                <>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-fill text-xs font-semibold text-on-ink">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="!font-sans text-base !font-semibold !text-ink">{step.title}</h3>
                    {step.text && <div className="mt-1 text-sm leading-relaxed text-soft">{step.text}</div>}
                  </div>
                  {step.to && <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-accent opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true" />}
                </>
              );
              return (
                <li key={`${step.title}-${i}`}>
                  {step.to
                    ? <Link to={step.to} className="group flex gap-4 p-5 transition-colors hover:bg-paper/40">{inner}</Link>
                    : <div className="flex gap-4 p-5">{inner}</div>}
                </li>
              );
            })}
          </ol>
        )}

        {chapter.details?.length > 0 && (
          <div className="mt-4 rounded-3xl bg-paper/60 p-5 ring-1 ring-line/60">
            <Eyebrow>{chapter.detailsLabel || detailsLabel}</Eyebrow>
            <ul className="mt-3 space-y-2 text-sm text-body">
              {chapter.details.map((detail) => (
                <li key={detail} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />{detail}</li>
              ))}
            </ul>
          </div>
        )}
        {chapter.tip && (
          <div className="mt-4 flex gap-4 rounded-3xl bg-fill p-5 text-on-ink">
            <Lightbulb className="h-5 w-5 shrink-0 text-accent-soft" aria-hidden="true" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">{chapter.tipLabel || tipLabel}</div>
              <div className="mt-2 text-sm leading-relaxed text-on-ink/85">{chapter.tip}</div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * A whole page.
 *   hero     { media, eyebrow, title, text, breadcrumbs, cta: { to, label }, secondary: { to, label } }
 *   glance   [[value, label]]                       numbers overlapping the hero
 *   label    what the chapters are called ("The journey")
 *   chapters [{ id, title, when?, intro?, body?, media?, aside?, steps?, details?, tip? }]
 *   toolkit  { eyebrow, title, text, cards: [{ to, image, tags, title, text }] }
 *   onward   { to, image, tags, title, text }        the wide card after the toolkit
 *   faqs     [{ q, a }]  (default: the studio's questions); false for none
 *   extra    sections after the toolkit, before the questions
 */
export default function JourneyPage({ hero, glance, label = 'On this page', chapters = [], toolkit, onward, faqs = FAQS, extra, children, loading }) {
  const sections = [
    ...chapters.map((c) => ({ id: c.id, label: c.navLabel || c.title })),
    ...(toolkit?.cards?.length ? [{ id: 'toolkit', label: toolkit.navLabel || toolkit.eyebrow }] : []),
    ...(faqs ? [{ id: 'faq', label: 'Questions' }] : []),
  ];
  return (
    <SiteLayout overlay>
      <PageHero
        tall
        media={hero.media}
        eyebrow={hero.eyebrow}
        title={hero.title}
        text={hero.text}
        breadcrumbs={hero.breadcrumbs}
        after={glance?.length ? <JourneyGlance glance={glance} /> : undefined}
      >
        {hero.cta && <PillLink to={hero.cta.to} variant="dark" size="lg">{hero.cta.label}</PillLink>}
        {hero.secondary && <PillLink to={hero.secondary.to} variant="glass" size="lg" arrow>{hero.secondary.label}</PillLink>}
        {hero.actions}
      </PageHero>

      {sections.length > 1 && <SectionNav label={label} numbered sections={sections} className="mt-16" />}

      {loading ? (
        <Container className="py-20"><div className="glass h-96 animate-pulse rounded-[2rem]" /></Container>
      ) : chapters.length > 0 && (
        <Container className="py-20">
          {chapters.map((chapter, i) => <JourneyChapter key={chapter.id} chapter={chapter} index={i} />)}
        </Container>
      )}

      {children}

      {toolkit?.cards?.length > 0 && (
        <section id="toolkit" className={`${SECTION_OFFSET} py-24`}>
          <Container>
            <SectionHeading eyebrow={toolkit.eyebrow} title={toolkit.title} text={toolkit.text} />
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {toolkit.cards.map((card, i) => (
                <ImageCard
                  key={card.to + card.title}
                  to={card.to}
                  image={card.image}
                  tags={card.tags?.filter(Boolean)}
                  title={card.title}
                  text={card.text}
                  className={i % 4 === 0 || i % 4 === 3 ? 'min-h-[26rem]' : 'min-h-[22rem]'}
                />
              ))}
            </div>
            {onward && (
              <ImageCard to={onward.to} image={onward.image} tags={onward.tags?.filter(Boolean)} title={onward.title} text={onward.text} className="mt-5 min-h-[20rem]" titleClass="text-3xl sm:text-4xl" />
            )}
          </Container>
        </section>
      )}
      {!toolkit?.cards?.length && onward && (
        <Container className="py-16">
          <ImageCard to={onward.to} image={onward.image} tags={onward.tags?.filter(Boolean)} title={onward.title} text={onward.text} className="min-h-[20rem]" titleClass="text-3xl sm:text-4xl" />
        </Container>
      )}

      {extra}
      {faqs && faqs.length > 0 && <FaqSection items={faqs} />}
    </SiteLayout>
  );
}
