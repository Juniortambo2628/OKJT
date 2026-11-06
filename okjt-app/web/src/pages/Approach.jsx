import JourneyPage from '../components/Journey';
import { live, usePillars, useProjects, useServices, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';
import { address, clip, listItems } from '../lib/text';

/** The principles, one chapter each, with the services built on them. */
export default function Approach() {
  const { setting } = useSettings();
  const { data, isLoading } = usePillars();
  const { data: services } = useServices();
  const { data: projects } = useProjects();
  const pillars = live(data);
  const flagship = live(projects).find((p) => p.type === 'flagship' && (p.bg_image || p.image));

  const chapters = pillars.map((p, i) => ({
    id: p.slug,
    navLabel: p.title,
    when: `Principle ${i + 1} of ${pillars.length}`,
    title: p.title,
    intro: clip(p.overview, 220),
    body: listItems(p.content).length ? null : p.content,
    media: p.image ? { src: p.image, url: address(`/our-approach/${p.slug}`) } : undefined,
    steps: live(p.services).length
      ? live(p.services).map((s) => ({ title: s.title, text: clip(s.description, 140), to: `/services/${s.slug}` }))
      : listItems(p.content).map((item) => ({ title: item })),
  }));

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: setting('hero_products_media') || DEFAULT_HERO,
        eyebrow: 'Approach',
        title: 'How the work <br />gets done.',
        text: setting('vp_section_subtitle', 'Six principles guide every project, from the first sketch to a platform that keeps growing.'),
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'Our approach' }],
        cta: { to: '/contact', label: 'Start a project' },
        secondary: { to: '/services', label: 'Every service' },
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
      onward={{ to: '/projects', image: flagship?.bg_image || flagship?.image, tags: ['The work'], title: 'See the principles at work', text: 'Platforms designed and built for clients across health, law, construction, events, commerce and nonprofits.' }}
    />
  );
}
