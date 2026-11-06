import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ImageCard, PillLink, RollingWord, SectionNav, SiteLayout, useRolling } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import { CardGridSkeleton, Empty } from '../components/States';
import { formatDate, live, useInsights, usePillars, useProjects, useServices, useSettings, useStats } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

const SECTIONS = [
  { id: 'approach', label: 'Approach' },
  { id: 'snapshot', label: 'Snapshot' },
  { id: 'services', label: 'Services' },
  { id: 'insights', label: 'Insights' },
];

const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function Rolling({ words }) {
  const phrases = useMemo(() => words.map((phrase) => ({ phrase })), [words]);
  const { item, hold } = useRolling(phrases);
  return (
    <>
      <span className="sr-only">{words.join(' ')}</span>
      <RollingWord item={item} className="text-accent" {...hold} />
    </>
  );
}

/** Flagship products, overlapping the bottom of the hero. */
function Flagships() {
  const { data } = useProjects();
  const flagships = live(data).filter((p) => p.type === 'flagship').slice(0, 3);
  if (!flagships.length) return null;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {flagships.map((p) => (
        <ImageCard key={p.id} image={p.bg_image || p.image} title={p.title} text={p.tagline} tags={['Flagship']} to={`/projects/${p.slug}`} className="min-h-[18rem]" titleClass="text-2xl" />
      ))}
    </div>
  );
}

export default function Home() {
  const { setting } = useSettings();
  const pillars = usePillars();
  const stats = useStats();
  const services = useServices();
  const insights = useInsights();
  const [category, setCategory] = useState('All');

  const words = setting('hero_rotating_words').split(',').map((w) => w.trim()).filter(Boolean);
  const serviceList = live(services.data);
  const categories = ['All', ...new Set(serviceList.map((s) => s.category).filter(Boolean))];
  const shownServices = category === 'All' ? serviceList : serviceList.filter((s) => s.category === category);
  const latest = live(insights.data).slice(0, 3);

  return (
    <SiteLayout overlay>
      <PageHero
        tall
        media={setting('hero_home_video_1') || setting('hero_home_video_2') || DEFAULT_HERO}
        eyebrow={setting('hero_tagline', 'Design-led web engineering from Nairobi')}
        title={(
          <>
            {setting('hero_title_line1', 'Full-stack web')}
            {words.length > 0 && <Rolling words={words} />}
            <span className="block text-body/80">{setting('hero_title_line2', 'Built end to end.')}</span>
          </>
        )}
        text={setting('hero_subtitle', 'Bespoke, high-performance web applications, robust APIs and clean admin systems, designed and built end to end.')}
        after={<Flagships />}
      >
        <PillLink to="/contact" variant="dark" size="lg">Start a project</PillLink>
        <PillLink to="/projects" variant="glass" size="lg" arrow>View the work</PillLink>
      </PageHero>

      <SectionNav sections={SECTIONS} label="On this page" className="mt-16" />

      <Section
        id="approach"
        eyebrow={setting('vp_section_tagline', 'The approach')}
        title={setting('vp_section_title', 'One continuous build, concept to production')}
        text={setting('vp_section_subtitle')}
      >
        {pillars.isLoading ? <CardGridSkeleton count={3} /> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {live(pillars.data).map((p) => (
              <ImageCard key={p.id} image={p.image} title={p.title} text={strip(p.overview).slice(0, 140)} to={`/our-approach/${p.slug}`} />
            ))}
          </div>
        )}
        <div className="mt-10 text-center"><PillLink to="/our-approach" variant="outline" arrow>Explore the approach</PillLink></div>
      </Section>

      {live(stats.data).length > 0 && (
        <Section id="snapshot" media={setting('bg_home_stats')} eyebrow={setting('stats_tagline', 'Snapshot')} title={setting('stats_title', 'The studio at a glance')}>
          <dl className="grid gap-px overflow-hidden rounded-[2rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {live(stats.data).map((stat) => (
              <div key={stat.id} className="bg-surface/90 p-8 backdrop-blur">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{stat.label}</dt>
                <dd className="mt-4 font-display text-5xl font-extralight tracking-tight text-ink">{stat.value}</dd>
                {stat.description && <dd className="mt-3 text-sm leading-relaxed text-soft">{stat.description}</dd>}
              </div>
            ))}
          </dl>
        </Section>
      )}

      <Section id="services" eyebrow={setting('services_tagline', 'Services')} title={setting('services_title', 'Web applications, designed and built end to end.')}>
        {categories.length > 2 && (
          <div role="group" aria-label="Service categories" className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${category === c ? 'bg-ink text-on-ink' : 'bg-surface text-soft hover:text-ink'}`}>
                {c}
              </button>
            ))}
          </div>
        )}
        {services.isLoading ? <CardGridSkeleton /> : shownServices.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shownServices.map((s) => (
              <ImageCard key={s.id} image={s.image} title={s.title} text={strip(s.description).slice(0, 140)} tags={s.category ? [s.category] : []} to={`/services/${s.slug}`} />
            ))}
          </div>
        ) : <Empty>No services in this category yet.</Empty>}
        <div className="mt-10 text-center"><PillLink to="/services" variant="outline" arrow>All services</PillLink></div>
      </Section>

      <Section id="insights" eyebrow={setting('insights_tagline', 'Insights')} title={setting('insights_title', 'Notes from the work')}>
        {insights.isLoading ? <CardGridSkeleton count={3} /> : latest.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {latest.map((i) => (
              <Link key={i.id} to={`/insights/${i.slug}`} className="group flex flex-col rounded-[1.75rem] border border-line bg-surface p-6 transition-colors hover:border-accent/50">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{i.category || 'Insight'}</div>
                <h3 className="mt-3 !font-display text-xl !font-normal leading-snug !text-ink">{i.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-soft">{strip(i.excerpt || i.content)}</p>
                <div className="mt-auto flex items-center justify-between pt-6 text-xs text-muted">
                  <span>{formatDate(i.published_at || i.created_at)}</span>
                  <ArrowUpRight className="h-4 w-4 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        ) : <Empty>New notes are on the way.</Empty>}
        <div className="mt-10 text-center"><PillLink to="/insights" variant="outline" arrow>All insights</PillLink></div>
      </Section>
    </SiteLayout>
  );
}
