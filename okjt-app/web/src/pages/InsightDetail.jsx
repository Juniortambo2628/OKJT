import { useParams } from 'react-router-dom';
import { Container, SiteLayout } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import Html from '../components/Html';
import usePageMeta from '../components/usePageMeta';
import { LoadError } from '../components/States';
import { Skeleton } from '@okjt/ui';
import { formatDate, live, readingTime, useInsights, useItem } from '../lib/content';
import { InsightCard } from './Insights';
import NotFound from './NotFound';

export default function InsightDetail() {
  const { slug } = useParams();
  const { data: insight, isLoading, isError, error } = useItem(`/insights/${slug}`);
  const { data: all } = useInsights();
  usePageMeta(insight?.title, insight?.excerpt || insight?.content);
  if (error?.response?.status === 404) return <NotFound />;
  const more = live(all).filter((i) => i.id !== insight?.id).slice(0, 3);

  return (
    <SiteLayout overlay>
      <PageHero
        media={insight?.image}
        eyebrow={insight?.category || 'Insight'}
        title={insight?.title || ''}
        text={insight ? `${formatDate(insight.published_at || insight.created_at)} · ${readingTime(insight.content)} min read${insight.user?.name ? ` · ${insight.user.name}` : ''}` : ''}
        breadcrumbs={[{ to: '/', label: 'Home' }, { to: '/insights', label: 'Insights' }, { label: insight?.title || '…' }]}
      />
      <Container className="py-16">
        <article className="mx-auto max-w-3xl rounded-[2rem] border border-line bg-surface p-6 text-[1.05rem] sm:p-12">
          {isLoading && <div className="space-y-3">{[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-4 !bg-tone-100" />)}</div>}
          {isError && <LoadError what="this article" />}
          {insight && <Html html={insight.content} />}
        </article>
      </Container>
      {more.length > 0 && (
        <Section id="more" eyebrow="Keep reading" title="More insights">
          <div className="grid gap-5 md:grid-cols-3">{more.map((i) => <InsightCard key={i.id} insight={i} />)}</div>
        </Section>
      )}
    </SiteLayout>
  );
}
