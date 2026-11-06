import { useParams } from 'react-router-dom';
import { ImageCard, PillLink, SiteLayout } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import Html from '../components/Html';
import usePageMeta from '../components/usePageMeta';
import { CardGridSkeleton, LoadError } from '../components/States';
import { live, useItem, useServices } from '../lib/content';
import NotFound from './NotFound';

const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export default function ServiceDetail() {
  const { slug } = useParams();
  const { data: service, isLoading, isError, error } = useItem(`/services/${slug}`);
  const { data: all } = useServices();
  usePageMeta(service?.title, service?.description);

  if (error?.response?.status === 404) return <NotFound />;
  const related = live(all).filter((s) => s.id !== service?.id && (service?.pillar_id ? s.pillar_id === service.pillar_id : s.category === service?.category)).slice(0, 3);

  return (
    <SiteLayout overlay>
      <PageHero
        media={service?.image}
        eyebrow={service?.pillar?.title || service?.category || 'Service'}
        title={service?.title || (isLoading ? '' : 'Service')}
        text={strip(service?.description)}
        breadcrumbs={[{ to: '/', label: 'Home' }, { to: '/services', label: 'Services' }, { label: service?.title || '…' }]}
      >
        <PillLink to="/contact" variant="dark" size="lg">Discuss this service</PillLink>
      </PageHero>
      <Section id="overview">
        {isLoading && <CardGridSkeleton count={2} className="sm:grid-cols-2" />}
        {isError && <LoadError what="this service" />}
        {service && (
          <div className="grid gap-10 lg:grid-cols-12">
            <article className="rounded-[2rem] border border-line bg-surface p-6 sm:p-10 lg:col-span-8">
              <Html html={service.content || service.description} />
            </article>
            <aside className="space-y-4 lg:col-span-4">
              <div className="rounded-[2rem] bg-ink p-8 text-on-ink lg:sticky lg:top-28">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">Next step</div>
                <h2 className="mt-3 !font-display text-2xl !font-normal !text-on-ink">Have a platform in mind?</h2>
                <p className="mt-3 text-sm leading-relaxed opacity-80">Share a short brief. Every brief receives a reply with next steps.</p>
                <PillLink to="/contact" variant="light" className="mt-6 w-full">Start a project</PillLink>
                {service.pillar && <PillLink to={`/our-approach/${service.pillar.slug}`} variant="outline" className="mt-3 w-full !border-on-ink/30 !text-on-ink">About {service.pillar.title}</PillLink>}
              </div>
            </aside>
          </div>
        )}
      </Section>
      {related.length > 0 && (
        <Section id="related" eyebrow="Related" title="Related services">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => <ImageCard key={s.id} image={s.image} title={s.title} text={strip(s.description).slice(0, 120)} to={`/services/${s.slug}`} />)}
          </div>
        </Section>
      )}
    </SiteLayout>
  );
}
