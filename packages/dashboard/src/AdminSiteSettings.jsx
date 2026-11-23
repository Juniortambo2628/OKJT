import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDashboard } from './DashboardProvider.js';
import useAdminAction from './useAdminAction.js';
import useUnsavedChangesGuard, { confirmLeave } from './useUnsavedChangesGuard.js';
import EmptyState from './EmptyState.js';
import SettingField from './SettingField.js';

/**
 * AdminSiteSettings: the words, pictures and switches the website reads,
 * lifted from okjt-app's /admin/settings. laravel-kit's SiteSettingController
 * stores them; the project's `catalogue` says how they're shown: groups (a
 * column beside the form, chips on phones), each with sections of fields,
 * each field with a plain label, a hint and the right editor (SettingField).
 * Stored settings the catalogue doesn't list still show, under "Other", so
 * nothing becomes uneditable.
 *
 *   const CATALOGUE = [
 *     { id: 'contact', title: 'Contact', description: 'Shown on the Contact page and in the footer.',
 *       sections: [{ title: 'How to reach you', fields: [
 *         { key: 'contact_email', store: 'contact', label: 'Email', type: 'email' },
 *         { key: 'contact_phone', store: 'contact', label: 'Phone' },
 *       ] }] },
 *   ];
 *   <AdminSiteSettings catalogue={CATALOGUE} />
 *
 * `store` is the group a new setting is saved under (a stored one keeps its
 * own). Saving sends only what changed; leaving with unsaved changes asks
 * first.
 *
 * @param {Array} catalogue
 * @param {string} [path='/admin/site-settings']
 * @param {string} [mediaPath='/media']  For image and media fields
 * @param {string} [saveLabel='Save changes']
 * @param {string} [savedMessage='Settings saved. The website shows them now.']
 */
const WIDE = ['textarea', 'media', 'image', 'lines', 'custom'];
const STORED_TYPE = { switch: 'boolean', image: 'image', media: 'media', textarea: 'textarea', lines: 'textarea' };
const humanise = (key) => key.replace(/[_.-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/** An editor for a stored setting the catalogue doesn't list: a guess from what it holds. */
function guessField(setting) {
  const value = setting.value ?? '';
  const type = setting.type === 'boolean' ? 'switch'
    : ['image', 'media'].includes(setting.type) ? setting.type
      : setting.type === 'video' ? 'media'
        : setting.type === 'textarea' || value.length > 90 ? 'textarea' : 'text';
  return { key: setting.key, label: humanise(setting.key), type };
}

export default function AdminSiteSettings({
  catalogue = [],
  path = '/admin/site-settings',
  mediaPath = '/media',
  saveLabel = 'Save changes',
  savedMessage = 'Settings saved. The website shows them now.',
}) {
  const { api } = useDashboard();
  const [stored, setStored] = useState(null);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState({});
  const [active, setActive] = useState(null);
  const dirty = Object.keys(draft).length > 0;
  useUnsavedChangesGuard(dirty);

  const load = useCallback(async () => {
    try {
      const res = await api.get(path);
      setStored(Object.fromEntries((res.data?.data ?? []).map((s) => [s.key, s])));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [api, path]);
  useEffect(() => { load(); }, [load]);

  const known = useMemo(() => Object.fromEntries(catalogue.flatMap((g) => g.sections.flatMap((s) => s.fields.map((f) => [f.key, f])))), [catalogue]);
  const groups = useMemo(() => {
    const other = Object.values(stored ?? {}).filter((s) => !known[s.key]).map(guessField);
    return [...catalogue, ...(other.length ? [{ id: 'other', title: 'Other', description: 'Settings without a place above yet.', sections: [{ fields: other }] }] : [])];
  }, [catalogue, known, stored]);
  const current = groups.find((g) => g.id === active) ?? groups[0];

  const save = useAdminAction(() => api.put(path, {
    settings: Object.entries(draft).map(([key, value]) => {
      const field = known[key] ?? {};
      const original = stored?.[key];
      return {
        key,
        value: typeof value === 'boolean' ? (value ? '1' : '0') : String(value ?? ''),
        type: original?.type ?? STORED_TYPE[field.type] ?? 'text',
        group: original?.group ?? field.store ?? 'general',
      };
    }),
  }), {
    key: () => 'save',
    success: savedMessage,
    error: "Couldn't save the settings",
    onSuccess: (res) => {
      setDraft({});
      const rows = res?.data?.data;
      if (Array.isArray(rows)) setStored(Object.fromEntries(rows.map((s) => [s.key, s])));
    },
  });

  const choose = async (id) => {
    if (dirty && !(await confirmLeave())) return;
    setDraft({});
    setActive(id);
  };
  const valueOf = (field) => (field.key in draft ? draft[field.key] : stored?.[field.key]?.value ?? '');
  const count = (g) => g.sections.reduce((n, s) => n + s.fields.length, 0);

  if (failed) return <EmptyState message="The settings couldn't be loaded." action={{ label: 'Try again', onClick: load, readOnly: true }} />;
  if (stored === null) return <EmptyState loading rows={4} />;
  if (!current) return <EmptyState message="No settings yet." />;

  return (
    <div className="grid gap-5 lg:grid-cols-[15rem_1fr]">
      <nav aria-label="Settings groups" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0">
        {groups.map((g) => (
          <button key={g.id} type="button" onClick={() => choose(g.id)} aria-current={current.id === g.id ? 'page' : undefined}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-left text-sm transition-colors ${current.id === g.id ? 'bg-tint font-medium text-ink' : 'text-tone-600 hover:bg-tone-100 hover:text-ink'}`}>
            {g.title} <span className="opacity-60">· {count(g)}</span>
          </button>
        ))}
      </nav>
      <div className="rounded-2xl border border-tone-100 bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-medium text-ink">{current.title}</h2>
        {current.description && <p className="mt-1 text-sm text-tone-500">{current.description}</p>}
        {current.sections.map((section, i) => (
          <section key={section.title ?? i} className={i ? 'mt-8 border-t border-tone-100 pt-6' : 'mt-6'}>
            {section.title && <h3 className="text-base font-medium text-ink">{section.title}</h3>}
            {section.description && <p className="mt-1 text-sm text-tone-500">{section.description}</p>}
            <div className={`grid gap-5 md:grid-cols-2 ${section.title || section.description ? 'mt-4' : ''}`}>
              {section.fields.map((field) => (
                <div key={field.key} className={WIDE.includes(field.type) ? 'md:col-span-2' : ''}>
                  <SettingField field={field} value={valueOf(field)} mediaPath={mediaPath} onChange={(v) => setDraft((d) => ({ ...d, [field.key]: v }))} />
                </div>
              ))}
            </div>
          </section>
        ))}
        <div className="sticky bottom-0 -mx-5 mt-8 flex items-center justify-between gap-3 border-t border-tone-100 bg-surface px-5 py-3 sm:-mx-6 sm:px-6">
          <p className="text-sm text-soft">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
          <button type="button" onClick={() => save.run()} disabled={!dirty || save.pending || !save.allowed}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {save.pending ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
