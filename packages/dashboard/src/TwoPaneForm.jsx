import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '@okjt/ui';
import TwoPaneDialog from './TwoPaneDialog.js';

const CHECK = 'check';

/**
 * A long form in two panes (lifted from Naoa): named sections on the left, one at a
 * time on the right, and a final "Check details" section that sums up what
 * will be saved and lists anything still missing. Short forms stay in a
 * single-pane AdminModal.
 *
 * - Validation runs when a field loses focus (fields need a `name`), and for
 *   every field when the person tries to save.
 * - New entries keep a draft in this browser (`draftKey`) until saved or
 *   closed with "Discard", so an interrupted form isn't lost.
 *
 *   <TwoPaneForm open title initial={values} draftKey="event-new" onClose onSubmit
 *     validate={(v) => ({ name: v.name ? null : 'Give it a name' })}
 *     sections={[{ id, label, fields: ['name', …], render: ({ values, set, field, error }) => …, summary: (v) => [['Name', v.name]] }]} />
 *
 * `set(name)` is an onChange handler; `field(name)` gives { name, value, onChange } for inputs;
 * `error(name)` is the message to show once the field has been left.
 */
export default function TwoPaneForm({
  open, title, subtitle, sections, initial, validate = () => ({}), onClose, onSubmit,
  submitLabel = 'Save', draftKey = null,
}) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [active, setActive] = useState(sections[0]?.id);
  const [saving, setSaving] = useState(false);
  const [restored, setRestored] = useState(false);
  const [visited, setVisited] = useState(() => new Set());
  const opened = useRef(false);

  // Fresh values each time the form opens; a saved draft wins for new entries.
  useEffect(() => {
    if (!open) { opened.current = false; return; }
    if (opened.current) return;
    opened.current = true;
    let draft = null;
    try { draft = draftKey ? JSON.parse(localStorage.getItem(`draft:${draftKey}`) || 'null') : null; } catch { draft = null; }
    setValues(draft ? { ...initial, ...draft } : initial);
    setRestored(!!draft);
    setTouched({});
    setVisited(new Set());
    setActive(sections[0]?.id);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || !draftKey || !opened.current) return;
    try { localStorage.setItem(`draft:${draftKey}`, JSON.stringify(values)); } catch { /* storage full or blocked */ }
  }, [values, open, draftKey]);

  const errors = useMemo(() => Object.fromEntries(Object.entries(validate(values) || {}).filter(([, m]) => m)), [values, validate]);
  const sectionOf = (name) => sections.find((s) => s.fields?.includes(name))?.id;
  const sectionErrors = (s) => (s.fields || []).filter((f) => errors[f]);

  if (!open) return null;

  const clearDraft = () => { if (draftKey) try { localStorage.removeItem(`draft:${draftKey}`); } catch { /* ignore */ } };
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));
  const field = (name) => ({ name, value: values[name] ?? '', onChange: set(name) });
  const error = (name) => (touched[name] ? errors[name] : null);
  const onBlur = (e) => { if (e.target.name) setTouched((t) => ({ ...t, [e.target.name]: true })); };

  // A section is ticked once the person has been through it (moved on from it) and it has nothing to fix.
  const go = (id) => { setVisited((v) => new Set(v).add(active)); setActive(id); };
  const all = [...sections, { id: CHECK, label: 'Check details', hint: Object.keys(errors).length ? `${Object.keys(errors).length} to fix` : 'Ready to save' }];
  const index = all.findIndex((s) => s.id === active);
  const current = sections.find((s) => s.id === active);

  const submit = async () => {
    if (Object.keys(errors).length) {
      setTouched(Object.fromEntries(Object.keys(errors).map((k) => [k, true])));
      go(CHECK);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(values);
      clearDraft();
      onClose();
    } catch {
      // The caller showed the error; keep the form (and the draft).
    }
    setSaving(false);
  };
  const discard = () => { clearDraft(); onClose(); };

  return (
    <TwoPaneDialog
      open
      title={title}
      subtitle={restored ? 'We kept what you’d typed last time.' : subtitle}
      sections={all.map((s) => ({
        id: s.id, label: s.label,
        hint: s.id === CHECK ? s.hint : sectionErrors(s).length && sectionErrors(s).some((f) => touched[f]) ? 'Something to fix' : s.hint,
        done: s.id !== CHECK && visited.has(s.id) && !sectionErrors(s).length,
      }))}
      active={active}
      onSelect={go}
      onClose={onClose}
      footer={(
        <>
          {draftKey && restored && <Button onClick={discard}>Discard draft</Button>}
          {index > 0 && <Button icon={ArrowLeft} onClick={() => go(all[index - 1].id)}>Back</Button>}
          {active !== CHECK && <Button icon={ArrowRight} onClick={() => go(all[index + 1].id)}>Next</Button>}
          <Button edit variant="secondary" icon={Save} loading={saving} onClick={submit}>{submitLabel}</Button>
        </>
      )}
    >
      <form onBlur={onBlur} onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
        {current && (
          <div className="space-y-4">
            {current.intro && <p className="text-sm text-tone-500">{current.intro}</p>}
            {current.render({ values, set, field, error, setValues })}
          </div>
        )}
        {active === CHECK && (
          <div className="space-y-5">
            {Object.keys(errors).length > 0 && (
              <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-semibold">Before saving:</p>
                <ul className="mt-1 space-y-1">
                  {Object.entries(errors).map(([name, message]) => (
                    <li key={name}>
                      <button type="button" className="underline" onClick={() => go(sectionOf(name) || sections[0].id)}>{message}</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sections.filter((s) => s.summary).map((s) => {
              const rows = s.summary(values).filter(([, v]) => v !== null && v !== undefined && v !== '');
              return (
                <section key={s.id}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-ink">{s.label}</h3>
                    <button type="button" className="text-sm text-accent hover:underline" onClick={() => go(s.id)}>Change</button>
                  </div>
                  {rows.length ? (
                    <dl className="mt-1 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[10rem_1fr]">
                      {rows.map(([label, value]) => (
                        <div key={label} className="contents">
                          <dt className="text-tone-500">{label}</dt>
                          <dd className="text-body">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : <p className="mt-1 text-sm text-tone-500">Nothing filled in.</p>}
                </section>
              );
            })}
          </div>
        )}
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </TwoPaneDialog>
  );
}

/** A field's error message, under the field. */
export function FieldError({ message }) {
  if (!message) return null;
  return <p role="alert" className="-mt-2 text-xs text-amber-800">{message}</p>;
}
