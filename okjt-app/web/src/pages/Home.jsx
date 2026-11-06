import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Building2, Rocket } from 'lucide-react';
import {
  Container, Eyebrow, FeatureExplorer, ImageCard, PillLink, RollingWord, SECTION_OFFSET, SectionHeading, SectionNav, SiteLayout, useRolling,
} from '@okjt/site';
import PageHero, { lines } from '../components/PageHero';
import { CardGridSkeleton, Empty } from '../components/States';
import { categorySlug } from '../site.config';
import { formatDate, live, useInsights, usePillars, useProjects, useServices, useSettings, useStats } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

/** The bar of sections under the hero. */
const SECTIONS = [
  { id: 'approach', label: 'The approach' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'work', label: 'The work' },
  { id: 'insights', label: 'Insights' },
];

const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const firstSentence = (text) => (strip(text).match(/^.*?[.!?](\s|$)/)?.[0] || strip(text)).trim();

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

/**
 * "About OKJTech" overlapping the hero: Naoa's bento of frosted glass. The
 * studio in a sentence, two ways in, and two flagship products as photo cards.
 */
function HeroPanel() {
  const { setting } = useSettings();
  const { data } = useProjects();
  const projects = live(data);
  const flagships = projects.filter((p) => p.type === 'flagship');
  const [wide, narrow] = flagships.length >= 2 ? flagships : [...flagships, ...projects.filter((p) => p.type !== 'flagship')];
  const story = setting('about_story', 'OKJTechnologies is a web engineering studio in Nairobi. It takes projects from first idea to a live, supported platform: planning, interface design, engineering, launch and ongoing administration.');

  return (
    <div className="glass-strong grid gap-4 rounded-[2rem] p-4 sm:p-5 lg:grid-cols-4">
      <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-tone-100/80 to-paper/40 p-6 sm:p-8 lg:col-span-2">
        <Eyebrow>About OKJTech</Eyebrow>
        <h2 className="mt-6 !font-display text-4xl !font-light leading-[1.02] tracking-tight !text-ink sm:text-5xl">
          {lines(setting('about_title', 'Design-led web engineering,\nbuilt around the people it serves.'))}
        </h2>
        <div className="mt-6 max-w-md text-sm leading-relaxed text-soft">{firstSentence(story)} {strip(story).slice(firstSentence(story).length).split('. ')[0]}.</div>
      </div>
      {[
        { to: '/services', icon: Building2, title: 'For organisations', text: 'Platforms for clinics, law firms, builders, event companies and nonprofits, designed and built end to end.' },
        { to: '/projects/flagship', icon: Rocket, title: 'Flagship products', text: 'Products OKJTechnologies designs, builds and runs itself, each around a whole ecosystem of people.' },
      ].map(({ to, icon: Icon, title, text }) => (
        <Link key={to} to={to} className="glass group flex min-h-[14rem] flex-col justify-between rounded-3xl p-6 transition-colors hover:border-accent/40">
          <div className="flex items-start justify-between">
            <h3 className="!font-display text-2xl !font-normal leading-tight !text-ink">{title}</h3>
            <ArrowUpRight className="h-5 w-5 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
          <div>
            <Icon className="h-5 w-5 text-accent-soft" aria-hidden="true" />
            <div className="mt-3 text-sm leading-relaxed text-soft">{text}</div>
          </div>
        </Link>
      ))}
      {wide && (
        <ImageCard image={wide.bg_image || wide.image} title={wide.title} text={wide.tagline} tags={[wide.type === 'flagship' ? 'Flagship' : wide.client_name].filter(Boolean)} to={`/projects/${wide.slug}`} className={`min-h-[18rem] ${narrow ? 'lg:col-span-3' : 'lg:col-span-4'}`} />
      )}
      {narrow && (
        <ImageCard image={narrow.bg_image || narrow.image} title={narrow.title} text={narrow.tagline} to={`/projects/${narrow.slug}`} className="min-h-[18rem]" />
      )}
    </div>
  );
}

/** The studio's numbers in a strip of hairline-divided cells. */
function Facts() {
  const { data } = useStats();
  const stats = live(data).slice(0, 4);
  if (!stats.length) return null;
  return (
    <section className="py-24">
      <Container>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col-reverse justify-end bg-tint p-6 sm:p-8">
              <dt className="mt-2 text-sm text-soft">{stat.label}{stat.description && <span className="mt-1 block text-xs text-muted">{stat.description}</span>}</dt>
              <dd className="font-display text-5xl font-extralight tracking-tight text-ink sm:text-6xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

/** A list of links inside a tab's glass card. */
function LinkList({ items, more }) {
  return (
    <>
      <ul className="mt-4 space-y-1.5">
        {items.slice(0, 5).map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="group/link flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-fill">
              <span className="truncate">{item.label}</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-accent opacity-60 group-hover/link:opacity-100" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      {more}
    </>
  );
}

/** The approach pillars as Naoa's tabbed explorer. */
function ApproachExplorer() {
  const { data, isLoading } = usePillars();
  const pillars = live(data);
  const groups = pillars.map((p, i) => {
    const services = live(p.services);
    return {
      id: `pillar-${p.slug}`,
      slug: p.slug,
      eyebrow: p.title,
      title: firstSentence(p.overview) || p.title,
      summary: (
        <>
          <p>{strip(p.content || p.overview).slice(0, 220)}</p>
          {services.length > 0 && <LinkList items={services.map((s) => ({ to: `/services/${s.slug}`, label: s.title }))} />}
        </>
      ),
      features: services,
      stats: [
        [String(i + 1).padStart(2, '0'), `of ${pillars.length} principles`],
        services.length > 0 ? [String(services.length), services.length === 1 ? 'service built on it' : 'services built on it'] : ['Every', 'project, every stage'],
        ['1', 'team, brief to launch'],
      ],
    };
  });
  if (isLoading) return <CardGridSkeleton count={2} className="lg:grid-cols-[1fr_3fr]" />;
  if (!groups.length) return <Empty>The principles will be listed here.</Empty>;
  return <FeatureExplorer groups={groups} href={(g) => `/our-approach/${g.slug}`} linkLabel="Read the principle" countLabel="services" label="Principles" />;
}

/** The services, grouped by category, as Naoa's tabbed explorer. */
function CapabilitiesExplorer() {
  const { data, isLoading } = useServices();
  const groups = useMemo(() => {
    const map = new Map();
    for (const s of live(data)) {
      const id = `cat-${categorySlug(s.category)}`;
      if (!map.has(id)) map.set(id, { id, category: s.category || 'Services', items: [] });
      map.get(id).items.push(s);
    }
    return [...map.values()].map((g) => ({
      id: g.id,
      category: g.category,
      eyebrow: g.category,
      title: g.items[0] ? firstSentence(g.items[0].description) || g.category : g.category,
      summary: <LinkList items={g.items.map((s) => ({ to: `/services/${s.slug}`, label: s.title }))} more={g.items.length > 5 && <div className="mt-2 px-3 text-xs text-muted">and {g.items.length - 5} more</div>} />,
      features: g.items,
      stats: [[String(g.items.length), g.items.length === 1 ? 'service' : 'services'], ['End to end', 'design to launch'], ['Nairobi', 'designed and built']],
    }));
  }, [data]);
  if (isLoading) return <CardGridSkeleton count={2} className="lg:grid-cols-[1fr_3fr]" />;
  if (!groups.length) return <Empty>The services will be listed here.</Empty>;
  return <FeatureExplorer groups={groups} href={(g) => `/services?category=${encodeURIComponent(g.category)}`} linkLabel="See these services" countLabel="services" label="Service categories" />;
}

/** Two large photo cards and a wide one: the latest client work and products. */
function Work() {
  const { data, isLoading } = useProjects();
  const projects = live(data);
  const client = projects.filter((p) => p.type !== 'flagship');
  const picks = [...client.filter((p) => p.is_featured), ...client.filter((p) => !p.is_featured)].slice(0, 3);
  if (isLoading) return <CardGridSkeleton count={2} className="lg:grid-cols-2" />;
  if (!picks.length) return <Empty>Projects will be listed here.</Empty>;
  const [a, b, c] = picks;
  const card = (p, className) => (
    <ImageCard key={p.id} to={`/projects/${p.slug}`} image={p.bg_image || p.image} tags={[p.client_name, p.category].filter(Boolean).slice(0, 2)} title={p.title} text={p.tagline} className={className} titleClass="text-3xl sm:text-5xl" />
  );
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        {card(a, 'min-h-[30rem]')}
        {b && card(b, 'min-h-[30rem]')}
      </div>
      {c && card(c, 'mt-5 min-h-[24rem]')}
    </>
  );
}

export default function Home() {
  const { setting } = useSettings();
  const insights = useInsights();
  const words = setting('hero_rotating_words').split(',').map((w) => w.trim()).filter(Boolean);
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
        after={<HeroPanel />}
      >
        <PillLink to="/contact" variant="dark" size="lg">Start a project</PillLink>
        <PillLink to="/projects" variant="glass" size="lg" arrow>View the work</PillLink>
      </PageHero>

      <Facts />

      <SectionNav label="On this page" sections={SECTIONS} />

      <section id="approach" className={`${SECTION_OFFSET} pt-24`}>
        <Container>
          <SectionHeading
            eyebrow={setting('vp_section_tagline', 'The approach')}
            title={setting('vp_section_title', 'One continuous build, concept to production')}
            text={setting('vp_section_subtitle', 'Pick a principle to see what it means in practice, and the services built on it.')}
          />
          <div className="mt-14"><ApproachExplorer /></div>
        </Container>
      </section>

      <section id="capabilities" className={`${SECTION_OFFSET} pt-24`}>
        <Container>
          <SectionHeading
            eyebrow={setting('services_tagline', 'Services')}
            title={setting('services_title', 'Tailored technical capabilities')}
            text="Pick an area to see the services in it, then read every detail."
          />
          <div className="mt-14"><CapabilitiesExplorer /></div>
          <div className="mt-10 text-center"><PillLink to="/services" variant="outline" arrow>All services</PillLink></div>
        </Container>
      </section>

      <section id="work" className={`${SECTION_OFFSET} pt-24`}>
        <Container>
          <SectionHeading eyebrow="The work" title="Platforms people rely on every day" />
          <div className="mt-14"><Work /></div>
          <div className="mt-10 text-center"><PillLink to="/projects" variant="outline" arrow>Every project</PillLink></div>
        </Container>
      </section>

      <section id="insights" className={`${SECTION_OFFSET} py-24`}>
        <Container>
          <SectionHeading eyebrow={setting('insights_tagline', 'Insights')} title={setting('insights_title', 'Notes from the work')} />
          <div className="mt-14">
            {insights.isLoading ? <CardGridSkeleton count={3} /> : latest.length ? (
              <ol className="grid gap-4 md:grid-cols-3">
                {latest.map((i, n) => (
                  <li key={i.id}>
                    <Link to={`/insights/${i.slug}`} className="glass group flex h-full flex-col rounded-3xl p-6 transition-colors hover:border-accent/40">
                      <div className="font-display text-4xl font-extralight text-accent-soft">{String(n + 1).padStart(2, '0')}</div>
                      <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{i.category || 'Insight'}</div>
                      <h3 className="mt-2 !font-sans text-base !font-semibold !text-ink">{i.title}</h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-soft">{strip(i.excerpt || i.content)}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted">
                        <span>{formatDate(i.published_at || i.created_at)}</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-accent-strong">Read <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : <Empty>New notes are on the way.</Empty>}
          </div>
          <div className="mt-10 text-center"><PillLink to="/insights" variant="outline" arrow>All insights</PillLink></div>
        </Container>
      </section>
    </SiteLayout>
  );
}
