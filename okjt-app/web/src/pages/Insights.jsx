import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SiteLayout } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import MediaFill from '../components/MediaFill';
import { CardGridSkeleton, Empty, LoadError } from '../components/States';
import { formatDate, live, readingTime, useInsights, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export function InsightCard({ insight }) {
  return (
    <Link to={`/insights/${insight.slug}`} className="group flex flex-col overflow-hidden rounded-[1.75rem] glass transition-colors hover:border-accent/50">
      <div className="relative aspect-[16/10]"><MediaFill src={insight.image} /></div>
      <div className="flex flex-1 flex-col p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{insight.category || 'Insight'}</div>
        <h3 className="mt-3 !font-display text-xl !font-normal leading-snug !text-ink">{insight.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-soft">{strip(insight.excerpt || insight.content)}</p>
        <div className="mt-auto flex items-center justify-between pt-6 text-xs text-muted">
          <span>{formatDate(insight.published_at || insight.created_at)} · {readingTime(insight.content)} min read</span>
          <ArrowUpRight className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

export default function Insights() {
  const { setting } = useSettings();
  const { data, isLoading, isError } = useInsights();
  const [category, setCategory] = useState('All');
  const list = live(data);
  const categories = ['All', ...new Set(list.map((i) => i.category).filter(Boolean))];
  const shown = category === 'All' ? list : list.filter((i) => i.category === category);

  return (
    <SiteLayout overlay>
      <PageHero
        media={setting('hero_insights_media') || DEFAULT_HERO}
        eyebrow="Insights"
        title={setting('insights_title', 'Notes from the work')}
        text={setting('insights_subtitle', 'Practical lessons from real projects in health, law, construction, events and commerce, written for the people who commission and run web platforms.')}
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Insights' }]}
      />
      <Section id="articles">
        {categories.length > 2 && (
          <div role="group" aria-label="Topics" className="mb-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${category === c ? 'bg-fill text-on-ink' : 'bg-surface text-soft hover:text-ink'}`}>{c}</button>
            ))}
          </div>
        )}
        {isLoading ? <CardGridSkeleton /> : isError ? <LoadError what="the insights" /> : shown.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map((i) => <InsightCard key={i.id} insight={i} />)}</div>
        ) : <Empty>New notes are on the way.</Empty>}
      </Section>
    </SiteLayout>
  );
}
