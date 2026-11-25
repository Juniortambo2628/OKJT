import { useCallback, useEffect, useState } from 'react';
import { formatDateTime } from '@okjt/ui';
import { useDashboard } from './DashboardProvider.js';
import useAdminAction from './useAdminAction.js';
import EmptyState from './EmptyState.js';
import { AdminTextarea } from './AdminInput.js';

/**
 * AdminContactMessages: the contact form's inbox, from Naoa's admin
 * Enquiries, on laravel-kit's ContactMessageController. New messages first;
 * filter by status (with counts) and search; open one (it's marked read),
 * reply by email (marked replied only if the email went), archive, delete
 * (asks first).
 *
 *   <AdminContactMessages />
 *
 * @param {string} [path='/admin/contact-messages']
 */
const FILTERS = [['new', 'New'], ['read', 'Read'], ['replied', 'Replied'], ['archived', 'Archived'], ['', 'All']];
const when = (iso) => formatDateTime(iso);

export default function AdminContactMessages({ path = '/admin/contact-messages' }) {
  const { api } = useDashboard();
  const [status, setStatus] = useState('new');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(null);
  const [reply, setReply] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get(path, { params: { ...(status ? { status } : {}), ...(search ? { search } : {}), page } });
      setList(res.data?.data ?? { data: [], meta: {}, counts: {} });
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [api, path, status, search, page]);
  useEffect(() => { load(); }, [load]);

  const view = async (message) => {
    setReply('');
    try {
      const res = await api.get(`${path}/${message.id}`);
      setOpen(res.data?.data ?? message);
      if (message.status === 'new') load();
    } catch {
      setOpen(message);
    }
  };

  const sendReply = useAdminAction((message, text) => api.post(`${path}/${message.id}/reply`, { message: text }), {
    key: () => 'reply', success: 'Reply sent', error: "The reply couldn't be sent",
    onSuccess: (res) => { setOpen(res?.data?.data ?? null); setReply(''); load(); },
  });
  const archive = useAdminAction((message) => api.patch(`${path}/${message.id}`, { status: 'archived' }), {
    key: (m) => m.id, success: 'Archived', onSuccess: () => { setOpen(null); load(); },
  });
  const remove = useAdminAction((message) => api.delete(`${path}/${message.id}`), {
    key: (m) => m.id,
    confirm: (m) => ({ title: `Delete the message from ${m.name}?`, message: "It can't be brought back.", confirmLabel: 'Delete', tone: 'danger' }),
    success: 'Message deleted', onSuccess: () => { setOpen(null); load(); },
  });

  if (failed) return <EmptyState message="The messages couldn't be loaded." action={{ label: 'Try again', onClick: load, readOnly: true }} />;

  if (open) {
    return (
      <article className="rounded-2xl border border-tone-100 bg-surface p-5 sm:p-6">
        <button type="button" onClick={() => setOpen(null)} className="text-sm text-soft hover:text-ink">← All messages</button>
        <h2 className="mt-3 text-lg font-medium text-ink">{open.subject || 'No subject'}</h2>
        <p className="mt-1 text-sm text-soft">
          {open.name} · <a href={`mailto:${open.email}`} className="text-accent hover:underline">{open.email}</a>{open.topic ? ` · ${open.topic}` : ''} · {when(open.created_at)}
        </p>
        <p className="mt-5 whitespace-pre-line text-body">{open.message}</p>
        {open.reply_message && (
          <div className="mt-6 rounded-xl bg-tint p-4">
            <p className="text-xs font-medium text-tone-600">Your reply · {when(open.replied_at)}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-body">{open.reply_message}</p>
          </div>
        )}
        <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); if (reply.trim()) sendReply.run(open, reply.trim()); }}>
          <AdminTextarea label={open.reply_message ? 'Reply again' : 'Reply'} rows={5} value={reply} onChange={(e) => setReply(e.target.value)} className="!resize-y" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3">
              {open.status !== 'archived' && <button type="button" onClick={() => archive.run(open)} disabled={!archive.allowed} className="text-sm text-soft hover:text-ink">Archive</button>}
              <button type="button" onClick={() => remove.run(open)} disabled={!remove.allowed} className="text-sm text-soft hover:text-red-600">Delete</button>
            </div>
            <button type="submit" disabled={!reply.trim() || sendReply.pending || !sendReply.allowed} className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {sendReply.pending ? 'Sending…' : `Send reply to ${open.email}`}
            </button>
          </div>
        </form>
      </article>
    );
  }

  const counts = list?.counts ?? {};
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Messages" className="flex flex-wrap gap-2">
          {FILTERS.map(([value, label]) => (
            <button key={value || 'all'} type="button" role="tab" aria-selected={status === value} onClick={() => { setStatus(value); setPage(1); }}
              className={`rounded-full px-3 py-1.5 text-sm ${status === value ? 'bg-tint font-medium text-ink' : 'text-tone-600 hover:bg-tone-100'}`}>
              {label}{value && counts[value] ? ` · ${counts[value]}` : ''}
            </button>
          ))}
        </div>
        <input type="search" aria-label="Search messages" placeholder="Search name, email or subject" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-xl border border-tone-200 bg-surface px-3 py-2 text-sm sm:w-64" />
      </div>
      {list === null && <EmptyState loading rows={4} />}
      {list && list.data.length === 0 && <EmptyState message={search ? 'No messages match.' : status === 'new' ? 'No new messages.' : 'No messages here.'} />}
      {list && list.data.length > 0 && (
        <ul className="divide-y divide-tone-100 rounded-2xl border border-tone-100 bg-surface">
          {list.data.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => view(m)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-tone-50">
                {m.status === 'new' && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="New" />}
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${m.status === 'new' ? 'font-semibold text-ink' : 'text-body'}`}>{m.name} · {m.subject || 'No subject'}</span>
                  <span className="block truncate text-xs text-muted">{m.message}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">{when(m.created_at)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {list?.meta?.last_page > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-end gap-3 text-sm">
          <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="text-soft disabled:opacity-40">Newer</button>
          <span className="text-muted">Page {list.meta.current_page} of {list.meta.last_page}</span>
          <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= list.meta.last_page} className="text-soft disabled:opacity-40">Older</button>
        </nav>
      )}
    </div>
  );
}
