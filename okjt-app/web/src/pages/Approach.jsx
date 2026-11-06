import { ImageCard, SiteLayout } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import { CardGridSkeleton, Empty, LoadError } from '../components/States';
import { live, usePillars, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export default function Approach() {
  const { setting } = useSettings();
  const { data, isLoading, isError } = usePillars();
  const pillars = live(data);
  return (
    <SiteLayout overlay>
      <PageHero
        media={setting('hero_products_media') || DEFAULT_HERO}
        eyebrow="Approach"
        title="How the work <br />gets done."
        text="Six principles guide every project, from the first sketch to a platform that keeps growing."
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Our approach' }]}
      />
      <Section id="principles" eyebrow="Principles" title={setting('vp_section_title', 'One continuous build, concept to production')} text={setting('vp_section_subtitle')}>
        {isLoading ? <CardGridSkeleton /> : isError ? <LoadError what="the approach" /> : pillars.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <ImageCard key={p.id} image={p.image} title={p.title} text={strip(p.overview).slice(0, 160)} tags={[String(i + 1).padStart(2, '0')]} to={`/our-approach/${p.slug}`} className="min-h-[26rem]" />
            ))}
          </div>
        ) : <Empty>The principles will be listed here.</Empty>}
      </Section>
    </SiteLayout>
  );
}
