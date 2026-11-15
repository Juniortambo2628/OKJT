import { useEffect, useId, useRef } from 'react';
import Overlay from './Overlay.js';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const MAX_WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-[calc(100vw-2rem)]',
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keyboard focus for an open dialog: moves into it (its autofocus field, else
 * its first control), stays inside it on Tab and Shift+Tab, and goes back to
 * whatever had it when the dialog closes.
 */
function useDialogFocus(ref) {
  useEffect(() => {
    const panel = ref.current;
    if (!panel) return undefined;
    const opener = document.activeElement;
    const focusables = () => [...panel.querySelectorAll(FOCUSABLE)].filter((el) => !el.closest('[inert]'));
    if (!panel.contains(document.activeElement)) {
      (panel.querySelector('[autofocus]') || focusables()[0] || panel).focus({ preventScroll: true });
    }
    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      // A dialog opened on top (a confirmation, say) keeps its own focus.
      const other = document.activeElement?.closest?.('[aria-modal="true"]');
      if (other && !other.contains(panel)) return;
      const list = focusables();
      if (!list.length) { e.preventDefault(); return; }
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [ref]);
}

function CloseButton({ onClose, className }) {
  return (
    <button type="button" aria-label="Close" onClick={onClose} className={className}>
      <X className="w-5 h-5" />
    </button>
  );
}

/** The open dialog's panel; mounted only while open, so focus moves in and out with it. */
function Panel({ widthClass, onClose, drawClose, carded, title, titleId, description, footer, className, children }) {
  const ref = useRef(null);
  useDialogFocus(ref);
  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`relative w-full ${widthClass} my-auto outline-none`}
    >
      {carded ? (
        <div className={`flex max-h-[88vh] flex-col overflow-hidden rounded-2xl bg-surface shadow-xl ${className}`.trim()}>
          {(title != null || drawClose) && (
            <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6 pb-4">
              <div className="min-w-0">
                {title != null && <h2 id={titleId} className="text-xl font-medium text-body">{title}</h2>}
                {description != null && <p className="mt-1 text-sm text-soft">{description}</p>}
              </div>
              {drawClose && (
                <CloseButton
                  onClose={onClose}
                  className="-mr-2 -mt-1 shrink-0 rounded-lg p-1.5 text-tone-400 transition-colors hover:bg-tone-100 hover:text-tone-700"
                />
              )}
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          {footer != null && (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-tone-100 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      ) : (
        <>
          {drawClose && (
            <CloseButton
              onClose={onClose}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-surface shadow-lg border border-tone-200 flex items-center justify-center text-tone-500 hover:text-tone-800 hover:bg-tone-50 transition-colors"
            />
          )}
          <div className={`max-h-[88vh] overflow-y-auto rounded-2xl ${className}`.trim()}>
            {children}
          </div>
        </>
      )}
    </motion.div>
  );
}

/**
 * Generic, reusable modal dialog.
 *
 * Renders a dimmed <Overlay> with a centered, scrollable panel.
 *
 * Without `title` or `footer` the panel is transparent so the child content
 * (which typically already is a styled card) provides its own chrome, and a
 * floating close button sits at the top-right.
 *
 * With `title` (and optionally `description` and `footer`) the panel is a card:
 * a header with the title and the close button, a body that scrolls, and a
 * footer that stays put.
 *
 * Keyboard focus moves into the dialog, stays there on Tab, and returns to
 * whatever had it when the dialog closes.
 *
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'4xl'|'5xl'|'6xl'|'7xl'|'full'} [maxWidth]
 * @param {string} [label]        Accessible name when there is no title.
 * @param {node} [title]          Turns on the card chrome; names the dialog.
 * @param {node} [description]    A line under the title.
 * @param {node} [footer]         Actions, pinned under the body (turns on the card chrome).
 * @param {boolean} [showClose]   Draw the close button (default true). Turn it off
 *                                for content that has its own.
 * @param {boolean} [closeable]   Escape, the backdrop and the close button close it
 *                                (default true). False for a step that must be finished.
 * @param {string} [className]    Extra classes for the panel (its own background, a height).
 */
export default function Modal({
  open,
  onClose,
  children,
  maxWidth = 'lg',
  label,
  title,
  description,
  footer,
  showClose = true,
  closeable = true,
  className = '',
}) {
  const widthClass = MAX_WIDTHS[maxWidth] || MAX_WIDTHS.lg;
  const titleId = useId();
  const carded = title != null || footer != null;
  const named = carded && title != null;

  return (
    <AnimatePresence>
      {open && (
        <Overlay
          onClose={closeable ? onClose : undefined}
          closeOnBackdrop={closeable}
          zIndex={9998}
          className="flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={named ? undefined : label}
          aria-labelledby={named ? titleId : undefined}
        >
          <Panel
            widthClass={widthClass}
            onClose={onClose}
            drawClose={showClose && closeable}
            carded={carded}
            title={title}
            titleId={titleId}
            description={description}
            footer={footer}
            className={className}
          >
            {children}
          </Panel>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
