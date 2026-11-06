import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, CircleSlash, ExternalLink, Layers, Pencil, Plus, X } from 'lucide-react';
import {
  AdminListPanel, AdminPageHero, AdminPageLayout, AdminPagination, AdminSummaryCards, DeleteButton, EmptyState, QueryError,
  useAdminAction, useFilteredItems, useSearch,
} from '@okjt/dashboard';
import api, { errorMessage, unwrap } from '../lib/api';
import { mediaUrl } from '../lib/media';
import { Field } from './fields';

const PAGE_SIZE = 25;

/** The form for one record, as a panel sliding in from the right. */
function Editor({ resource, record, onClose, onSaved }) {
  const isNew = !record.id;
  const [form, setForm] = useState(() => ({ ...resource.initial, ...record }));
  const [error, setError] = useState('');
  const pillars = useQuery({
    queryKey: ['/pillars'],
    queryFn: () => api.get('/pillars').then((res) => unwrap(res.data)),
    enabled: resource.fields.some((f) => f.type === 'pillar'),
  });
  const save = useAdminAction(
    (values) => (isNew ? api.post(resource.endpoint, values) : api.put(`${resource.endpoint}/${record.id}`, values)),
    {
      success: isNew ? `The ${resource.noun} was added` : 'Changes saved',
      error: false,
      invalidate: [[resource.endpoint], ['admin', resource.endpoint]],
      onSuccess: onSaved,
      onError: (err) => setError(errorMessage(err)),
    },
  );

  const submit = (e) => {
    e.preventDefault();
    const missing = resource.fields.find((f) => f.required && (form[f.key] === undefined || form[f.key] === null || String(form[f.key]).trim() === ''));
    if (missing) return setError(`${missing.label} is needed.`);
    if (isNew && resource.fields.some((f) => f.type === 'password') && !form.password) return setError('Give them a password of at least 8 characters.');
    setError('');
    const values = { ...form };
    for (const key of ['id', 'slug', 'created_at', 'updated_at', 'pillar', 'services', 'user']) delete values[key];
    if (!values.password) delete values.password;
    save.run(values);
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/60" role="dialog" aria-modal="true" aria-label={isNew ? `New ${resource.noun}` : `Edit ${resource.noun}`} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <form onSubmit={submit} className="flex h-full w-full max-w-3xl flex-col border-l border-tone-200 bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-tone-100 px-6 py-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{resource.title}</div>
            <h2 className="text-xl font-medium text-ink">{isNew ? `New ${resource.noun}` : resource.row(record).title || `Edit ${resource.noun}`}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close without saving" className="rounded-lg p-1.5 text-tone-400 hover:bg-tone-100 hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid flex-1 content-start gap-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          {resource.fields.map((field) => (
            <div key={field.key} className={field.wide || ['rich', 'image', 'media'].includes(field.type) ? 'sm:col-span-2' : ''}>
              <Field field={field} value={form[field.key]} onChange={(v) => setForm((f) => ({ ...f, [field.key]: v }))} pillars={unwrap(pillars.data) ?? []} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-tone-100 px-6 py-4">
          <p role="alert" className="min-w-0 text-sm text-red-400">{error}</p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-tone-200 px-5 py-2 text-sm font-medium text-tone-700 hover:border-accent hover:text-ink">Cancel</button>
            <button type="submit" disabled={save.pending} className="rounded-full bg-accent px-6 py-2 text-sm font-semibold text-paper hover:bg-accent-strong disabled:opacity-60">{save.pending ? 'Saving…' : isNew ? 'Add' : 'Save'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

/**
 * One list the dashboard manages (see resources.js), on the kit's page:
 * hero, summary cards that filter, the list, and the toolbar's search and
 * "add". Rows open the editor; the bin deletes after asking.
 */
export default function ResourcePage({ resource }) {
  const { searchQuery } = useSearch();
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState('all');
  const [group, setGroup] = useState('all');
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['admin', resource.endpoint], queryFn: () => api.get(resource.endpoint).then((res) => unwrap(res.data)) });
  const all = useMemo(() => (Array.isArray(query.data) ? query.data : []), [query.data]);

  const remove = useAdminAction((id) => api.delete(`${resource.endpoint}/${id}`), {
    confirm: { title: `Delete this ${resource.noun}?`, message: 'It disappears from the website straight away. This can’t be undone.', confirmLabel: 'Delete' },
    success: `The ${resource.noun} was deleted`,
    invalidate: [[resource.endpoint], ['admin', resource.endpoint]],
  });

  const statusOf = (item) => (resource.status ? Boolean(item[resource.status.field]) : null);
  const narrowed = all.filter((item) => (status === 'all' || (status === 'on') === statusOf(item)) && (group === 'all' || item[resource.groups.field] === group));
  const shown = useFilteredItems(narrowed, searchQuery);
  const pageItems = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cards = [{ label: 'All', value: all.length, icon: Layers, onClick: () => { setStatus('all'); setGroup('all'); setPage(1); }, active: status === 'all' && group === 'all' }];
  if (resource.status) {
    const on = all.filter((i) => statusOf(i)).length;
    cards.push({ label: resource.status.on, value: on, icon: CheckCircle2, onClick: () => { setStatus('on'); setPage(1); }, active: status === 'on' });
    cards.push({ label: resource.status.off, value: all.length - on, icon: CircleSlash, onClick: () => { setStatus('off'); setPage(1); }, active: status === 'off' });
  }

  const openNew = () => setEditing({});
  return (
    <AdminPageLayout
      fill
      hero={<AdminPageHero title={resource.title} breadcrumb={resource.title} description={resource.description} />}
      summary={<AdminSummaryCards cards={cards} columns={cards.length} />}
      search={`Search ${resource.title.toLowerCase()}`}
      filters={resource.groups ? {
        groups: [{
          id: resource.groups.field,
          label: resource.groups.label,
          value: group,
          defaultValue: 'all',
          onChange: (v) => { setGroup(v); setPage(1); },
          options: [{ id: 'all', label: 'All' }, ...resource.groups.options.map((o) => ({ ...o, count: all.filter((i) => i[resource.groups.field] === o.id).length }))],
        }],
      } : undefined}
      actions={resource.readOnlyCreate ? [] : [{ id: 'add', label: `Add ${resource.noun}`, icon: Plus, onClick: openNew, variant: 'primary' }]}
    >
      {query.isError ? <QueryError what={resource.title.toLowerCase()} onRetry={query.refetch} error={query.error} /> : (
        <AdminListPanel footer={shown.length > PAGE_SIZE && <AdminPagination currentPage={page} pageSize={PAGE_SIZE} totalItems={shown.length} onPageChange={setPage} />}>
          {query.isLoading || !pageItems.length ? (
            <EmptyState
              loading={query.isLoading}
              icon={Layers}
              searchQuery={searchQuery}
              message={`No ${resource.title.toLowerCase()} yet.`}
              action={resource.readOnlyCreate ? undefined : { label: `Add ${resource.noun}`, onClick: openNew, icon: Plus }}
            />
          ) : (
            <ul className="divide-y divide-tone-100">
              {pageItems.map((item) => {
                const row = resource.row(item);
                const on = statusOf(item);
                return (
                  <li key={item.id} className="group flex items-center gap-4 px-4 py-3 hover:bg-tone-50">
                    {'image' in row && (
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-tone-100 bg-tone-50">
                        {row.image && <img src={mediaUrl(row.image)} alt="" loading="lazy" className="h-full w-full object-cover" />}
                      </div>
                    )}
                    <button type="button" onClick={() => setEditing(item)} className="min-w-0 flex-1 text-left">
                      <div className="truncate font-medium text-ink">{row.title}</div>
                      <div className="truncate text-sm text-tone-500">{row.subtitle || '—'}</div>
                    </button>
                    {row.date && <span className="hidden text-xs text-tone-400 md:block">{new Date(row.date).toLocaleDateString('en-GB')}</span>}
                    {row.badge && <span className="hidden rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium capitalize text-accent sm:inline">{String(row.badge).replace('_', ' ')}</span>}
                    {on !== null && (
                      <span className={`hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline ${on ? 'bg-positive/15 text-positive' : 'bg-tone-100 text-tone-500'}`}>
                        {on ? resource.status.on : resource.status.off}
                      </span>
                    )}
                    <div className="flex shrink-0 items-center gap-1">
                      {row.link && <a href={row.link} target="_blank" rel="noopener noreferrer" aria-label="Open on the website" className="rounded-lg p-2 text-tone-400 hover:bg-tone-100 hover:text-accent"><ExternalLink className="h-4 w-4" /></a>}
                      <button type="button" onClick={() => setEditing(item)} aria-label={`Edit ${row.title}`} className="rounded-lg p-2 text-tone-400 hover:bg-tone-100 hover:text-accent"><Pencil className="h-4 w-4" /></button>
                      <DeleteButton onClick={() => remove.run(item.id)} processing={remove.isPending?.(item.id)} title={`Delete ${row.title}`} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminListPanel>
      )}
      {editing && <Editor resource={resource} record={editing} onClose={() => setEditing(null)} onSaved={() => setEditing(null)} />}
    </AdminPageLayout>
  );
}
