import JourneyPage from '../components/Journey';
import { live, screenOf, usePillars, useProjects, useServices, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';
import { address, clip, listItems, strip } from '../lib/text';
import { principleFor, standoutProjects } from '../lib/principles';

/** The principles, one chapter each, with the services built on them. */
export default function Approach() {
  const { setting } = useSettings();
  const { data, isLoading } = usePillars();
  const { data: services } = useServices();
  const { data: projects } = useProjects();
  const pillars = live(data);
  const flagship = live(projects).find((p) => p.type === 'flagship' && (screenOf(p)));

  const shown = new Set();
  const chapters = pillars.map((p, i) => {
    const principle = principleFor(p);
    const ownList = listItems(p.content);
    const picks = standoutProjects(principle, live(projects), 3, shown);
    picks.forEach((x) => shown.add(x.id));
    const pictured = picks.find((x) => screenOf(x));
    const services = live(p.services);
    return {
      id: p.slug,
      navLabel: p.title,
      when: `Principle ${i + 1} of ${pillars.length}`,
      title: p.title,
      intro: [clip(p.overview, 160), ownList.length ? '' : clip(strip(p.content), 260)].filter(Boolean).join(' '),
      media: { src: p.image || screenOf(pictured), url: address(`/our-approach/${p.slug}`) },
      steps: ownList.length ? ownList.map((item) => ({ title: item })) : (principle?.points ?? []),
      details: [...(principle?.receive ?? []), ...services.map((sv) => `Service: ${sv.title}`)],
      detailsLabel: 'What you receive',
      showcase: picks.map((x) => ({ to: `/projects/${x.slug}`, image: screenOf(x), title: x.title, text: x.client_name || x.tagline })),
    };
  });

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: setting('hero_products_media') || DEFAULT_HERO,
        eyebrow: 'Approach',
        title: 'How the work <br />gets done.',
        text: setting('vp_section_subtitle', 'Six principles guide every project, from the first sketch to a platform that keeps growing.'),
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'Our Approach' }],
        cta: { to: '/contact', label: 'Start a Project' },
        secondary: { to: '/services', label: 'Every Service' },
      }}
      glance={[
        [String(pillars.length), 'principles behind every build'],
        [String(live(services).length), 'services built on them'],
        ['1', 'team from brief to launch'],
        ['0', 'hand-offs between stages'],
      ]}
      label="The principles"
      chapters={chapters}
      toolkit={{
        eyebrow: 'In depth',
        title: 'Each principle, on its own page',
        text: 'Open one to read it in full, with the services that put it into practice.',
        cards: pillars.slice(0, 4).map((p) => ({ to: `/our-approach/${p.slug}`, image: p.image, tags: ['Principle'], title: p.title, text: clip(p.overview, 140) })),
      }}
      onward={{ to: '/projects', image: screenOf(flagship), tags: ['The work'], title: 'See the principles at work', text: 'Platforms designed and built for clients across health, law, construction, events, commerce and nonprofits.' }}
    />
  );
}
