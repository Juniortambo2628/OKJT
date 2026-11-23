import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { AdminCard, AdminPageHero, AdminPageLayout, QueryError, useAdminAction, useUnsavedChangesGuard } from '@okjt/dashboard';
import api, { unwrap } from '../lib/api';
import { Field } from './fields';
import { CATALOGUE, FIELDS, OWN_PAGE } from './settingsCatalogue';

const humanise = (key) => key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const asBool = (v) => ['1', 'true', 'on'].includes(String(v).toLowerCase());
const WIDE = ['rich', 'textarea', 'media', 'image', 'lines', 'faq'];

/** How a setting is stored when it doesn't exist yet. */
const storedType = (field) => ({ switch: 'boolean', image: 'image', media: 'media', rich: 'rich', textarea: 'textarea', lines: 'textarea', faq: 'textarea' }[field.type] ?? 'text');

/** A field for a setting the catalogue doesn't know (added later by a migration): best guess from what it holds. */
function guessField(setting) {
  const label = humanise(setting.key);
  const value = setting.value ?? '';
  if (setting.type === 'boolean') return { key: setting.key, label, type: 'switch' };
  if (setting.type === 'image') return { key: setting.key, label, type: 'image' };
  if (setting.type === 'media' || setting.type === 'video') return { key: setting.key, label, type: 'media' };
  if (['html', 'rich', 'rich-text'].includes(setting.type)) return { key: setting.key, label, type: 'rich' };
  if (setting.type === 'textarea' || value.length > 90) return { key: setting.key, label, type: 'textarea', rows: 4 };
  return { key: setting.key, label, type: 'text' };
}

/**
 * /admin/settings: the words, pictures and switches the website reads, in
 * groups by where they appear (settingsCatalogue.js), each with a plain
 * label and a hint, and lists edited row by row rather than as code.
 */
export default function Settings() {
  const query = useQuery({ queryKey: ['/settings'], queryFn: () => api.get('/settings').then((res) => res.data) });
  // Every stored setting by key, whatever group the API keeps it in.
  const stored = useMemo(() => Object.fromEntries(Object.values(query.data ?? {}).flatMap((items) => (unwrap(items) ?? []).map((s) => [s.key, s]))), [query.data]);
  const groups = useMemo(() => {
    const other = Object.values(stored).filter((s) => !FIELDS[s.key] && !OWN_PAGE.includes(s.key)).map(guessField);
    return [
      ...CATALOGUE,
      ...(other.length ? [{ id: 'other', title: 'Other', description: 'Settings without a place above yet.', sections: [{ fields: other }] }] : []),
    ];
  }, [stored]);

  const [active, setActive] = useState(null);
  const current = groups.find((g) => g.id === active) ?? groups[0];
  const [draft, setDraft] = useState({});
  const dirty = Object.keys(draft).length > 0;
  useUnsavedChangesGuard(dirty);
  useEffect(() => { setDraft({}); }, [current?.id]);

  const save = useAdminAction(
    () => api.put('/settings/batch', {
      settings: Object.entries(draft).map(([key, value]) => {
        const field = FIELDS[key] ?? {};
        const original = stored[key];
        return { key, value: typeof value === 'boolean' ? (value ? '1' : '0') : String(value ?? ''), type: original?.type ?? storedType(field), group: original?.group ?? field.store ?? 'general' };
      }),
    }),
    { success: 'Settings saved. The website shows them now.', invalidate: [['/settings'], ['/site-settings/maintenance']], onSuccess: () => setDraft({}) },
  );

  const count = (g) => g.sections.reduce((n, s) => n + s.fields.length, 0);
  const valueOf = (field) => {
    const raw = field.key in draft ? draft[field.key] : stored[field.key]?.value ?? '';
    return field.type === 'switch' ? (typeof raw === 'boolean' ? raw : asBool(raw)) : raw;
  };

  return (
    <AdminPageLayout
      hero={<AdminPageHero title="Site settings" breadcrumb="Site settings" description="The words, pictures and switches the website reads." />}
      actions={[{ id: 'save', label: dirty ? 'Save changes' : 'Saved', icon: Save, onClick: () => save.run(), disabled: !dirty || save.pending, variant: 'primary' }]}
    >
      {query.isError ? <QueryError what="the settings" onRetry={query.refetch} error={query.error} /> : (
        <div className="grid gap-5 lg:grid-cols-[15rem_1fr]">
          {/* Stays in view through long groups, like the dashboard's side panels:
              a column beside the form, a chip bar under the header on phones. */}
          <nav aria-label="Settings groups" className="sticky top-16 z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-accent/10 bg-paper/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-20 lg:z-auto lg:mx-0 lg:max-h-[calc(100dvh-6.5rem)] lg:flex-col lg:self-start lg:overflow-x-visible lg:overflow-y-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            {groups.map((g) => (
              <button key={g.id} type="button" onClick={() => { if (!dirty || window.confirm('Leave without saving your changes?')) setActive(g.id); }} aria-current={current?.id === g.id ? 'page' : undefined}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-left text-sm transition-colors ${current?.id === g.id ? 'bg-[#f3ead5] text-[#1d160d] shadow-sm' : 'text-tone-600 hover:bg-tone-100 hover:text-ink'}`}>
                {g.title} <span className="opacity-60">· {count(g)}</span>
              </button>
            ))}
          </nav>
          <AdminCard>
            {query.isLoading ? <div className="h-64 animate-pulse rounded-xl bg-tone-50" /> : current && (
              <>
                <h2 className="text-lg font-medium text-ink">{current.title}</h2>
                {current.description && <p className="mt-1 text-sm text-tone-500">{current.description}</p>}
                {current.sections.map((section, i) => (
                  <section key={section.title ?? i} className={i ? 'mt-8 border-t border-tone-100 pt-6' : 'mt-6'}>
                    {section.title && <h3 className="text-base font-medium text-ink">{section.title}</h3>}
                    {section.description && <p className="mt-1 text-sm text-tone-500">{section.description}</p>}
                    <div className={`grid gap-5 md:grid-cols-2 ${section.title || section.description ? 'mt-4' : ''}`}>
                      {section.fields.map((field) => (
                        <div key={field.key} className={WIDE.includes(field.type) ? 'md:col-span-2' : ''}>
                          <Field field={field} value={valueOf(field)} onChange={(v) => setDraft((d) => ({ ...d, [field.key]: v }))} />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
                {dirty && <p className="mt-6 text-sm text-accent">You have unsaved changes. Use “Save changes” in the toolbar.</p>}
              </>
            )}
          </AdminCard>
        </div>
      )}
    </AdminPageLayout>
  );
}
