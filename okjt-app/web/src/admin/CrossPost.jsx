import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AlertTriangle, Check, Copy, ExternalLink, X } from 'lucide-react';
import { QueryError } from '@okjt/dashboard';
import api from '../lib/api';

/** Copy text, falling back to selecting it when the browser blocks the clipboard. */
function useCopy() {
  const [copied, setCopied] = useState('');
  const copy = async (id, text, field) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      field?.select();
      document.execCommand?.('copy');
    }
    setCopied(id);
    toast.success('Copied');
    setTimeout(() => setCopied((c) => (c === id ? '' : c)), 2000);
  };
  return [copied, copy];
}

/** One site: what to do there, the text to paste and a copy button. */
function Destination({ id, name, steps, text, open, copied, onCopy, rows = 10 }) {
  const field = useRef(null);
  return (
    <section className="rounded-xl border border-tone-100 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-medium text-ink">{name}</h3>
        <div className="flex items-center gap-2">
          {open && <a href={open.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-tone-200 px-3.5 py-1.5 text-xs font-medium text-tone-700 hover:border-accent hover:text-ink">{open.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>}
          <button type="button" onClick={() => onCopy(id, text, field.current)} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-paper hover:bg-accent-strong">
            {copied === id ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />} {copied === id ? 'Copied' : `Copy for ${name}`}
          </button>
        </div>
      </div>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-tone-600">
        {steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <label className="mt-3 block">
        <span className="sr-only">Text for {name}</span>
        <textarea ref={field} readOnly value={text} rows={rows} onFocus={(e) => e.target.select()} className="w-full resize-y rounded-lg border border-tone-200 bg-tone-50 px-3 py-2 font-mono text-xs leading-relaxed text-tone-700 focus:border-accent focus:outline-none" />
      </label>
    </section>
  );
}

/**
 * The Cross-post panel for one insight: the article ready for DEV, Hashnode
 * and LinkedIn, each crediting okjtech.co.ke as the original (the server
 * builds the texts: App\Support\CrossPost).
 */
export default function CrossPost({ record, onClose }) {
  const query = useQuery({ queryKey: ['admin', 'crosspost', record.id], queryFn: () => api.get(`/insights/${record.id}/crosspost`).then((res) => res.data.data) });
  const [copied, copy] = useCopy();
  const data = query.data;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/60" role="dialog" aria-modal="true" aria-label={`Cross-post ${record.title}`} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="flex h-full w-full max-w-3xl flex-col border-l border-tone-200 bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-tone-100 px-6 py-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Cross-post</div>
            <h2 className="truncate text-xl font-medium text-ink">{record.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-tone-400 hover:bg-tone-100 hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <p className="text-sm text-tone-600">Post the article on other sites while search engines keep okjtech.co.ke as the original. Every copy ends with “First published on okjtech.co.ke” and a link back.</p>
          {query.isError ? <QueryError what="the copies" onRetry={query.refetch} error={query.error} /> : !data ? (
            <div className="space-y-4">{[0, 1, 2].map((n) => <div key={n} className="h-48 animate-pulse rounded-xl bg-tone-50" />)}</div>
          ) : (
            <>
              {!data.published && (
                <p role="alert" className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-tone-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                  This insight is a draft. Publish it on okjtech.co.ke first, so the original is live before any copy appears elsewhere.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-tone-50 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-tone-500">Original address (canonical)</div>
                  <div className="truncate text-sm text-ink">{data.url}</div>
                </div>
                <button type="button" onClick={() => copy('url', data.url)} className="inline-flex items-center gap-1.5 rounded-full border border-tone-200 px-3.5 py-1.5 text-xs font-medium text-tone-700 hover:border-accent hover:text-ink">
                  {copied === 'url' ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />} Copy address
                </button>
              </div>
              <Destination
                id="devto" name="DEV" text={data.devto} copied={copied} onCopy={copy}
                open={{ href: 'https://dev.to/new', label: 'New post' }}
                steps={[
                  'Open a new post on DEV and paste everything into the editor, replacing what is there.',
                  'The lines at the top set the title, tags, cover and canonical_url (the original address). It is saved as a draft; check the preview, then publish.',
                ]}
              />
              <Destination
                id="hashnode" name="Hashnode" text={data.hashnode} copied={copied} onCopy={copy}
                steps={[
                  'Start a new article on your Hashnode blog and paste the text into it.',
                  'Before publishing, open the article’s settings, mark it as republished from another site, and paste the original address above as the original (canonical) URL.',
                ]}
              />
              <Destination
                id="linkedin" name="LinkedIn" text={data.linkedin} copied={copied} onCopy={copy} rows={6}
                open={{ href: 'https://www.linkedin.com/feed/', label: 'LinkedIn' }}
                steps={[
                  'Start a post and paste the text. LinkedIn has no canonical setting, so a short post that links to the article sends readers and credit back to okjtech.co.ke.',
                  'Add a line of your own about why it matters, and the cover image if you like.',
                ]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
