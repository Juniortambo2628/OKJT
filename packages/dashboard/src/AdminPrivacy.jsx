import { useCallback, useEffect, useState } from 'react';
import { confirmAction, formatDateTime } from '@okjt/ui';
import { useDashboard } from './DashboardProvider.js';
import useAdminAction from './useAdminAction.js';
import EmptyState from './EmptyState.js';
import { AdminInput, AdminTextarea } from './AdminInput.js';

/**
 * AdminPrivacy: how long data is kept, and requests from people to delete
 * their data, from Naoa's privacy settings, on laravel-kit's
 * PrivacyController. Each retention rule with what is past its time; the
 * requests, open ones first with the date each must be dealt with by
 * (overdue ones marked); delete their data (asks first) or decline with a
 * reason they will be given; record a request that came another way.
 *
 *   <AdminPrivacy />
 *
 * @param {string} [path='/admin/privacy']
 */
const date = (iso) => formatDateTime(iso, { hour: undefined, minute: undefined });
const STATUS = { received: 'Open', done: 'Data deleted', declined: 'Declined' };
const BLANK = { name: '', email: '', phone: '', details: '' };

export default function AdminPrivacy({ path = '/admin/privacy' }) {
  const { api } = useDashboard();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(BLANK);

  const load = useCallback(async () => {
    try {
      const res = await api.get(path);
      setData(res.data?.data ?? { retention: [], requests: [] });
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [api, path]);
  useEffect(() => { load(); }, [load]);

  const complete = (r, body) => api.post(`${path}/erasure-requests/${r.id}/complete`, body);
  const erase = useAdminAction((r) => complete(r, { action: 'erase' }), {
    key: (r) => r.id,
    confirm: (r) => ({ title: `Delete what's held about ${r.name}?`, message: "Everything the app holds about them is deleted or anonymised. It can't be brought back.", confirmLabel: 'Delete their data', tone: 'danger' }),
    success: (res) => res?.data?.message ?? 'Their data was deleted',
    error: "Their data couldn't be deleted. Nothing was changed.",
    onSuccess: load,
  });
  const declineAction = useAdminAction((r, reason) => complete(r, { action: 'decline', outcome: reason }), {
    key: (r) => r.id, success: 'Request declined', onSuccess: load,
  });
  const decline = async (r) => {
    const reason = await confirmAction({
      title: `Decline ${r.name}'s request?`,
      message: 'Say why; they will be given this reason.',
      input: { label: 'Reason', placeholder: 'For example: we must keep invoices for 6 years' },
      confirmLabel: 'Decline',
    });
    if (reason) declineAction.run(r, reason);
  };
  const record = useAdminAction((values) => api.post(`${path}/erasure-requests`, values), {
    key: () => 'record', success: 'Request recorded',
    onSuccess: () => { setForm(BLANK); setAdding(false); load(); },
  });

  if (failed) return <EmptyState message="The privacy settings couldn't be loaded." action={{ label: 'Try again', onClick: load, readOnly: true }} />;
  if (data === null) return <EmptyState loading rows={4} />;

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (form.name.trim()) record.run(Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim() !== '')));
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="okjt-privacy-kept" className="space-y-3">
        <h2 id="okjt-privacy-kept" className="text-base font-semibold text-ink">How long data is kept</h2>
        {data.retention.length === 0 ? (
          <EmptyState message="No retention rules yet. A project lists them in okjt.privacy.retention." />
        ) : (
          <ul className="divide-y divide-tone-100 rounded-2xl border border-tone-100 bg-surface">
            {data.retention.map((rule) => (
              <li key={rule.label} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
                <span className="text-sm font-medium text-ink">{rule.label}</span>
                <span className="text-sm text-soft">
                  {rule.period ? `Kept ${rule.period}` : 'Kept until deleted'}
                  {rule.due > 0 && ` · ${rule.due} past their time, deleted by the daily run`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="okjt-privacy-requests" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="okjt-privacy-requests" className="text-base font-semibold text-ink">Requests to delete data</h2>
            <p className="mt-1 text-sm text-soft">
              Each must be dealt with within {data.erasure_days} days.{data.auto_complete ? ' Any left past their date are completed automatically.' : ''}
            </p>
          </div>
          {!adding && <button type="button" onClick={() => setAdding(true)} disabled={!record.allowed} className="rounded-full border border-tone-200 px-4 py-2 text-sm font-medium text-ink hover:bg-tone-50">Record a request</button>}
        </div>

        {adding && (
          <form onSubmit={submit} className="space-y-3 rounded-2xl border border-tone-100 bg-surface p-4">
            <p className="text-sm text-soft">A request that came by phone, message or letter.</p>
            <AdminInput label="Name" value={form.name} onChange={set('name')} required maxLength={120} />
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput label="Email" type="email" value={form.email} onChange={set('email')} maxLength={191} />
              <AdminInput label="Phone" type="tel" value={form.phone} onChange={set('phone')} maxLength={50} />
            </div>
            <AdminTextarea label="Details" rows={3} value={form.details} onChange={set('details')} maxLength={2000} />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setAdding(false); setForm(BLANK); }} className="text-sm text-soft hover:text-ink">Cancel</button>
              <button type="submit" disabled={!form.name.trim() || record.pending} className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Record request</button>
            </div>
          </form>
        )}

        {data.requests.length === 0 ? (
          <EmptyState message="No requests to delete data yet." />
        ) : (
          <ul className="divide-y divide-tone-100 rounded-2xl border border-tone-100 bg-surface">
            {data.requests.map((r) => (
              <li key={r.id} className="space-y-2 px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{r.name}</p>
                    <p className="text-sm text-soft">{[r.email, r.phone].filter(Boolean).join(' · ')}</p>
                  </div>
                  <p className="text-xs text-muted">
                    {STATUS[r.status] ?? r.status}
                    {r.status === 'received'
                      ? <> · <span className={r.overdue ? 'font-semibold text-red-600' : ''}>{r.overdue ? 'Overdue since' : 'Due'} {date(r.due_at)}</span></>
                      : ` · ${date(r.completed_at)}`}
                  </p>
                </div>
                {r.details && <p className="whitespace-pre-line text-sm text-body">{r.details}</p>}
                {r.outcome && <p className="text-sm text-soft">{r.outcome}</p>}
                {r.status === 'received' && (
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => erase.run(r)} disabled={erase.isPending(r.id) || !erase.allowed} className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">Delete their data</button>
                    <button type="button" onClick={() => decline(r)} disabled={declineAction.isPending(r.id) || !declineAction.allowed} className="text-sm text-soft hover:text-ink">Decline</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
