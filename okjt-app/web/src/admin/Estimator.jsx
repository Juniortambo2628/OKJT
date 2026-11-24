import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { AdminCard, AdminInput, AdminPageHero, AdminPageLayout, AdminSelect, QueryError, useAdminAction, useUnsavedChangesGuard } from '@okjt/dashboard';
import api, { unwrap } from '../lib/api';
import { DEFAULT_ESTIMATOR, defaultAnswers, estimate, estimatorConfig, usd } from '../lib/estimator';
import { inputClass } from './fields';

const KEY = 'estimator_config';
const clone = (value) => JSON.parse(JSON.stringify(value));
const num = (value) => (value === '' || value == null ? 0 : Number(value));

/** The saved config from the settings, or the starting figures. */
function useSavedConfig() {
  const query = useQuery({ queryKey: ['/settings'], queryFn: () => api.get('/settings').then((res) => res.data) });
  const saved = useMemo(() => {
    const items = unwrap(query.data?.services) ?? [];
    const raw = items.find((s) => s.key === KEY)?.value;
    try { return estimatorConfig(raw ? JSON.parse(raw) : null); } catch { return DEFAULT_ESTIMATOR; }
  }, [query.data]);
  return [query, saved];
}

/** One answer, as a small panel: its words, price and weeks on one line, hint and outline line below. */
function OptionRow({ option, deadline, onChange, onRemove, canRemove }) {
  const set = (key) => (e) => onChange({ ...option, [key]: e.target.type === 'number' ? num(e.target.value) : e.target.value });
  const name = option.label || 'this answer';
  return (
    <li className="rounded-xl border border-tone-100 p-3 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_6rem_auto] sm:items-end">
        <AdminInput label="Answer" value={option.label} onChange={set('label')} className={inputClass} />
        <AdminInput label="Price (US$)" type="number" min={0} step={100} value={option.cost ?? 0} onChange={set('cost')} className={`${inputClass} tabular-nums`} />
        <AdminInput label="Weeks" type="number" min={0} step={1} value={option.weeks ?? 0} onChange={set('weeks')} className={`${inputClass} tabular-nums`} />
        <button type="button" onClick={onRemove} disabled={!canRemove} aria-label={`Remove ${name}`} title={canRemove ? 'Remove this answer' : 'A question needs at least two answers'} className="justify-self-end rounded-lg p-2.5 text-tone-400 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-tone-400">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <AdminInput label="Hint (optional)" value={option.hint ?? ''} onChange={set('hint')} placeholder="Shown under the answer, e.g. customers, staff" className={inputClass} />
        <AdminInput label="Adds to the outline (optional)" value={option.scope ?? ''} onChange={set('scope')} placeholder="A line in the estimate’s list" className={inputClass} />
      </div>
      {deadline && (
        <label className="mt-3 flex items-center gap-2 text-sm text-tone-600">
          <input type="checkbox" checked={!!option.rush} onChange={(e) => onChange({ ...option, rush: e.target.checked })} className="h-4 w-4 accent-[var(--color-accent)]" />
          Rush rate applies to this answer
        </label>
      )}
    </li>
  );
}

/** One question: its words, then its answers. */
function QuestionCard({ question, index, onChange }) {
  const deadline = question.options.some((o) => o.timeline || o.rush);
  const setOption = (i, option) => onChange({ ...question, options: question.options.map((o, n) => (n === i ? option : o)) });
  const removeOption = (i) => onChange({ ...question, options: question.options.filter((_, n) => n !== i) });
  const addOption = () => onChange({ ...question, options: [...question.options, { id: `answer-${Date.now().toString(36)}`, label: 'New answer', cost: 0, weeks: 0 }] });
  return (
    <AdminCard>
      <div className="flex items-baseline gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-tone-100 text-xs font-semibold text-tone-600">{index + 1}</span>
        <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_12rem]">
          <AdminInput label="Question" value={question.label} onChange={(e) => onChange({ ...question, label: e.target.value })} className={inputClass} />
          <AdminInput label="Step name" value={question.short ?? ''} onChange={(e) => onChange({ ...question, short: e.target.value })} placeholder="Shown in the progress bar" className={inputClass} />
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {question.options.map((option, i) => (
          <OptionRow key={option.id} option={option} deadline={deadline} onChange={(o) => setOption(i, o)} onRemove={() => removeOption(i)} canRemove={question.options.length > 2} />
        ))}
      </ul>
      <button type="button" onClick={addOption} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-strong"><Plus className="h-4 w-4" /> Add an answer</button>
    </AdminCard>
  );
}

/** Try the config: pick answers and see the estimate a visitor would get. */
function Preview({ config }) {
  const [answers, setAnswers] = useState(() => defaultAnswers(config));
  const valid = useMemo(() => Object.fromEntries(config.questions.map((q) => [q.id, q.options.some((o) => o.id === answers[q.id]) ? answers[q.id] : (q.options.find((o) => o.default) ?? q.options[0]).id])), [config, answers]);
  const result = estimate(config, valid);
  return (
    <AdminCard className="lg:sticky lg:top-20">
      <h2 className="text-lg font-medium text-ink">Preview</h2>
      <p className="mt-1 text-sm text-tone-500">Pick answers to see the estimate a visitor would get with these figures.</p>
      <div className="mt-4 rounded-xl bg-tone-50 p-4" aria-live="polite">
        <div className="text-2xl font-light tracking-tight text-ink tabular-nums">{usd(result.low)} – {usd(result.high)}</div>
        <div className="mt-1 text-sm text-tone-600">About {result.weeksLow} to {result.weeksHigh} weeks{result.rush ? ', at a rush rate' : ''}</div>
      </div>
      <div className="mt-4 space-y-3">
        {config.questions.map((q) => (
          <AdminSelect key={q.id} label={q.short || q.label} value={valid[q.id]} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} className={inputClass}>
            {q.options.map((o) => <option key={o.id} value={o.id}>{o.label} ({usd(num(o.cost))})</option>)}
          </AdminSelect>
        ))}
      </div>
    </AdminCard>
  );
}

/** /admin/estimator: the cost estimator's questions, prices and weeks, as a form. */
export default function Estimator() {
  const [query, saved] = useSavedConfig();
  const [draft, setDraft] = useState(null);
  useEffect(() => { if (query.data) setDraft(clone(saved)); }, [query.data, saved]);
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved);
  useUnsavedChangesGuard(dirty);

  const save = useAdminAction(
    () => api.put('/settings/batch', { settings: [{ key: KEY, value: JSON.stringify(draft), type: 'textarea', group: 'services' }] }),
    { success: 'Estimator saved. The website uses these figures now.', invalidate: [['/settings']] },
  );
  const setQuestion = (i, q) => setDraft((d) => ({ ...d, questions: d.questions.map((x, n) => (n === i ? q : x)) }));
  const pct = (value) => Math.round(((value ?? 1) - 1) * 100);

  return (
    <AdminPageLayout
      hero={<AdminPageHero title="Cost estimator" breadcrumb="Cost estimator" description="The questions, prices and weeks behind the free estimator on the website. Changes show as soon as you save." />}
      actions={[
        { id: 'save', label: dirty ? 'Save changes' : 'Saved', icon: Save, onClick: () => save.run(), disabled: !dirty || save.pending, variant: 'primary' },
        { id: 'defaults', label: 'Use starting figures', icon: RotateCcw, onClick: () => { if (window.confirm('Replace every question, price and week with the starting figures? Nothing is saved until you press Save.')) setDraft(clone(DEFAULT_ESTIMATOR)); } },
        { id: 'view', label: 'View on site', icon: ExternalLink, onClick: () => window.open('/tools/estimate', '_blank', 'noopener') },
      ]}
    >
      {query.isError ? <QueryError what="the estimator" onRetry={query.refetch} error={query.error} /> : !draft ? (
        <AdminCard><div className="h-64 animate-pulse rounded-xl bg-tone-50" /></AdminCard>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="space-y-5">
            <AdminCard>
              <h2 className="text-lg font-medium text-ink">How the range is worked out</h2>
              <p className="mt-1 text-sm text-tone-500">The low end adds up the prices of the chosen answers. The high end and the rush rate are set here.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <AdminInput label="High end above the low end (%)" type="number" min={0} max={300} step={5} value={pct(draft.spread)} onChange={(e) => setDraft((d) => ({ ...d, spread: 1 + num(e.target.value) / 100 }))} className={`${inputClass} tabular-nums`} />
                  <p className="mt-1 text-xs text-tone-500">40% turns $5,000 into $5,000 – $7,000.</p>
                </div>
                <div>
                  <AdminInput label="Rush rate (%)" type="number" min={0} max={200} step={5} value={pct(draft.rush)} onChange={(e) => setDraft((d) => ({ ...d, rush: 1 + num(e.target.value) / 100 }))} className={`${inputClass} tabular-nums`} />
                  <p className="mt-1 text-xs text-tone-500">Added when a deadline answer has “Rush rate applies”.</p>
                </div>
                <div>
                  <AdminInput label="Round to the nearest (US$)" type="number" min={1} step={50} value={draft.round ?? 500} onChange={(e) => setDraft((d) => ({ ...d, round: Math.max(1, num(e.target.value)) }))} className={`${inputClass} tabular-nums`} />
                  <p className="mt-1 text-xs text-tone-500">Ranges are rounded to this.</p>
                </div>
              </div>
            </AdminCard>
            {draft.questions.map((q, i) => <QuestionCard key={q.id} question={q} index={i} onChange={(next) => setQuestion(i, next)} />)}
            {dirty && <p className="text-sm text-accent">You have unsaved changes. Use “Save changes” in the toolbar.</p>}
          </div>
          <Preview config={draft} />
        </div>
      )}
    </AdminPageLayout>
  );
}
