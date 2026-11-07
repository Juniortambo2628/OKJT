import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Building2, Rocket } from 'lucide-react';
import {
  Container, Eyebrow, FeatureExplorer, ImageCard, PillLink, RollingWord, SECTION_OFFSET, SectionHeading, SectionNav, SiteLayout, useRolling,
} from '@okjt/site';
import PageHero, { lines } from '../components/PageHero';
import LogoCarousel from '../components/LogoCarousel';
import { CardGridSkeleton, Empty } from '../components/States';
import { bySector } from '../lib/sectors';
import { principleFor } from '../lib/principles';
import { formatDate, live, useInsights, usePillars, useProjects, useSettings, useStats } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

/** The bar of sections under the hero. */
const SECTIONS = [
  { id: 'approach', label: 'The Approach' },
  { id: 'work', label: 'Work by Sector' },
  { id: 'flagship', label: 'Flagship Products' },
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
        { to: '/services', icon: Building2, title: 'For Organisations', text: 'Platforms for clinics, law firms, builders, event companies and nonprofits, designed and built end to end.' },
        { to: '/projects/flagship', icon: Rocket, title: 'Flagship Products', text: 'Products OKJTechnologies designs, builds and runs itself, each around a whole ecosystem of people.' },
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
              <dd className="font-display text-4xl font-extralight tracking-tight text-ink sm:text-6xl">{stat.value}</dd>
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
      stats: principleFor(p)?.stats ?? [
        [String(i + 1).padStart(2, '0'), `of ${pillars.length} principles`],
        [String(services.length), services.length === 1 ? 'service built on it' : 'services built on it'],
        ['1', 'team, brief to launch'],
      ],
    };
  });
  if (isLoading) return <CardGridSkeleton count={2} className="lg:grid-cols-[1fr_3fr]" />;
  if (!groups.length) return <Empty>The principles will be listed here.</Empty>;
  return <FeatureExplorer groups={groups} href={(g) => `/our-approach/${g.slug}`} linkLabel="Read the Principle" countLabel={(n) => (n === 1 ? 'service' : 'services')} label="Principles" />;
}

/** Client projects grouped by sector, as Naoa's tabbed explorer. */
function SectorExplorer() {
  const { data, isLoading } = useProjects();
  const groups = useMemo(() => bySector(live(data).filter((p) => p.type !== 'flagship')).map((g) => {
    const clients = new Set(g.projects.map((p) => p.client_name || p.title));
    return {
      id: `sector-${g.id}`,
      sector: g.id,
      eyebrow: g.label,
      title: g.line,
      summary: (
        <LinkList
          items={g.projects.map((p) => ({ to: `/projects/${p.slug}`, label: p.client_name && !p.title.includes(p.client_name) ? `${p.title} · ${p.client_name}` : p.title }))}
          more={g.projects.length > 5 && <div className="mt-2 px-3 text-xs text-muted">and {g.projects.length - 5} more</div>}
        />
      ),
      features: g.projects,
      stats: [
        [String(g.projects.length), g.projects.length === 1 ? 'platform built' : 'platforms built'],
        [String(clients.size), clients.size === 1 ? 'organisation served' : 'organisations served'],
        ['Live', 'in daily use'],
      ],
    };
  }), [data]);
  if (isLoading) return <CardGridSkeleton count={2} className="lg:grid-cols-[1fr_3fr]" />;
  if (!groups.length) return <Empty>Projects will be listed here.</Empty>;
  return <FeatureExplorer groups={groups} href={(g) => `/projects?sector=${g.sector}#clients`} linkLabel="See the Sector’s Work" countLabel={(n) => (n === 1 ? 'project' : 'projects')} label="Sectors" />;
}

/** The products OKJTechnologies builds and runs itself: one wide, the rest in pairs. */
function Flagships() {
  const { data, isLoading } = useProjects();
  const flagships = live(data).filter((p) => p.type === 'flagship');
  if (isLoading) return <CardGridSkeleton count={2} className="lg:grid-cols-2" />;
  if (!flagships.length) return <Empty>Flagship products will be listed here.</Empty>;
  const [lead, ...rest] = [...flagships.filter((p) => p.is_featured), ...flagships.filter((p) => !p.is_featured)];
  const card = (p, className, titleClass = 'text-3xl sm:text-4xl') => (
    <ImageCard
      key={p.id}
      to={`/projects/${p.slug}`}
      image={p.bg_image || p.image}
      tags={['Flagship', p.category?.split(/[,/]/)[0]?.trim()].filter(Boolean)}
      title={p.title}
      text={p.tagline}
      className={className}
      titleClass={titleClass}
    >
      {p.significant_figure && <div className="mt-4 font-display text-2xl font-extralight text-accent">{p.significant_figure}</div>}
    </ImageCard>
  );
  return (
    <>
      {card(lead, 'min-h-[30rem]', 'text-3xl sm:text-5xl')}
      {rest.length > 0 && <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{rest.map((p) => card(p, 'min-h-[22rem]', 'text-2xl sm:text-3xl'))}</div>}
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
        text={<LogoCarousel />}
        after={<HeroPanel />}
      >
        <PillLink to="/contact" variant="dark" size="lg">Start a Project</PillLink>
        <PillLink to="/projects" variant="glass" size="lg" arrow>View the Work</PillLink>
      </PageHero>

      <Facts />

      <SectionNav label="On this page" sections={SECTIONS} />

      <section id="approach" className={`${SECTION_OFFSET} pt-24`}>
        <Container>
          <SectionHeading
            eyebrow={setting('vp_section_tagline', 'The Approach')}
            title={setting('vp_section_title', 'One continuous build, concept to production')}
            text={setting('vp_section_subtitle', 'Pick a principle to see what it means in practice, and the services built on it.')}
          />
          <div className="mt-14"><ApproachExplorer /></div>
        </Container>
      </section>

      <section id="work" className={`${SECTION_OFFSET} pt-24`}>
        <Container>
          <SectionHeading
            eyebrow="The work"
            title={setting('work_title', 'Web applications, designed and built end to end')}
            text="Pick a sector to see the platforms built for it, then read each case study."
          />
          <div className="mt-14"><SectorExplorer /></div>
          <div className="mt-10 text-center"><PillLink to="/projects" variant="outline" arrow>Every Project</PillLink></div>
        </Container>
      </section>

      <section id="flagship" className={`${SECTION_OFFSET} pt-24`}>
        <Container>
          <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
            <SectionHeading align="left" eyebrow="Flagship Products" title="Built and run by OKJTechnologies" className="!max-w-none" />
            <div className="lg:pb-2">
              <p className="max-w-md text-soft">Products of our own, each designed around a whole ecosystem of people: the users, the businesses beside them and the community they serve.</p>
              <PillLink to="/projects/flagship" variant="outline" className="mt-6" arrow>How Flagship Products Are Built</PillLink>
            </div>
          </div>
          <Flagships />
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
          <div className="mt-10 text-center"><PillLink to="/insights" variant="outline" arrow>All Insights</PillLink></div>
        </Container>
      </section>
    </SiteLayout>
  );
}
