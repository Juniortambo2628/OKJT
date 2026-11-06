import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ImageCard, SectionNav, SiteLayout } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import { CardGridSkeleton, Empty, LoadError } from '../components/States';
import { live, useServices, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Every service, grouped by the approach pillar (or category) it belongs to. */
export default function Services() {
  const { setting } = useSettings();
  const { data, isLoading, isError } = useServices();
  const [params] = useSearchParams();
  const only = params.get('category');

  const groups = useMemo(() => {
    const map = new Map();
    for (const s of live(data)) {
      if (only && s.category !== only) continue;
      const title = s.pillar?.title || s.category || 'Services';
      if (!map.has(title)) map.set(title, { id: slug(title), title, overview: s.pillar?.overview, items: [] });
      map.get(title).items.push(s);
    }
    return [...map.values()];
  }, [data, only]);

  return (
    <SiteLayout overlay>
      <PageHero
        media={setting('hero_services_media') || DEFAULT_HERO}
        eyebrow="Services"
        title={setting('services_title', 'Web applications, designed and built end to end.')}
        text={setting('services_subtitle', 'Each service covers a part of the same journey: shaping the idea, designing the experience, building the platform and keeping it running.')}
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: only || 'Services' }]}
      />
      {groups.length > 1 && <SectionNav sections={groups.map((g) => ({ id: g.id, label: g.title }))} label="Service groups" />}
      {isLoading && <Section><CardGridSkeleton /></Section>}
      {isError && <Section><LoadError what="the services" /></Section>}
      {!isLoading && !isError && !groups.length && <Section><Empty>No services are listed yet.</Empty></Section>}
      {groups.map((g) => (
        <Section key={g.id} id={g.id} eyebrow="Services" title={g.title} text={strip(g.overview).slice(0, 220)} align="left">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((s) => (
              <ImageCard key={s.id} image={s.image} title={s.title} text={strip(s.description).slice(0, 150)} tags={s.category ? [s.category] : []} to={`/services/${s.slug}`} />
            ))}
          </div>
        </Section>
      ))}
    </SiteLayout>
  );
}
