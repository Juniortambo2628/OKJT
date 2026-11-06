import { useMemo } from 'react';
import JourneyPage from '../components/Journey';
import { formatDate, live, readingTime, useInsights, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';
import { address, clip, slugify } from '../lib/text';

/** The articles, a chapter per topic. */
export default function Insights() {
  const { setting } = useSettings();
  const { data, isLoading } = useInsights();
  const list = live(data);
  const topics = useMemo(() => {
    const map = new Map();
    for (const i of list) {
      const title = i.category || 'Notes';
      if (!map.has(title)) map.set(title, []);
      map.get(title).push(i);
    }
    return [...map.entries()];
  }, [list]);
  const minutes = list.reduce((sum, i) => sum + readingTime(i.content), 0);

  const chapters = topics.map(([title, items]) => {
    const pictured = items.find((i) => i.image);
    return {
      id: slugify(title),
      navLabel: title,
      when: `${items.length} ${items.length === 1 ? 'article' : 'articles'}`,
      title,
      intro: clip(items[0].excerpt || items[0].content, 200),
      media: pictured ? { src: pictured.image, url: address(`/insights/${pictured.slug}`) } : undefined,
      steps: items.map((i) => ({ title: i.title, text: `${formatDate(i.published_at || i.created_at)} · ${readingTime(i.content)} min read`, to: `/insights/${i.slug}` })),
    };
  });

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: setting('hero_insights_media') || DEFAULT_HERO,
        eyebrow: 'Insights',
        title: setting('insights_title', 'Notes from the work'),
        text: setting('insights_subtitle', 'Practical lessons from real projects in health, law, construction, events and commerce, written for the people who commission and run web platforms.'),
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'Insights' }],
        cta: list[0] ? { to: `/insights/${list[0].slug}`, label: 'Read the latest' } : undefined,
        secondary: { to: '/projects', label: 'See the work' },
      }}
      glance={[
        [String(list.length), list.length === 1 ? 'article' : 'articles'],
        [String(topics.length), topics.length === 1 ? 'topic' : 'topics'],
        [`${minutes} min`, 'of reading'],
        [list[0] ? formatDate(list[0].published_at || list[0].created_at).replace(/^\d+ /, '') : '—', 'latest note'],
      ]}
      label="Topics"
      chapters={chapters}
      toolkit={{
        eyebrow: 'Latest',
        title: 'The newest notes',
        cards: list.slice(0, 4).map((i) => ({ to: `/insights/${i.slug}`, image: i.image, tags: [i.category], title: i.title, text: clip(i.excerpt || i.content, 140) })),
      }}
      onward={{ to: '/contact', tags: ['Next step'], title: 'Have a platform in mind?', text: 'Share a short brief. Every brief receives a reply with next steps.' }}
    />
  );
}
