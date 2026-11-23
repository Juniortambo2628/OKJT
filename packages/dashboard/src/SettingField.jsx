import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, Upload } from 'lucide-react';
import { MEDIA_ACCEPT, notifyError } from '@okjt/ui';
import { useDashboard } from './DashboardProvider.js';
import { AdminInput, AdminSelect, AdminTextarea } from './AdminInput.js';
import MediaPicker from './MediaPicker.js';

/**
 * One editable site setting, by `field.type`, lifted from okjt-app's admin
 * fields (fields.jsx). Used by AdminSiteSettings; usable on its own.
 *
 * Types: text (default), textarea (rows), email, url, number, select
 * (options: [{ value, label }] or strings), switch, image, media (an image
 * or a video: upload into the media library, pick from it, or paste an
 * address), lines (a list of short texts, one per row; format 'comma' or
 * 'json' says how it is stored), and custom (field.render({ value,
 * onChange, field })) for anything a project draws itself.
 *
 * @param {{ key, label?, type?, hint?, placeholder?, rows?, options?, format?, item?, required?, render? }} field
 * @param {*} value
 * @param {(value) => void} onChange
 * @param {string} [mediaPath='/media']  The media library API, for image / media fields
 */
const humanise = (key) => key.replace(/[_.-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const VIDEO = /\.(mp4|webm)(\?|$)/i;

export function readList(value, format = 'comma') {
  if (Array.isArray(value)) return value;
  const text = String(value ?? '').trim();
  if (!text) return [];
  if (format === 'json') {
    try { const parsed = JSON.parse(text); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }
  return text.split(',').map((v) => v.trim()).filter(Boolean);
}

export function writeList(items, format = 'comma') {
  return format === 'json' ? JSON.stringify(items) : items.join(', ');
}

function MediaField({ label, value, onChange, hint, kind, mediaPath }) {
  const { api } = useDashboard();
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const input = useRef(null);
  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('files[]', file);
      const res = await api.post(mediaPath, form);
      onChange(res.data?.data?.[0]?.url ?? '');
    } catch (err) {
      notifyError(err, 'The upload failed.');
    } finally {
      setBusy(false);
    }
  };
  const button = 'inline-flex items-center gap-1.5 rounded-lg border border-tone-200 px-3 py-1.5 text-xs font-medium text-tone-700 hover:border-accent hover:text-accent disabled:opacity-60';
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-tone-600">{label}</div>
      <div className="flex items-start gap-3">
        <div className="relative grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-tone-200 bg-tone-50">
          {value
            ? (VIDEO.test(value) ? <video src={value} className="h-full w-full object-cover" muted /> : <img src={value} alt="" className="h-full w-full object-cover" />)
            : <ImagePlus className="h-6 w-6 text-tone-300" aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className={button}><Upload className="h-3.5 w-3.5" /> {busy ? 'Uploading…' : 'Upload'}</button>
            <button type="button" onClick={() => setPicking(true)} className={button}><ImagePlus className="h-3.5 w-3.5" /> Library</button>
            {value && <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-tone-500 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /> Remove</button>}
          </div>
          <AdminInput bare value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="…or an address" aria-label={`${label} address`} className="text-xs" />
          {hint && <p className="text-xs text-tone-500">{hint}</p>}
        </div>
      </div>
      <input ref={input} type="file" hidden accept={kind === 'media' ? MEDIA_ACCEPT.media : MEDIA_ACCEPT.image} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
      <MediaPicker open={picking} onClose={() => setPicking(false)} onPick={(asset) => onChange(asset.url)} kind={kind === 'media' ? null : 'image'} path={mediaPath} />
    </div>
  );
}

function LinesField({ label, value, onChange, format, item = 'item', hint }) {
  const saved = writeList(readList(value, format).map(String), format);
  const [rows, setRows] = useState(() => readList(value, format).map(String));
  // Take outside changes (the settings reloaded), not the echo of our own edits.
  useEffect(() => {
    setRows((current) => (writeList(current.map((t) => t.trim()).filter(Boolean), format) === saved ? current : readList(saved, format).map(String)));
  }, [saved, format]);
  const set = (next) => {
    setRows(next);
    onChange(writeList(next.map((t) => t.trim()).filter(Boolean), format));
  };
  const clean = (text) => (format === 'json' ? text : text.replace(/,/g, ''));
  const move = (i, by) => { const next = [...rows]; const [x] = next.splice(i, 1); next.splice(i + by, 0, x); set(next); };
  const icon = 'rounded-lg p-2 text-tone-400 hover:bg-tone-100 hover:text-ink disabled:opacity-30';
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-tone-600">{label}</legend>
      {hint && <p className="mb-2 text-xs text-tone-500">{hint}</p>}
      <ul className="space-y-2">
        {rows.map((text, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-right text-xs tabular-nums text-tone-400">{i + 1}</span>
            <AdminInput bare aria-label={`${label}: ${item} ${i + 1}`} value={text} onChange={(e) => set(rows.map((t, n) => (n === i ? clean(e.target.value) : t)))} />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${item} ${i + 1} up`} className={icon}><ArrowUp className="h-4 w-4" /></button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={`Move ${item} ${i + 1} down`} className={icon}><ArrowDown className="h-4 w-4" /></button>
            <button type="button" onClick={() => set(rows.filter((_, n) => n !== i))} aria-label={`Remove ${item} ${i + 1}`} className="rounded-lg p-2 text-tone-400 hover:bg-red-500/10 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
      {!rows.length && <p className="rounded-lg border border-dashed border-tone-200 px-4 py-3 text-sm text-tone-500">None yet.</p>}
      <button type="button" onClick={() => setRows([...rows, ''])} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-strong"><Plus className="h-4 w-4" /> Add a {item}</button>
    </fieldset>
  );
}

const asBool = (v) => v === true || ['1', 'true', 'on', 'yes'].includes(String(v).toLowerCase());

export default function SettingField({ field, value, onChange, mediaPath = '/media' }) {
  const type = field.type ?? 'text';
  const label = field.label ?? humanise(field.key);
  const hint = field.hint;
  if (type === 'custom' && field.render) return field.render({ value, onChange, field });
  if (type === 'image' || type === 'media') return <MediaField label={label} value={value} onChange={onChange} hint={hint} kind={type} mediaPath={mediaPath} />;
  if (type === 'lines') return <LinesField label={label} value={value} onChange={onChange} format={field.format} item={field.item} hint={hint} />;
  if (type === 'switch') {
    const on = asBool(value);
    const id = `okjt-setting-${field.key}`;
    return (
      <div className="flex items-start justify-between gap-4">
        <div>
          <p id={id} className="text-sm font-medium text-tone-600">{label}</p>
          {hint && <p className="mt-1 text-xs text-tone-500">{hint}</p>}
        </div>
        <button type="button" role="switch" aria-checked={on} aria-labelledby={id} onClick={() => onChange(!on)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${on ? 'bg-accent' : 'bg-tone-300'}`}>
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
    );
  }
  let control;
  if (type === 'textarea') {
    control = <AdminTextarea label={label} rows={field.rows || 4} value={value ?? ''} placeholder={field.placeholder} required={field.required} onChange={(e) => onChange(e.target.value)} className="!resize-y" />;
  } else if (type === 'select') {
    const options = (field.options ?? []).map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
    control = (
      <AdminSelect label={label} value={value ?? ''} required={field.required} onChange={(e) => onChange(e.target.value)}>
        {!field.required && <option value="">—</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </AdminSelect>
    );
  } else {
    const inputType = { email: 'email', url: 'url', number: 'number' }[type] ?? 'text';
    control = <AdminInput label={label} type={inputType} value={value ?? ''} placeholder={field.placeholder} required={field.required} onChange={(e) => onChange(e.target.value)} />;
  }
  return <div>{control}{hint && <p className="mt-1 text-xs text-tone-500">{hint}</p>}</div>;
}
