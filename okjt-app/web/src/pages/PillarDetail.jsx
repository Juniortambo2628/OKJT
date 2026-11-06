import { useParams } from 'react-router-dom';
import { ImageCard, PillLink, SiteLayout } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import Html from '../components/Html';
import usePageMeta from '../components/usePageMeta';
import { LoadError } from '../components/States';
import { live, useItem, usePillars } from '../lib/content';
import NotFound from './NotFound';

const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export default function PillarDetail() {
  const { slug } = useParams();
  const { data: pillar, isLoading, isError, error } = useItem(`/pillars/${slug}`);
  const { data: all } = usePillars();
  usePageMeta(pillar?.title, pillar?.overview);
  if (error?.response?.status === 404) return <NotFound />;
  const others = live(all).filter((p) => p.id !== pillar?.id);
  const services = live(pillar?.services);

  return (
    <SiteLayout overlay>
      <PageHero
        media={pillar?.image}
        eyebrow="Approach"
        title={pillar?.title || ''}
        text={strip(pillar?.overview)}
        breadcrumbs={[{ to: '/', label: 'Home' }, { to: '/our-approach', label: 'Our approach' }, { label: pillar?.title || '…' }]}
      >
        <PillLink to="/contact" variant="dark" size="lg">Start a project</PillLink>
      </PageHero>
      <Section id="principle">
        {isLoading && <div className="h-64 animate-pulse rounded-[2rem] bg-surface" />}
        {isError && <LoadError what="this principle" />}
        {pillar && (
          <article className="mx-auto max-w-3xl rounded-[2rem] glass p-6 text-[1.05rem] sm:p-12">
            <Html html={pillar.content || pillar.overview} />
          </article>
        )}
      </Section>
      {services.length > 0 && (
        <Section id="services" eyebrow="In practice" title="Services under this principle">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => <ImageCard key={s.id} image={s.image} title={s.title} text={strip(s.description).slice(0, 120)} to={`/services/${s.slug}`} />)}
          </div>
        </Section>
      )}
      {others.length > 0 && (
        <Section id="more" eyebrow="Approach" title="The other principles">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => <ImageCard key={p.id} image={p.image} title={p.title} text={strip(p.overview).slice(0, 120)} to={`/our-approach/${p.slug}`} className="min-h-[18rem]" />)}
          </div>
        </Section>
      )}
    </SiteLayout>
  );
}
