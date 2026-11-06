import JourneyPage from '../components/Journey';
import { live, useClients, useProjects, useSettings, useStats, useTestimonials } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';
import { bySector, sectorOf, sectorPhoto } from '../lib/sectors';
import { address, clip } from '../lib/text';

/** Platforms in daily use, what clients say, and who they are. */
export default function ClientImpact() {
  const { setting } = useSettings();
  const { data: projects, isLoading } = useProjects();
  const { data: testimonials } = useTestimonials();
  const { data: clients } = useClients();
  const { data: stats } = useStats();
  const clientWork = live(projects).filter((p) => p.type !== 'flagship');
  const featured = clientWork.filter((p) => p.is_featured);
  const shown = (featured.length ? featured : clientWork).slice(0, 6);
  const pictured = shown.find((p) => p.bg_image || p.image);
  const quotes = live(testimonials);
  const orgs = live(clients);

  const chapters = [
    shown.length > 0 && {
      id: 'in-use',
      when: 'Every day',
      title: 'Platforms in daily use',
      intro: 'Clinics, law firms, workshops, event companies and nonprofits run on these.',
      media: { src: pictured?.bg_image || pictured?.image, url: address('/client-impact') },
      steps: shown.map((p) => ({ title: p.client_name && !p.title.includes(p.client_name) ? `${p.title} · ${p.client_name}` : p.title, text: clip(p.tagline || p.description, 140), to: `/projects/${p.slug}` })),
      details: [...new Set(shown.map((p) => sectorOf(p).label))],
      detailsLabel: 'Sectors',
    },
    quotes.length > 0 && {
      id: 'in-their-words',
      when: `${quotes.length} ${quotes.length === 1 ? 'client' : 'clients'}`,
      title: 'In their words',
      intro: 'What clients say about working together, in their own words.',
      media: setting('bg_client_impact_testimonials') ? { src: setting('bg_client_impact_testimonials'), url: address('/client-impact#in-their-words') } : undefined,
      steps: quotes.map((t) => ({ title: `“${t.quote}”`, text: [t.name, t.role, t.company].filter(Boolean).join(', ') })),
    },
    orgs.length > 0 && {
      id: 'clients',
      when: `${orgs.length} organisations`,
      title: 'Organisations served',
      intro: 'Some of the organisations the studio has designed and built for.',
      media: setting('bg_client_impact_clients') ? { src: setting('bg_client_impact_clients'), url: address('/client-impact#clients') } : undefined,
      steps: orgs.map((c) => ({ title: c.name, text: c.category || undefined })),
      tip: 'Every brief is mapped against the people the platform serves before anything is built.',
      tipLabel: 'How the work starts',
    },
  ].filter(Boolean);

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: setting('hero_client_impact_media') || DEFAULT_HERO,
        eyebrow: 'Client Impact',
        title: 'Work that clients rely on.',
        text: 'Platforms in daily use by clinics, law firms, workshops, event companies and nonprofits, with clients’ own words where they have shared them.',
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'Client Impact' }],
        cta: { to: '/contact', label: 'Start a Project' },
        secondary: { to: '/projects', label: 'Every Project' },
      }}
      glance={live(stats).length ? live(stats).slice(0, 4).map((s) => [s.value, s.label]) : [
        [String(clientWork.length), 'client platforms'],
        [String(orgs.length), 'organisations'],
        [String(quotes.length), 'testimonials'],
      ]}
      label="The impact"
      chapters={chapters}
      toolkit={{
        eyebrow: 'By sector',
        title: 'The work, sector by sector',
        cards: bySector(clientWork).slice(0, 4).map((g) => ({ to: `/projects#sector-${g.id}`, image: sectorPhoto(g), tags: [g.label, `${g.projects.length} platforms`], title: g.label, text: g.line })),
      }}
      onward={{ to: '/contact', tags: ['Next step'], title: 'Your platform next?', text: 'Share a short brief. Every brief receives a reply with next steps.' }}
    />
  );
}
