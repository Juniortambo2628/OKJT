import { useParams } from 'react-router-dom';
import JourneyPage from '../components/Journey';
import usePageMeta from '../components/usePageMeta';
import { formatDate, live, readingTime, useInsights, useItem, useSettings } from '../lib/content';
import { address, clip, sectionsOf, slugify } from '../lib/text';
import NotFound from './NotFound';

/** The account that posted an article is often the site's admin login; the byline names the writer instead. */
const byline = (name, writer) => (name && !/\badmin\b/i.test(name) ? name : writer);

/** An article, its sections as chapters. */
export default function InsightDetail() {
  const { slug } = useParams();
  const { setting } = useSettings();
  const { data: insight, isLoading, error } = useItem(`/insights/${slug}`);
  const { data: all } = useInsights();
  usePageMeta(insight?.title, insight?.excerpt || insight?.content);
  if (error?.response?.status === 404) return <NotFound />;
  const more = live(all).filter((i) => i.id !== insight?.id);
  const parts = sectionsOf(insight?.content || '');

  const chapters = insight ? parts.map((part, n) => ({
    id: part.title ? slugify(part.title) : 'introduction',
    when: n === 0 ? insight.category || 'Insight' : undefined,
    title: part.title || 'Introduction',
    body: part.body,
    media: n === 0 && insight.image ? { src: insight.image, url: address(`/insights/${slug}`) } : undefined,
  })) : [];

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: insight?.image,
        eyebrow: insight?.category || 'Insight',
        title: insight?.title || '',
        text: clip(insight?.excerpt, 240),
        breadcrumbs: [{ to: '/', label: 'Home' }, { to: '/insights', label: 'Insights' }, { label: insight?.title || '…' }],
      }}
      glance={insight ? [
        [formatDate(insight.published_at || insight.created_at), 'published'],
        [`${readingTime(insight.content)} min`, 'to read'],
        [insight.category || 'Notes', 'topic'],
        [byline(insight.user?.name, setting('insights_author', 'Kevin Tambo')), 'written by'],
      ] : []}
      label="The article"
      chapters={chapters}
      toolkit={{
        eyebrow: 'Keep reading',
        title: 'More notes from the work',
        cards: more.slice(0, 4).map((i) => ({ to: `/insights/${i.slug}`, image: i.image, tags: [i.category], title: i.title, text: clip(i.excerpt || i.content, 140) })),
      }}
      onward={{ to: '/contact', tags: ['Next step'], title: 'Have a platform in mind?', text: 'Share a short brief. Every brief receives a reply with next steps.' }}
      faqs={false}
    />
  );
}
