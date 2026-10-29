import { CheckCircle2, Lightbulb } from 'lucide-react';
import MediaFrame from './MediaFrame.js';
import { Eyebrow } from './ui.js';
import { SECTION_OFFSET } from './SectionNav.js';
import { useMedia } from './SiteProvider.js';

/** "At a glance" numbers, overlapping the hero. */
export function JourneyGlance({ journey }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-40px_color-mix(in_srgb,var(--color-ink)_50%,transparent)] sm:p-10">
      <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {journey.glance.map(([value, label]) => (
          <div key={label} className="rounded-2xl bg-tint p-5">
            <dd className="font-display text-3xl font-light tracking-tight text-ink sm:text-4xl">{value}</dd>
            <dt className="mt-1 text-sm text-soft">{label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * One chapter of the journey. On wide screens the screen stays put on the
 * left while its title, steps and fine print sit beside it, so a chapter
 * reads in one view; on phones they stack. `detailsLabel` and `tipLabel` head
 * the chapter's fine print and its tip.
 */
export function JourneyChapter({ chapter, index, detailsLabel = 'The nitty-gritty', tipLabel = 'Good to know' }) {
  const phone = useMedia(chapter.media)?.phone;
  return (
    <article id={chapter.id} className={`${SECTION_OFFSET} grid gap-8 border-t border-line py-14 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:gap-12 lg:py-16`}>
      <div className={`lg:sticky lg:top-40 lg:self-start ${phone ? 'lg:col-span-5' : 'lg:col-span-7'}`}>
        <MediaFrame media={chapter.media} className={phone ? 'max-w-[16rem]' : ''} />
      </div>

      <div className={`${phone ? 'lg:col-span-7' : 'lg:col-span-5'}`}>
        <div className="flex items-center gap-3">
          <span className="font-display text-4xl font-extralight text-accent-soft">{String(index + 1).padStart(2, '0')}</span>
          <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">{chapter.when}</span>
        </div>
        <h2 className="mt-3 !font-display text-3xl !font-light tracking-tight !text-ink sm:text-4xl">{chapter.title}</h2>
        <div className="mt-3 leading-relaxed text-soft">{chapter.intro}</div>

        <ol className="mt-6 divide-y divide-tint rounded-3xl border border-line bg-white">
          {chapter.steps.map((step, i) => (
            <li key={step.title} className="flex gap-4 p-5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-tint text-xs font-semibold text-accent">{i + 1}</span>
              <div>
                <h3 className="!font-sans text-base !font-semibold !text-ink">{step.title}</h3>
                <div className="mt-1 text-sm leading-relaxed text-soft">{step.text}</div>
              </div>
            </li>
          ))}
        </ol>

        {chapter.details.length > 0 && (
          <div className="mt-4 rounded-3xl bg-tint p-5">
            <Eyebrow>{detailsLabel}</Eyebrow>
            <ul className="mt-3 space-y-2 text-sm text-body">
              {chapter.details.map((detail) => (
                <li key={detail} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />{detail}</li>
              ))}
            </ul>
          </div>
        )}
        {chapter.tip && (
          <div className="mt-4 flex gap-4 rounded-3xl bg-ink p-5 text-white">
            <Lightbulb className="h-5 w-5 shrink-0 text-accent-soft" aria-hidden="true" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">{tipLabel}</div>
              <div className="mt-2 text-sm leading-relaxed text-white/85">{chapter.tip}</div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
