import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, BookOpen, Briefcase, Eye, Inbox, TrendingUp, Users } from 'lucide-react';
import { AdminCard, AdminPageHero, AdminPageLayout, AdminSummaryCards, QueryError } from '@okjt/dashboard';
import api, { unwrap } from '../lib/api';
import { useAdminUser } from './auth';

const list = (path) => () => api.get(path).then((res) => unwrap(res.data));

/** Views per day for the last two weeks, as bars. */
function Bars({ points = [] }) {
  const max = Math.max(1, ...points.map((p) => p.views));
  if (!points.length) return <p className="py-10 text-center text-sm text-tone-500">No visits recorded yet. Visits are counted for visitors who allow it.</p>;
  return (
    <div className="flex h-44 items-end gap-1.5" role="img" aria-label={`Page views per day: ${points.map((p) => `${p.date} ${p.views}`).join(', ')}`}>
      {points.map((p) => (
        <div key={p.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[10px] text-tone-500 opacity-0 group-hover:opacity-100">{p.views}</span>
          {/* Pixels, not %: a percentage of an auto-height column is nothing. */}
          <div className="w-full rounded-t-md bg-accent/70 transition-colors group-hover:bg-accent" style={{ height: `${Math.max(4, Math.round((p.views / max) * 128))}px` }} />
          <span className="text-[10px] text-tone-400">{new Date(p.date).getDate()}</span>
        </div>
      ))}
    </div>
  );
}

export default function Overview() {
  const { data: user } = useAdminUser();
  const analytics = useQuery({ queryKey: ['/analytics/summary'], queryFn: () => api.get('/analytics/summary').then((res) => res.data) });
  const requests = useQuery({ queryKey: ['admin', '/consultation-requests'], queryFn: list('/consultation-requests') });
  const projects = useQuery({ queryKey: ['admin', '/projects'], queryFn: list('/projects') });
  const insights = useQuery({ queryKey: ['admin', '/insights'], queryFn: list('/insights') });
  const a = analytics.data;
  const fresh = (requests.data ?? []).filter((r) => r.status === 'pending');

  return (
    <AdminPageLayout
      hero={<AdminPageHero title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`} breadcrumb="Overview" description="What visitors see and what they send, at a glance." />}
      summary={(
        <AdminSummaryCards
          columns={4}
          cards={[
            { label: 'Views this week', value: a?.week_views ?? '—', icon: Eye, hint: a ? `${a.today_views} today` : undefined },
            { label: 'Visitors, 30 days', value: a?.unique_visitors ?? '—', icon: Users },
            { label: 'New enquiries', value: requests.data ? fresh.length : '—', icon: Inbox },
            { label: 'Live projects', value: projects.data ? projects.data.filter((p) => p.is_active).length : '—', icon: Briefcase, hint: insights.data ? `${insights.data.filter((i) => i.is_published).length} insights published` : undefined },
          ]}
        />
      )}
    >
      <div className="grid gap-5 xl:grid-cols-3">
        <AdminCard className="xl:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-ink"><TrendingUp className="h-4 w-4 text-accent" aria-hidden="true" /> Page views, last 14 days</div>
          {analytics.isError ? <QueryError what="visits" onRetry={analytics.refetch} error={analytics.error} /> : <Bars points={a?.views_over_time} />}
        </AdminCard>
        <AdminCard>
          <div className="mb-3 text-sm font-medium text-ink">Most viewed pages</div>
          <ol className="space-y-2 text-sm">
            {(a?.top_pages ?? []).slice(0, 8).map((p) => (
              <li key={p.path} className="flex items-center justify-between gap-3">
                <a href={p.path} target="_blank" rel="noopener noreferrer" className="truncate text-tone-700 hover:text-accent">{p.path}</a>
                <span className="shrink-0 tabular-nums text-tone-500">{p.views}</span>
              </li>
            ))}
            {a && !a.top_pages?.length && <li className="text-tone-500">Nothing yet.</li>}
          </ol>
        </AdminCard>
        <AdminCard className="xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-ink">Latest enquiries</span>
            <Link to="/admin/requests" className="inline-flex items-center gap-1 text-xs font-medium text-accent">All enquiries <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
          <ul className="divide-y divide-tone-100">
            {(requests.data ?? []).slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0"><div className="truncate text-ink">{r.first_name} {r.last_name}</div><div className="truncate text-tone-500">{r.subject || r.message}</div></div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${r.status === 'pending' ? 'bg-accent/15 text-accent' : 'bg-tone-100 text-tone-500'}`}>{r.status === 'pending' ? 'New' : r.status}</span>
              </li>
            ))}
            {requests.data && !requests.data.length && <li className="py-6 text-center text-sm text-tone-500">No enquiries yet.</li>}
          </ul>
        </AdminCard>
        <AdminCard>
          <div className="mb-3 text-sm font-medium text-ink">Where visitors come from</div>
          <ol className="space-y-2 text-sm">
            {(a?.top_referrers ?? []).slice(0, 6).map((r) => (
              <li key={r.referrer} className="flex items-center justify-between gap-3"><span className="truncate text-tone-700">{r.referrer.replace(/^https?:\/\//, '')}</span><span className="tabular-nums text-tone-500">{r.count}</span></li>
            ))}
            {a && !a.top_referrers?.length && <li className="text-tone-500">Mostly direct visits.</li>}
          </ol>
          <div className="mt-6 grid gap-2">
            <Link to="/admin/insights" className="flex items-center gap-2 rounded-lg border border-tone-100 px-3 py-2 text-sm text-tone-700 hover:border-accent hover:text-ink"><BookOpen className="h-4 w-4 text-accent" /> Write an insight</Link>
            <Link to="/admin/projects" className="flex items-center gap-2 rounded-lg border border-tone-100 px-3 py-2 text-sm text-tone-700 hover:border-accent hover:text-ink"><Briefcase className="h-4 w-4 text-accent" /> Add a project</Link>
          </div>
        </AdminCard>
      </div>
    </AdminPageLayout>
  );
}
