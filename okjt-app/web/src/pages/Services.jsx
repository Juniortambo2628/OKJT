import { useMemo } from 'react';
import JourneyPage from '../components/Journey';
import { categorySlug } from '../site.config';
import { live, usePillars, useProjects, useServices, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';
import { address, clip } from '../lib/text';

/** Every service, a chapter per category. */
export default function Services() {
  const { setting } = useSettings();
  const { data, isLoading } = useServices();
  const { data: pillars } = usePillars();
  const { data: projects } = useProjects();
  const services = live(data);

  const groups = useMemo(() => {
    const map = new Map();
    for (const s of services) {
      const id = categorySlug(s.category);
      if (!map.has(id)) map.set(id, { id, title: s.category || 'Services', items: [] });
      map.get(id).items.push(s);
    }
    return [...map.values()];
  }, [services]);

  const chapters = groups.map((g) => {
    const pictured = g.items.find((s) => s.image);
    const pillarNames = [...new Set(g.items.map((s) => s.pillar?.title).filter(Boolean))];
    return {
      id: g.id,
      navLabel: g.title,
      when: `${g.items.length} ${g.items.length === 1 ? 'service' : 'services'}`,
      title: g.title,
      intro: clip(g.items[0]?.description, 200),
      media: { src: pictured?.image || setting(`bg_services_${g.id.replace(/-/g, '_')}`), url: address(`/services?category=${encodeURIComponent(g.title)}`) },
      steps: g.items.map((s) => ({ title: s.title, text: clip(s.description, 140), to: `/services/${s.slug}` })),
      details: pillarNames.length ? pillarNames.map((name) => `Built on the principle: ${name}`) : undefined,
      detailsLabel: 'Where it comes from',
    };
  });
  const flagship = live(projects).find((p) => p.type === 'flagship' && (p.bg_image || p.image));

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: setting('hero_services_media') || DEFAULT_HERO,
        eyebrow: 'Services',
        title: setting('services_title', 'Web applications, designed and built end to end.'),
        text: setting('services_subtitle', 'Each service covers a part of the same journey: shaping the idea, designing the experience, building the platform and keeping it running.'),
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'Services' }],
        cta: { to: '/contact', label: 'Discuss a Project' },
        secondary: { to: '/projects', label: 'See the Work' },
      }}
      glance={[
        [String(services.length), 'services'],
        [String(groups.length), groups.length === 1 ? 'area of work' : 'areas of work'],
        [String(live(pillars).length), 'principles behind them'],
        ['1', 'team from brief to launch'],
      ]}
      label="The services"
      chapters={chapters}
      toolkit={{
        eyebrow: 'The Approach',
        title: 'The principles behind the services',
        text: 'Every service is shaped by the same principles. Open one to see how.',
        cards: live(pillars).slice(0, 4).map((p) => ({ to: `/our-approach/${p.slug}`, image: p.image, tags: ['Principle'], title: p.title, text: clip(p.overview, 140) })),
      }}
      onward={{ to: '/projects', image: flagship?.bg_image || flagship?.image, tags: ['The work'], title: 'The services, at work', text: 'Case studies of the platforms designed, built and run for clients and as flagship products.' }}
    />
  );
}
