import { Check } from 'lucide-react';
import ImageCard from './ImageCard.js';
import MediaFrame from './MediaFrame.js';
import { Container, Eyebrow } from './ui.js';
import { SECTION_OFFSET } from './SectionNav.js';
import { usePlaces, useSite } from './SiteProvider.js';

/**
 * One feature group: heading and numbers, a photo card beside a real screen,
 * then every tool. The card's photo is the place `group-<id>-card`; the screen
 * is `group.clip` or `group.media` from `site.media`.
 */
export default function FeatureGroup({ group, index }) {
  const place = usePlaces();
  const { media: MEDIA = {} } = useSite();
  const media = MEDIA[group.clip] || MEDIA[group.media];
  const flip = index % 2 === 1;
  return (
    <section id={group.id} className={`${SECTION_OFFSET} py-20 lg:py-28`}>
      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="font-display text-sm font-semibold text-accent-soft">{String(index + 1).padStart(2, '0')}</span>
              <Eyebrow>{group.eyebrow}</Eyebrow>
            </div>
            <h2 className="mt-4 !font-display text-4xl !font-light leading-[1.05] tracking-tight !text-ink sm:text-5xl">{group.title}</h2>
            <div className="mt-5 max-w-2xl text-lg leading-relaxed text-soft">{group.summary}</div>
          </div>
          <dl className="grid grid-cols-3 gap-3 lg:col-span-5">
            {group.stats.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-line bg-white/60 p-4">
                <dd className="font-display text-xl font-normal tracking-tight text-ink sm:text-2xl">{value}</dd>
                <dt className="mt-1 text-xs text-muted">{label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className={`mt-12 grid gap-5 lg:grid-cols-12 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
          <ImageCard image={place(`group-${group.id}-card`)} tags={[group.eyebrow]} title={group.features[0].title} text={group.features[0].text} className="min-h-[24rem] lg:col-span-5" />
          <div className="relative overflow-hidden rounded-[1.75rem] bg-line p-4 sm:p-8 lg:col-span-7">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/50 blur-3xl" aria-hidden="true" />
            <MediaFrame media={media} className="relative" />
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {group.features.map((feature) => (
            <article key={feature.title} className="flex flex-col rounded-[1.75rem] border border-line bg-white p-6 sm:p-7">
              <h3 className="!font-display text-xl !font-medium !text-ink">{feature.title}</h3>
              <div className="mt-3 text-sm leading-relaxed text-soft">{feature.text}</div>
              {feature.details.length > 0 && (
                <ul className="mt-5 space-y-2 border-t border-tint pt-5 text-sm text-body">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />{detail}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
