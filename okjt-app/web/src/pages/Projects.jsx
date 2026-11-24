import JourneyPage from '../components/Journey';
import { live, useProjects, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';
import { bySector, sectorPhoto, sectorScreen } from '../lib/sectors';
import { address, clip, strip } from '../lib/text';

const shortSector = (p) => p.category?.split(/[,/]/)[0]?.trim();

/**
 * The work. All projects: a chapter per sector of client work, then the
 * flagship products as the toolkit. `flagship`: a chapter per product.
 */
export default function Projects({ flagship = false }) {
  const { setting } = useSettings();
  const { data, isLoading } = useProjects();
  const all = live(data);
  const products = all.filter((p) => p.type === 'flagship');
  const clients = all.filter((p) => p.type !== 'flagship');
  const sectors = bySector(clients);
  const organisations = new Set(clients.map((p) => p.client_name || p.title)).size;

  const chapters = flagship
    ? products.map((p) => ({
      id: p.slug,
      navLabel: p.title,
      when: shortSector(p) || 'Flagship',
      title: p.title,
      intro: p.tagline || clip(p.description, 220),
      media: { src: p.bg_image || p.image, url: p.url?.replace(/^https?:\/\//, '') || address(`/projects/${p.slug}`) },
      steps: [
        p.problem && { title: 'The opportunity', text: clip(p.problem, 180) },
        p.methodology && { title: 'What was built', text: clip(p.methodology, 180) },
        p.outcome && { title: 'The outcome', text: clip(p.outcome, 180) },
        { title: 'Read the case study', to: `/projects/${p.slug}` },
      ].filter(Boolean),
      stack: p.technologies,
      tip: p.significant_figure ? `${p.significant_figure}.` : undefined,
      tipLabel: 'Impact',
    }))
    : sectors.map((g) => ({
      id: `sector-${g.id}`,
      navLabel: g.label,
      when: `${g.projects.length} ${g.projects.length === 1 ? 'platform' : 'platforms'}`,
      title: g.label,
      intro: g.line,
      media: { src: sectorScreen(g), url: address(`/projects?sector=${g.id}`) },
      steps: g.projects.map((p) => ({
        title: p.client_name && !p.title.includes(p.client_name) ? `${p.title} · ${p.client_name}` : p.title,
        text: clip(p.tagline || p.description, 140),
        to: `/projects/${p.slug}`,
      })),
      stack: g.projects.flatMap((p) => p.technologies ?? []),
    }));

  const lead = products.find((p) => p.bg_image || p.image);
  const clientLead = clients.find((p) => p.is_featured && (p.bg_image || p.image)) || clients.find((p) => p.bg_image || p.image);

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: setting('hero_projects_media') || DEFAULT_HERO,
        eyebrow: flagship ? 'Flagship Products' : 'Portfolio',
        title: flagship ? 'Products built <br />from the ground up.' : 'Real platforms, <br />built end to end.',
        text: flagship
          ? 'Flagship products developed by OKJTechnologies, each designed around a whole ecosystem of users and partners.'
          : 'Web platforms for health, law, construction, events, commerce and nonprofits. Each project shows the opportunity it responds to and what was built.',
        breadcrumbs: flagship ? [{ to: '/', label: 'Home' }, { to: '/projects', label: 'Projects' }, { label: 'Flagship' }] : [{ to: '/', label: 'Home' }, { label: 'Projects' }],
        cta: { to: '/contact', label: 'Start a Project' },
        secondary: flagship ? { to: '/projects', label: 'Client Work' } : { to: '/projects/flagship', label: 'Flagship Products' },
      }}
      glance={flagship ? [
        [String(products.length), 'flagship products'],
        [String(new Set(products.map(shortSector).filter(Boolean)).size), 'sectors'],
        [String(new Set(products.flatMap((p) => p.technologies ?? [])).size), 'technologies'],
        ['1', 'team behind them'],
      ] : [
        [String(all.length), 'platforms built'],
        [String(sectors.length), 'sectors'],
        [String(organisations), 'organisations served'],
        [String(products.length), 'flagship products'],
      ]}
      label={flagship ? 'The products' : 'Work by Sector'}
      chapters={chapters}
      toolkit={flagship ? {
        eyebrow: 'Client Work',
        navLabel: 'Client Work',
        title: 'Platforms built for clients',
        text: 'The same team, the same principles, for organisations across every sector.',
        cards: sectors.slice(0, 4).map((g) => ({ to: `/projects#sector-${g.id}`, image: sectorPhoto(g), tags: [g.label, `${g.projects.length} platforms`], title: g.label, text: g.line })),
      } : {
        eyebrow: 'Flagship Products',
        navLabel: 'Flagship',
        title: 'Built and run by OKJTechnologies',
        text: 'Products of our own, each designed around a whole ecosystem of people.',
        cards: products.slice(0, 4).map((p) => ({ to: `/projects/${p.slug}`, image: p.bg_image || p.image, tags: ['Flagship', shortSector(p)], title: p.title, text: p.tagline || clip(strip(p.description), 140) })),
      }}
      onward={flagship
        ? { to: '/client-impact', image: clientLead?.bg_image || clientLead?.image, tags: ['Client Impact'], title: 'Work that clients rely on', text: 'Platforms in daily use, with clients’ own words where they have shared them.' }
        : { to: '/projects/flagship', image: lead?.bg_image || lead?.image, tags: ['Flagship'], title: 'How Flagship Products Are Built', text: 'Every product, its opportunity, what was built and what it changed.' }}
    />
  );
}
