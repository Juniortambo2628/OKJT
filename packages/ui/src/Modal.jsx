import { useId } from 'react';
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

function CloseButton({ onClose, className }) {
  return (
    <button type="button" aria-label="Close" onClick={onClose} className={className}>
      <X className="w-5 h-5" />
    </button>
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
}) {
  const widthClass = MAX_WIDTHS[maxWidth] || MAX_WIDTHS.lg;
  const titleId = useId();
  const carded = title != null || footer != null;
  const close = closeable ? onClose : undefined;
  const drawClose = showClose && closeable;

  return (
    <AnimatePresence>
      {open && (
        <Overlay
          onClose={close}
          closeOnBackdrop={closeable}
          zIndex={9998}
          className="flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={carded && title != null ? undefined : label}
          aria-labelledby={carded && title != null ? titleId : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${widthClass} my-auto`}
          >
            {carded ? (
              <div className="flex max-h-[88vh] flex-col overflow-hidden rounded-2xl bg-surface shadow-xl">
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
                <div className="max-h-[88vh] overflow-y-auto rounded-2xl">
                  {children}
                </div>
              </>
            )}
          </motion.div>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
