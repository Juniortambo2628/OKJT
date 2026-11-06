import { useParams } from 'react-router-dom';
import JourneyPage from '../components/Journey';
import usePageMeta from '../components/usePageMeta';
import { live, useItem, useServices } from '../lib/content';
import { address, clip, listItems, sectionsOf, slugify } from '../lib/text';
import { HOW_IT_STARTS } from '../lib/faqs';
import NotFound from './NotFound';

export default function ServiceDetail() {
  const { slug } = useParams();
  const { data: service, isLoading, error } = useItem(`/services/${slug}`);
  const { data: all } = useServices();
  usePageMeta(service?.title, service?.description);
  if (error?.response?.status === 404) return <NotFound />;
  const related = live(all).filter((s) => s.id !== service?.id && (service?.pillar_id ? s.pillar_id === service.pillar_id : s.category === service?.category));
  const parts = sectionsOf(service?.content || '');

  const chapters = service ? [
    {
      id: 'overview',
      when: service.category || 'Service',
      title: 'What it is',
      intro: clip(service.description, 300),
      body: parts[0] && !parts[0].title ? parts[0].body : undefined,
      media: { src: service.image, url: address(`/services/${slug}`) },
      steps: listItems(parts[0]?.body).map((item) => ({ title: item })),
    },
    ...parts.filter((p) => p.title).map((p) => ({ id: slugify(p.title), title: p.title, body: p.body })),
    {
      id: 'how-it-starts',
      when: 'Next step',
      title: 'How a project starts',
      intro: 'Every engagement follows the same short path from brief to proposal.',
      steps: HOW_IT_STARTS,
      tip: 'Design, engineering, launch and ongoing care are one piece of work, with one point of contact throughout.',
    },
  ] : [];

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: service?.image,
        eyebrow: service?.pillar?.title || service?.category || 'Service',
        title: service?.title || '',
        text: clip(service?.description, 220),
        breadcrumbs: [{ to: '/', label: 'Home' }, { to: '/services', label: 'Services' }, { label: service?.title || '…' }],
        cta: { to: '/contact', label: 'Discuss This Service' },
        secondary: { to: '/services', label: 'Every Service' },
      }}
      glance={service ? [
        [service.category || 'Service', 'area of work'],
        [service.pillar?.title || 'Every principle', 'principle behind it'],
        [String(related.length), related.length === 1 ? 'related service' : 'related services'],
        ['2 days', 'to a proposal'],
      ] : []}
      label="The service"
      chapters={chapters}
      toolkit={{
        eyebrow: 'Related',
        title: 'Services that go with it',
        cards: related.slice(0, 4).map((s) => ({ to: `/services/${s.slug}`, image: s.image, tags: [s.category], title: s.title, text: clip(s.description, 140) })),
      }}
      onward={service?.pillar
        ? { to: `/our-approach/${service.pillar.slug}`, image: service.pillar.image, tags: ['Principle'], title: service.pillar.title, text: clip(service.pillar.overview, 160) }
        : { to: '/contact', tags: ['Next step'], title: 'Have a platform in mind?', text: 'Share a short brief. Every brief receives a reply with next steps.' }}
    />
  );
}
