import { useParams } from 'react-router-dom';
import JourneyPage from '../components/Journey';
import usePageMeta from '../components/usePageMeta';
import { live, useItem, usePillars, useProjects } from '../lib/content';
import { principleFor, standoutProjects } from '../lib/principles';
import { address, clip, listItems, sectionsOf, slugify } from '../lib/text';
import NotFound from './NotFound';

/** One principle: its text in chapters, then the services built on it. */
export default function PillarDetail() {
  const { slug } = useParams();
  const { data: pillar, isLoading, error } = useItem(`/pillars/${slug}`);
  const { data: all } = usePillars();
  const { data: projects } = useProjects();
  usePageMeta(pillar?.title, pillar?.overview);
  if (error?.response?.status === 404) return <NotFound />;
  const others = live(all).filter((p) => p.id !== pillar?.id);
  const services = live(pillar?.services);
  const parts = sectionsOf(pillar?.content || '');

  const chapters = [
    ...parts.map((part, i) => ({
      id: part.title ? slugify(part.title) : 'principle',
      when: i === 0 ? 'The principle' : undefined,
      title: part.title || pillar?.title || '',
      intro: i === 0 && !part.title ? clip(pillar?.overview, 240) : undefined,
      body: part.body,
      media: i === 0 && pillar?.image ? { src: pillar.image, url: address(`/our-approach/${slug}`) } : undefined,
    })),
    pillar && principleFor(pillar) && !listItems(pillar.content).length && {
      id: 'what-goes-in',
      when: 'In practice',
      title: principleFor(pillar).lead,
      steps: principleFor(pillar).points,
      details: principleFor(pillar).receive,
      detailsLabel: 'What you receive',
      media: (() => { const x = standoutProjects(principleFor(pillar), live(projects), 1)[0]; return x ? { src: x.bg_image || x.image, url: address(`/projects/${x.slug}`) } : undefined; })(),
    },
    pillar && principleFor(pillar) && {
      id: 'standout',
      when: 'The work',
      title: 'Standout projects',
      intro: `Projects where ${pillar.title.toLowerCase()} made the difference.`,
      steps: standoutProjects(principleFor(pillar), live(projects), 5).map((x) => ({ title: x.title, text: clip(x.tagline || x.description, 140), to: `/projects/${x.slug}` })),
    },
    services.length > 0 && {
      id: 'in-practice',
      when: 'In practice',
      title: `Services built on ${pillar?.title?.toLowerCase() || 'it'}`,
      intro: 'Where this principle shows up in the work.',
      steps: services.map((s) => ({ title: s.title, text: clip(s.description, 140), to: `/services/${s.slug}` })),
    },
  ].filter(Boolean);
  if (pillar && !chapters.length) chapters.push({ id: 'principle', when: 'The principle', title: pillar.title, intro: pillar.overview, media: pillar.image ? { src: pillar.image, url: address(`/our-approach/${slug}`) } : undefined });

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: pillar?.image,
        eyebrow: 'Approach',
        title: pillar?.title || '',
        text: clip(pillar?.overview, 220),
        breadcrumbs: [{ to: '/', label: 'Home' }, { to: '/our-approach', label: 'Our Approach' }, { label: pillar?.title || '…' }],
        cta: { to: '/contact', label: 'Start a Project' },
        secondary: { to: '/our-approach', label: 'All Principles' },
      }}
      glance={pillar ? [
        [String(live(all).findIndex((p) => p.id === pillar.id) + 1).padStart(2, '0'), `of ${live(all).length} principles`],
        [String(services.length), services.length === 1 ? 'service built on it' : 'services built on it'],
        ['1', 'team from brief to launch'],
      ] : []}
      label="The principle"
      chapters={chapters}
      toolkit={{
        eyebrow: 'The other principles',
        title: 'How the rest of the work gets done',
        cards: others.slice(0, 4).map((p) => ({ to: `/our-approach/${p.slug}`, image: p.image, tags: ['Principle'], title: p.title, text: clip(p.overview, 140) })),
      }}
      onward={{ to: '/contact', tags: ['Next step'], title: 'Have a platform in mind?', text: 'Share a short brief. Every brief receives a reply with next steps.' }}
    />
  );
}
