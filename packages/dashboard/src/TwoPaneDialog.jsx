import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * A dialog for long forms and information that would otherwise scroll:
 * named sections on the left, one section at a time on the right. On phones
 * it fills the screen and the sections become a row of steps at the top.
 * Sections are parallel views (not a forced sequence); `done` marks the ones
 * already checked.
 *
 *   <TwoPaneDialog open title sections={[{ id, label, hint, done }]} active onSelect onClose footer>
 *
 * Lifted from Naoa (components/admin/TwoPaneDialog), where it was built for its long forms.
 */
export default function TwoPaneDialog({ open, title, subtitle, sections, active, onSelect, onClose, footer, children }) {
  const titleId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.activeElement;
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-stretch justify-center bg-ink/40 sm:items-center sm:p-6">
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-full w-full flex-col overflow-hidden bg-surface shadow-xl outline-none sm:h-[min(44rem,90vh)] sm:max-w-5xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate !font-sans !text-lg !font-semibold !text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-tone-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-tone-500 hover:bg-tint" aria-label="Close">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <nav aria-label="Sections" className="shrink-0 border-b border-line bg-paper sm:w-56 sm:border-b-0 sm:border-r">
            <ol className="flex gap-1 overflow-x-auto p-2 sm:flex-col sm:p-3">
              {sections.map((s, i) => {
                const on = s.id === active;
                return (
                  <li key={s.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelect(s.id)}
                      aria-current={on ? 'step' : undefined}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors ${on ? 'bg-ink text-white' : 'text-body hover:bg-tint'}`}
                    >
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[length:max(11px,var(--okjt-min-text,0px))] font-semibold ${on ? 'bg-white/20' : s.done ? 'bg-positive text-white' : 'bg-line text-soft'}`}>
                        {s.done && !on ? '✓' : i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{s.label}</span>
                        {s.hint && <span className={`hidden text-xs sm:block ${on ? 'text-white/70' : 'text-tone-500'}`}>{s.hint}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <section className="min-h-0 flex-1 overflow-y-auto p-5">{children}</section>
        </div>

        {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}
