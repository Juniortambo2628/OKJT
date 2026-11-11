import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { AdminCard, AdminPageHero, AdminPageLayout, QueryError, useAdminAction, useUnsavedChangesGuard } from '@okjt/dashboard';
import api, { unwrap } from '../lib/api';
import { Field } from './fields';

/** What each settings group is called and what it is for, in the order shown. */
const GROUPS = {
  homepage: ['Home page', 'The home page’s headline, rotating words and section titles.'],
  about: ['About page', 'The story, approach and studio sections of the About page.'],
  contact: ['Contact details', 'Email, phone, address and social links shown across the site.'],
  services: ['Services', 'Titles and pictures of the Services page.'],
  'hero-media': ['Pictures and clips', 'The photo or clip behind each page’s hero and sections.'],
  branding: ['Logo and icon', 'The logos and favicon.'],
  widgets: ['Widgets', 'The WhatsApp button and the FAQ assistant.'],
  legal: ['Legal documents', 'Privacy policy, terms of service and cookie policy. Headings become the document’s sections.'],
  email: ['Email templates', 'The emails the site sends.'],
  maintenance: ['Maintenance mode', 'Show a maintenance page to visitors (you still see the site while signed in).'],
  general: ['General', 'Everything else.'],
};

const humanise = (key) => key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/** The editor for a setting, from its type and what it holds. */
function fieldFor(setting, group) {
  const label = humanise(setting.key);
  const value = setting.value ?? '';
  if (setting.type === 'boolean') return { key: setting.key, label, type: 'switch' };
  if (setting.type === 'image') return { key: setting.key, label, type: 'image' };
  if (setting.type === 'media' || setting.type === 'video') return { key: setting.key, label, type: 'media' };
  if (group === 'legal' || group === 'email' || setting.type === 'html' || setting.type === 'rich') return { key: setting.key, label, type: 'rich', tall: group === 'legal' };
  if (/^\s*[[{]/.test(value)) return { key: setting.key, label, type: 'textarea', rows: 10, hint: 'Structured data (JSON). Keep the brackets and quotes as they are.' };
  if (setting.type === 'textarea' || value.length > 90) return { key: setting.key, label, type: 'textarea', rows: 4 };
  return { key: setting.key, label, type: 'text' };
}

const asBool = (v) => ['1', 'true', 'on'].includes(String(v).toLowerCase());

export default function Settings() {
  const query = useQuery({ queryKey: ['/settings'], queryFn: () => api.get('/settings').then((res) => res.data) });
  const groups = useMemo(() => {
    const byGroup = Object.entries(query.data ?? {}).map(([id, items]) => ({ id, items: unwrap(items) ?? [] }));
    const order = Object.keys(GROUPS);
    return byGroup.sort((a, b) => (order.indexOf(a.id) + 1 || 99) - (order.indexOf(b.id) + 1 || 99));
  }, [query.data]);
  const [active, setActive] = useState(null);
  const current = groups.find((g) => g.id === active) ?? groups[0];
  const [draft, setDraft] = useState({});
  const dirty = Object.keys(draft).length > 0;
  useUnsavedChangesGuard(dirty);
  useEffect(() => { setDraft({}); }, [current?.id]);

  const save = useAdminAction(
    () => api.put('/settings/batch', {
      settings: Object.entries(draft).map(([key, value]) => {
        const original = current.items.find((s) => s.key === key);
        return { key, value: typeof value === 'boolean' ? (value ? '1' : '0') : String(value ?? ''), type: original?.type, group: current.id };
      }),
    }),
    { success: 'Settings saved. The website shows them now.', invalidate: [['/settings'], ['/site-settings/maintenance']], onSuccess: () => setDraft({}) },
  );

  const [title, description] = GROUPS[current?.id] ?? [humanise(current?.id || 'Settings'), ''];
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
                {GROUPS[g.id]?.[0] ?? humanise(g.id)} <span className="opacity-60">· {g.items.length}</span>
              </button>
            ))}
          </nav>
          <AdminCard>
            {query.isLoading ? <div className="h-64 animate-pulse rounded-xl bg-tone-50" /> : current && (
              <>
                <h2 className="text-lg font-medium text-ink">{title}</h2>
                {description && <p className="mt-1 text-sm text-tone-500">{description}</p>}
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {current.items.map((s) => {
                    const field = fieldFor(s, current.id);
                    const raw = s.key in draft ? draft[s.key] : s.value;
                    const value = field.type === 'switch' ? (typeof raw === 'boolean' ? raw : asBool(raw)) : raw;
                    return (
                      <div key={s.key} className={['rich', 'textarea', 'media', 'image'].includes(field.type) ? 'md:col-span-2' : ''}>
                        <Field field={field} value={value} onChange={(v) => setDraft((d) => ({ ...d, [s.key]: v }))} />
                      </div>
                    );
                  })}
                </div>
                {dirty && <p className="mt-6 text-sm text-accent">You have unsaved changes. Use “Save changes” in the toolbar.</p>}
              </>
            )}
          </AdminCard>
        </div>
      )}
    </AdminPageLayout>
  );
}
