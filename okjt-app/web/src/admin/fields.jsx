import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Quote, Trash2, Upload, X } from 'lucide-react';
import { AdminInput, AdminSelect, AdminTextarea, ToggleButton } from '@okjt/dashboard';
import api, { errorMessage, unwrap } from '../lib/api';
import { mediaUrl, isVideo } from '../lib/media';
import { notifyError } from '@okjt/ui';

export const inputClass = 'bg-paper text-ink placeholder:text-tone-400';

/** Upload one file to the media library; resolves to its stored path (uploads/…). */
export async function uploadFile(file) {
  const body = new FormData();
  body.append('file', file);
  const { data } = await api.post('/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data.path ? `/storage/${data.path}` : data.url;
}

export function useMedia(enabled = true) {
  return useQuery({ queryKey: ['/media'], queryFn: () => api.get('/media').then((res) => unwrap(res.data)), enabled });
}

/* ---------- Picking from the media library ---------- */

export function MediaPicker({ open, onClose, onPick, accept = 'image' }) {
  const { data = [], isLoading } = useMedia(open);
  if (!open) return null;
  const files = data.filter((f) => accept === 'any' || f.type === accept || (accept === 'media' && f.type !== 'file'));
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-label="Media library" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-tone-200 bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-tone-100 px-5 py-4">
          <h2 className="text-lg font-medium text-ink">Choose from the media library</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-tone-400 hover:bg-tone-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-3 md:grid-cols-4">
          {isLoading && <p className="col-span-full text-sm text-tone-500">Loading…</p>}
          {!isLoading && !files.length && <p className="col-span-full text-sm text-tone-500">Nothing uploaded yet.</p>}
          {files.map((f) => (
            <button key={f.path} type="button" onClick={() => { onPick(`/storage/${f.path}`); onClose(); }} className="group overflow-hidden rounded-xl border border-tone-200 text-left hover:border-accent">
              <div className="aspect-square bg-tone-50">
                {f.type === 'video'
                  ? <video src={mediaUrl(f.url)} className="h-full w-full object-cover" muted />
                  : <img src={mediaUrl(f.url)} alt="" loading="lazy" className="h-full w-full object-cover" />}
              </div>
              <div className="truncate px-2 py-1.5 text-xs text-tone-600">{f.filename}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- An image (or clip) field: preview, upload, pick, clear ---------- */

export function MediaField({ label, value, onChange, accept = 'image', hint }) {
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const input = useRef(null);
  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try { onChange(await uploadFile(file)); } catch (err) { notifyError(errorMessage(err, 'The upload failed.')); } finally { setBusy(false); }
  };
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-tone-600">{label}</div>
      <div className="flex items-start gap-3">
        <div className="relative grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-tone-200 bg-tone-50">
          {value ? (isVideo(value)
            ? <video src={mediaUrl(value)} className="h-full w-full object-cover" muted />
            : <img src={mediaUrl(value)} alt="" className="h-full w-full object-cover" />)
            : <ImagePlus className="h-6 w-6 text-tone-300" aria-hidden="true" />}
          {busy && <div className="absolute inset-0 grid place-items-center bg-black/50"><Loader2 className="h-5 w-5 animate-spin text-ink" /></div>}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-tone-200 px-3 py-1.5 text-xs font-medium text-tone-700 hover:border-accent hover:text-accent"><Upload className="h-3.5 w-3.5" /> Upload</button>
            <button type="button" onClick={() => setPicking(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-tone-200 px-3 py-1.5 text-xs font-medium text-tone-700 hover:border-accent hover:text-accent"><ImagePlus className="h-3.5 w-3.5" /> Library</button>
            {value && <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-tone-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /> Remove</button>}
          </div>
          <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="…or an address" className={`w-full rounded-lg border border-tone-200 px-3 py-1.5 text-xs ${inputClass}`} aria-label={`${label} address`} />
          {hint && <p className="text-xs text-tone-500">{hint}</p>}
        </div>
      </div>
      <input ref={input} type="file" hidden accept={accept === 'image' ? 'image/*' : 'image/*,video/mp4'} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
      <MediaPicker open={picking} onClose={() => setPicking(false)} onPick={onChange} accept={accept === 'image' ? 'image' : 'media'} />
    </div>
  );
}

/* ---------- Formatted text: a small editor writing the HTML the site shows ---------- */

const TOOLS = [
  { icon: Bold, label: 'Bold', run: () => document.execCommand('bold') },
  { icon: Italic, label: 'Italic', run: () => document.execCommand('italic') },
  { icon: Heading2, label: 'Heading', run: () => document.execCommand('formatBlock', false, 'h2') },
  { icon: Heading3, label: 'Subheading', run: () => document.execCommand('formatBlock', false, 'h3') },
  { icon: List, label: 'Bulleted list', run: () => document.execCommand('insertUnorderedList') },
  { icon: ListOrdered, label: 'Numbered list', run: () => document.execCommand('insertOrderedList') },
  { icon: Quote, label: 'Quote', run: () => document.execCommand('formatBlock', false, 'blockquote') },
  { icon: Link2, label: 'Link', run: () => { const url = window.prompt('Link address'); if (url) document.execCommand('createLink', false, url); } },
];

export function RichField({ label, value, onChange, tall = false }) {
  const ref = useRef(null);
  const [source, setSource] = useState(false);
  // Only push outside changes into the editor, so the cursor stays put while typing.
  useEffect(() => {
    if (ref.current && !source && ref.current.innerHTML !== (value || '')) ref.current.innerHTML = value || '';
  }, [value, source]);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-tone-600">{label}</span>
        <button type="button" onClick={() => setSource((v) => !v)} className="text-xs text-tone-500 hover:text-accent">{source ? 'Formatted' : 'HTML'}</button>
      </div>
      <div className="overflow-hidden rounded-lg border border-tone-200 focus-within:border-accent">
        {!source && (
          <div className="flex flex-wrap gap-0.5 border-b border-tone-100 bg-tone-50 p-1" role="toolbar" aria-label={`${label} formatting`}>
            {TOOLS.map(({ icon: Icon, label: name, run }) => (
              <button key={name} type="button" title={name} aria-label={name} onMouseDown={(e) => { e.preventDefault(); run(); onChange(ref.current.innerHTML); }} className="rounded p-1.5 text-tone-600 hover:bg-tone-100 hover:text-ink"><Icon className="h-4 w-4" /></button>
            ))}
          </div>
        )}
        {source ? (
          <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={tall ? 18 : 8} className={`block w-full p-3 font-mono text-xs ${inputClass} focus:outline-none`} aria-label={`${label} HTML`} />
        ) : (
          <div
            ref={ref}
            role="textbox"
            aria-multiline="true"
            aria-label={label}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onChange(e.currentTarget.innerHTML)}
            className={`prose-okjt ${tall ? 'min-h-[22rem]' : 'min-h-[9rem]'} bg-paper p-3 text-sm focus:outline-none`}
          />
        )}
      </div>
    </div>
  );
}

/** Comma-separated words, kept as typed and saved as a list. */
function ListInput({ label, value, onChange }) {
  const joined = Array.isArray(value) ? value.join(', ') : value ?? '';
  const [text, setText] = useState(joined);
  // Take outside changes (another record opened), not the echo of our own typing.
  useEffect(() => {
    setText((current) => (current.split(',').map((v) => v.trim()).filter(Boolean).join(', ') === joined ? current : joined));
  }, [joined]);
  return (
    <AdminInput
      label={label}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split(',').map((v) => v.trim()).filter(Boolean));
      }}
      className={inputClass}
    />
  );
}

/* ---------- One field of a form, by type ---------- */

export function Field({ field, value, onChange, pillars = [] }) {
  const { type, label, hint } = field;
  const name = field.required ? `${label} *` : label;
  if (type === 'rich') return <RichField label={name} value={value} onChange={onChange} tall={field.tall} />;
  if (type === 'image') return <MediaField label={name} value={value} onChange={onChange} hint={hint} />;
  if (type === 'media') return <MediaField label={name} value={value} onChange={onChange} accept="media" hint={hint} />;
  if (type === 'switch') {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-tone-100 px-4 py-3">
        <span className="text-sm text-tone-700">{label}</span>
        <ToggleButton enabled={Boolean(value)} onToggle={() => onChange(!value)} label={label} />
      </div>
    );
  }
  let control;
  if (type === 'textarea') control = <AdminTextarea label={name} rows={field.rows || 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={`${inputClass} !resize-y`} required={field.required} />;
  else if (type === 'select') {
    control = (
      <AdminSelect label={name} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </AdminSelect>
    );
  } else if (type === 'pillar') {
    control = (
      <AdminSelect label={name} value={value ?? ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)} className={inputClass}>
        <option value="">None</option>
        {pillars.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
      </AdminSelect>
    );
  } else if (type === 'list') {
    control = <ListInput label={name} value={value} onChange={onChange} />;
  } else if (type === 'number') {
    control = <AdminInput label={name} type="number" min={field.min} max={field.max} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} className={inputClass} />;
  } else {
    control = <AdminInput label={name} type={type === 'password' ? 'password' : type === 'email' ? 'email' : type === 'url' ? 'url' : 'text'} autoComplete={type === 'password' ? 'new-password' : undefined} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass} required={field.required} />;
  }
  return <div>{control}{hint && <p className="mt-1 text-xs text-tone-500">{hint}</p>}</div>;
}
