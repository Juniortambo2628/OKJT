import { useCallback, useEffect, useState } from 'react';
import { useDashboard } from './DashboardProvider.js';
import useAdminAction from './useAdminAction.js';
import useUnsavedChangesGuard, { confirmLeave } from './useUnsavedChangesGuard.js';
import EmptyState from './EmptyState.js';
import { AdminInput, AdminTextarea } from './AdminInput.js';

/**
 * AdminPageCopy: the words on the site's pages, edited over the defaults in
 * the project's code (laravel-kit's PageCopyController). One section at a
 * time: each text with the original wording as its placeholder (leave a
 * field empty for the original), a switch to show or hide the section, and
 * "Back to the original" for the whole section. Only wording can be changed
 * here, never links, icons or images: the server refuses those.
 *
 *   <AdminPageCopy />                  // GET /admin/page-copy, PUT|DELETE /admin/page-copy/{section}
 *
 * @param {string} [path='/admin/page-copy']
 * @param {(key: string) => string} [sectionLabel]  A project's own name for a section
 */
export default function AdminPageCopy({ path = '/admin/page-copy', sectionLabel }) {
  const { api } = useDashboard();
  const [sections, setSections] = useState(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState({});
  const dirty = Object.keys(draft).length > 0;
  useUnsavedChangesGuard(dirty);

  const load = useCallback(async () => {
    try {
      const res = await api.get(path);
      setSections(res.data?.data ?? []);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [api, path]);
  useEffect(() => { load(); }, [load]);

  const current = sections?.find((s) => s.key === active) ?? sections?.[0];
  const replace = (updated) => setSections((list) => list.map((s) => (s.key === updated.key ? updated : s)));
  const name = (s) => (sectionLabel ? sectionLabel(s.key) : null) ?? s.label;

  const save = useAdminAction((body) => api.put(`${path}/${encodeURIComponent(current.key)}`, body), {
    key: () => 'save',
    success: 'Saved. The page shows it now.',
    error: "Couldn't save the wording",
    onSuccess: (res) => { if (res?.data?.data) replace(res.data.data); setDraft({}); },
  });

  const reset = useAdminAction(() => api.delete(`${path}/${encodeURIComponent(current.key)}`), {
    key: () => 'reset',
    confirm: () => ({ title: `Put "${name(current)}" back to the original wording?`, message: 'Every edit in this section is undone, and the section shows again.', confirmLabel: 'Put back' }),
    success: 'Back to the original wording',
    error: "Couldn't put it back",
    onSuccess: (res) => { if (res?.data?.data) replace(res.data.data); setDraft({}); },
  });

  const choose = async (key) => {
    if (dirty && !(await confirmLeave())) return;
    setDraft({});
    setActive(key);
  };

  if (failed) return <EmptyState message="The page wording couldn't be loaded." action={{ label: 'Try again', onClick: load, readOnly: true }} />;
  if (sections === null) return <EmptyState loading rows={4} />;
  if (!current) return <EmptyState message="No page wording to edit yet." />;

  const valueOf = (field) => (field.path in draft ? draft[field.path] : field.value ?? '');
  const edited = current.fields.filter((f) => f.value).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[15rem_1fr]">
      <nav aria-label="Page sections" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0">
        {sections.map((s) => (
          <button key={s.key} type="button" onClick={() => choose(s.key)} aria-current={current.key === s.key ? 'page' : undefined}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-left text-sm transition-colors ${current.key === s.key ? 'bg-tint font-medium text-ink' : 'text-tone-600 hover:bg-tone-100 hover:text-ink'} ${s.visible ? '' : 'opacity-60'}`}>
            {name(s)}{!s.visible && <>{' '}<span className="text-xs">(hidden)</span></>}
          </button>
        ))}
      </nav>
      <div className="rounded-2xl border border-tone-100 bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-ink">{name(current)}</h2>
            <p className="mt-1 text-sm text-tone-500">
              {edited ? `${edited} of ${current.fields.length} changed from the original.` : 'The original wording.'} Leave a field empty to use the original.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span id="okjt-section-visible" className="text-sm text-tone-600">Show on the site</span>
            <button type="button" role="switch" aria-checked={current.visible} aria-labelledby="okjt-section-visible"
              disabled={save.pending || !save.allowed} onClick={() => save.run({ visible: !current.visible })}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${current.visible ? 'bg-accent' : 'bg-tone-300'}`}>
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${current.visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
        <div className="mt-6 space-y-5">
          {current.fields.map((field) => {
            const props = { label: field.label, value: valueOf(field), placeholder: field.default, onChange: (e) => setDraft((d) => ({ ...d, [field.path]: e.target.value })) };
            return <div key={field.path}>{field.multiline ? <AdminTextarea rows={3} {...props} className="!resize-y" /> : <AdminInput {...props} />}</div>;
          })}
        </div>
        <div className="sticky bottom-0 -mx-5 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-tone-100 bg-surface px-5 py-3 sm:-mx-6 sm:px-6">
          <button type="button" onClick={() => reset.run()} disabled={reset.pending || !reset.allowed || (!edited && current.visible)}
            className="text-sm text-soft hover:text-ink disabled:opacity-40">Back to the original</button>
          <div className="flex items-center gap-3">
            <p className="text-sm text-soft">{dirty ? 'Unsaved changes' : ''}</p>
            <button type="button" onClick={() => save.run({ fields: draft })} disabled={!dirty || save.pending || !save.allowed}
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {save.pending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
